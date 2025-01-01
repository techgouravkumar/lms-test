import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/models/Admin.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// get all admins
export async function GET() {
	await dbConnect();
	try {
		const admins = await AdminModel.find();
		return NextResponse.json(
			{ success: true, data: admins },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching admins",
			},
			{ status: 500 },
		);
	}
}

// create a new admin
export async function POST(request: NextRequest) {
	await dbConnect();
	try {
		const { name, email, password } = await request.json();
		

		// Validation checks
		if (!name || !email || !password) {
			return NextResponse.json(
				{
					success: false,
					message: "All fields (name, email, password) are required",
				},
				{ status: 400 },
			);
		}

		// Check for existing admin
		const existedAdmin = await AdminModel.findOne({ email });
		if (existedAdmin) {
			return NextResponse.json(
				{
					success: false,
					message: "Admin with this email already exists",
				},
				{ status: 400 },
			);
		}

		// Hash the password and create a new admin
		const hashedPassword = await bcrypt.hash(password, 12);
		const newAdmin = await AdminModel.create({
			name,
			email,
			password: hashedPassword,
		});
		const adminCreated = await AdminModel.findById(newAdmin._id).select(
			"-password",
		);

		if (!adminCreated) {
			return NextResponse.json(
				{
					success: false,
					message: "Failed to retrieve the newly created admin.",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: adminCreated,
				message: "Admin created successfully",
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating admin:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error creating admin. Please try again.",
			},
			{ status: 500 },
		);
	}
}
