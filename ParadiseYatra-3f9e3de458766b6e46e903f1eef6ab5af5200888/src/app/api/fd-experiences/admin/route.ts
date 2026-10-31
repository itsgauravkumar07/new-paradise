import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

// Staff management of past trips. The trip id travels as ?id= rather than an [id] folder:
// the /api/:path* rewrite in next.config.ts shadows dynamic API routes.
async function forward(request: NextRequest, method: "GET" | "PUT" | "DELETE") {
  try {
    const id = new URL(request.url).searchParams.get("id") || "";
    if (method !== "GET" && !id) {
      return NextResponse.json({ success: false, message: "Missing id." }, { status: 400 });
    }

    const path = method === "GET" ? "admin/all" : encodeURIComponent(id);
    const response = await fetch(`${BACKEND_URL}/api/fd-experiences/${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") || "" },
      body: method === "PUT" ? await request.text() : undefined,
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Past trip ${method} proxy error:`, error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return forward(request, "GET");
}

export async function PUT(request: NextRequest) {
  return forward(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return forward(request, "DELETE");
}
