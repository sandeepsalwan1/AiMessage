import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id || !currentUser?.email) {
    return [];
  }

  try {
    // Find conversations where current user is a member using the junction table
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: "desc",
      },
      where: {
        users: {
          some: {
            userId: currentUser.id
          }
        }
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
          }
        },
      },
    });

    return conversations;
  } catch (error) {
    console.log("[CONVERSATIONS_ERROR]", error);
    return [];
  }
};

export default getConversations;
