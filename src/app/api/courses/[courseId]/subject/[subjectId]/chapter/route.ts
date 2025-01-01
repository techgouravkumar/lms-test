import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import SubjectModel from "@/models/Subject.model";
import ChapterModel from "@/models/Chapter.model";

const resourceSchema = z.object({
	title: z
		.string({
			required_error: "Resource title is required",
		})
		.min(3, "Resource title must be at least 3 characters long")
		.max(100, "Resource title cannot exceed 100 characters")
		.trim(),
	url: z
		.string({
			required_error: "Resource URL is required",
		})
		.trim()
		.url("Invalid resource URL"),
});

const chapterSchema = z.object({
	title: z
		.string({
			required_error: "Chapter title is required",
		})
		.min(3, "Chapter title must be at least 3 characters long")
		.max(100, "Chapter title cannot exceed 100 characters")
		.trim(),
	description: z
		.string({
			required_error: "Chapter description is required",
		})
		.max(1000, "Description cannot exceed 1000 characters")
		.trim(),
	resources: z.array(resourceSchema).optional(),
});

// Type for validated chapter data
type ChapterInput = z.infer<typeof chapterSchema>;

// Validate route parameters and fetch related documents
async function validateAndFetch(
	courseId: string,
	subjectId: string,
	chapterId?: string,
) {
	if (!mongoose.Types.ObjectId.isValid(courseId)) {
		return { error: "Invalid course ID format", status: 400 };
	}

	if (!mongoose.Types.ObjectId.isValid(subjectId)) {
		return { error: "Invalid subject ID format", status: 400 };
	}

	if (chapterId && !mongoose.Types.ObjectId.isValid(chapterId)) {
		return { error: "Invalid chapter ID format", status: 400 };
	}

	await dbConnect();

	const course = await CourseModel.findById(courseId);
	if (!course) {
		return { error: "Course not found", status: 404 };
	}

	const subject = await SubjectModel.findOne({
		_id: subjectId,
		courseId: courseId,
	});
	if (!subject) {
		return { error: "Subject not found", status: 404 };
	}

	if (chapterId) {
		const chapter = await ChapterModel.findOne({
			_id: chapterId,
			subjectId: subjectId,
		});
		if (!chapter) {
			return { error: "Chapter not found", status: 404 };
		}
		return { course, subject, chapter };
	}

	return { course, subject };
}

// GET - List all chapters for a subject
export async function GET(
	request: NextRequest,
	{ params }: { params: { courseId: string; subjectId: string } },
) {
	try {
		const { courseId, subjectId } = params;
		const result = await validateAndFetch(courseId, subjectId);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		const chapters = await ChapterModel.find({ subjectId }).sort({
			createdAt: -1,
		});

		return NextResponse.json(
			{
				success: true,
				message: "Chapters fetched successfully",
				data: chapters,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching chapters:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching chapters" },
			{ status: 500 },
		);
	}
}

// POST - Create a new chapter
export async function POST(
	request: NextRequest,
	{ params }: { params: { courseId: string; subjectId: string } },
) {
	try {
		const { courseId, subjectId } = params;
		const result = await validateAndFetch(courseId, subjectId);

		if ("error" in result) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status },
			);
		}

		const body = await request.json();
		const validationResult = chapterSchema.safeParse(body);

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

		const chapter = await ChapterModel.create({
			...validationResult.data,
			subjectId,
		});

		return NextResponse.json(
			{
				success: true,
				message: "Chapter created successfully",
				data: chapter,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating chapter:", error);
		return NextResponse.json(
			{ success: false, message: "Error creating chapter" },
			{ status: 500 },
		);
	}
}
