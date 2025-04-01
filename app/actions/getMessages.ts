import prisma from "@/app/libs/prismadb";

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
        },
      },
    });

    if (!messages) {
      return [];
    }

    return messages;
  } catch (error) {
    console.log(error, "ERROR_MESSAGES");
    return [];
  }
};

export default getMessages;
