"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo } from "react";
import { MdSentimentVerySatisfied, MdSentimentVeryDissatisfied, MdSentimentNeutral } from "react-icons/md";

import Avatar from "@/app/components/avatar";
import AvatarGroup from "@/app/components/AvatarGroup";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import clsx from "clsx";
import { format } from "date-fns";

interface ConversationBoxProps {
	conversation: FullConversationType;
	selected: boolean;
}

const ConversationBox: FC<ConversationBoxProps> = ({
	conversation,
	selected,
}) => {
	const otherUser = useOtherUser(conversation);
	const session = useSession();
	const router = useRouter();

	const handleClick = useCallback(() => {
		router.push(`/conversations/${conversation.id}`);
	}, [conversation.id, router]);

	const lastMessage = useMemo(() => {
		const messages = conversation.messages || [];

		return messages[messages.length - 1];
	}, [conversation.messages]);

	const userEmail = useMemo(() => {
		return session.data?.user?.email;
	}, [session.data]);

	// Extract users from UserConversation objects
	const users = useMemo(() => {
		if (!conversation.users) {
			return [];
		}
		
		// Handle the MySQL schema with junction table
		return conversation.users.map(userConv => userConv.user);
	}, [conversation.users]);

	const hasSeen = useMemo(() => {
		if (!lastMessage) {
			return false;
		}

		if (!userEmail) {
			return false;
		}

		// Add proper null checking for the seenBy property
		if (!lastMessage.seenBy || !Array.isArray(lastMessage.seenBy)) {
			return false;
		}

		// Check if current user is in the seenBy list with proper null checks
		return lastMessage.seenBy.some(seen => {
			// Make sure the seen object and its user property exist
			if (!seen || !seen.user) {
				return false;
			}
			return seen.user.email === userEmail;
		});
	}, [userEmail, lastMessage]);

	const lastMessageText = useMemo(() => {
		if (lastMessage?.image) {
			return "Sent an image";
		}

		if (lastMessage?.body) {
			return lastMessage.body;
		}

		return "Start a conversation";
	}, [lastMessage]);

	const getSentimentInfo = () => {
		if (!conversation.sentiment) return null;
		
		const { emotionalState, sentimentScore } = conversation.sentiment;
		let icon;
		let color;
		let bgColor;

		switch (emotionalState) {
			case 'POSITIVE':
				icon = <MdSentimentVerySatisfied className="h-5 w-5" />;
				color = 'text-green-600';
				bgColor = 'bg-green-50';
				break;
			case 'NEGATIVE':
				icon = <MdSentimentVeryDissatisfied className="h-5 w-5" />;
				color = 'text-red-600';
				bgColor = 'bg-red-50';
				break;
			default:
				icon = <MdSentimentNeutral className="h-5 w-5" />;
				color = 'text-yellow-600';
				bgColor = 'bg-yellow-50';
		}

		return { icon, color, bgColor, score: sentimentScore };
	};

	const sentimentInfo = getSentimentInfo();

	return (
		<div
			onClick={handleClick}
			className={clsx(
				"w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3",
				selected ? "bg-neutral-100" : "bg-white"
			)}
		>
			<div className="relative">
				{conversation.isGroup ? (
					<AvatarGroup users={users} />
				) : (
					<Avatar user={otherUser} />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex justify-between items-center mb-1">
					<div className="flex items-center gap-2">
						<p className="text-sm font-medium text-gray-900">
							{conversation.name || otherUser.name}
						</p>
						{sentimentInfo && (
							<div className={`flex items-center gap-1 ${sentimentInfo.bgColor} ${sentimentInfo.color} px-2 py-0.5 rounded-full`}>
								{sentimentInfo.icon}
								<span className="text-xs font-medium">
									{sentimentInfo.score}/100
								</span>
							</div>
						)}
					</div>
					{lastMessage?.createdAt && (
						<p className="text-xs text-gray-400 font-light">
							{format(new Date(lastMessage.createdAt), "p")}
						</p>
					)}
				</div>
				<p
					className={clsx(
						"truncate text-sm",
						hasSeen ? "text-gray-500" : "text-black font-medium"
					)}
				>
					{lastMessageText}
				</p>
			</div>
		</div>
	);
};

export default ConversationBox;

