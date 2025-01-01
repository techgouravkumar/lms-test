import VideoModel from "@/models/Video.model";
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{
			success: true,
			message: "Health check successful",
		},
		{
			status: 200,
		},
	);
}
