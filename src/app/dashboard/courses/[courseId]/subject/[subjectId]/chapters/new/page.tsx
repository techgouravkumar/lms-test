"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChapterForm } from "@/components/courses/ChapterForm";

const AddChapters = ({
	params,
}: {
	params: {
		courseId: string;
		subjectId: string;
	};
}) => {
	const { courseId, subjectId } = params;
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			const response = await axios.post(
				`/api/courses/${courseId}/subject/${subjectId}/chapter`,
				data,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
            console.log(response.data);

			router.push(`/dashboard/courses/${courseId}/subject/${subjectId}`);
			router.refresh();
		} catch (error) {
			console.error("Error creating chapter:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Add New Chapter</CardTitle>
				<CardDescription>
					Create a new chapter for your subject
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChapterForm onSubmit={handleSubmit} isLoading={isLoading} />
			</CardContent>
		</Card>
	);
};

export default AddChapters;
