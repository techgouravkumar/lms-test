import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import VideoModel from "@/models/Video.model";

// GET - Get all live videos
export async function GET(
	request: NextRequest,
	{
		params,
	}: { params: { courseId: string; subjectId: string; chapterId: string } },
) {
	try {
		const { chapterId } = params;
		if (!chapterId) {
			return NextResponse.json(
				{ success: false, message: "Chapter ID is required" },
				{
					status: 400,
				},
			);
		}
		await dbConnect();

		const liveVideo = await VideoModel.find({
			chapterId,
			isLive: true,
		});
		if (liveVideo.length === 0) {
			return NextResponse.json(
				{ success: false, message: "No live video found" },
				{ status: 404 },
			);
		}
		return NextResponse.json(
			{
				success: true,
				message: "Live videos fetched successfully",
				data: liveVideo[0],
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching live videos:", error);
		return NextResponse.json(
			{ success: false, message: "Error fetching live videos" },
			{ status: 500 },
		);
	}
}
