"use client";
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(100, "Title cannot exceed 100 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters"),
	originalCost: z.number().min(0, "Cost cannot be negative"),
	discount: z
		.number()
		.min(0, "Discount cannot be negative")
		.max(100, "Discount cannot exceed 100%"),
	duration: z.number().min(0, "Duration cannot be negative"),
	validity: z.number().min(1, "Validity must be at least 1 day"),
	isPublished: z.boolean().default(false),
	category: z.string().min(1, "Category is required"),
	language: z.string().default("Hindi"),
	courseThumbnail: z.any(),
	demoVideo: z.array(z.string()).optional(),
	faq: z.array(
		z.object({
			question: z
				.string()
				.min(10, "Question must be at least 10 characters"),
			answer: z.string().min(10, "Answer must be at least 10 characters"),
		}),
	),
	socialMedia: z.array(
		z.object({
			platform: z.string().min(1, "Platform is required"),
			url: z.string().url("Invalid URL format"),
		}),
	),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
	initialData?: Partial<FormValues>;
	onSubmit: (data: FormData) => Promise<void>;
}
export default function CourseForm({ initialData, onSubmit }: CourseFormProps) {
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			originalCost: 0,
			discount: 0,
			duration: 0,
			validity: 1,
			isPublished: true,
			category: "",
			language: "Hindi",
			faq: [],
			socialMedia: [],
			...initialData,
		},
	});

	const {
		fields: faqFields,
		append: appendFaq,
		remove: removeFaq,
	} = useFieldArray({
		control: form.control,
		name: "faq",
	});

	const {
		fields: socialFields,
		append: appendSocial,
		remove: removeSocial,
	} = useFieldArray({
		control: form.control,
		name: "socialMedia",
	});

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
			form.setValue("courseThumbnail", file);
		}
	};

	const handleSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (key === "courseThumbnail") {
					if (value instanceof File) {
						formData.append(key, value);
					}
				} else if (key === "faq" || key === "socialMedia") {
					formData.append(key, JSON.stringify(value));
				} else {
					formData.append(key, value?.toString() || "");
				}
			});

			await onSubmit(formData);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setError(
					error.response?.data?.message || "Failed to create course",
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	};
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);
	const MediaCard = () => (
		<Card>
			<CardContent className="pt-6">
				<h3 className="text-lg font-semibold">Media</h3>
				<div className="mt-4 space-y-4">
					<FormField
						control={form.control}
						name="courseThumbnail"
						render={({ field: { value, onChange, ...field } }) => (
							<FormItem>
								<FormLabel>Course Thumbnail</FormLabel>
								<FormControl>
									<div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
										<Input
											type="file"
											accept="image/*"
											onChange={handleImageChange}
											className="hidden"
											id="thumbnail-upload"
											{...field}
										/>
										<label
											htmlFor="thumbnail-upload"
											className="cursor-pointer text-blue-500 hover:underline"
										>
											Upload Thumbnail
										</label>
										{previewUrl && (
											<div className="mt-4">
												<img
													src={previewUrl}
													alt="Thumbnail preview"
													className="w-32 h-32 object-cover rounded-md"
												/>
											</div>
										)}
									</div>
								</FormControl>
								<FormDescription>
									Recommended size: 1280x720px (16:9)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-8"
			>
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<Card>
					<CardContent className="pt-6">
						<div className="space-y-6">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">
											Course Title
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter course title"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Make it clear and catchy
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base">
											Description
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe your course content and learning outcomes"
												className="min-h-[120px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<h3 className="text-lg font-semibold mb-4">
							Course Details
						</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Input
												{...field} // spread the field props to the input
												placeholder="Enter category" // set a placeholder for the input
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="language"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Language</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select language" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="Hindi">
													Hindi
												</SelectItem>
												<SelectItem value="English">
													English
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="originalCost"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price (₹)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) =>
													field.onChange(
														parseFloat(
															e.target.value,
														),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="discount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discount (%)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) =>
													field.onChange(
														parseFloat(
															e.target.value,
														),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Duration (hours)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="0"
												{...field}
												onChange={(e) =>
													field.onChange(
														parseFloat(
															e.target.value,
														),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="validity"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Validity (days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="1"
												{...field}
												onChange={(e) =>
													field.onChange(
														parseFloat(
															e.target.value,
														),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<MediaCard />

				<Card>
					<CardContent className="pt-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">
								FAQ Section
							</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									appendFaq({ question: "", answer: "" })
								}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add FAQ
							</Button>
						</div>

						<div className="space-y-4">
							{faqFields.map((field, index) => (
								<div
									key={field.id}
									className="border rounded-lg p-4 space-y-4"
								>
									<div className="flex justify-between items-start">
										<h4 className="text-sm font-medium">
											FAQ #{index + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeFaq(index)}
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									</div>

									<FormField
										control={form.control}
										name={`faq.${index}.question`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Question</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter question"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`faq.${index}.answer`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Answer</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Enter answer"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">
								Social Media Links
							</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									appendSocial({ platform: "", url: "" })
								}
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Link
							</Button>
						</div>

						<div className="space-y-4">
							{socialFields.map((field, index) => (
								<div
									key={field.id}
									className="border rounded-lg p-4 space-y-4"
								>
									<div className="flex justify-between items-start">
										<h4 className="text-sm font-medium">
											Link #{index + 1}
										</h4>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeSocial(index)}
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									</div>

									<FormField
										control={form.control}
										name={`socialMedia.${index}.platform`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Platform</FormLabel>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select platform" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="youtube">
															YouTube
														</SelectItem>
														<SelectItem value="instagram">
															Instagram
														</SelectItem>
														<SelectItem value="linkedin">
															LinkedIn
														</SelectItem>
														<SelectItem value="twitter">
															Twitter
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name={`socialMedia.${index}.url`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>URL</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Enter social media URL"
														type="url"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<FormField
							control={form.control}
							name="isPublished"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Published
										</FormLabel>
										<FormDescription>
											Make this course visible to students
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Button
					type="submit"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting
						? "Saving..."
						: initialData
						? "Update Course"
						: "Create Course"}
				</Button>
			</form>
		</Form>
	);
}
