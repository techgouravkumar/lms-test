import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { getDataFromToken } from "@/helpers/jwtToken";

export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		// Get user ID from the token
		const userId = await getDataFromToken(request);

		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "User not authenticated" },
				{ status: 401 },
			);
		}

		// Remove the token from the database by updating the user's record
		await StudentModel.findByIdAndUpdate(userId, {
			token: null,
			isLoggingIn: false,
		});

		// Remove the token from cookies
		const cookieStore = cookies();
		cookieStore.delete("token");

		return NextResponse.json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		console.error("Error logging out:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to log out" },
			{ status: 500 },
		);
	}
}
