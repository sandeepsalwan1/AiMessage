"use client";

import AvatarGroup from "@/app/components/AvatarGroup";
import Avatar from "@/app/components/avatar";
import useActiveList from "@/app/hooks/useActiveList";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import Link from "next/link";
import { FC, useEffect, useMemo, useState } from "react";
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2";
import { MdSentimentVerySatisfied, MdSentimentVeryDissatisfied, MdSentimentNeutral } from "react-icons/md";
import ProfileDrawer from "./ProfileDrawer";

interface HeaderProps {
	conversation: FullConversationType;
}

interface SentimentDisplayInfo {
	icon: JSX.Element;
	color: string;
	bgColor: string;
	text: string;
	description: string;
	score: number;
}

const Header: FC<HeaderProps> = ({ conversation }) => {
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
			console.log("No conversation sentiment found");
			return null;
		}

		const sentiment = conversation.sentiment;
		console.log("Using conversation sentiment for header:", sentiment);

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
	console.log("Header sentiment info:", sentimentInfo);

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
				{sentimentInfo && (
					<div className={`mt-3 w-full ${sentimentInfo.bgColor} ${sentimentInfo.color} px-4 py-3 rounded-lg shadow-sm border border-opacity-10`}>
						<div className="flex items-center gap-3">
							{sentimentInfo.icon}
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<span className="font-medium">{sentimentInfo.text}</span>
									<span className="text-sm font-medium">
										Score: {sentimentInfo.score > 0 ? '+' : ''}{sentimentInfo.score}
									</span>
								</div>
								<p className="text-sm opacity-90 mt-0.5">
									{sentimentInfo.description}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Header;
