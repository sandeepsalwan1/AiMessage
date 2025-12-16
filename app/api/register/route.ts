import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Debug: Log environment variables (masked)
  const dbUrl = process.env.DATABASE_URL;
  console.log("[DEBUG] DATABASE_URL exists:", !!dbUrl);
  console.log("[DEBUG] DATABASE_URL starts with:", dbUrl?.substring(0, 30) + "...");
  
  try {
    const body = await req.json();
    const { email, name, password } = body;
    console.log("[DEBUG] Received registration request for:", email);

    if (!email || !name || !password) {
      return new NextResponse("Missing fields.", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("[DEBUG] Password hashed, attempting to create user...");

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });
    console.log("[DEBUG] User created successfully:", user.id);

    // Broadcast the new user event to all clients on the "users" channel
    try {
      await pusherServer.trigger("users-channel", "user:new", user);
    } catch (pusherError) {
      console.error("[PUSHER_ERROR]", pusherError);
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[REGISTRATION_ERROR] Full error:", error);
    console.error("[REGISTRATION_ERROR] Message:", error?.message);
    console.error("[REGISTRATION_ERROR] Code:", error?.code);
    return new NextResponse(`Registration error: ${error?.message || "Unknown error"}`, { status: 500 });
  }
}
