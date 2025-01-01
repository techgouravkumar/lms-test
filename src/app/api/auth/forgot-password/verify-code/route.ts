import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		const { email, code } = await request.json();
		if (!email || !code) {
			return NextResponse.json(
				{
					success: false,
					message: "Email and code are required",
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
					message: "User not found",
				},
				{
					status: 404,
				},
			);
		}
		const isCodeValid = user.verifyCode === code;
		const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
		if (isCodeNotExpired && isCodeValid) {
			return NextResponse.json(
				{
					success: true,
					message: "Account verified successfully",
				},
				{
					status: 200,
				},
			);
		}
		if (!isCodeNotExpired) {
			return NextResponse.json(
				{
					success: false,
					message: "Verification code has expired, please try again",
				},
				{
					status: 400,
				},
			);
		}
		return NextResponse.json(
			{
				success: false,
				message: "Invalid code",
			},
			{
				status: 400,
			},
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error verifying user",
			},
			{
				status: 500,
			},
		);
	}
}
