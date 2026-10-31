import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, API_ENDPOINTS } from "@/config/api";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        
        let backendUrl = getApiUrl("/api/page-content");
        if (type) {
            backendUrl += `?type=${type}`;
        }

        const response = await fetch(backendUrl);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in page-content API:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const authHeader = req.headers.get("authorization");

        const response = await fetch(getApiUrl("/api/page-content"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error creating page content:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
