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

// Helper function to validate route parameters and fetch related documents
async function validateAndFetch(
	courseId: string,
	subjectId: string,
	chapterId: string,
	videoId?: string,
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
	if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
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

	if (videoId) {
		const video = await VideoModel.findOne({
			_id: videoId,
			chapterId,
		});
		if (!video) {
			return { error: "Video not found", status: 404 };
		}
		return { course, subject, chapter, video };
	}

	return { course, subject, chapter };
}

// GET - List all videos in a chapter
export async function GET(
	request: NextRequest,
	{
		params,
	}: { params: { courseId: string; subjectId: string; chapterId: string } },
) {
	try {
		const { courseId, subjectId, chapterId } = params;
		const result = await validateAndFetch(courseId, subjectId, chapterId);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		const videos = await VideoModel.find({ chapterId });

		return NextResponse.json(
			{
				success: true,
				message: "Videos fetched successfully",
				data: videos,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching videos:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching videos" },
			{ status: 500 },
		);
	}
}

// POST - Create a new video
export async function POST(
	request: NextRequest,
	{
		params,
	}: { params: { courseId: string; subjectId: string; chapterId: string } },
) {
	try {
		const { courseId, subjectId, chapterId } = params;
		const result = await validateAndFetch(courseId, subjectId, chapterId);

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

		const video = await VideoModel.create({
			...validationResult.data,
			chapterId,
		});

		// Update chapter's videos array
		await ChapterModel.findByIdAndUpdate(chapterId, {
			$push: { videos: video._id },
		});

		return NextResponse.json(
			{
				success: true,
				message: "Video created successfully",
				data: video,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating video:", error);
		return NextResponse.json(
			{ success: false, message: "Error creating video" },
			{ status: 500 },
		);
	}
}
