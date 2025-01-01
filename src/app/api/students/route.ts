import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/models/Student.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	await dbConnect();

	// Get query parameters from the request URL
	const { searchParams } = new URL(request.nextUrl);
	const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10)); // Ensure page is at least 1
	const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10)); // Ensure limit is at least 1
	const skip = (page - 1) * limit; // Calculate skip value for pagination

	try {
		// Create an aggregation pipeline to fetch students and total count
		const result = await StudentModel.aggregate([
			{
				$facet: {
					data: [
						{ $match: {
							isActive: true,
						} }, // Match all students
						{ $project: { password: 0 } }, // Exclude the password field from the results
						{ $skip: skip }, // Skip documents based on the calculated skip value
						{ $limit: limit }, // Limit the number of documents returned
					],
					totalCount: [
						{ $count: "count" }, // Count total students
					],
				},
			},
		]);

		const students = result[0]?.data || [];
		const totalStudents = result[0]?.totalCount[0]?.count || 0; // Total count of students

		// Calculate the total number of pages based on the total students and limit
		const totalPages = Math.ceil(totalStudents / limit);

		// Return a JSON response with the students, pagination information, and success status
		return NextResponse.json(
			{
				success: true,
				data: students,
				pagination: {
					totalStudents,
					totalPages,
					currentPage: page,
					pageSize: limit,
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error); // Log any errors that occur during the process
		return NextResponse.json(
			{
				success: false,
				message: "Error fetching students",
			},
			{ status: 500 },
		);
	}
}
