import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  // Simple auth check - you should use a proper secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expected = process.env.MIGRATE_SECRET || "your-migration-secret-123";

  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Run raw SQL to create tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        emailVerified DATETIME,
        image VARCHAR(255),
        hashedPassword VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Account (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        type VARCHAR(255),
        provider VARCHAR(255),
        providerAccountId VARCHAR(255),
        refresh_token TEXT,
        access_token TEXT,
        expires_at INT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        UNIQUE KEY unique_provider_account (provider, providerAccountId),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Conversation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastMessageAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255),
        isGroup BOOLEAN
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS UserConversation (
        userId INT,
        conversationId INT,
        PRIMARY KEY (userId, conversationId),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (conversationId) REFERENCES Conversation(id) ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Message (
        id INT AUTO_INCREMENT PRIMARY KEY,
        body TEXT,
        image VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        conversationId INT,
        senderId INT,
        FOREIGN KEY (conversationId) REFERENCES Conversation(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE CASCADE
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS UserSeenMessage (
        userId INT,
        messageId INT,
        PRIMARY KEY (userId, messageId),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (messageId) REFERENCES Message(id) ON DELETE CASCADE
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}