import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

// Public: customer photos and videos (?location=Kerala&home=1&type=video&limit=12)
export async function GET(request: NextRequest) {
  try {
    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    for (const key of ["location", "home", "type", "limit"]) {
      const value = incoming.get(key);
      if (value) params.set(key, value.slice(0, 80));
    }
    const response = await fetch(`${BACKEND_URL}/api/customer-moments?${params}`, { next: { revalidate: 60 } });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Customer moments proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
