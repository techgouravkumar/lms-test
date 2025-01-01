import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SliderModel from "@/models/Slider.model";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";

// GET all sliders
export async function GET() {
	try {
		await dbConnect();
		const sliders = await SliderModel.find().sort({ createdAt: -1 });
		return NextResponse.json(sliders, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Failed to fetch sliders" },
			{ status: 500 },
		);
	}
}

// POST create a new slider with an image
export async function POST(request: Request) {
	try {
		// Connect to the database

		const formData = await request.formData();
		console.log("formData", formData);
		const image = formData.get("image") as File | null;

		if (!image) {
			return NextResponse.json(
				{ error: "Image is required" },
				{ status: 400 },
			);
		}

		// Validate the image file (size, type)
		try {
			validateImageFile(image);
		} catch (error) {
			return NextResponse.json(
				{
					error:
						error instanceof Error
							? error.message
							: "Invalid image",
				},
				{ status: 400 },
			);
		}

		// Convert image to Buffer
		const arrayBuffer = await image.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload the image to Cloudinary
		const cloudinaryResponse = await uploadToCloudinary(buffer, {
			folder: "sliders",
			quality: "auto",
		});

		await dbConnect();
		const slider = await SliderModel.create({
			url: cloudinaryResponse,
			isActive: true,
		});

		return NextResponse.json(slider, { status: 201 });
	} catch (error) {
		console.error("Slider creation error:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to create slider",
			},
			{ status: 500 },
		);
	}
}
