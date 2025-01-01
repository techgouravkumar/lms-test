import dbConnect from "@/lib/dbConnect";
import CourseModel from "@/models/Course.model";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const { email, courseId } = await req.json();

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
                }
            );
        }

        const student = await StudentModel.findOne({ email });
        if (!student) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found",
                },
                {
                    status: 404,
                }
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
                }
            );
        }

        // Check if the student is enrolled in the course
        const isEnrolled = student.enrolledCourses.includes(courseId);

        return NextResponse.json(
            {
                success: true,
                isEnrolled,
                message: isEnrolled ? "Student is already enrolled in this course" : "Student is not enrolled in this course",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error("Enrollment Check Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}
