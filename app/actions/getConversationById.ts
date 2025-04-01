import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

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

    return conversation;
  } catch (error) {
    console.log(error, "ERROR_CONVERSATION_BY_ID");
    return null;
  }
};

export default getConversationById;
