import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

// Function to handle student registration
export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		const { email, password, fullName, phoneNumber, gender } =
			await request.json();

		// Validate required fields
		if (!email || !password || !fullName || !phoneNumber || !gender) {
			return NextResponse.json(
				{
					success: false,
					message: "All fields are required.",
				},
				{
					status: 400,
				},
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid email format.",
				},
				{
					status: 400,
				},
			);
		}

		// Validate password strength
		if (password.length < 6) {
			return NextResponse.json(
				{
					success: false,
					message: "Password must be at least 6 characters long.",
				},
				{
					status: 400,
				},
			);
		}

		// Check if a user with the same email exists
		const existingUser = await StudentModel.findOne({ email });
		if (existingUser) {
			return NextResponse.json(
				{
					success: false,
					message: "User with this email already exists.",
				},
				{
					status: 400,
				},
			);
		}

		// Hash password and create new user
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new StudentModel({
			fullName,
			phoneNumber,
			gender,
			email,
			password: hashedPassword,
			isVerified: true, // Automatically verify upon registration
			enrolledCourses: [],
		});
		await newUser.save();

		// Send a welcome email or any other follow-up email if necessary
		// await sendVerificationCode({ email, verificationCode, type: "registration" });

		return NextResponse.json(
			{
				success: true,
				message: "User registered successfully.",
				user: {
					fullName: newUser.fullName,
					email: newUser.email,
					phoneNumber: newUser.phoneNumber,
				},
			},
			{
				status: 201,
			},
		);
	} catch (error) {
		console.log("Error registering user", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error registering user",
			},
			{
				status: 500,
			},
		);
	}
}
