import bcrypt from "bcrypt";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Debug logging
  console.log("[DEBUG] DATABASE_URL:", process.env.DATABASE_URL);
  console.log("[DEBUG] DIRECT_URL:", process.env.DIRECT_URL);
  
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
    console.error("[REGISTRATION_ERROR] Full error:", JSON.stringify(error, null, 2));
    console.error("[REGISTRATION_ERROR] Message:", error?.message);
    console.error("[REGISTRATION_ERROR] Code:", error?.code);
    
    // Return detailed error for debugging - show FULL URLs
    return NextResponse.json({
      error: true,
      message: error?.message || "Unknown error",
      code: error?.code,
      DATABASE_URL: process.env.DATABASE_URL || "NOT_SET",
      DIRECT_URL: process.env.DIRECT_URL || "NOT_SET",
    }, { status: 500 });
  }
}
