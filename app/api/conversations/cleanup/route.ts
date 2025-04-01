import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

/**
 * API endpoint to remove duplicate one-on-one conversations
 * This keeps only the most recent conversation with each user
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get all non-group conversations the current user is part of
    const conversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
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
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });
    
    // Map to track which conversations to keep (by other user's ID)
    const keepConversationsByUser = new Map();
    const conversationsToDelete = [];
    
    // For each conversation, determine if it's a duplicate
    for (const conversation of conversations) {
      // Find the other user in this conversation
      const otherUserEntry = conversation.users.find(
        userConv => userConv.userId !== currentUser.id
      );
      
      if (!otherUserEntry) continue;
      
      const otherUserId = otherUserEntry.userId;
      
      // If we haven't seen this user before, mark this conversation to keep
      if (!keepConversationsByUser.has(otherUserId)) {
        keepConversationsByUser.set(otherUserId, conversation.id);
      } else {
        // Otherwise, mark for deletion
        conversationsToDelete.push(conversation.id);
      }
    }
    
    // Only proceed if there are conversations to delete
    if (conversationsToDelete.length === 0) {
      return NextResponse.json({ 
        message: "No duplicate conversations found", 
        deletedCount: 0 
      });
    }
    
    // Delete all messages in the conversations first
    await prisma.message.deleteMany({
      where: {
        conversationId: {
          in: conversationsToDelete
        }
      }
    });
    
    // Delete the UserConversation junction records
    await prisma.userConversation.deleteMany({
      where: {
        conversationId: {
          in: conversationsToDelete
        }
      }
    });
    
    // Delete the conversations
    const deleteResult = await prisma.conversation.deleteMany({
      where: {
        id: {
          in: conversationsToDelete
        }
      }
    });
    
    return NextResponse.json({ 
      message: "Duplicate conversations removed successfully", 
      deletedCount: deleteResult.count 
    });
    
  } catch (error) {
    console.error("[CONVERSATIONS_CLEANUP_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 