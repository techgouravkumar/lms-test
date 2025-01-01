import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isLoading: boolean;
}

export const ChatInput = ({
	value,
	onChange,
	onSubmit,
	isLoading,
}: ChatInputProps) => (
	<div className="p-4 border-b bg-white rounded-lg shadow-sm">
		<Textarea
			placeholder="Type your message..."
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="mb-2 focus:ring-2 focus:ring-blue-500"
			rows={2}
		/>
		<Button
			onClick={onSubmit}
			disabled={!value.trim() || isLoading}
			className="w-full bg-blue-600 hover:bg-blue-700"
		>
			{isLoading ? "Sending..." : "Send Message"}
		</Button>
	</div>
);
