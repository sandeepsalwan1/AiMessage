import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();

    const { message, image, conversationId } = body;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate conversationId
    if (!conversationId) {
      return new NextResponse("Missing conversationId", { status: 400 });
    }

    // Parse conversationId safely
    const parsedConversationId = parseInt(conversationId);
    if (isNaN(parsedConversationId)) {
      return new NextResponse("Invalid conversationId format", { status: 400 });
    }

    try {
      // Create the new message
      const newMessage = await prisma.message.create({
        data: {
          body: message,
          image,
          conversation: {
            connect: {
              id: parsedConversationId,
            },
          },
          sender: {
            connect: {
              id: currentUser.id,
            },
          },
        },
        include: {
          sender: true,
          seenBy: {
            include: {
              user: true
            }
          },
        },
      });

      // Create the seen relationship separately
      await prisma.userSeenMessage.create({
        data: {
          userId: currentUser.id,
          messageId: newMessage.id
        }
      });

      const updatedConversation = await prisma.conversation.update({
        where: {
          id: parsedConversationId,
        },
        data: {
          lastMessageAt: new Date(),
        },
        include: {
          users: {
            include: {
              user: true
            }
          },
          messages: {
            include: {
              seenBy: {
                include: {
                  user: true
                }
              },
              sender: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
        },
      });

      // Trigger Pusher events with safety checks and error handling
      try {
        // For conversation channel
        if (conversationId) {
          await pusherServer.trigger(conversationId.toString(), "messages:new", newMessage);
        }

        // For individual user channels
        if (updatedConversation.users && updatedConversation.users.length > 0 && 
            updatedConversation.messages && updatedConversation.messages.length > 0) {
          
          // Get the last message
          const lastMessage = updatedConversation.messages[0];
          
          // For each user, trigger a conversation update
          for (const userConversation of updatedConversation.users) {
            const userEmail = userConversation.user?.email;
            
            if (userEmail) {
              await pusherServer.trigger(userEmail, "conversation:update", {
                id: updatedConversation.id,
                messages: [lastMessage],
              });
            }
          }
        }
      } catch (error) {
        console.error("PUSHER_ERROR", error);
        // Continue execution even if Pusher fails
      }

      return NextResponse.json(newMessage);
    } catch (dbError) {
      console.error("[DATABASE_ERROR]", dbError);
      return new NextResponse("Database Error", { status: 500 });
    }
  } catch (error) {
    console.log("[MESSAGES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
