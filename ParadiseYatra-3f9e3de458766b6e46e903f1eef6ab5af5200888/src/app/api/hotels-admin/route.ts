import { NextRequest, NextResponse } from "next/server";

// Authenticated pass-through to the backend's hotel admin endpoints.
// Usage: /api/hotels-admin?p=<backend path under /api/hotels, incl. query>
//   e.g. ?p=enquiries%3Flimit%3D200  ->  GET {backend}/api/hotels/enquiries?limit=200
//
// This is ONE static route on purpose: next.config.ts rewrites /api/* to the
// backend, and that rewrite wins over dynamic ([id], [...path]) route files.
// The backend checks the token and the staff role on every call - this proxy
// only forwards the Authorization header and limits which paths can be reached.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const ALLOWED_FIRST_SEGMENTS = new Set(["admin", "enquiries"]);
const OBJECT_ID = /^[a-f0-9]{24}$/i;
const SAFE_PATH = /^[A-Za-z0-9/_-]*$/;
const SAFE_QUERY = /^[A-Za-z0-9=&.,_%+-]*$/;

async function forward(request: NextRequest) {
  try {
    const raw = new URL(request.url).searchParams.get("p") || "";
    const [pathPart, queryPart = ""] = raw.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const first = segments[0];

    const valid =
      SAFE_PATH.test(pathPart) &&
      SAFE_QUERY.test(queryPart) &&
      !segments.includes("..") &&
      (segments.length === 0 ||
        ALLOWED_FIRST_SEGMENTS.has(first) ||
        (segments.length === 1 && OBJECT_ID.test(first)));
    if (!valid) {
      return NextResponse.json({ success: false, message: "Not found." }, { status: 404 });
    }

    const target = `${BACKEND_URL}/api/hotels${segments.length ? "/" + segments.join("/") : ""}${queryPart ? "?" + queryPart : ""}`;
    const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method);

    const response = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
      },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Hotel admin proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
