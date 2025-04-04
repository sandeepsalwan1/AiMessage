"use client";

import Avatar from "@/app/components/avatar";
import { FullMessageType } from "@/app/types";
import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import ImageModal from "./ImageModal";
import { RiEmotionHappyLine, RiEmotionUnhappyLine, RiEmotionNormalLine } from "react-icons/ri";

interface MessageBoxProps {
	isLast: boolean;
	message: FullMessageType;
}

const MessageBox: FC<MessageBoxProps> = ({ isLast, message }) => {
	const session = useSession();
	const [imageModalOpen, setImageModalOpen] = useState(false);

	const isOwn = session?.data?.user?.email === message?.sender?.email;
	
	// Get the seen list from the new MySQL schema
	const seenList = useMemo(() => {
		if (!message || !message.seenBy || !Array.isArray(message.seenBy)) {
			return "";
		}
		
		// Make sure sender exists
		if (!message.sender || !message.sender.email) {
			return "";
		}
		
		// Extract user names from seenBy entries, excluding sender
		const seenUsers = message.seenBy
			.filter(seenEntry => {
				// Make sure each seenEntry has a valid user
				if (!seenEntry || !seenEntry.user || !seenEntry.user.email) {
					return false;
				}
				return seenEntry.user.email !== message.sender.email;
			})
			.map(seenEntry => seenEntry.user.name || "Unknown")
			.filter(Boolean);
			
		return seenUsers.join(", ");
	}, [message]);

	// Get sentiment information
	const sentimentInfo = useMemo(() => {
		// Detailed debug logging
		console.log("Full message object:", JSON.stringify(message, null, 2));
		console.log("Mental health insights:", JSON.stringify(message?.mentalHealthInsights, null, 2));

		if (!message?.mentalHealthInsights?.[0]) {
			console.log("No mental health insights available for message");
			return null;
		}
		
		const insight = message.mentalHealthInsights[0];
		console.log("Using insight for message:", JSON.stringify(insight, null, 2));

		return {
			score: insight.sentimentScore || 0,
			emotionalState: insight.emotionalState || 'NEUTRAL'
		};
	}, [message?.mentalHealthInsights]);

	const container = clsx("flex gap-3 p-4", isOwn && "justify-end");
	const avatar = clsx(isOwn && "order-2");
	const body = clsx("flex flex-col gap-2", isOwn && "items-end");

	const messageContainer = clsx(
		"text-sm w-fit overflow-hidden relative",
		isOwn ? "text-white bg-sky-500" : "bg-gray-100",
		message?.image ? "rounded-md p-0" : "rounded-full py-2 px-3"
	);

	// Get sentiment icon
	const getSentimentIcon = () => {
		if (!sentimentInfo) {
			console.log("No sentiment info available for icon");
			return null;
		}
		
		console.log("Getting sentiment icon for state:", sentimentInfo.emotionalState);
		
		switch (sentimentInfo.emotionalState) {
			case 'POSITIVE':
				return <RiEmotionHappyLine className="h-4 w-4 text-green-500" />;
			case 'NEGATIVE':
				return <RiEmotionUnhappyLine className="h-4 w-4 text-red-500" />;
			default:
				return <RiEmotionNormalLine className="h-4 w-4 text-yellow-500" />;
		}
	};

	// Debug log when sentiment changes
	useEffect(() => {
		console.log("Current message sentiment:", JSON.stringify(sentimentInfo, null, 2));
	}, [sentimentInfo]);

	return (
		<div className={container}>
			<div className={avatar}>
				<Avatar user={message?.sender} />
			</div>
			<div className={body}>
				<div className="flex items-center gap-1">
					<div className="text-sm text-gray-500">{message?.sender?.name}</div>
					<div className="text-xs text-gray-400">
						{format(new Date(message?.createdAt), "p")}
					</div>
					{sentimentInfo && (
						<div className="ml-1">
							{getSentimentIcon()}
						</div>
					)}
				</div>
				<div className={messageContainer}>
					<ImageModal
						src={message?.image}
						isOpen={imageModalOpen}
						onClose={() => setImageModalOpen(false)}
					/>
					{message?.image ? (
						<Image
							onClick={() => setImageModalOpen(true)}
							alt="Image"
							height={288}
							width={288}
							src={message?.image}
							className="object-cover cursor-pointer hover:scale-110 transition translate"
						/>
					) : (
						<div>{message?.body}</div>
					)}
				</div>
				{isLast && isOwn && seenList && (
					<div className="text-xs font-light text-gray-500">{`Seen by ${seenList}`}</div>
				)}
			</div>
		</div>
	);
};

export default MessageBox;
