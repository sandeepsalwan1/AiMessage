import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { analyzeMentalHealth, shouldTriggerAlert } from "@/app/utils/mentalHealth";
import { pusherServer } from "@/app/libs/pusher";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, image, conversationId } = await request.json();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID is required", { status: 400 });
    }

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Convert conversationId to number
    const numericConversationId = parseInt(conversationId, 10);
    if (isNaN(numericConversationId)) {
      return new NextResponse("Invalid conversation ID", { status: 400 });
    }

    // Analyze message for mental health insights
    const mentalHealthAnalysis = analyzeMentalHealth(message);

    // Create the message with transaction to ensure both message and insight are created
    const result = await prisma.$transaction(async (tx) => {
      // Create message
      const newMessage = await tx.message.create({
        data: {
          body: message,
          image: image,
          conversationId: numericConversationId,
          senderId: currentUser.id,
          seenBy: {
            create: {
              userId: currentUser.id
            }
          }
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

      // Create mental health insight using raw SQL
      const query = Prisma.sql`
        INSERT INTO MentalHealthInsight (
          messageId, 
          sentimentScore, 
          emotionalState, 
          riskLevel, 
          keywords, 
          recommendations, 
          createdAt
        ) VALUES (
          ${newMessage.id},
          ${mentalHealthAnalysis.sentimentScore},
          ${mentalHealthAnalysis.emotionalState},
          ${mentalHealthAnalysis.riskLevel},
          ${mentalHealthAnalysis.keywords.join(',')},
          ${mentalHealthAnalysis.recommendations.join('\n')},
          NOW()
        )
      `;
      await tx.$executeRaw(query);

      // Fetch the message with mental health insights
      const messageWithInsights = await tx.message.findUnique({
        where: { id: newMessage.id },
        include: {
          seenBy: {
            include: {
              user: true
            }
          },
          sender: true,
          mentalHealthInsights: true
        }
      });

      return messageWithInsights || newMessage;
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: {
        id: numericConversationId
      },
      data: {
        lastMessageAt: new Date()
      }
    });

    // Trigger Pusher events
    try {
      // Fetch the message with mental health insights for Pusher
      const messageForPusher = await prisma.message.findUnique({
        where: { id: result.id },
        include: {
          seenBy: {
            include: {
              user: true
            }
          },
          sender: true,
          mentalHealthInsights: true
        }
      });

      if (!messageForPusher) {
        throw new Error("Message not found after creation");
      }

      console.log("Triggering Pusher event for message:", messageForPusher.id);
      
      // Trigger the message:new event on the conversation channel
      const channelName = `presence-conversation-${numericConversationId}`;
      console.log("Using channel name:", channelName);
      await pusherServer.trigger(channelName, "messages:new", messageForPusher);

      // Update the conversation's last message time
      const updatedConversation = await prisma.conversation.findUnique({
        where: {
          id: numericConversationId
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
              sender: true,
              mentalHealthInsights: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      if (updatedConversation?.users) {
        for (const userConversation of updatedConversation.users) {
          const userEmail = userConversation.user?.email;
          if (userEmail) {
            await pusherServer.trigger(userEmail, "conversation:update", {
              id: numericConversationId,
              messages: updatedConversation.messages
            });
          }
        }
      }
    } catch (error) {
      console.error("PUSHER_ERROR", error);
      // Don't throw the error, just log it and continue
      // The message is still created in the database
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ERROR_MESSAGES", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
