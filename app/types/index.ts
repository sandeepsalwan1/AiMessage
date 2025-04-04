import { Conversation, Message, User, UserConversation } from "@prisma/client";

export interface MentalHealthInsight {
  id: number;
  messageId: number;
  sentimentScore: number;
  emotionalState: string;
  riskLevel: string;
  keywords: string | null;
  recommendations: string | null;
  createdAt: Date;
}

export interface ConversationSentiment {
  id: number;
  conversationId: number;
  sentimentScore: number;
  emotionalState: string;
  riskLevel: string;
  keywords: string | null;
  recommendations: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FullMessageType = Message & {
  sender: User;
  seenBy: { user: User }[];
  mentalHealthInsights: MentalHealthInsight[];
};

export type FullConversationType = Conversation & {
  users: (UserConversation & { user: User })[];
  messages: FullMessageType[];
  sentiment: ConversationSentiment | null;
};

// Helper type for getting a flat user list
export type UserWithoutPassword = Omit<User, "hashedPassword">;
