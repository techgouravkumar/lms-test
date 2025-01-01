import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import SubjectModel from "@/models/Subject.model";
import {
	uploadToCloudinary,
	deleteFromCloudinary,
	validateImageFile,
} from "@/lib/cloudinary";
import ChapterModel from "@/models/Chapter.model";

// Zod schema for subject validation
const subjectUpdateSchema = z.object({
	name: z
		.string()
		.min(2, "Subject name must be at least 2 characters long")
		.max(50, "Subject name cannot exceed 50 characters")
		.trim()
		.optional(),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters long")
		.max(500, "Description cannot exceed 500 characters")
		.trim()
		.optional(),
});

// Validate IDs and get course/subject with proper error handling
async function validateAndFetch(courseId: string, subjectId: string) {
	if (!mongoose.Types.ObjectId.isValid(courseId)) {
		return { error: "Invalid course ID format", status: 400 };
	}

	if (!mongoose.Types.ObjectId.isValid(subjectId)) {
		return { error: "Invalid subject ID format", status: 400 };
	}

	try {
		await dbConnect();
		console.log("courseId", courseId);
		console.log("subjectId", subjectId);

		const [course, subject, chapters] = await Promise.all([
			CourseModel.findById(courseId),
			SubjectModel.findById(subjectId),
			ChapterModel.find({ subjectId }).sort({ createdAt: 1 }),
		]);

		if (!course) {
			return { error: "Course not found", status: 404 };
		}

		if (!subject) {
			return { error: "Subject not found", status: 404 };
		}

		return { course, subject, chapters };
	} catch (error) {
		console.error("Database error in validateAndFetch:", error);
		throw new Error("Database error occurred");
	}
}

// GET - Fetch a specific subject
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

		// Combine subject data with chapters
		const responseData = {
			...result.subject.toObject(),
			chapters: result.chapters,
		};

		return NextResponse.json(
			{
				success: true,
				message: "Subject with chapters fetched successfully",
				data: responseData,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching subject:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PUT - Replace entire subject
export async function PUT(
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

		const formData = await request.formData();
		const updateData = {
			name: formData.get("name") as string,
			description: formData.get("description") as string,
		};

		const validationResult = subjectUpdateSchema.safeParse(updateData);

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

		// Check name uniqueness within the course
		if (updateData.name && updateData.name !== result.subject.name) {
			const existingSubject = await SubjectModel.findOne({
				name: updateData.name,
				courseId: courseId,
				_id: { $ne: subjectId },
			});

			if (existingSubject) {
				return NextResponse.json(
					{
						success: false,
						message:
							"Subject with this name already exists in this course",
					},
					{ status: 409 },
				);
			}
		}

		// Handle image operations
		const imageFile = formData.get("image") as File | null;
		const deleteImage = formData.get("deleteImage") === "true";
		let imageUrl = result.subject.imageUrl;

		if (deleteImage && imageUrl) {
			await deleteFromCloudinary(imageUrl);
			imageUrl = undefined;
		}

		if (imageFile) {
			try {
				if (result.subject.imageUrl) {
					await deleteFromCloudinary(result.subject.imageUrl);
				}

				validateImageFile(imageFile);
				const buffer = await imageFile.arrayBuffer();
				imageUrl = await uploadToCloudinary(Buffer.from(buffer), {
					folder: `courses/${courseId}/subjects`,
				});
			} catch (error) {
				return NextResponse.json(
					{
						success: false,
						message:
							error instanceof Error
								? error.message
								: "Error uploading image",
					},
					{ status: 400 },
				);
			}
		}

		const updatedSubject = await SubjectModel.findByIdAndUpdate(
			subjectId,
			{
				...validationResult.data,
				imageUrl,
			},
			{ new: true, runValidators: true },
		);

		return NextResponse.json(
			{
				success: true,
				message: "Subject updated successfully",
				data: updatedSubject,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating subject:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH - Partial update of subject
export async function PATCH(
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

		const formData = await request.formData();
		const updateData: Record<string, any> = {};

		// Only include fields that are present in the form data
		if (formData.has("name"))
			updateData.name = formData.get("name") as string;
		if (formData.has("description"))
			updateData.description = formData.get("description") as string;

		const validationResult = subjectUpdateSchema
			.partial()
			.safeParse(updateData);

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

		// Check name uniqueness within the course if name is being updated
		if (updateData.name && updateData.name !== result.subject.name) {
			const existingSubject = await SubjectModel.findOne({
				name: updateData.name,
				courseId: courseId,
				_id: { $ne: subjectId },
			});

			if (existingSubject) {
				return NextResponse.json(
					{
						success: false,
						message:
							"Subject with this name already exists in this course",
					},
					{ status: 409 },
				);
			}
		}

		// Handle image operations
		const imageFile = formData.get("image") as File | null;

		if (imageFile) {
			try {
				if (result.subject.imageUrl) {
					await deleteFromCloudinary(result.subject.imageUrl);
				}

				validateImageFile(imageFile);
				const buffer = await imageFile.arrayBuffer();
				updateData.imageUrl = await uploadToCloudinary(
					Buffer.from(buffer),
					{
						folder: `courses/${courseId}/subjects`,
					},
				);
			} catch (error) {
				return NextResponse.json(
					{
						success: false,
						message:
							error instanceof Error
								? error.message
								: "Error uploading image",
					},
					{ status: 400 },
				);
			}
		}

		const updatedSubject = await SubjectModel.findByIdAndUpdate(
			subjectId,
			{ $set: updateData },
			{ new: true, runValidators: true },
		);

		return NextResponse.json(
			{
				success: true,
				message: "Subject updated successfully",
				data: updatedSubject,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating subject:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE - Remove a subject and its image
export async function DELETE(
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

		// Delete associated image if it exists
		if (result.subject.imageUrl) {
			await deleteFromCloudinary(result.subject.imageUrl);
		}

		await SubjectModel.findByIdAndDelete(subjectId);

		return NextResponse.json(
			{
				success: true,
				message: "Subject deleted successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting subject:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 },
		);
	}
}
