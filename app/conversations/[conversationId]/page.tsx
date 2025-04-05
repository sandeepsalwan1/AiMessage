"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import EmptyState from "@/app/components/EmptyState";
import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import { FullConversationType } from "@/app/types";

interface IParams {
	conversationId: string;
}

const ConversationId = ({ params }: { params: IParams }) => {
	const [conversation, setConversation] = useState<FullConversationType | null>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const { data: session } = useSession();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [conversationData, messagesData] = await Promise.all([
					fetch(`/api/conversations/${params.conversationId}`).then(res => res.json()),
					fetch(`/api/messages?conversationId=${params.conversationId}`).then(res => res.json())
				]);
				setConversation(conversationData);
				setMessages(messagesData);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [params.conversationId]);

	useEffect(() => {
		if (!params.conversationId || !pusherClient) {
			return;
		}

		const channel = pusherClient.subscribe(`presence-conversation-${params.conversationId}`);

		const conversationUpdateHandler = (data: { id: string; lastMessageAt: Date; sentiment: any }) => {
			setConversation(prev => {
				if (!prev) return prev;
				return {
					...prev,
					lastMessageAt: new Date(data.lastMessageAt),
					sentiment: {
						id: prev.sentiment?.id || 0,
						conversationId: parseInt(data.id),
						sentimentScore: data.sentiment.sentimentScore,
						emotionalState: data.sentiment.emotionalState,
						riskLevel: data.sentiment.riskLevel,
						keywords: data.sentiment.keywords.join(','),
						recommendations: data.sentiment.recommendations.join('\n'),
						createdAt: prev.sentiment?.createdAt || new Date(),
						updatedAt: new Date()
					}
				};
			});
		};

		channel.bind("conversation:update", conversationUpdateHandler);

		return () => {
			channel.unbind("conversation:update", conversationUpdateHandler);
			if (pusherClient) {
				pusherClient.unsubscribe(`presence-conversation-${params.conversationId}`);
			}
		};
	}, [params.conversationId]);

	if (!conversation) {
		return (
			<div className="lg:pl-80 h-full">
				<div className="h-full flex flex-col">
					<EmptyState />
				</div>
			</div>
		);
	}

	return (
		<div className="lg:pl-80 h-full">
			<div className="h-full flex flex-col">
				<Header conversation={conversation} />
				<Body initialMessages={messages} conversationId={params.conversationId} />
				<Form />
			</div>
		</div>
	);
};

export default ConversationId;
