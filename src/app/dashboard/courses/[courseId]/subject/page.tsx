"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader } from "@/components/ui/card";
import { Subject } from "@/types";
import SubjectCard from "@/components/courses/SubjectCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SubjectsPage = ({ params }: { params: { courseId: string } }) => {
	const { courseId } = params;
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await axios.get(
					`/api/courses/${courseId}/subject`,
				);
				setSubjects(response.data.data);
			} catch (err) {
				setError("Failed to load subjects. Please try again later.");
				console.error("Error fetching subjects:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSubjects();
	}, [courseId]);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex items-center justify-between mb-8">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, index) => (
						<Card
							key={index}
							className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
						>
							<CardHeader className="space-y-3">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<div className="p-6">
								<Skeleton className="h-32 w-full rounded-lg" />
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<Alert
					variant="destructive"
					className="animate-in slide-in-from-top-1"
				>
					<AlertCircle className="h-5 w-5" />
					<AlertTitle className="text-lg font-semibold">
						Error
					</AlertTitle>
					<AlertDescription className="mt-2">
						{error}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4 space-y-8">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">
						Subjects
					</h1>
					<p className="text-muted-foreground">
						Manage and organize your course subjects
					</p>
				</div>
				<Button asChild size="lg" className="w-full md:w-auto">
					<Link
						href={`/dashboard/courses/${params.courseId}/subject/new`}
					>
						<Plus className="w-5 h-5 mr-2" />
						Add New Subject
					</Link>
				</Button>
			</div>

			{subjects.length === 0 ? (
				<div className="mt-8">
					<Alert className="bg-muted/50 border-none">
						<BookOpen className="h-5 w-5" />
						<AlertTitle className="text-lg font-semibold">
							No subjects yet
						</AlertTitle>
						<AlertDescription className="mt-2">
							Get started by adding your first subject to this
							course.
						</AlertDescription>
					</Alert>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{subjects.map((subject) => (
						<div
							key={subject._id}
							className="transform hover:scale-102 transition-transform duration-200"
						>
							<SubjectCard
								subject={subject}
								courseId={courseId}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default SubjectsPage;
