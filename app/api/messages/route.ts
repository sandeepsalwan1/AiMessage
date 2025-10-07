import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prismadb";
import { analyzeMentalHealth, shouldTriggerAlert, analyzeConversationSentiment } from "@/app/utils/mentalHealth";
import { pusherServer } from "@/app/libs/pusher";

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
      // Create message with mental health insight
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
          },
          mentalHealthInsights: {
            create: {
              sentimentScore: mentalHealthAnalysis.sentimentScore,
              emotionalState: mentalHealthAnalysis.emotionalState,
              riskLevel: mentalHealthAnalysis.riskLevel,
              keywords: mentalHealthAnalysis.keywords.join(','),
              recommendations: mentalHealthAnalysis.recommendations.join('\n')
            }
          }
        },
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

      // Get all messages in the conversation to update conversation sentiment
      const conversationMessages = await tx.message.findMany({
        where: {
          conversationId: numericConversationId
        },
        include: {
          mentalHealthInsights: true
        }
      });

      // Analyze conversation sentiment
      const conversationSentiment = analyzeConversationSentiment(conversationMessages);

      // Update or create conversation sentiment
      await tx.conversationSentiment.upsert({
        where: {
          conversationId: numericConversationId
        },
        create: {
          conversationId: numericConversationId,
          sentimentScore: conversationSentiment.sentimentScore,
          emotionalState: conversationSentiment.emotionalState,
          riskLevel: conversationSentiment.riskLevel,
          keywords: conversationSentiment.keywords.join(','),
          recommendations: conversationSentiment.recommendations.join('\n')
        },
        update: {
          sentimentScore: conversationSentiment.sentimentScore,
          emotionalState: conversationSentiment.emotionalState,
          riskLevel: conversationSentiment.riskLevel,
          keywords: conversationSentiment.keywords.join(','),
          recommendations: conversationSentiment.recommendations.join('\n'),
          updatedAt: new Date()
        }
      });

      // Trigger Pusher events with safety checks and error handling
      try {
        // For conversation channel - using consistent conversationId format
        if (conversationId) {
          console.log('[PUSHER] Triggering messages:new on channel:', conversationId.toString());
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
              console.log('[PUSHER] Triggering conversation:update for user:', userEmail);
              await pusherServer.trigger(userEmail, "conversation:update", {
                id: updatedConversation.id,
                messages: [lastMessage],
                lastMessageAt: updatedConversation.lastMessageAt
              });
            }
          }
        }
      } catch (error) {
        console.error("PUSHER_ERROR", error);
        // Continue execution even if Pusher fails
      }
    });

    // Trigger Pusher events
    try {
      // Trigger the message:new event on the conversation channel
      const channelName = `presence-conversation-${conversationId}`;
      console.log('[PUSHER] Using channel name:', channelName);
      console.log('[PUSHER] Triggering messages:new event with data:', result.message);
      await pusherServer.trigger(channelName, "messages:new", result.message);

      // Update the conversation's last message time and trigger conversation update with sentiment
      console.log('[PUSHER] Triggering conversation:update event with data:', {
        id: numericConversationId,
        lastMessageAt: new Date(),
        sentiment: result.sentiment
      });
      await pusherServer.trigger(channelName, "conversation:update", {
        id: numericConversationId,
        lastMessageAt: new Date(),
        sentiment: result.sentiment
      });
    } catch (error) {
      console.error("[PUSHER] Error triggering Pusher events:", error);
    }

    return NextResponse.json(result.message);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID is required", { status: 400 });
    }

    const numericConversationId = parseInt(conversationId, 10);
    if (isNaN(numericConversationId)) {
      return new NextResponse("Invalid conversation ID", { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: numericConversationId
      },
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
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
