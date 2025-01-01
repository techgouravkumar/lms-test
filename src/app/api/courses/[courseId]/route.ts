import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/jwtToken";

export async function GET(
	request: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	if (!mongoose.isValidObjectId(params.courseId)) {
		return NextResponse.json(
			{ success: false, message: "Invalid course ID" },
			{ status: 400 },
		);
	}

	await dbConnect();

	try {
		const { courseId } = params;
		const course = await CourseModel.findById(courseId).populate({
			path: "createdBy",
			select: "name email",
		});

		if (!course) {
			return NextResponse.json(
				{ success: false, message: "Course not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: course,
			message: "Course fetched successfully",
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error fetching course" },
			{ status: 500 },
		);
	}
}

const UpdateCourseSchema = z.object({
	title: z.string().min(3).max(100).optional(),
	description: z.string().min(10).optional(),
	originalCost: z.number().min(0).optional(),
	discount: z.number().min(0).max(100).optional(),
	courseThumbnail: z.string().url().optional(),
	duration: z.number().min(0).optional(),
	validity: z.number().min(1).optional(),
	demoVideo: z.array(z.string()).optional(),
	faq: z
		.array(
			z.object({
				question: z.string().min(10),
				answer: z.string().min(10),
			}),
		)
		.optional(),
	socialMedia: z
		.array(
			z.object({
				platform: z.string().min(1),
				url: z.string().url(),
			}),
		)
		.optional(),
	isPublished: z.boolean().optional(),
	category: z.string().optional(),
	language: z.string().optional(),
});

export async function PUT(
	request: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	const userId = await getDataFromToken(request);
	if (!userId || !mongoose.isValidObjectId(params.courseId)) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized or invalid ID" },
			{ status: 401 },
		);
	}

	await dbConnect();

	try {
		const validation = UpdateCourseSchema.safeParse(await request.json());
		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					errors: validation.error.errors,
				},
				{ status: 400 },
			);
		}

		const course = await CourseModel.findOneAndUpdate(
			{ _id: params.courseId, createdBy: userId },
			validation.data,
			{ new: true, runValidators: true },
		).populate("createdBy", "name email");

		if (!course) {
			return NextResponse.json(
				{ success: false, message: "Course not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: course,
			message: "Course updated successfully",
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error updating course" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	const userId = await getDataFromToken(request);
	if (!userId || !mongoose.isValidObjectId(params.courseId)) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized or invalid ID" },
			{ status: 401 },
		);
	}

	await dbConnect();

	try {
		const course = await CourseModel.findByIdAndDelete(params.courseId);

		if (!course) {
			return NextResponse.json(
				{ success: false, message: "Course not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Course deleted successfully",
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error deleting course" },
			{ status: 500 },
		);
	}
}
