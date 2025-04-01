import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

interface IParams {
  conversationId?: string;
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: IParams;
  }
) {
  try {
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversationIdNumber = parseInt(conversationId, 10);

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationIdNumber,
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
      },
    });

    if (!existingConversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Check if current user is part of the conversation
    const isUserInConversation = existingConversation.users.some(
      userConv => userConv.userId === currentUser.id
    );

    if (!isUserInConversation) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the conversation
    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: conversationIdNumber,
      },
    });

    // Get users for notification
    const users = existingConversation.users.map(userConv => userConv.user);
    
    // Notify users about removal
    users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:remove", existingConversation);
      }
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.log("[CONVERSATION_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Add GET endpoint for fetching a specific conversation
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: IParams;
  }
) {
  try {
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const conversationIdNumber = parseInt(conversationId, 10);

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationIdNumber,
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

    if (!conversation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Check if current user is part of the conversation
    const isUserInConversation = conversation.users.some(
      userConv => userConv.userId === currentUser.id
    );

    if (!isUserInConversation) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.log("[CONVERSATION_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
