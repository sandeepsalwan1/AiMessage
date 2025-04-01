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
