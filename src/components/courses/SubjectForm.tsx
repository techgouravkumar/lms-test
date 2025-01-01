"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const subjectFormSchema = z.object({
	name: z
		.string()
		.min(2, "Subject name must be at least 2 characters long")
		.max(50, "Subject name cannot exceed 50 characters"),
	description: z
		.string()
		.max(500, "Description cannot exceed 500 characters")
		.optional(),
	image: z.any().optional(),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
	initialData?: SubjectFormData;
	onSubmit: (formData: FormData) => Promise<void>;
	isLoading: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
	initialData,
	onSubmit,
	isLoading,
}) => {
	const [errors, setErrors] = useState<Partial<SubjectFormData>>({});
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrors({});

		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name"),
			description: formData.get("description"),
			image: formData.get("image"),
		};

		try {
			subjectFormSchema.parse(data);
			await onSubmit(formData);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setErrors(
					error.flatten().fieldErrors as Partial<SubjectFormData>,
				);
				toast({
					title: "Validation Error",
					description: "Please check the form for errors",
					variant: "destructive",
				});
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="name">Subject Name*</Label>
				<Input
					id="name"
					name="name"
					defaultValue={initialData?.name}
					placeholder="Enter subject name"
					className={errors.name ? "border-destructive" : ""}
				/>
				{errors.name && (
					<p className="text-destructive text-sm mt-1">
						{errors.name}
					</p>
				)}
			</div>

			<div>
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					defaultValue={initialData?.description}
					placeholder="Enter subject description"
					className={errors.description ? "border-destructive" : ""}
					rows={4}
				/>
				{errors.description && (
					<p className="text-destructive text-sm mt-1">
						{errors.description}
					</p>
				)}
			</div>

			<div>
				<Label htmlFor="image">Subject Image</Label>
				<Input
					id="image"
					name="image"
					type="file"
					accept="image/*"
					className="cursor-pointer"
				/>
			</div>

			<Button
				type="submit"
				disabled={isLoading}
				className="w-full md:w-auto"
			>
				{isLoading ? (
					<span className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						{initialData ? "Updating..." : "Creating..."}
					</span>
				) : initialData ? (
					"Update Subject"
				) : (
					"Create Subject"
				)}
			</Button>
		</form>
	);
};

export default SubjectForm;
