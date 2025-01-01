import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import SubjectModel from "@/models/Subject.model";
import ChapterModel from "@/models/Chapter.model";
import VideoModel from "@/models/Video.model";

const chapterUpdateSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters long")
		.max(100, "Title cannot exceed 100 characters")
		.optional(),
	description: z
		.string()
		.max(1000, "Description cannot exceed 1000 characters")
		.optional(),
	resources: z
		.array(
			z.object({
				title: z
					.string()
					.min(3, "Resource title must be at least 3 characters long")
					.max(100, "Resource title cannot exceed 100 characters"),
				url: z.string().url("Invalid resource URL"),
			}),
		)
		.optional(),
	chapterThumbnail: z.string().url("Invalid thumbnail URL").optional(),
});

// Helper function (unchanged)
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

// GET - Fetch a chapter with all its videos
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

		const chapter = await ChapterModel.findById(chapterId).lean();
		if (!chapter) {
			return NextResponse.json(
				{ success: false, message: "Chapter not found" },
				{ status: 404 },
			);
		}

		const videos = await VideoModel.find({ chapterId })
			.sort({
				createdAt: 1,
			})
			.lean();

		const chapterWithVideos = {
			...chapter,
			videos,
		};

		return NextResponse.json(
			{
				success: true,
				message: "Chapter with videos fetched successfully",
				data: chapterWithVideos,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching chapter with videos:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching chapter with videos" },
			{ status: 500 },
		);
	}
}


// PUT - Update a chapter
export async function PUT(
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
		const validationResult = chapterUpdateSchema.safeParse(body);

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

		const updatedChapter = await ChapterModel.findByIdAndUpdate(
			chapterId,
			validationResult.data,
			{ new: true, runValidators: true },
		);

		if (!updatedChapter) {
			return NextResponse.json(
				{ success: false, message: "Chapter not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Chapter updated successfully",
				data: updatedChapter,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating chapter:", error);
		return NextResponse.json(
			{ success: false, message: "Error updating chapter" },
			{ status: 500 },
		);
	}
}
