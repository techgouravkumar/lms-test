import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Video } from "@/types";
import { Play, Settings, Trash } from "lucide-react";

interface VideoCardProps {
	video: Video;
	onDelete: (videoId: string) => Promise<void>;
	onUpdateLiveStatus: (videoId: string, isLive: boolean) => Promise<void>;
}

export const VideoCard: React.FC<VideoCardProps> = ({
	video,
	onDelete,
	onUpdateLiveStatus,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card className="flex flex-col">
			<CardHeader className="relative">
				<div className="absolute top-2 right-2 flex space-x-1">
					{video.isLive && (
						<Alert variant="destructive" className="bg-red-100">
							<AlertDescription>Live Now</AlertDescription>
						</Alert>
					)}
				</div>
				<CardTitle className="text-lg">{video.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-center">
					<Button
						variant="outline"
						onClick={() => window.open(video.url, "_blank")}
					>
						<Play className="w-4 h-4 mr-2" />
						Watch
					</Button>
					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<Button
							variant="outline"
							onClick={() => setIsOpen(true)}
						>
							<Settings className="w-4 h-4 mr-2" />
							Manage
						</Button>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Manage Video</DialogTitle>
								<DialogDescription>
									Update video settings or delete the video
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span>Live Status</span>
									<Switch
										checked={video.isLive}
										onCheckedChange={(checked) => {
											onUpdateLiveStatus(
												video._id,
												checked,
											);
											setIsOpen(false);
										}}
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="destructive"
										onClick={() => {
											onDelete(video._id);
											setIsOpen(false);
										}}
									>
										<Trash className="w-4 h-4 mr-2" />
										Delete
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	);
};
