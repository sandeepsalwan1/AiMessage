import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { name, image } = body;

    if (!currentUser?.id || !currentUser.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name,
        image,
      },
    });

    // Broadcast the user update event
    try {
      await pusherServer.trigger("users-channel", "user:update", updatedUser);
    } catch (pusherError) {
      console.error("[PUSHER_ERROR]", pusherError);
      // Continue execution even if Pusher fails
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("[SETTINGS_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
