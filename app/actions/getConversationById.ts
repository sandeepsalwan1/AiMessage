import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";
import { Prisma } from "@prisma/client";
import { analyzeConversationSentiment } from "@/app/utils/mentalHealth";

const getConversationById = async (conversationId: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) {
      return null;
    }

    // Parse the conversationId to an integer since MySQL expects integer IDs
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: parseInt(conversationId),
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: {
          include: {
            sender: true,
            seenBy: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
    });

    if (!conversation) {
      return null;
    }

    // Fetch mental health insights for each message using raw SQL
    const messagesWithInsights = await Promise.all(
      conversation.messages.map(async (message) => {
        const insights = await prisma.$queryRaw<Array<{
          id: number;
          messageId: number;
          sentimentScore: number;
          emotionalState: string;
          riskLevel: string;
          keywords: string | null;
          recommendations: string | null;
          createdAt: Date;
        }>>`
          SELECT * FROM MentalHealthInsight WHERE messageId = ${message.id}
        `;

        return {
          ...message,
          mentalHealthInsights: insights
        };
      })
    );

    // Analyze conversation-level sentiment
    const conversationSentiment = analyzeConversationSentiment(messagesWithInsights);

    // Store or update conversation sentiment
    await prisma.$executeRaw`
      INSERT INTO ConversationSentiment (
        conversationId,
        sentimentScore,
        emotionalState,
        riskLevel,
        keywords,
        recommendations,
        createdAt,
        updatedAt
      ) VALUES (
        ${parseInt(conversationId)},
        ${conversationSentiment.sentimentScore},
        ${conversationSentiment.emotionalState},
        ${conversationSentiment.riskLevel},
        ${conversationSentiment.keywords.join(',')},
        ${conversationSentiment.recommendations.join('\n')},
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        sentimentScore = VALUES(sentimentScore),
        emotionalState = VALUES(emotionalState),
        riskLevel = VALUES(riskLevel),
        keywords = VALUES(keywords),
        recommendations = VALUES(recommendations),
        updatedAt = NOW()
    `;

    return {
      ...conversation,
      messages: messagesWithInsights,
      sentiment: conversationSentiment
    };
  } catch (error) {
    console.log(error, "ERROR_CONVERSATION_BY_ID");
    return null;
  }
};

export default getConversationById;
