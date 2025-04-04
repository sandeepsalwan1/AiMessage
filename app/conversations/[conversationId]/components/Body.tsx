"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";
import MessageBox from "./MessageBox";
import { FullMessageType } from "@/app/types";
import axios from "axios";

interface BodyProps {
  initialMessages: FullMessageType[];
  conversationId: string;
}

const Body: React.FC<BodyProps> = ({ initialMessages, conversationId }) => {
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !pusherClient) {
      return;
    }

    const channel = pusherClient.subscribe(`presence-conversation-${conversationId}`);

    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
        })
      );
    };

    const conversationUpdateHandler = (data: { id: string; lastMessageAt: Date; sentiment: any }) => {
      // No need to update messages with sentiment as it's handled at the page level
    };

    channel.bind("messages:new", messageHandler);
    channel.bind("message:update", updateMessageHandler);
    channel.bind("conversation:update", conversationUpdateHandler);

    return () => {
      channel.unbind("messages:new", messageHandler);
      channel.unbind("message:update", updateMessageHandler);
      channel.unbind("conversation:update", conversationUpdateHandler);
      if (pusherClient) {
        pusherClient.unsubscribe(`presence-conversation-${conversationId}`);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          message={message}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
