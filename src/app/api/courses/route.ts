import { z } from "zod";
import { getDataFromToken } from "@/helpers/jwtToken";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import StudentModel from "@/models/Student.model";

// Zod schemas remain the same
const FAQSchema = z.object({
	question: z.string().min(10, "Question must be at least 10 characters"),
	answer: z.string().min(10, "Answer must be at least 10 characters"),
});

const SocialMediaSchema = z.object({
	platform: z.string().min(1, "Platform is required"),
	url: z.string().url("Invalid URL format"),
});

const CreateCourseSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(100, "Title cannot exceed 100 characters")
		.trim(),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.trim(),
	originalCost: z.number().min(0, "Cost cannot be negative"),
	discount: z
		.number()
		.min(0, "Discount cannot be negative")
		.max(100, "Discount cannot exceed 100%")
		.default(0),
	courseThumbnail: z.string().url().optional(),
	duration: z.number().min(0, "Duration cannot be negative"),
	validity: z.number().min(1, "Validity must be at least 1 day"),
	demoVideo: z.array(z.string()).optional(),
	faq: z.array(FAQSchema).optional(),
	socialMedia: z.array(SocialMediaSchema).optional(),
	isPublished: z.boolean().default(false),
	category: z.string().optional(),
	language: z.string().default("Hindi"),
});

export async function GET(request: NextRequest) {
	await dbConnect();
	try {
		// Extract student ID from search params
		const { searchParams } = new URL(request.nextUrl);
		const studentId = searchParams.get("studentId");

		// Fetch courses with creator details
		const courses = await CourseModel.find().populate(
			"createdBy",
			"name email",
		);

		// If studentId is provided, check enrollment
		if (!studentId) {
			return NextResponse.json(
				{
					success: true,
					data: courses,
					message: "Courses fetched successfully",
				},
				{ status: 200 },
			);
		}

		// Find student once instead of for each course
		const student = await StudentModel.findById(studentId);
		if (!student) {
			return NextResponse.json(
				{
					success: false,
					message: "Student not found",
				},
				{ status: 404 },
			);
		}

		// Map courses with enrollment status
		const coursesWithEnrollmentStatus = courses.map((course) => {
			const courseObject = course.toObject();
			courseObject.isEnrolled = student.enrolledCourses.some(
				(enrolledCourse) =>
					enrolledCourse.toString() === course._id.toString(),
			);
			return courseObject;
		});

		return NextResponse.json(
			{
				success: true,
				data: coursesWithEnrollmentStatus,
				message: "Courses fetched successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error fetching courses" },
			{ status: 500 },
		);
	}
}

// Updated POST endpoint with image upload handling
export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const userId = await getDataFromToken(request);
		if (!userId || !mongoose.isValidObjectId(userId)) {
			return NextResponse.json(
				{
					success: false,
					message: "Unauthorized or invalid user ID",
				},
				{ status: 401 },
			);
		}

		// Parse form data
		const formData = await request.formData();

		// Handle thumbnail upload
		const thumbnailFile = formData.get("courseThumbnail") as File | null;
		let thumbnailUrl = "";

		if (thumbnailFile) {
			try {
				// Validate the image file
				validateImageFile(thumbnailFile);

				// Convert File to Buffer for Cloudinary upload
				const buffer = Buffer.from(await thumbnailFile.arrayBuffer());

				// Upload to Cloudinary with specific configuration
				thumbnailUrl = await uploadToCloudinary(buffer, {
					folder: "course-thumbnails",
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
								: "Error uploading thumbnail",
					},
					{ status: 400 },
				);
			}
		}

		// Prepare course data
		const courseData = {
			title: formData.get("title"),
			description: formData.get("description"),
			originalCost: Number(formData.get("originalCost")),
			discount: Number(formData.get("discount")),
			duration: Number(formData.get("duration")),
			validity: Number(formData.get("validity")),
			isPublished: formData.get("isPublished") === "true",
			category: formData.get("category"),
			language: formData.get("language"),
			courseThumbnail: thumbnailUrl,
			demoVideo:
				formData.getAll("demoVideo").length > 0
					? formData.getAll("demoVideo")
					: undefined,
			faq: formData.get("faq")
				? JSON.parse(formData.get("faq") as string)
				: undefined,
			socialMedia: formData.get("socialMedia")
				? JSON.parse(formData.get("socialMedia") as string)
				: undefined,
		};

		// Validate course data
		const validationResult = CreateCourseSchema.safeParse(courseData);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					errors: validationResult.error.errors.map((err) => ({
						path: err.path.join("."),
						message: err.message,
					})),
				},
				{ status: 400 },
			);
		}

		// Connect to database and create course
		await dbConnect();

		const newCourseData = {
			...validationResult.data,
			createdBy: userId,
			ratings: {
				average: 0,
				count: 0,
			},
		};

		const newCourse = await CourseModel.create(newCourseData);
		await newCourse.populate("createdBy", "name email");
		await newCourse.populate("demoVideo");

		const courseObject = newCourse.toObject({ virtuals: true });

		return NextResponse.json(
			{
				success: true,
				message: "Course created successfully",
				data: courseObject,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Course creation error:", error);

		if (error instanceof mongoose.Error.ValidationError) {
			return NextResponse.json(
				{
					success: false,
					message: "Validation error",
					errors: Object.values(error.errors).map(
						(err) => err.message,
					),
				},
				{ status: 400 },
			);
		}

		if (error instanceof mongoose.Error) {
			return NextResponse.json(
				{
					success: false,
					message: "Database error",
					error: error.message,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
