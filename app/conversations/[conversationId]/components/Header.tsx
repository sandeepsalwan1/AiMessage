"use client";

import AvatarGroup from "@/app/components/AvatarGroup";
import Avatar from "@/app/components/avatar";
import useActiveList from "@/app/hooks/useActiveList";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2";
import { FiBarChart2 } from "react-icons/fi";
import ProfileDrawer from "./ProfileDrawer";

interface HeaderProps {
	conversation: FullConversationType;
	showSentiment: boolean;
	toggleSentiment: () => void;
}

const Header: FC<HeaderProps> = ({ 
	conversation, 
	showSentiment, 
	toggleSentiment 
}) => {
	const otherUser = useOtherUser(conversation);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const { members } = useActiveList();
	const isActive = members.indexOf(otherUser?.email!) !== -1;

	// Extract users from UserConversation objects
	const users = useMemo(() => {
		if (!conversation.users) {
			return [];
		}
		return conversation.users.map(userConv => userConv.user);
	}, [conversation.users]);

	const statusText = useMemo(() => {
		if (conversation.isGroup) {
			return `${users.length} members`;
		}

		return isActive ? "Active" : "Offline";
	}, [conversation, isActive]);

	// Get sentiment information from the conversation
	const getSentimentInfo = (): SentimentDisplayInfo | null => {
		if (!conversation.sentiment) {
			return null;
		}

		const sentiment = conversation.sentiment;

		let icon;
		let color;
		let bgColor;
		let text;

		switch (sentiment.emotionalState) {
			case 'POSITIVE':
				icon = <MdSentimentVerySatisfied className="h-7 w-7" />;
				color = 'text-green-600';
				bgColor = 'bg-gradient-to-r from-green-50 to-green-100';
				text = 'Positive Mood';
				break;
			case 'NEGATIVE':
				icon = <MdSentimentVeryDissatisfied className="h-7 w-7" />;
				color = 'text-red-600';
				bgColor = 'bg-gradient-to-r from-red-50 to-red-100';
				text = 'Needs Support';
				break;
			default:
				icon = <MdSentimentNeutral className="h-7 w-7" />;
				color = 'text-yellow-600';
				bgColor = 'bg-gradient-to-r from-yellow-50 to-yellow-100';
				text = 'Neutral Mood';
		}

		return {
			icon,
			color,
			bgColor,
			text,
			description: sentiment.recommendations?.split('\n')[0] || `The conversation has a ${sentiment.emotionalState.toLowerCase()} tone`,
			score: sentiment.sentimentScore
		};
	};

	const sentimentInfo = getSentimentInfo();

	return (
		<>
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				data={conversation}
			/>
			<div className="bg-white w-full flex flex-col border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 shadow-sm">
				<div className="flex justify-between items-center">
					<div className="flex gap-3 items-center">
						<Link
							href="/conversations"
							className="lg:hidden block text-sky-500 hover:text-sky-600 transition cursor-pointer"
						>
							<HiChevronLeft size={32} />
						</Link>
						{conversation.isGroup ? (
							<AvatarGroup users={users} />
						) : (
							<Avatar user={otherUser} />
						)}
						<div className="flex flex-col">
							<div className="text-lg font-semibold">
								{conversation.name || otherUser.name}
							</div>
							<div className="text-sm font-light text-neutral-500">
								{statusText}
							</div>
						</div>
					</div>
					<HiEllipsisHorizontal
						size={32}
						onClick={() => setDrawerOpen(true)}
						className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
					/>
				</div>
				<div className="flex items-center gap-4">
					<button
						onClick={toggleSentiment}
						className={`p-2 rounded-full transition ${
							showSentiment ? 'bg-sky-100 text-sky-600' : 'text-neutral-500 hover:text-sky-600'
						}`}
						title={showSentiment ? "Hide sentiment analysis" : "Show sentiment analysis"}
					>
						<FiBarChart2 size={20} />
					</button>
					<button
						onClick={() => setDrawerOpen(true)}
						className="text-sky-500 cursor-pointer hover:text-sky-600 transition"
					>
						<HiEllipsisHorizontal size={32} />
					</button>
				</div>
			</div>
		</>
	);
};

export default Header;
