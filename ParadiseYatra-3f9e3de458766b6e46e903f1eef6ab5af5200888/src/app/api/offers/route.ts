import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Public: active home page offer cards (Admin → Offers)
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/offers`, { next: { revalidate: 60 } });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Offers proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
