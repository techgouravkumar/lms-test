"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { Chapter } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AddVideoSheet } from "@/components/courses/AddVideoForm";
import { VideosList } from "@/components/courses/VideoList";
import ResourceCard from "@/components/courses/ResourceCard";

const ChapterPage = ({
	params,
}: {
	params: { courseId: string; subjectId: string; chapterId: string };
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const { courseId, subjectId, chapterId } = params;
	const [chapter, setChapter] = useState<Chapter | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const { toast } = useToast();

	const fetchChapter = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`/api/courses/${courseId}/subject/${subjectId}/chapter/${chapterId}`,
			);
			setChapter(response.data.data);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch chapter data",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchChapter();
	}, [chapterId]);

	if (loading) {
		return (
			<div className="w-full space-y-4">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle className="text-2xl font-bold">
								{chapter?.title}
							</CardTitle>
							<CardDescription>
								{chapter?.description}
							</CardDescription>
						</div>
						<div className="space-x-2">
							<Button variant="outline">Edit Chapter</Button>
							<Button
								onClick={() => router.push(`${pathname}/live`)}
							>
								Live Class
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<Tabs defaultValue="videos" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="videos">Videos</TabsTrigger>
							<TabsTrigger value="resources">
								Resources
							</TabsTrigger>
						</TabsList>

						<TabsContent value="videos" className="space-y-4">
							<AddVideoSheet
								params={params}
								onSuccess={fetchChapter}
							/>
							<VideosList
								chapter={chapter}
								params={params}
								onUpdate={fetchChapter}
							/>
						</TabsContent>

						<TabsContent value="resources">
							<div className="space-y-4">
								{chapter?.resources.map((resource) => (
									<ResourceCard
										key={resource._id}
										resource={resource}
									/>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

export default ChapterPage;
