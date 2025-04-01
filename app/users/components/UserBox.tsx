"use client";

import Avatar from "@/app/components/avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useState } from "react";
import { toast } from "react-hot-toast";

interface UserBoxProps {
	user: User;
}

const UserBox: FC<UserBoxProps> = ({ user }) => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = useCallback(() => {
		setIsLoading(true);

		// First check if a conversation already exists with this user
		axios
			.get("/api/conversations")
			.then((res) => {
				// Look for existing direct conversations with this user
				const existingConversation = res.data.find(
					(conversation: any) => 
						!conversation.isGroup && 
						conversation.users.some((userConv: any) => userConv.user.id === user.id)
				);

				// If conversation exists, navigate to it
				if (existingConversation) {
					router.push(`/conversations/${existingConversation.id}`);
					setIsLoading(false);
					return null; // Return null instead of a Promise
				}
				
				// Otherwise create a new conversation
				return axios.post("/api/conversations", {
					userId: user.id,
				});
			})
			.then((res) => {
				if (res) { // Only execute if we created a new conversation
					router.push(`/conversations/${res.data.id}`);
				}
			})
			.catch((error) => {
				console.error("Error handling conversation:", error);
				toast.error("Failed to start conversation");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [user.id, router]);

	return (
		<>
			{isLoading && <LoadingModal />}
			<div
				onClick={handleClick}
				className="w-full relative flex items-center space-x-3 bg-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
			>
				<Avatar user={user} />
				<div className="min-w-0 flex-1">
					<div className="focus:outline-none">
						<div className="flex justify-between items-center mb-1">
							<p className="text-sm font-medium text-gray-900">{user.name}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default UserBox;
