"use client";

import React from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/types";
import { CourseCard, LoadingSkeleton } from "@/components/courses/CourseCard";

const CoursePage = () => {
	const { toast } = useToast();
	const [courses, setCourses] = React.useState<Course[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await axios.get<{
					success: boolean;
					data: Course[];
					message?: string;
				}>("/api/courses");
				if (response.data.success) {
					setCourses(response.data.data);
				} else {
					throw new Error(
						response.data.message || "Failed to fetch courses",
					);
				}
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.message ||
					error.message ||
					"Error connecting to server";
				setError(errorMessage);
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchCourses();
	}, [toast]);

	if (loading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Available Courses</h1>
					<Badge variant="outline">Loading...</Badge>
				</div>
				<LoadingSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center p-8">
				<p className="text-red-500">{error}</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => window.location.reload()}
				>
					Try Again
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Available Courses</h1>
				<Badge variant="outline">{courses.length} Courses</Badge>
			</div>
			{courses.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{courses.map((course) => (
						<CourseCard key={course._id} course={course} />
					))}
				</div>
			) : (
				<p className="text-center text-muted-foreground">
					No courses available
				</p>
			)}
		</div>
	);
};

export default CoursePage;
