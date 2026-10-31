import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5001";

    const response = await fetch(`${backendUrl}/api/purchases/my`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      const backendMessage = String(data?.message || "");
      const normalized = backendMessage.toLowerCase();
      const message =
        response.status === 401 &&
        (normalized.includes("user not found") ||
          normalized.includes("invalid token") ||
          normalized.includes("access denied"))
          ? "Session expired. Please login again."
          : backendMessage || "Failed to fetch purchases";

      return NextResponse.json(
        { message, data: [] },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("My purchases API error:", error);
    return NextResponse.json(
      { message: "Internal server error", data: [] },
      { status: 500 }
    );
  }
}
