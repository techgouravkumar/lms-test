export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/models/Admin.model";
import { getDataFromToken } from "@/helpers/jwtToken";

export async function GET(request: NextRequest) {
    await dbConnect();

    try {
        const adminId = await getDataFromToken(request);

        if (!adminId) {
            return NextResponse.json(
                { error: "Invalid or missing token" },
                { status: 401 }
            );
        }

        const admin = await AdminModel.findById(adminId).select("-password");

        if (!admin) {
            return NextResponse.json(
                { error: "Admin not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, data: admin, message: "Admin data fetched successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching current admin:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin data" },
            { status: 500 }
        );
    }
}
