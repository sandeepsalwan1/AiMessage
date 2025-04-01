import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { userId, isGroup, members, name } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (isGroup && (!members || members.length < 2 || !name)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            create: [
              ...members.map((member: { value: number }) => ({
                userId: member.value,
              })),
              {
                userId: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: {
            include: {
              user: true
            }
          }
        },
      });

      const users = newConversation.users.map(userConv => userConv.user);
      
      users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, "conversation:new", newConversation);
        }
      });

      return NextResponse.json(newConversation);
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        AND: [
          {
            users: {
              some: {
                userId: currentUser.id
              }
            }
          },
          {
            users: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      }
    });

    if (existingConversations.length > 0) {
      return NextResponse.json(existingConversations[0]);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          create: [
            {
              userId: currentUser.id,
            },
            {
              userId,
            },
          ],
        },
      },
      include: {
        users: {
          include: {
            user: true
          }
        }
      },
    });

    const users = newConversation.users.map(userConv => userConv.user);
    
    users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:new", newConversation);
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.log("[CONVERSATIONS_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
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
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.log("[CONVERSATIONS_GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
