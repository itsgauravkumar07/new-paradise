import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

// Public list of past fixed-departure trips (?destination=, ?limit=)
export async function GET(request: NextRequest) {
  try {
    const query = new URL(request.url).searchParams.toString();
    const response = await fetch(`${BACKEND_URL}/api/fd-experiences${query ? `?${query}` : ""}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Past trips proxy error:", error);
    return NextResponse.json({ success: false, experiences: [] }, { status: 500 });
  }
}

// Staff: create a past trip
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/fd-experiences`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") || "" },
      body: await request.text(),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Past trip create proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
