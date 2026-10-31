import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

// Admin: one transcript (?id=...). A query parameter rather than a [id] folder - see ../route.ts.
async function forward(request: NextRequest, method: "GET" | "DELETE") {
  try {
    const id = new URL(request.url).searchParams.get("id") || "";
    if (!id) return NextResponse.json({ success: false, message: "Missing id." }, { status: 400 });

    const response = await fetch(`${BACKEND_URL}/api/chat-conversations/${encodeURIComponent(id)}`, {
      method,
      headers: { Authorization: request.headers.get("authorization") || "" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Chat conversation ${method} proxy error:`, error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return forward(request, "GET");
}

export async function DELETE(request: NextRequest) {
  return forward(request, "DELETE");
}
