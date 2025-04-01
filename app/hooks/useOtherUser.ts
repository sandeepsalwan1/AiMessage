import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { FullConversationType } from "../types";

// Updated to handle both direct users array and nested user objects from junction table
const useOtherUser = (conversation: any) => {
  const session = useSession();
  
  const otherUser = useMemo(() => {
    const currentUserEmail = session?.data?.user?.email;
    
    // Check if conversation exists
    if (!conversation) return null;
    
    // Handle the new MySQL schema with junction table
    if (conversation.users && Array.isArray(conversation.users)) {
      // Case 1: Direct array of users (from MongoDB schema or mapped data)
      if (conversation.users[0] && !conversation.users[0].user) {
        return conversation.users.find((user: User) => user.email !== currentUserEmail);
      }
      
      // Case 2: Array of UserConversation objects (from MySQL schema)
      if (conversation.users[0] && conversation.users[0].user) {
        return conversation.users
          .map((userConv: any) => userConv.user)
          .find((user: User) => user.email !== currentUserEmail);
      }
    }
    
    return null;
  }, [conversation, session?.data?.user?.email]);
  
  return otherUser;
};

export default useOtherUser;
