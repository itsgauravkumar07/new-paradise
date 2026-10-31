import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Disable caching for this route to ensure fresh data
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("Authorization");

        if (!token) {
            return NextResponse.json(
                { message: "Authentication required" },
                { status: 401 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/leads`, {
            headers: {
                Authorization: token,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || "Failed to fetch leads" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Leads API error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
