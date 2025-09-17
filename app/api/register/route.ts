import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Basic runtime env check for DB
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database is not configured. Set DATABASE_URL env var" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Basic validation to catch obvious client errors early
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Prevent duplicate accounts
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
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
  } catch (error: any) {
    // Log detailed error server-side for diagnostics
    console.error("[REGISTRATION_ERROR]", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    // Prisma known request errors (e.g., unique constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      return NextResponse.json({ error: `Database error (${error.code})` }, { status: 500 });
    }

    // Prisma initialization/connection errors
    if (typeof error?.code === 'string' && error.code.startsWith('P10')) {
      // P1000..P1017 are connection/auth/timeout errors
      return NextResponse.json({ 
        error: "Database connection error",
        code: error.code,
        hint: "Verify DATABASE_URL and SSL settings for Aiven MySQL (e.g., add ?sslaccept=strict)"
      }, { status: 500 });
    }

    // Missing table / not migrated yet
    const messageText = String(error?.message || '').toLowerCase();
    if (messageText.includes('doesn\'t exist') || messageText.includes('no such table') || messageText.includes('er_no_such_table')) {
      return NextResponse.json({ 
        error: "Database not migrated",
        hint: "Run `npx prisma migrate deploy` or open /api/migrate with the secret"
      }, { status: 500 });
    }

    // Low-level network errors
    if (error?.code === 'ECONNREFUSED' || messageText.includes('getaddrinfo') || messageText.includes('connect etimedout')) {
      return NextResponse.json({ 
        error: "Cannot reach database",
        hint: "Check host/port/firewall and SSL requirements for your Aiven instance"
      }, { status: 500 });
    }

    // Fallback (include message in non-production for TDD diagnostics)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: "Error while registering user", message: error?.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Error while registering user" }, { status: 500 });
  }
}
