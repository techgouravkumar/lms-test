import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jwt
import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/models/Admin.model";
import env from "@/lib/env";

export async function POST(request: NextRequest) {
	await dbConnect();
	const body = await request.json();
	const { email, password } = body;
	console.log(email, password);

	try {
		const admin = await AdminModel.findOne({ email });
		if (!admin) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid email or password",
				},
				{ status: 401 },
			);
		}

		const isMatch = await bcrypt.compare(password, admin.password);
		if (!isMatch) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid email or password",
				},
				{ status: 401 },
			);
		}

		// Generate a JWT token for the authenticated user
		const token = jwt.sign(
			{
				id: admin._id,
				email: admin.email,
				fullName: admin.fullName,
			},
			env.JWT_SECRET,
			{ expiresIn: `${env.JWT_SECRET_EXPIRY}d` },
		);

		const response = NextResponse.json(
			{
				success: true,
				message: "Admin logged in successfully",
				data: {
					id: admin._id,
					name: admin.name,
					email: admin.email,
				},
			},
			{ status: 200 },
		);

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "none",
			maxAge: 60 * 60 * 24 * env.JWT_SECRET_EXPIRY, 
			path: "/",
			expires: new Date(
				Date.now() + 60 * 60 * 24 * env.JWT_SECRET_EXPIRY * 1000,
			),
		});

		return response;
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error logging in",
			},
			{ status: 500 },
		);
	}
}
