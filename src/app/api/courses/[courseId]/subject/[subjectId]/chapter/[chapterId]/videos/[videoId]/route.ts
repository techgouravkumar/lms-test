import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import SubjectModel from "@/models/Subject.model";
import ChapterModel from "@/models/Chapter.model";
import VideoModel from "@/models/Video.model";

// Zod schema for video validation
const videoSchema = z.object({
	title: z
		.string({
			required_error: "Video title is required",
		})
		.min(3, "Title must be at least 3 characters long")
		.max(100, "Title cannot exceed 100 characters")
		.trim(),
	url: z
		.string({
			required_error: "Video URL is required",
		})
		.url("Invalid video URL")
		.regex(/^https?:\/\/.+$/, "URL must start with http:// or https://"),
	description: z.string().trim().default(""),
	isLive: z.boolean().default(true),
	isLiveChatEnabled: z.boolean().default(true),
});

// Type for validated video data
type VideoInput = z.infer<typeof videoSchema>;

// Helper function to validate route parameters and fetch related documents
async function validateAndFetch(
	courseId: string,
	subjectId: string,
	chapterId: string,
	videoId: string,
) {
	if (!mongoose.Types.ObjectId.isValid(courseId)) {
		return { error: "Invalid course ID format", status: 400 };
	}
	if (!mongoose.Types.ObjectId.isValid(subjectId)) {
		return { error: "Invalid subject ID format", status: 400 };
	}
	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		return { error: "Invalid chapter ID format", status: 400 };
	}
	if (!mongoose.Types.ObjectId.isValid(videoId)) {
		return { error: "Invalid video ID format", status: 400 };
	}

	await dbConnect();

	const course = await CourseModel.findById(courseId);
	if (!course) {
		return { error: "Course not found", status: 404 };
	}

	const subject = await SubjectModel.findOne({
		_id: subjectId,
		courseId,
	});
	if (!subject) {
		return { error: "Subject not found", status: 404 };
	}

	const chapter = await ChapterModel.findOne({
		_id: chapterId,
		subjectId,
	});
	if (!chapter) {
		return { error: "Chapter not found", status: 404 };
	}

	const video = await VideoModel.findOne({
		_id: videoId,
		chapterId,
	});
	if (!video) {
		return { error: "Video not found", status: 404 };
	}

	return { course, subject, chapter, video };
}

// GET - Fetch specific video
export async function GET(
	request: NextRequest,
	{
		params,
	}: {
		params: {
			courseId: string;
			subjectId: string;
			chapterId: string;
			videoId: string;
		};
	},
) {
	try {
		const { courseId, subjectId, chapterId, videoId } = params;
		const result = await validateAndFetch(
			courseId,
			subjectId,
			chapterId,
			videoId,
		);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Video fetched successfully",
				data: result.video,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching video:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching video" },
			{ status: 500 },
		);
	}
}

// PUT - Update entire video
export async function PUT(
	request: NextRequest,
	{
		params,
	}: {
		params: {
			courseId: string;
			subjectId: string;
			chapterId: string;
			videoId: string;
		};
	},
) {
	try {
		const { courseId, subjectId, chapterId, videoId } = params;
		const result = await validateAndFetch(
			courseId,
			subjectId,
			chapterId,
			videoId,
		);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		const body = await request.json();
		const validationResult = videoSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					errors: validationResult.error.errors,
				},
				{ status: 400 },
			);
		}

		const updatedVideo = await VideoModel.findByIdAndUpdate(
			videoId,
			validationResult.data,
			{ new: true, runValidators: true },
		);

		return NextResponse.json(
			{
				success: true,
				message: "Video updated successfully",
				data: updatedVideo,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating video:", error);
		return NextResponse.json(
			{ success: false, message: "Error updating video" },
			{ status: 500 },
		);
	}
}

// PATCH - Partial update of video
export async function PATCH(
	request: NextRequest,
	{
		params,
	}: {
		params: {
			courseId: string;
			subjectId: string;
			chapterId: string;
			videoId: string;
		};
	},
) {
	try {
		const { courseId, subjectId, chapterId, videoId } = params;
		const result = await validateAndFetch(
			courseId,
			subjectId,
			chapterId,
			videoId,
		);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		const body = await request.json();
		const validationResult = videoSchema.partial().safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					errors: validationResult.error.errors,
				},
				{ status: 400 },
			);
		}

		const updatedVideo = await VideoModel.findByIdAndUpdate(
			videoId,
			{ $set: validationResult.data },
			{ new: true, runValidators: true },
		);

		return NextResponse.json(
			{
				success: true,
				message: "Video updated successfully",
				data: updatedVideo,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating video:", error);
		return NextResponse.json(
			{ success: false, message: "Error updating video" },
			{ status: 500 },
		);
	}
}

// DELETE - Remove a video
export async function DELETE(
	request: NextRequest,
	{
		params,
	}: {
		params: {
			courseId: string;
			subjectId: string;
			chapterId: string;
			videoId: string;
		};
	},
) {
	try {
		const { courseId, subjectId, chapterId, videoId } = params;
		const result = await validateAndFetch(
			courseId,
			subjectId,
			chapterId,
			videoId,
		);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		await VideoModel.findByIdAndDelete(videoId);

		return NextResponse.json(
			{
				success: true,
				message: "Video deleted successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting video:", error);
		return NextResponse.json(
			{ success: false, message: "Error deleting video" },
			{ status: 500 },
		);
	}
}
