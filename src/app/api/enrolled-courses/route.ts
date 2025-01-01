import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		// Parse the JSON body
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 },
			);
		}
		// Connect to the MongoDB database
		await dbConnect();

		// Find the student by email and populate enrolledCourses with specific fields
		const student = await StudentModel.findOne({ email }).populate({
			path: "enrolledCourses",
			select: "title description originalCost discount createdAt updatedAt courseThumbnail duration validity demoVideo faq socialMedia isPublished category language ratings",
			populate: {
				path: "createdBy",
				select: "name email",
			},
		});

		if (!student) {
			return NextResponse.json(
				{ error: "Student not found" },
				{ status: 404 },
			);
		}

		// Calculate finalPrice for each course
		const enrolledCoursesWithFinalPrice = student.enrolledCourses.map(
			(course: any) => {
				const discountAmount =
					(course.originalCost * course.discount) / 100;
				const finalPrice = course.originalCost - discountAmount;
				return { ...course.toObject(), finalPrice };
			},
		);

		// Return the enrolled courses
		return NextResponse.json(
			{
				message: "Enrolled courses fetched successfully",
				enrolledCourses: enrolledCoursesWithFinalPrice,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching enrolled courses:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
