"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { Video as VideoData } from "@/types";
import LiveStream from "@/components/liveClass/LiveStream";
import { ChatSection } from "@/components/liveClass/ChatSection";
import { NoLiveClass } from "@/components/liveClass/NoLiveClass";

interface PageParams {
	courseId: string;
	subjectId: string;
	chapterId: string;
}

export default function LiveVideoPage({ params }: { params: PageParams }) {
	const [video, setVideo] = useState<VideoData | null>(null);
	const [error, setError] = useState("");
	const [isLiveClassStarted, setIsLiveClassStarted] = useState(false);
	const [activeTab, setActiveTab] = useState("chat");

	useEffect(() => {
		const fetchLiveVideo = async () => {
			try {
				const response = await axios.get(
					`/api/courses/${params.courseId}/subject/${params.subjectId}/chapter/${params.chapterId}/videos/get-live`,
				);
				console.log(response.data);
				if (response.data.success && response.data.data) {
					setIsLiveClassStarted(true);
					setVideo(response.data.data);
				}
				setError("");
			} catch (err) {
				setError("Unable to load live class. Please try again.");
				setIsLiveClassStarted(false);
				setVideo(null);
			}
		};
		fetchLiveVideo();
	}, [params]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto p-4 space-y-6">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="grid lg:grid-cols-3 gap-6">
					{isLiveClassStarted && video ? (
						<>
							<div className="lg:col-span-2">
								<LiveStream video={video} viewers={10} />
							</div>
							<div className="lg:col-span-1">
								<ChatSection
									courseId={params.courseId}
									videoId={video._id}
									chapterId={params.chapterId}
									subjectId={params.subjectId}
								/>
							</div>
						</>
					) : (
						<div className="lg:col-span-3">
							<NoLiveClass />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
