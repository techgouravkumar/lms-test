import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

// Define the type for the update payload
type UpdateStudentPayload = {
	fullName?: string;
	gender?: "male" | "female" | "other";
	phoneNumber?: string;
	isLoggingIn?: boolean;
};

// Validation function for student updates
const validateUpdatePayload = (payload: UpdateStudentPayload) => {
	// Check if fullName is provided and is a string
	if (payload.fullName && typeof payload.fullName !== "string") {
		return "Full name must be a string";
	}
	// Check if gender is provided and is one of the allowed values
	if (
		payload.gender &&
		!["male", "female", "other"].includes(payload.gender)
	) {
		return "Gender must be 'male', 'female', or 'other'";
	}
	// If no validation errors, return null
	return null;
};

// Get student by ID
// export async function GET(
// 	request: NextRequest,
// 	{ params }: { params: { id: string } },
// ) {
// 	// Get the student ID from the URL parameters
// 	const { id } = params;
// 	console.log(id);
// 	// If no ID is provided, return an error
// 	if (!id) {
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				message: "Student ID is required",
// 			},
// 			{ status: 400 },
// 		);
// 	}
// 	// Connect to the database
// 	await dbConnect();
// 	try {
// 		// Find the student by ID and exclude password and token from the response
// 		const student = await StudentModel.findById(id).select(
// 			"-password -verifyCode -verifyCodeExpiry -token -isActive",
// 		);
// 		// If the student is not found, return an error
// 		if (!student) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message: "Student not found",
// 				},
// 				{ status: 404 },
// 			);
// 		}
// 		if (student.enrolledCourses.length !== 0) {
// 			await student.populate("enrolledCourses");
// 		}

// 		// Return the student data with a success status
// 		return NextResponse.json(
// 			{
// 				success: true,
// 				data: student,
// 				message: "Student fetched successfully",
// 			},
// 			{ status: 200 },
// 		);
// 	} catch (error) {
// 		// Log any errors that occur during the process
// 		console.error(error);
// 		// Return an error message with a 500 status code
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				message: "Error fetching student",
// 			},
// 			{ status: 500 },
// 		);
// 	}
// }
// Get student by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{ success: false, message: "Student ID is required" },
			{ status: 400 },
		);
	}

	await dbConnect();

	try {
		const student = await StudentModel.findById(id).select(
			"-password -verifyCode -verifyCodeExpiry -token -isActive",
		);

		if (!student) {
			return NextResponse.json(
				{ success: false, message: "Student not found" },
				{ status: 404 },
			);
		}

		// Populate enrolled courses if any
		if (student.enrolledCourses.length > 0) {
			await student.populate("enrolledCourses");
		}

		// Return student data with isLoggingIn field
		return NextResponse.json(
			{
				success: true,
				data:student,
				message: "Student fetched successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error fetching student" },
			{ status: 500 },
		);
	}
}

// Edit student details
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{ success: false, message: "Student ID is required" },
			{ status: 400 },
		);
	}

	await dbConnect();

	try {
		const body = await request.json();
		const validationError = validateUpdatePayload(body);
		if (validationError) {
			return NextResponse.json(
				{ success: false, message: validationError },
				{ status: 400 },
			);
		}

		// Ensure we are accepting all the fields from the frontend
		const updateData: UpdateStudentPayload = {};
		if (body.fullName) updateData.fullName = body.fullName;
		if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber; // Added phone number
		if (body.gender) updateData.gender = body.gender;
		if (body.isLoggingIn !== undefined)
			updateData.isLoggingIn = body.isLoggingIn; // Ensure it's a boolean

		const updatedStudent = await StudentModel.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true },
		).select(
			"-password -verifyCode -verifyCodeExpiry -token -isActive -enrolledCourses",
		);

		if (!updatedStudent) {
			return NextResponse.json(
				{ success: false, message: "Student not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: updatedStudent,
				message: "Student updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Error updating student" },
			{ status: 500 },
		);
	}
}

// Delete student
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	// Get the student ID from the URL parameters
	const { id } = params;
	// If no ID is provided, return an error
	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Student ID is required",
			},
			{ status: 400 },
		);
	}
	// Connect to the database
	await dbConnect();
	try {
		// Delete the student from the database
		const student = await StudentModel.findById(id);

		// If the student is not found, return an error
		if (!student) {
			return NextResponse.json(
				{
					success: false,
					message: "Student not found",
				},
				{ status: 404 },
			);
		}
		student.isActive = false;
		await student.save();

		// Return the deleted student data with a success status
		return NextResponse.json(
			{ success: true, message: "Student deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		// Log any errors that occur during the process
		console.error(error);
		// Return an error message with a 500 status code
		return NextResponse.json(
			{
				success: false,
				message: "Error deleting student",
			},
			{ status: 500 },
		);
	}
}
