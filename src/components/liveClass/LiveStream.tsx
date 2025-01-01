"use client";

import React from "react";
import ReactPlayer from "react-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Video as VideoTypes } from "@/types";

interface LiveStreamProps {
	video: VideoTypes;
	viewers: number;
}

const LiveStream = ({ video, viewers }: LiveStreamProps) => (
	<Card className="mb-6">
		<CardHeader className="flex flex-row items-center justify-between">
			<CardTitle className="flex items-center space-x-2">
				<Video className="w-5 h-5" />
				<span>Live Stream</span>
				{video?.isLive && (
					<Badge variant="destructive" className="ml-2">
						LIVE
					</Badge>
				)}
			</CardTitle>
			<div className="flex items-center space-x-2 text-sm text-gray-500">
				<Users className="w-4 h-4" />
				<span>{viewers} viewing</span>
			</div>
		</CardHeader>
		<CardContent>
			{video ? (
				<div className="space-y-4">
					<div className="aspect-video rounded-lg overflow-hidden bg-black">
						<ReactPlayer
							url={video.url}
							width="100%"
							height="100%"
							controls
							playing
							playsinline
						/>
					</div>
					<div className="space-y-2">
						<h3 className="text-xl font-semibold">{video.title}</h3>
						<p className="text-gray-600 whitespace-pre-wrap">
							{video.description}
						</p>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<Skeleton className="h-[400px] w-full" />
					<Skeleton className="h-4 w-[300px]" />
					<Skeleton className="h-4 w-full" />
				</div>
			)}
		</CardContent>
	</Card>
);

export default LiveStream;
