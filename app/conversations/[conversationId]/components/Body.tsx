"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { FullMessageType, ConversationSentiment } from "@/app/types";
import { analyzeConversationSentiment } from "@/app/utils/mentalHealth";
import axios from "axios";
import { find } from "lodash";
import MessageBox from "./MessageBox";
import ConversationSentimentComponent from "./ConversationSentiment";
import Header from "./Header";
import { toast } from "react-hot-toast";

interface BodyProps {
  initialMessages: FullMessageType[];
  conversation: any; // Using any to match existing pattern
}

const Body: FC<BodyProps> = ({ initialMessages, conversation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [sentiment, setSentiment] = useState<ConversationSentiment | null>(null);
  const [showSentiment, setShowSentiment] = useState(true);
  const [sentimentError, setSentimentError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedMessagesCountRef = useRef<number>(0);

  const { conversationId } = useConversation();

  const toggleSentiment = () => {
    setShowSentiment(prev => !prev);
  };

  // Mark messages as seen when conversation is opened
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // Analyze sentiment whenever messages change
  useEffect(() => {
    if (messages.length === 0) {
      setSentiment(null);
      setSentimentError(null);
      return;
    }
    
    // Skip if message count hasn't changed - prevents duplicate analysis
    if (messages.length === lastAnalyzedMessagesCountRef.current) {
      return;
    }
    
    setIsAnalyzing(true);
    setSentimentError(null);
    
    try {
      // Clear any existing timer to avoid multiple analyses running
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
      
      // Debounce the analysis for performance with large message sets
      analysisTimerRef.current = setTimeout(() => {
        try {
          // Only analyze the messages if there are enough to form a meaningful analysis
          if (messages.length < 3) {
            setSentiment({
              emotionalState: 'NEUTRAL',
              sentimentScore: 50,
              riskLevel: 'LOW',
              keywords: [],
              recommendations: ['Continue the conversation to get more insights.']
            });
            setIsAnalyzing(false);
            // Update last analyzed count
            lastAnalyzedMessagesCountRef.current = messages.length;
            return;
          }

          const result = analyzeConversationSentiment(messages);
          
          setSentiment({
            emotionalState: result.emotionalState,
            sentimentScore: result.sentimentScore,
            riskLevel: result.riskLevel,
            keywords: result.keywords,
            recommendations: result.recommendations
          });
          
          // Update last analyzed count
          lastAnalyzedMessagesCountRef.current = messages.length;
        } catch (innerError) {
          console.error("Error analyzing conversation sentiment:", innerError);
          setSentimentError("Could not analyze sentiment. Please try again later.");
          toast.error("Could not analyze conversation sentiment");
        } finally {
          setIsAnalyzing(false);
          analysisTimerRef.current = null;
        }
      }, 500); // 500ms debounce
      
      return () => {
        if (analysisTimerRef.current) {
          clearTimeout(analysisTimerRef.current);
          analysisTimerRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error in sentiment analysis effect:", error);
      setSentimentError("Could not analyze sentiment. Please try again later.");
      setIsAnalyzing(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !pusherClient) {
      return;
    }

    const channel = pusherClient.subscribe(`presence-conversation-${conversationId}`);

    const messageHandler = (message: FullMessageType) => {
      console.log('[PUSHER-Body] Received messages:new', message.id);
      axios.post(`/api/conversations/${conversationId}/seen`);
      
      setMessages((messages) => {
        // Check if we already have this message
        if (find(messages, { id: message.id })) {
          return messages;
        }

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
    };

    const updateMessageHandler = (message: FullMessageType) => {
      console.log('[PUSHER-Body] Received message:update', message.id);
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }
          return currentMessage;
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

  // Fallback UI for sentiment analysis
  const renderSentimentUI = () => {
    if (!showSentiment) return null;
    
    if (isAnalyzing) {
      return (
        <div className="px-4 pt-4">
          <div className="p-3 rounded-lg border bg-gray-50 mb-4 text-sm text-gray-500">
            Analyzing conversation sentiment...
          </div>
        </div>
      );
    }
    
    if (sentimentError) {
      return (
        <div className="px-4 pt-4">
          <div className="p-3 rounded-lg border bg-red-50 border-red-200 text-red-800 mb-4 text-sm">
            {sentimentError}
          </div>
        </div>
      );
    }
    
    if (sentiment) {
      return (
        <div className="px-4 pt-4">
          <ConversationSentimentComponent sentiment={sentiment} />
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      <Header 
        conversation={conversation} 
        showSentiment={showSentiment} 
        toggleSentiment={toggleSentiment}
      />
      <div className="flex-1 overflow-y-auto">
        {renderSentimentUI()}
        {messages.map((message, index) => (
          <MessageBox isLast={index === messages.length - 1} key={message.id} message={message} />
        ))}
        <div ref={bottomRef} className="pt-24" />
      </div>
    </>
  );
};

export default Body;
