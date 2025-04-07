"use client";

import AvatarGroup from "@/app/components/AvatarGroup";
import Avatar from "@/app/components/avatar";
import useActiveList from "@/app/hooks/useActiveList";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import Link from "next/link";
import { FC, useMemo, useState } from "react";
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
		
		// Handle the MySQL schema with junction table
		return conversation.users.map(userConv => userConv.user);
	}, [conversation.users]);

	const statusText = useMemo(() => {
		if (conversation.isGroup) {
			return `${conversation.users.length} members`;
		}

		return isActive ? "Active" : "Offline";
	}, [conversation, isActive]);

	return (
		<>
			<ProfileDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				data={conversation}
			/>
			<div className="bg-white w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center shadow-sm">
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
						<div>{conversation?.name || otherUser?.name}</div>
						<div className="text-sm font-light text-neutral-500">
							{statusText}
						</div>
					</div>
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
