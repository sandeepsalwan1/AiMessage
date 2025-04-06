"use client";

import useConversation from "@/app/hooks/useConversation";
import { pusherClient } from "@/app/libs/pusher";
import { FullMessageType } from "@/app/types";
import axios from "axios";
import { find } from "lodash";
import { FC, useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversation();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    pusherClient.subscribe(conversationId);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    const messageHandler = (message: FullMessageType) => {
      console.log('[PUSHER-Body] Received messages:new', message.id);
      axios.post(`/api/conversations/${conversationId}/seen`);
      
      setMessages((messages) => {
        // Check if we already have this message
        if (find(messages, { id: message.id })) {
          return messages;
        }

        return [...messages, message];
      });

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const updateMessageHandler = (message: FullMessageType) => {
      console.log('[PUSHER-Body] Received message:update', message.id);
      setMessages((current) =>
        current.map((m) => {
          if (m.id === message.id) {
            return message;
          }

          return m;
        })
      );
    };

    // Debug the subscription
    console.log('[PUSHER-Body] Subscribing to channel:', conversationId);
    
    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updateMessageHandler);

    return () => {
      console.log('[PUSHER-Body] Unsubscribing from channel:', conversationId);
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updateMessageHandler);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, index) => (
        <MessageBox isLast={index === messages.length - 1} key={message.id} message={message} />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
