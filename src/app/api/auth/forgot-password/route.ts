import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{
					success: false,
					message: "Email and password are required.",
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

		// Hash the new password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update the user's password in the database
		await StudentModel.updateOne(
			{ _id: user._id },
			{
				password: hashedPassword,
			},
		);

		return NextResponse.json({
			success: true,
			message: "Password reset successfully.",
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Something went wrong.",
			},
			{
				status: 500,
			},
		);
	}
}
