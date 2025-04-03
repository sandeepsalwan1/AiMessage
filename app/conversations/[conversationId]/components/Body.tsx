"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Message, User } from "@prisma/client";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";
import MessageBox from "./MessageBox";
import { FullMessageType } from "@/app/types";

interface MentalHealthInsight {
  id: number;
  messageId: number;
  sentimentScore: number;
  emotionalState: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  keywords: string | null;
  recommendations: string | null;
  createdAt: Date;
}

interface ExtendedMessageType extends FullMessageType {
  mentalHealthInsights?: MentalHealthInsight[];
}

interface BodyProps {
  initialMessages: ExtendedMessageType[];
  conversationId: string;
}

const Body: React.FC<BodyProps> = ({ initialMessages, conversationId }) => {
  const [messages, setMessages] = useState<ExtendedMessageType[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!pusherClient) {
      console.error("Pusher client is not initialized");
      return;
    }

    console.log("Subscribing to channel:", `presence-conversation-${conversationId}`);
    const channel = pusherClient.subscribe(`presence-conversation-${conversationId}`);

    const messageHandler = (message: ExtendedMessageType) => {
      console.log("Received message:", message);
      
      if (find(messages, { id: message.id })) {
        console.log("Message already exists, skipping");
        return;
      }

      console.log("Adding new message to state");
      setMessages((current) => [...current, message]);

      // Check for mental health insights
      if (message.mentalHealthInsights && message.mentalHealthInsights.length > 0) {
        console.log("Mental health insights found:", message.mentalHealthInsights);
      }
    };

    // Bind to the channel's messages:new event
    channel.bind("messages:new", messageHandler);

    return () => {
      console.log("Unsubscribing from channel:", `presence-conversation-${conversationId}`);
      if (pusherClient) {
        channel.unbind("messages:new", messageHandler);
        pusherClient.unsubscribe(`presence-conversation-${conversationId}`);
      }
    };
  }, [conversationId, messages]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageBox
            message={message}
            isLast={messages.indexOf(message) === messages.length - 1}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default Body;
