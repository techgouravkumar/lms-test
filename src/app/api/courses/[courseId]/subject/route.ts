import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import SubjectModel from "@/models/Subject.model";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";

// Zod schema for subject validation
const subjectFormSchema = z.object({
	name: z
		.string({
			required_error: "Subject name is required",
			invalid_type_error: "Subject name must be a string",
		})
		.min(2, "Subject name must be at least 2 characters long")
		.max(50, "Subject name cannot exceed 50 characters")
		.trim(),
	description: z
		.string({
			required_error: "Description is required",
			invalid_type_error: "Description must be a string",
		})
		.max(500, "Description cannot exceed 500 characters")
		.trim(),
});

// GET handler - Get all subjects for a course
export async function GET(
	request: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	try {
		const { courseId } = params;

		if (!mongoose.Types.ObjectId.isValid(courseId)) {
			return NextResponse.json(
				{ success: false, message: "Invalid course ID format" },
				{ status: 400 },
			);
		}

		await dbConnect();

		const course = await CourseModel.findById(courseId);
		if (!course) {
			return NextResponse.json(
				{ success: false, message: "Course not found" },
				{ status: 404 },
			);
		}

		const subjects = await SubjectModel.find({ courseId })
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json(
			{
				success: true,
				message: "Subjects fetched successfully",
				data: subjects,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching subjects:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching subjects" },
			{ status: 500 },
		);
	}
}

// POST handler - Create a new subject with form data
export async function POST(
	request: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	try {
		const { courseId } = params;

		if (!mongoose.Types.ObjectId.isValid(courseId)) {
			return NextResponse.json(
				{ success: false, message: "Invalid course ID format" },
				{ status: 400 },
			);
		}

		await dbConnect();

		const course = await CourseModel.findById(courseId);
		if (!course) {
			return NextResponse.json(
				{ success: false, message: "Course not found" },
				{ status: 404 },
			);
		}

		// Handle form data
		const formData = await request.formData();

		const name = formData.get("name") as string;
		const description = formData.get("description") as string;
		const imageFile = formData.get("image") as File | null;

		// Validate form data
		const validationResult = subjectFormSchema.safeParse({
			name,
			description,
		});

		if (!validationResult.success) {
			const formattedErrors = validationResult.error.errors.map(
				(error) => ({
					path: error.path.join("."),
					message: error.message,
				}),
			);

			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					errors: formattedErrors,
				},
				{ status: 400 },
			);
		}

		// Check if subject name already exists
		const existingSubject = await SubjectModel.findOne({
			name: validationResult.data.name,
		});

		if (existingSubject) {
			return NextResponse.json(
				{
					success: false,
					message: "Subject with this name already exists",
				},
				{ status: 409 },
			);
		}

		let imageUrl: string | undefined;

		// Handle image upload if present
		if (imageFile) {
			try {
				validateImageFile(imageFile);

				// Convert File to Buffer for Cloudinary upload
				const buffer = Buffer.from(await imageFile.arrayBuffer());

				// Upload to Cloudinary with specific configuration
				imageUrl = await uploadToCloudinary(buffer, {
					folder: `courses/${courseId}/subjects`,
					resource_type: "image",
					quality: "auto",
					fetch_format: "auto",
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
		console.log("Image URL:", imageUrl);
		// Create new subject
		const subject = await SubjectModel.create({
			...validationResult.data,
			imageUrl,
			courseId,
		});

		console.log("Subject created:", subject);
		return NextResponse.json(
			{
				success: true,
				message: "Subject created successfully",
				data: subject,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating subject:", error);
		return NextResponse.json(
			{ success: false, message: "Error creating subject" },
			{ status: 500 },
		);
	}
}
