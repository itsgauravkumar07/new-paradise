import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { OFFER_BAR_TAG } from "@/lib/server/offers";

// Authenticated pass-through to the backend's offer admin endpoints (Admin → Offers).
// Usage: /api/offers-admin?p=<path under /api/offers/admin>, e.g. ?p=all, ?p=bar, ?p=<offer id>
// One static route on purpose: next.config.ts rewrites /api/* to the backend before dynamic route files.
// The backend checks the token and role on every call; this only forwards the Authorization header.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const ALLOWED = /^(all|bar|[a-f0-9]{24})?$/i;

async function forward(request: NextRequest) {
  try {
    const path = new URL(request.url).searchParams.get("p") || "";
    if (!ALLOWED.test(path)) return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });

    const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method);
    const response = await fetch(`${BACKEND_URL}/api/offers/admin${path ? `/${path}` : ""}`, {
      method: request.method,
      headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") || "" },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    // A saved bar shows on every page straight away instead of after the cache expires
    if (response.ok && path === "bar" && request.method === "PUT") revalidateTag(OFFER_BAR_TAG, { expire: 0 });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Offers admin proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
