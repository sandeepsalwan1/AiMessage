import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing fields.", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Broadcast the new user event to all clients on the "users" channel
    try {
      await pusherServer.trigger("users-channel", "user:new", user);
    } catch (pusherError) {
      console.error("[PUSHER_ERROR]", pusherError);
      // Continue execution even if Pusher fails
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTRATION_ERROR]", error);
    return new NextResponse("Error while registering user.", { status: 500 });
  }
}
