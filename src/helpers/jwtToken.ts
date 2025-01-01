import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import env from "@/lib/env";
import AdminModel from "@/models/Admin.model";
import mongoose from "mongoose";

interface DecodedToken {
	id: string;
	email: string;
	fullName?: string;
}

export const getDataFromToken = async (request: NextRequest) => {
	try {
		// Get the token from cookies
		let token = request.cookies.get("token")?.value || "";

		// If the token is not in cookies, check the Authorization header
		if (!token) {
			const authHeader = request.headers.get("Authorization");
			if (authHeader && authHeader.startsWith("Bearer ")) {
				token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
			}
		}

		// If no token is found, return an error response
		if (!token) {
			return NextResponse.json(
				{ error: "Token is missing" },
				{ status: 401 },
			);
		}

		// Verify the token using the secret
		let decodedToken: DecodedToken;
		try {
			decodedToken = jwt.verify(token, env.JWT_SECRET!) as DecodedToken;
		} catch (error) {
			console.error("Token verification failed:", error);
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 },
			);
		}

		// Connect to the database
		await dbConnect();

		// Check if the user exists in the database
		const id = new mongoose.Types.ObjectId(decodedToken.id);
		const admin = await AdminModel.findById(id);

		if (!admin) {
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 },
			);
		}

		// Return the user ID from the decoded token
		return decodedToken.id;
	} catch (error) {
		console.error("An error occurred:", error);
		return NextResponse.json(
			{ error: "An internal server error occurred" },
			{ status: 500 },
		);
	}
};
