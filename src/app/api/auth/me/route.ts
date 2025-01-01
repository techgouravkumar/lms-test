export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { getDataFromToken } from "@/helpers/jwtToken";

export async function GET(request: NextRequest) {
	await dbConnect();

	try {
		const userId = await getDataFromToken(request);
		const user = await StudentModel.findById(userId).select(
			"-password -token -verifyCode -verifyCodeExpiry -isActive -enrolledCourses",
		);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		// Return the user details
		return NextResponse.json(
			{
				success: true,
				user,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching current user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user data" },
			{ status: 500 },
		);
	}
}
