"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd, MdCleaningServices } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

import useConversation from "@/app/hooks/useConversation";
import { pusherClient } from "@/app/libs/pusher";
import { FullConversationType } from "@/app/types";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";

interface ConversationListProps {
  conversations: FullConversationType[];
  users: User[];
}

const ConversationList: FC<ConversationListProps> = ({ conversations, users }) => {
  const session = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [localConversations, setLocalConversations] = useState<FullConversationType[]>(conversations);

  const router = useRouter();

  const { conversationId, isOpen } = useConversation();

  // Use effect to update local conversations when the prop changes
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  // Deduplicate one-on-one conversations, but ensure we maintain any active conversations
  const deduplicatedItems = useMemo(() => {
    // First, separate group and direct conversations
    const groupConversations = localConversations.filter(conversation => conversation.isGroup);
    const directConversations = localConversations.filter(conversation => !conversation.isGroup);
    
    // Create a map to track conversations by other user's ID
    const conversationsByUserId = new Map();
    
    // For each direct conversation, keep only the most recent one with each user
    directConversations.forEach(conversation => {
      // Find the other user in the conversation
      const otherUser = conversation.users.find(
        userConv => userConv.user.email !== session?.data?.user?.email
      );
      
      if (!otherUser) return;
      
      const otherUserId = otherUser.user.id;
      
      // Always keep the currently active conversation if applicable
      if (conversation.id.toString() === conversationId) {
        conversationsByUserId.set(otherUserId, conversation);
        return;
      }
      
      // If we haven't seen this user or this conversation is more recent, update the map
      if (!conversationsByUserId.has(otherUserId) || 
          new Date(conversation.lastMessageAt).getTime() > 
          new Date(conversationsByUserId.get(otherUserId).lastMessageAt).getTime()) {
        conversationsByUserId.set(otherUserId, conversation);
      }
    });
    
    // Combine deduplicated direct conversations with group conversations
    return [
      ...groupConversations,
      ...Array.from(conversationsByUserId.values())
    ].sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [localConversations, session?.data?.user?.email, conversationId]);

  // Handle cleanup of duplicate conversations in the database
  const handleCleanupDuplicates = async () => {
    setIsCleaningUp(true);
    try {
      const response = await axios.post('/api/conversations/cleanup');
      const { deletedCount } = response.data;
      
      if (deletedCount > 0) {
        toast.success(`Removed ${deletedCount} duplicate conversations`);
        // Use a more gentle approach to refresh conversations
        const updatedConvos = await axios.get('/api/conversations');
        setLocalConversations(updatedConvos.data);
      } else {
        toast.success('No duplicate conversations found');
      }
    } catch (error) {
      console.error('Failed to clean up conversations:', error);
      toast.error('Failed to clean up conversations');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const pusherKey = useMemo(() => {
    return session?.data?.user?.email;
  }, [session?.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (current.find((item) => item.id === conversation.id)) {
          return current;
        }

        // Also update our local conversation state
        setLocalConversations(prev => {
          if (prev.find(item => item.id === conversation.id)) {
            return prev;
          }
          return [conversation, ...prev];
        });

        return [conversation, ...current];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((item) => {
          if (item.id === conversation.id) {
            return {
              ...item,
              messages: conversation.messages,
            };
          }

          return item;
        })
      );

      // Also update our local conversation state
      setLocalConversations(prev => 
        prev.map(item => {
          if (item.id === conversation.id) {
            return {
              ...item,
              messages: conversation.messages,
            };
          }
          return item;
        })
      );
    };

    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => current.filter((item) => item.id !== conversation.id));
      
      // Also update our local conversation state
      setLocalConversations(prev => prev.filter(item => item.id !== conversation.id));
      
      if (conversationId === conversation.id.toString()) {
        router.push("/conversations");
      }
    };

    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:remove", removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind("conversation:new", newHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:remove", removeHandler);
    };
  }, [pusherKey, conversationId, router]);

  // Use the deduplicated conversations
  const [items, setItems] = useState<FullConversationType[]>(deduplicatedItems);

  // Update items when deduplicatedItems changes
  useEffect(() => {
    setItems(deduplicatedItems);
  }, [deduplicatedItems]);

  return (
    <>
      <GroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={users} />
      <aside
        className={clsx(
          "fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200",
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div className="flex items-center gap-2">
              <div
                onClick={handleCleanupDuplicates}
                className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
                title="Clean up duplicate conversations"
              >
                <MdCleaningServices size={20} />
              </div>
              <div
                onClick={() => setIsModalOpen(true)}
                className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
              >
                <MdOutlineGroupAdd size={20} />
              </div>
            </div>
          </div>
          {isCleaningUp && (
            <div className="text-sm text-gray-500 mb-2">Cleaning up duplicates...</div>
          )}
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No conversations yet. Start chatting with someone from the People tab!
            </div>
          ) : (
            items.map((item) => (
              <ConversationBox key={item.id} conversation={item} selected={conversationId === item.id.toString()} />
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
