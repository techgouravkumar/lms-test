import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Comment } from "@/types";

interface ChatMessageProps {
	comment: Comment;
}

export const ChatMessage = ({ comment }: ChatMessageProps) => (
	<div className="flex space-x-3 animate-fadeIn">
		<Avatar>
			<AvatarFallback>
				{comment.user.substring(0, 2).toUpperCase()}
			</AvatarFallback>
		</Avatar>
		<div className="flex-1 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
			<div className="flex items-center justify-between mb-1">
				<span className="font-medium">{comment.user}</span>
				<span className="text-xs text-gray-500">
					{new Date(comment.timestamp).toLocaleTimeString()}
				</span>
			</div>
			<p className="text-gray-700">{comment.content}</p>
		</div>
	</div>
);
