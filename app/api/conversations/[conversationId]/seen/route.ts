import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface IParams {
  conversationId?: string;
}

export async function POST(req: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Parse the conversation ID safely
    const parsedConversationId = parseInt(conversationId);
    if (isNaN(parsedConversationId)) {
      return new NextResponse("Invalid conversation ID", { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: parsedConversationId,
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

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Get the last message from the conversation
    const lastMessage = conversation.messages[0];

    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    try {
      // Instead of checking and then creating, use a single upsert operation
      // This will either create a new record or do nothing if it already exists
      await prisma.$executeRaw`
        INSERT IGNORE INTO UserSeenMessage (userId, messageId)
        VALUES (${currentUser.id}, ${lastMessage.id})
      `;

      // Get updated message with seen info
      const updatedMessage = await prisma.message.findUnique({
        where: {
          id: lastMessage.id
        },
        include: {
          seenBy: {
            include: {
              user: true
            }
          },
          sender: true
        }
      });

      if (!updatedMessage) {
        return NextResponse.json(conversation);
      }

      // Trigger updates via Pusher with proper error handling
      if (currentUser.email) {
        try {
          await pusherServer.trigger(currentUser.email, "conversation:update", {
            id: parsedConversationId,
            messages: [updatedMessage],
          });
        } catch (error) {
          console.error("Pusher error:", error);
          // Continue execution even if Pusher fails
        }
      }

      // Use the string representation of parsedConversationId for the channel name
      try {
        await pusherServer.trigger(parsedConversationId.toString(), "message:update", updatedMessage);
      } catch (error) {
        console.error("Pusher error:", error);
        // Continue execution even if Pusher fails
      }

      return NextResponse.json(updatedMessage);
    } catch (error) {
      console.log("[MESSAGE_SEEN_DB_ERROR]", error);
      
      // If there's a database error, still try to return the message data
      // This prevents the 500 error from bubbling up to the client
      try {
        const messageData = await prisma.message.findUnique({
          where: {
            id: lastMessage.id
          },
          include: {
            seenBy: {
              include: {
                user: true
              }
            },
            sender: true
          }
        });
        
        return NextResponse.json(messageData || conversation);
      } catch (secondaryError) {
        console.error("[SECONDARY_ERROR]", secondaryError);
        return NextResponse.json(conversation);
      }
    }
  } catch (error) {
    console.log("[MESSAGE_SEEN_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
