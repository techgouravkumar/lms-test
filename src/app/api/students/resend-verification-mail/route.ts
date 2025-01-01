import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCode } from "@/helpers/sendMail";

// Function to handle POST requests for sending verification emails
export async function POST(request: NextRequest) {
	// Connect to the database
	await dbConnect();
	try {
		// Parse the JSON request body to get the email
		const { email } = await request.json();

		// Validate the email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid email format",
				},
				{
					status: 400,
				},
			);
		}

		// Check if the user exists in the database
		const user = await StudentModel.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{
					status: 404,
				},
			);
		}

		// Check if the user is already verified
		if (user.isVerified) {
			return NextResponse.json(
				{
					success: false,
					message: "User already verified",
				},
				{
					status: 400,
				},
			);
		}

		// Generate a 6-digit verification code
		const verificationCode = Math.floor(
			100000 + Math.random() * 900000,
		).toString();

		// Set the verification code and its expiry time (5 minutes)
		user.verifyCode = verificationCode;
		user.verifyCodeExpiry = new Date(Date.now() + 1000 * 60 * 5);

		// Save the updated user information to the database
		await user.save();

		// Send the verification code via email
		await sendVerificationCode({
			email: user.email,
			verificationCode,
			type: "registration",
		});

		// Return a success response
		return NextResponse.json(
			{
				success: true,
				message: "Verification email sent successfully",
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		// Log any errors that occur during the process
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error sending verification email",
			},
			{
				status: 500,
			},
		);
	}
}
