import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCode } from "@/helpers/sendMail";

// This function handles the POST request for the sign-up route.
export async function POST(request: NextRequest) {
	// Connect to the database.
	await dbConnect();
	try {
		// Get the user data from the request body.
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

		// Validate email format (basic regex)
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

		// Validate password strength (example: minimum length)
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

		// Check if a user with the same email already exists and is verified.
		const existingUserEmail = await StudentModel.findOne({
			email,
		});
		// If a verified user with the same email exists, return an error.
		if (existingUserEmail && existingUserEmail.isVerified) {
			return NextResponse.json(
				{
					success: false,
					message: "User with this email already exists",
				},
				{
					status: 400,
				},
			);
		}

		const verificationCode = generateVerificationCode();

		// If a user with the same phone number exists.
		if (existingUserEmail) {
			// Check if the user is already verified.
			if (existingUserEmail.isVerified) {
				return NextResponse.json(
					{
						success: false,
						message: "User with this phone number already exists",
					},
					{
						status: 400,
					},
				);
			} else {
				// If the user is not verified.
				const hashedPassword = await bcrypt.hash(password, 10);
				existingUserEmail.password = hashedPassword;
				existingUserEmail.gender = gender;
				existingUserEmail.fullName = fullName;
				existingUserEmail.phoneNumber = phoneNumber;
				existingUserEmail.email = email;
				existingUserEmail.verifyCode = verificationCode;
				existingUserEmail.verifyCodeExpiry = new Date(
					Date.now() + 1000 * 60 * 5,
				);
				await existingUserEmail.save();
			}
		} else {
			// If the user does not exist, create a new user.
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = new StudentModel({
				fullName,
				phoneNumber,
				gender,
				email,
				password: hashedPassword,
				enrolledCourses: [],
				verifyCode: verificationCode,
				verifyCodeExpiry: new Date(Date.now() + 1000 * 60 * 5),
			});
			await newUser.save();
		}

		// Send the verification code via email
		await sendVerificationCode({
			email,
			verificationCode,
			type: "registration",
		});
		// Find the user by email and select only the necessary fields.
		const user = await StudentModel.findOne({ email }).select(
			"-password -verifyCode -verifyCodeExpiry -token -isActive",
		);

		// If the email was sent successfully, return a success message.
		return NextResponse.json(
			{
				success: true,
				message:
					"User registered successfully. Please verify your email.",
				user,
			},
			{
				status: 200,
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

// Helper function to generate verification code
function generateVerificationCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}
