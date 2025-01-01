import React, { useState } from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";

const videoSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters long")
		.max(100),
	url: z
		.string()
		.url("Please enter a valid URL")
		.regex(/^https?:\/\/.+$/, "URL must start with http:// or https://"),
	description: z.string().optional(),
	isLive: z.boolean().default(false),
	isLiveChatEnabled: z.boolean().default(false),
});

export type VideoFormValues = z.infer<typeof videoSchema>;

interface AddVideoFormProps {
	onSubmit: (data: VideoFormValues) => Promise<void>;
	isSubmitting: boolean;
	onCancel: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({
	onSubmit,
	isSubmitting,
	onCancel,
}) => {
	const form = useForm<VideoFormValues>({
		resolver: zodResolver(videoSchema),
		defaultValues: {
			title: "",
			url: "",
			description: "",
			isLive: true,
			isLiveChatEnabled: true,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="url"
					render={({ field }) => (
						<FormItem>
							<FormLabel>URL</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isLive"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between">
							<FormLabel>Live Stream</FormLabel>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="isLiveChatEnabled"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between">
							<FormLabel>Enable Live Chat</FormLabel>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<div className="flex justify-end space-x-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Add Video
					</Button>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
};

interface AddVideoSheetProps {
	params: {
		courseId: string;
		subjectId: string;
		chapterId: string;
	};
	onSuccess: () => void;
}

export const AddVideoSheet: React.FC<AddVideoSheetProps> = ({
	params,
	onSuccess,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const { courseId, subjectId, chapterId } = params;

	const handleAddVideo = async (data: VideoFormValues) => {
		try {
			setIsSubmitting(true);
			await axios.post(
				`/api/courses/${courseId}/subject/${subjectId}/chapter/${chapterId}/videos`,
				data,
			);
			toast({
				title: "Success",
				description: "Video added successfully",
			});
			setIsOpen(false);
			onSuccess();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to add video",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button>Add Video</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Add New Video</SheetTitle>
					<SheetDescription>
						Add a new video to this chapter. Fill in the details
						below.
					</SheetDescription>
				</SheetHeader>
				<div className="p-4">
					<AddVideoForm
						onSubmit={handleAddVideo}
						isSubmitting={isSubmitting}
						onCancel={() => setIsOpen(false)}
					/>
				</div>
			</SheetContent>
		</Sheet>
	);
};
