import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

// Note: the chat API routes use query parameters (?sessionId=, ?id=) instead of dynamic [segments].
// next.config.ts rewrites /api/:path* to the backend, and Next applies that rewrite *before* dynamic
// route folders, so a /api/chat/conversations/[sessionId] route would never be reached.

// Public: the chat widget appends new transcript messages for its session (?sessionId=...)
export async function POST(request: NextRequest) {
  try {
    const sessionId = new URL(request.url).searchParams.get("sessionId") || "";
    const body = await request.json().catch(() => null);
    if (!sessionId || !body) {
      return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
    }

    // The backend rate-limits per visitor, so tell it who the visitor is.
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    const response = await fetch(`${BACKEND_URL}/api/chat-conversations/${encodeURIComponent(sessionId)}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
        "User-Agent": request.headers.get("user-agent") || "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Chat conversation proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

// Admin: paginated list of chat conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const response = await fetch(`${BACKEND_URL}/api/chat-conversations?${searchParams.toString()}`, {
      headers: { Authorization: request.headers.get("authorization") || "" },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Chat conversations list proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
