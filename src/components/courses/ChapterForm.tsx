"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const resourceSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters long")
		.max(100, "Title cannot exceed 100 characters"),
	url: z.string().url("Invalid URL"),
});

const chapterSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters long")
		.max(100, "Title cannot exceed 100 characters"),
	description: z
		.string()
		.max(1000, "Description cannot exceed 1000 characters"),
	resources: z.array(resourceSchema).optional(),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
	onSubmit: (data: ChapterFormData) => Promise<void>;
	isLoading: boolean;
}

export function ChapterForm({ onSubmit, isLoading }: ChapterFormProps) {
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ChapterFormData>({
		resolver: zodResolver(chapterSchema),
		defaultValues: {
			resources: [{ title: "", url: "" }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "resources",
	});

	const onSubmitForm = async (data: ChapterFormData) => {
		try {
			setError(null);
			await onSubmit(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div>
				<Label htmlFor="title">Chapter Title</Label>
				<Input id="title" {...register("title")} />
				{errors.title && (
					<p className="text-red-500 text-sm mt-1">
						{errors.title.message}
					</p>
				)}
			</div>

			<div>
				<Label htmlFor="description">Description</Label>
				<Textarea id="description" {...register("description")} />
				{errors.description && (
					<p className="text-red-500 text-sm mt-1">
						{errors.description.message}
					</p>
				)}
			</div>

			<div>
				<Label>Resources</Label>
				{fields.map((field, index) => (
					<div key={field.id} className="flex items-end gap-2 mt-2">
						<div className="flex-1">
							<Input
								placeholder="Resource Title"
								{...register(
									`resources.${index}.title` as const,
								)}
							/>
							{errors.resources?.[index]?.title && (
								<p className="text-red-500 text-sm mt-1">
									{errors.resources[index]?.title?.message}
								</p>
							)}
						</div>
						<div className="flex-1">
							<Input
								placeholder="Resource URL"
								{...register(`resources.${index}.url` as const)}
							/>
							{errors.resources?.[index]?.url && (
								<p className="text-red-500 text-sm mt-1">
									{errors.resources[index]?.url?.message}
								</p>
							)}
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => remove(index)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				))}
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="mt-2"
					onClick={() => append({ title: "", url: "" })}
				>
					<Plus className="h-4 w-4 mr-2" /> Add Resource
				</Button>
			</div>

			<Button type="submit" disabled={isLoading}>
				{isLoading ? "Adding Chapter..." : "Add Chapter"}
			</Button>
		</form>
	);
}
