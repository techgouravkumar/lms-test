import React from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Chapter } from "@/types";
import { VideoCard } from "./VideoCard";

interface VideosListProps {
	chapter: Chapter | null;
	params: {
		courseId: string;
		subjectId: string;
		chapterId: string;
	};
	onUpdate: () => void;
}

export const VideosList: React.FC<VideosListProps> = ({
	chapter,
	params,
	onUpdate,
}) => {
	const { toast } = useToast();
	const { courseId, subjectId, chapterId } = params;

	const handleDeleteVideo = async (videoId: string) => {
		try {
			await axios.delete(
				`/api/courses/${courseId}/subject/${subjectId}/chapter/${chapterId}/videos/${videoId}`,
			);
			toast({
				title: "Success",
				description: "Video deleted successfully",
			});
			onUpdate();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete video",
				variant: "destructive",
			});
		}
	};

	const handleUpdateLiveStatus = async (videoId: string, isLive: boolean) => {
		try {
			await axios.patch(
				`/api/courses/${courseId}/subject/${subjectId}/chapter/${chapterId}/videos/${videoId}`,
				{ isLive },
			);
			toast({
				title: "Success",
				description: "Video status updated successfully",
			});
			onUpdate();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update video status",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{chapter?.videos?.map((video) => (
				<VideoCard
					key={video._id}
					video={video}
					onDelete={handleDeleteVideo}
					onUpdateLiveStatus={handleUpdateLiveStatus}
				/>
			))}
		</div>
	);
};
