import { Conversation, Message, User, UserConversation } from "@prisma/client";

export type FullMessageType = Message & {
  sender: User;
  seenBy: { user: User }[];
};

// For MySQL with junction tables
export type FullConversationType = Conversation & {
  users: (UserConversation & { user: User })[];
  messages: FullMessageType[];
};

// Helper type for getting a flat user list
export type UserWithoutPassword = Omit<User, "hashedPassword">;

// Mental health types needed for sentiment analysis
export interface MentalHealthInsight {
  sentimentScore: number;
  emotionalState: string;
  riskLevel: string;
  keywords?: string;
  recommendations?: string;
}

export interface ConversationSentiment {
  emotionalState: string;
  sentimentScore: number;
  riskLevel: string;
  keywords?: string[];
  recommendations: string[];
}
