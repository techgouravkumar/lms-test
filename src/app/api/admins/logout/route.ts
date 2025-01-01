import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	try {
		const cookieStore = cookies();
		cookieStore.delete("adminToken");
		return NextResponse.json(
			{
				success: true,
				message: "Admin logged out successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error logging out:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to log out" },
			{ status: 500 },
		);
	}
}
