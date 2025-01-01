import dbConnect from "@/lib/dbConnect";
import PaymentModel from "@/models/Payment.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	await dbConnect();
	const paymentId = params.id;

	try {
		// Fetch the payment by ID
		const payment = await PaymentModel.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(paymentId) }, // Ensure the ID is converted to ObjectId
			},
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
					"studentDetails.email": 1,
					"studentDetails.phoneNumber": 1,
					"studentDetails.gender": 1,
					"courseDetails._id": 1,
					"courseDetails.title": 1,
					"courseDetails.cost": 1,
				},
			},
		]);

		if (!payment.length) {
			return NextResponse.json(
				{
					success: false,
					message: "Payment not found",
				},
				{
					status: 404,
				},
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: payment[0],
				message: "Payment fetched successfully",
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Error fetching payment:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Something went wrong while fetching the payment",
			},
			{
				status: 500,
			},
		);
	}
}
