export const dynamic = "force-dynamic";

import dbConnect from "@/lib/dbConnect";
import PaymentModel from "@/models/Payment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	await dbConnect();
	try {
		// Extract query parameters for pagination
		const { searchParams } = req.nextUrl;
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const skip = (page - 1) * limit;

		// Aggregation pipeline
		const payments = await PaymentModel.aggregate([
			{
				$lookup: {
					from: "students",
					localField: "studentId",
					foreignField: "_id",
					as: "studentDetails",
				},
			},
			{
				$unwind: "$studentDetails",
			},
			{
				$lookup: {
					from: "courses",
					localField: "courseId",
					foreignField: "_id",
					as: "courseDetails",
				},
			},
			{
				$unwind: "$courseDetails",
			},
			{
				$project: {
					_amount: 1,
					paymentDate: 1,
					paymentMethod: 1,
					transactionId: 1,
					status: 1,
					"studentDetails._id": 1,
					"studentDetails.fullName": 1,
					"courseDetails._id": 1,
					"courseDetails.title": 1,
				},
			},
			{
				$sort: { paymentDate: -1 },
			},
			{
				$skip: skip,
			},
			{
				$limit: limit,
			},
		]);

		// Count total payments for pagination info
		const totalPayments = await PaymentModel.countDocuments();

		return NextResponse.json(
			{
				success: true,
				data: payments,
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalPayments / limit),
					totalPayments,
				},
				message: "Payments fetched successfully",
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Error fetching payments:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Something went wrong while fetching payments",
			},
			{
				status: 500,
			},
		);
	}
}
