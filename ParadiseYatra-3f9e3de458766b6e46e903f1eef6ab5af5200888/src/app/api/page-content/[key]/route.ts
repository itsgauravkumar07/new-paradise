import { NextRequest, NextResponse } from "next/server";
import { getFullUrl } from "@/config/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const response = await fetch(getFullUrl(`/api/page-content/${key}`));
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error in page-content dynamic GET API:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const body = await req.json();
        const authHeader = req.headers.get("authorization");

        const response = await fetch(getFullUrl(`/api/page-content/${key}`), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error updating page content:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const authHeader = req.headers.get("authorization");

        const response = await fetch(getFullUrl(`/api/page-content/${key}`), {
            method: "DELETE",
            headers: {
                ...(authHeader && { Authorization: authHeader }),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error deleting page content:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

