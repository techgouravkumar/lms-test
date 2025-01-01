import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/models/Admin.model";
import { NextRequest, NextResponse } from "next/server";

// Get a specific admin by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Admin ID is required",
			},
			{ status: 400 },
		);
	}

	await dbConnect();

	try {
		const admin = await AdminModel.findById(id).select("-password");
		if (!admin) {
			return NextResponse.json(
				{
					success: false,
					message: "Admin not found",
				},
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{
				success: true,
				data: admin,
				message: "Admin fetched successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching admin",
			},
			{ status: 500 },
		);
	}
}

// Update a specific admin by ID
// export async function PUT(
// 	request: NextRequest,
// 	{ params }: { params: { id: string } },
// ) {
// 	const { id } = params;
// 	await dbConnect();
// 	const body = await request.json();

// 	try {
// 		const updatedAdmin = await AdminModel.findByIdAndUpdate(id, body, {
// 			new: true,
// 		});
// 		if (!updatedAdmin) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					message: "Admin not found",
// 				},
// 				{ status: 404 },
// 			);
// 		}
// 		return NextResponse.json(
// 			{ success: true, data: updatedAdmin },
// 			{ status: 200 },
// 		);
// 	} catch (error) {
// 		console.error(error);
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				message: "Error updating admin",
// 			},
// 			{ status: 500 },
// 		);
// 	}
// }

// Delete a specific admin by ID
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Admin ID is required",
			},
			{ status: 400 },
		);
	}
	await dbConnect();

	try {
		const deletedAdmin = await AdminModel.findByIdAndDelete(id);
		if (!deletedAdmin) {
			return NextResponse.json(
				{
					success: false,
					message: "Admin not found",
				},
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{
				success: true,
				message: "Admin deleted successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{
				success: false,
				message: "Error deleting admin",
			},
			{ status: 500 },
		);
	}
}
