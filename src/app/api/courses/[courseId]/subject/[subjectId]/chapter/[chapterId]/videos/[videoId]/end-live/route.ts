import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import VideoModel from "@/models/Video.model";

// / PATCH - End live video
export async function PATCH(
	request: NextRequest,
	{
		params,
	}: {
		params: {
			courseId: string;
			subjectId: string;
			chapterId: string;
			videoId: string;
		};
	},
) {
	try {
		const { videoId } = params;
		if (!videoId) {
			return NextResponse.json(
				{ success: false, message: "Video ID is required" },
				{ status: 400 },
			);
		}
		await dbConnect();

		const result = await VideoModel.findById(videoId);

		if (!result) {
			return NextResponse.json(
				{ success: false, message: "Video not found" },
				{ status: 404 },
			);
		}

		if (!result.video.isLive) {
			return NextResponse.json(
				{ success: false, message: "Video is not live" },
				{ status: 400 },
			);
		}

		const updatedVideo = await VideoModel.findByIdAndUpdate(
			videoId,
			{ isLive: false },
			{ new: true },
		);

		return NextResponse.json(
			{
				success: true,
				message: "Live video ended successfully",
				data: updatedVideo,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error ending live video:", error);
		return NextResponse.json(
			{ success: false, message: "Error ending live video" },
			{ status: 500 },
		);
	}
}
