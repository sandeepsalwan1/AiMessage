import { Conversation, Message, User, UserConversation } from "@prisma/client";

export interface MentalHealthInsight {
  id: number;
  messageId: number;
  sentimentScore: number;
  emotionalState: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keywords: string | null;
  recommendations: string | null;
  createdAt: Date;
}

export type FullMessageType = Message & {
  sender: User;
  seenBy: { user: User }[];
  mentalHealthInsights?: MentalHealthInsight[];
};

// For MySQL with junction tables
export type FullConversationType = Conversation & {
  users: (UserConversation & { user: User })[];
  messages: FullMessageType[];
};

// Helper type for getting a flat user list
export type UserWithoutPassword = Omit<User, "hashedPassword">;
