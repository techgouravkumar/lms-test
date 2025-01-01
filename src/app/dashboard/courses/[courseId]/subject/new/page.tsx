"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SubjectForm from "@/components/courses/SubjectForm";
import { useToast } from "@/hooks/use-toast";

const AddSubject = ({ params }: { params: { courseId: string } }) => {
	const { courseId } = params;
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleFormSubmit = async (formData: FormData) => {
		setIsLoading(true);

		try {
			const config = {
				headers: { "Content-Type": "multipart/form-data" },
			};
			console.log("formData", formData);

			const response = await axios.post(
				`/api/courses/${courseId}/subject`,
				formData,
				config,
			);
			console.log("response", response);

			toast({
				title: "Success",
				description: "Subject created successfully",
			});

			router.push(`/dashboard/courses/${courseId}/subject`);
			router.refresh();
		} catch (error) {
			console.error("Error creating subject:", error);
			toast({
				title: "Error",
				description: "Failed to create subject. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Add New Subject</h1>
			<SubjectForm onSubmit={handleFormSubmit} isLoading={isLoading} />
		</div>
	);
};

export default AddSubject;
