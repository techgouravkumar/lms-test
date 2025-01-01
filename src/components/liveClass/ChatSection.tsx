"use client";

import { MessageSquare } from "lucide-react";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { Comment } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useState } from "react";
import axios from "axios";

interface ChatSectionProps {
	courseId: string;
	videoId: string;
	subjectId: string;
	chapterId: string;
}

export const ChatSection = ({
	courseId,
	subjectId,
	chapterId,
	videoId,
}: ChatSectionProps) => {
	const [newComment, setNewComment] = useState("");
	const [adminData, setAdminData] = useState<{
		name: string;
		email: string;
	} | null>(null);

	const {
		data: comments,
		loading,
		error,
		pushData,
	} = useFirebaseData(
		`livechat/${courseId}/${subjectId}/${chapterId}/${videoId}`,
	);

	const fetchAdminData = async () => {
		try {
			const cachedAdminData = localStorage.getItem("adminData");
			if (cachedAdminData) {
				setAdminData(JSON.parse(cachedAdminData));
				return;
			}

			const response = await axios.get("/api/admins/me");
			if (response.data?.success) {
				localStorage.setItem(
					"adminData",
					JSON.stringify(response.data.data),
				);
				setAdminData(response.data.data);
			}
		} catch (error) {
			console.error("Failed to fetch admin data:", error);
		}
	};

	const handleAddComment = async () => {
		if (!newComment.trim()) return;

		const userName = adminData?.name || "Anonymous";

		await pushData({
			id: new Date().getTime().toString(),
			user: userName,
			content: newComment,
			timestamp: new Date().toISOString(),
		});
		setNewComment("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAddComment();
		}
	};

	useEffect(() => {
		fetchAdminData();
	}, []);

	return (
		<div className="flex flex-col h-[600px]">
			<div className="flex items-center border-t p-4">
				<textarea
					className="flex-1 p-2 border rounded resize-none"
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message..."
					rows={2}
				/>
				<button
					onClick={handleAddComment}
					disabled={loading || !newComment.trim()}
					className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
				>
					Send
				</button>
			</div>

			<div className="flex-1 overflow-y-auto space-y-4 p-4">
				{error && (
					<div className="text-center text-red-500 mb-2">
						{error.message}
					</div>
				)}

				{!comments?.length ? (
					<div className="text-center text-gray-500 mt-8">
						<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
						<p>No messages yet. Start the conversation!</p>
					</div>
				) : (
					<div className="space-y-4">
						{comments.map((comment: Comment) => (
							<ChatMessage key={comment.id} comment={comment} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};
