import { NextResponse } from "next/server";
import SliderModel from "@/models/Slider.model";
import dbConnect from "@/lib/dbConnect";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// Toggle slider active status
export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		await dbConnect();

		const slider = await SliderModel.findById(params.id);
		if (!slider) {
			return NextResponse.json(
				{ error: "Slider not found" },
				{ status: 404 },
			);
		}

		slider.isActive = !slider.isActive;
		await slider.save();

		return NextResponse.json(slider, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Failed to update slider" },
			{ status: 500 },
		);
	}
}

// Delete slider
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		await dbConnect();

		const slider = await SliderModel.findById(params.id);
		if (!slider) {
			return NextResponse.json(
				{ error: "Slider not found" },
				{ status: 404 },
			);
		}
		await deleteFromCloudinary(slider.url);

		// Delete from database
		await slider.deleteOne();

		return NextResponse.json(
			{ message: "Slider deleted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Failed to delete slider" },
			{ status: 500 },
		);
	}
}
