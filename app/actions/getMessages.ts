import prisma from "@/app/libs/prismadb";
import { Prisma } from "@prisma/client";

const getMessages = async (conversationId: string) => {
  try {
    // Parse the conversationId to an integer for MySQL
    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: true,
        seenBy: {
          include: {
            user: true
          }
        }
      },
    });

    if (!messages) {
      return [];
    }

    // Fetch mental health insights for each message using raw SQL
    const messagesWithInsights = await Promise.all(
      messages.map(async (message) => {
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

    return messagesWithInsights;
  } catch (error) {
    console.log(error, "ERROR_MESSAGES");
    return [];
  }
};

export default getMessages;
