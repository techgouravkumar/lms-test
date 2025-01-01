"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Chapter, Subject } from "@/types";

// Subject Header Component
const SubjectHeader: React.FC<{
	subject: Subject;
	chapterCount: number;
}> = ({ subject, chapterCount }) => (
	<Card className="mb-6">
		<CardHeader>
			<div className="flex items-center gap-4">
				<img
					src={subject.imageUrl || "/placeholder.png"} // Added fallback
					alt={subject.name || "Subject Image"}
					className="w-16 h-16 rounded-lg object-cover"
				/>
				<div className="flex-1">
					<CardTitle>{subject.name || "Untitled Subject"}</CardTitle>
					<CardDescription className="line-clamp-3">
						{subject.description || "No description available"}
					</CardDescription>
					<p className="text-sm text-muted-foreground mt-1">
						{chapterCount}{" "}
						{chapterCount === 1 ? "Chapter" : "Chapters"}
					</p>
				</div>
			</div>
		</CardHeader>
	</Card>
);

// Subject Header Skeleton
const SubjectHeaderSkeleton = () => (
	<Card className="mb-6">
		<CardHeader>
			<div className="flex items-center gap-4">
				<Skeleton className="w-16 h-16 rounded-lg" />
				<div className="flex-1">
					<Skeleton className="h-6 w-48 mb-2" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-24 mt-2" />
				</div>
			</div>
		</CardHeader>
	</Card>
);

// Chapter Card Component
const ChapterCard: React.FC<{
	chapter: Chapter;
	onClick: () => void;
}> = ({ chapter, onClick }) => (
	<Card
		className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
		onClick={onClick}
	>
		<CardHeader>
			<div className="flex items-center gap-4">
				<img
					src={chapter.chapterThumbnail} // Added fallback
					alt={chapter.title || "Chapter Thumbnail"}
					className="w-12 h-12 rounded object-cover"
				/>
				<div>
					<CardTitle className="text-lg">
						{chapter.title || "Untitled Chapter"}
					</CardTitle>
					<CardDescription>
						{chapter.description || "No description available"}
					</CardDescription>
				</div>
			</div>
		</CardHeader>
	</Card>
);

// Chapter Card Skeleton
const ChapterCardSkeleton = () => (
	<Card className="mb-4">
		<CardHeader>
			<div className="flex items-center gap-4">
				<Skeleton className="w-12 h-12 rounded" />
				<div className="flex-1">
					<Skeleton className="h-5 w-48 mb-2" />
					<Skeleton className="h-4 w-full" />
				</div>
			</div>
		</CardHeader>
	</Card>
);

// Main Subject Page Component
const SubjectPage = ({
	params,
}: {
	params: {
		courseId: string;
		subjectId: string;
	};
}) => {
	const router = useRouter();
	const { courseId, subjectId } = params;
	const [subject, setSubject] = useState<Subject | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const getSubject = async () => {
		setLoading(true);
		try {
			const response = await axios.get(
				`/api/courses/${courseId}/subject/${subjectId}`,
			);
			setSubject(response.data.data);
			setError(""); // Clear any previous errors
		} catch (err) {
			setError("Failed to load subject data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getSubject();
	}, [courseId, subjectId]);

	const handleChapterClick = (chapterId: string) => {
		router.push(
			`/dashboard/courses/${courseId}/subject/${subjectId}/chapters/${chapterId}`,
		);
	};

	const handleAddChapter = () => {
		router.push(
			`/dashboard/courses/${courseId}/subject/${subjectId}/chapters/new`,
		);
	};

	if (error) {
		return (
			<Alert variant="destructive" className="m-4">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			{loading ? (
				<>
					<SubjectHeaderSkeleton />
					{[1, 2, 3].map((i) => (
						<ChapterCardSkeleton key={i} />
					))}
				</>
			) : subject ? (
				<>
					<div className="flex justify-between items-center mb-6">
						<SubjectHeader
							subject={subject}
							chapterCount={subject.chapters?.length || 0}
						/>
						<Button onClick={handleAddChapter} className="ml-4">
							<Plus className="w-4 h-4 mr-2" />
							Add Chapter
						</Button>
					</div>

					<ScrollArea className="h-[600px] rounded-md border p-4">
						{subject.chapters?.map((chapter) => (
							<ChapterCard
								key={chapter._id}
								chapter={chapter}
								onClick={() => handleChapterClick(chapter._id)}
							/>
						))}
					</ScrollArea>
				</>
			) : null}
		</div>
	);
};

export default SubjectPage;
