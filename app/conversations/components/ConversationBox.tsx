"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useCallback, useMemo } from "react";

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

	return (
		<div
			onClick={handleClick}
			className={clsx(
				"w-full relative flex items-center space-x-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer p-3",
				selected ? "bg-neutral-100" : "bg-white"
			)}
		>
			{conversation.isGroup ? (
				<AvatarGroup users={users} />
			) : (
				<Avatar user={otherUser} />
			)}
			<div className="min-w-0 flex-1">
				<div className="focus:outline-none">
					<div className="flex justify-between items-center mb-1">
						<p className="text-md font-medium text-gray-900">
							{conversation?.name || otherUser?.name}
						</p>
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
		</div>
	);
};

export default ConversationBox;

