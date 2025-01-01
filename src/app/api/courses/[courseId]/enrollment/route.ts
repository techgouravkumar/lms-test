import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import StudentModel from "@/models/Student.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: { courseId: string } },
) {
	try {
		const { courseId } = params;
		const { email } = await req.json();
		console.log(courseId);
		console.log(email);

		if (!email || !courseId) {
			return NextResponse.json(
				{
					success: false,
					message: "Email or Course ID is missing",
				},
				{
					status: 400,
				},
			);
		}
		await dbConnect();

		const student = await StudentModel.findOne({ email });
		if (!student) {
			return NextResponse.json(
				{
					success: false,
					message: "Student not found",
				},
				{
					status: 404,
				},
			);
		}

		const course = await CourseModel.findById(courseId);
		if (!course) {
			return NextResponse.json(
				{
					success: false,
					message: "Course not found",
				},
				{
					status: 404,
				},
			);
		}

		// Check if the student is already enrolled in the course
		if (
			student.enrolledCourses.includes(
				new mongoose.Types.ObjectId(courseId),
			)
		) {
			return NextResponse.json(
				{
					success: false,
					message: "Student is already enrolled in this course",
				},
				{
					status: 400,
				},
			);
		}

		// TODO: Add payment gateway logic here

		student.isSubscribed = true;
		student.subscriptionEndDate = new Date(
			Date.now() + 365 * 24 * 60 * 60 * 1000,
		); // 1 year from now
		student.enrolledCourses.push(course._id);
		await student.save();

		return NextResponse.json(
			{
				success: true,
				message: "Student enrolled successfully",
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Enrollment Error:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Something went wrong",
			},
			{
				status: 500,
			},
		);
	}
}
