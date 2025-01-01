import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video } from "@/types";

interface DeleteVideoDialogProps {
	video: Video;
	onDelete: (videoId: string) => Promise<void>;
}

export const DeleteVideoDialog: React.FC<DeleteVideoDialogProps> = ({
	video,
	onDelete,
}) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="destructive">Delete</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Video</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &quot;{video.title}&quot;? This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="destructive"
						onClick={() => onDelete(video._id)}
					>
						Delete
					</Button>
					<Button variant="outline">Cancel</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
