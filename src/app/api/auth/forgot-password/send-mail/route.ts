import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationCode } from "@/helpers/sendMail";

// Function to handle sending verification code for password reset
export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{
					success: false,
					message: "Email is required.",
				},
				{
					status: 400,
				},
			);
		}

		const user = await StudentModel.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found.",
				},
				{
					status: 404,
				},
			);
		}

		const verificationCode = generateVerificationCode();
		user.verifyCode = verificationCode;
		user.verifyCodeExpiry = new Date(Date.now() + 1000 * 60 * 5); // Code valid for 5 minutes
		await user.save();

		// Send the verification code via email
		await sendVerificationCode({
			email,
			verificationCode,
			type: "forgotPassword",
		});

		return NextResponse.json(
			{
				success: true,
				message: "Verification code sent to your email.",
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error sending verification code.",
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
