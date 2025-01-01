"use client";

import React, { useState } from "react";
import axios from "axios";
import CourseForm from "@/components/courses/CourseForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CoursePage() {
	const { toast } = useToast();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await axios.post("/api/courses", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data.success) {
				toast({
					title: "Course Created",
					description: "Your course has been created successfully.",
				});
				router.replace("dashboard/courses");
			} else {
				setError(response.data.message || "Failed to create course.");
			}
		} catch (error: any) {
			setError(
				error.response?.data?.message ||
					"Something went wrong. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-6">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="dashboard/courses">
									Courses
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>New</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="bg-white rounded-lg shadow-sm">
						<div className="px-6 py-4 border-b">
							<h1 className="text-xl font-semibold text-gray-900">
								Create New Course
							</h1>
						</div>

						{error && (
							<div className="px-6 py-4">
								<div className="text-sm text-red-600">
									{error}
								</div>
							</div>
						)}

						<div className="p-6">
							<CourseForm onSubmit={handleSubmit} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
