import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import env from "@/lib/env";

// This function handles the POST request for the login route.

export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		// Get the user data from the request body.
		const { email, password } = await request.json();

		// Validate that both email and password are provided
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

		// Check if the user exists in the database
		const user = await StudentModel.findOne({
			email,
		});
		if (!user || user.isActive === false) {
			return NextResponse.json(
				{
					success: false,
					message: "User does not exist.",
				},
				{
					status: 404,
				},
			);
		}
		// Check if the user is verified
		if (!user.isVerified) {
			return NextResponse.json(
				{
					success: false,
					message: "Please verify your email address.",
				},
				{
					status: 400,
				},
			);
		}
		// if (user.isLoggingIn) {
		// 	return NextResponse.json(
		// 		{
		// 			success: false,
		// 			message:
		// 				"User is already logging in. please contact your administrator",
		// 		},
		// 		{
		// 			status: 400,
		// 		},
		// 	);
		// }

		const isPasswordMatch = await bcrypt.compare(password, user.password);
		if (!isPasswordMatch) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid user password.",
				},
				{
					status: 401,
				},
			);
		}

		// Generate a JWT token for the authenticated user
		const token = jwt.sign(
			{
				id: user._id,
				email: user.email,
				fullName: user.fullName,
			},
			env.JWT_SECRET,
			{ expiresIn: `${env.JWT_SECRET_EXPIRY}d` },
		);

		user.token = token;
		user.isLoggingIn = true;
		await user.save();

		const response = NextResponse.json(
			{
				success: true,
				message: "Login successful.",
				token,
				user: {
					id: user._id,
					fullName: user.fullName,
					email: user.email,
					phoneNumber: user.phoneNumber,
					gender: user.gender,
					isSubscribed: user.isSubscribed,
					enrolledCourses: user.enrolledCourses,
					isVerified: user.isVerified,
				},
			},
			{
				status: 200,
			},
		);

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: true,
			sameSite: "none",
			maxAge: 60 * 60 * 24 * env.JWT_SECRET_EXPIRY, // days in seconds
			path: "/",
			expires: new Date(
				Date.now() + 60 * 60 * 24 * env.JWT_SECRET_EXPIRY * 1000,
			),
		});

		return response;
	} catch (error) {
		// Log the error and return a generic error message
		console.log("Error logging in user", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error logging in user.",
			},
			{
				status: 500,
			},
		);
	}
}
