import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isLegalKind, type LegalKind } from "@/lib/legal/types";
import { legalCacheTag } from "@/lib/server/legal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export const dynamic = "force-dynamic";

const PAGE_PATHS: Record<LegalKind, string> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  cookie: "/cookie-policy",
  refund: "/refund-policy",
};

// Admin → Legal Pages. Query parameters instead of [segments]: next.config.ts rewrites /api/:path* to the
// backend before dynamic route folders are matched (see app/api/chat/conversations/route.ts).

async function forward(path: string, request: NextRequest, init: RequestInit = {}) {
  const response = await fetch(`${BACKEND_URL}/api/legal-pages${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: request.headers.get("authorization") || "" },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({ success: false, message: "Unexpected response from the server." }));
  return { response, data };
}

// ?view=list | ?view=page&kind= | ?view=revisions&kind= | ?view=revision&id=
export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const view = params.get("view") || "list";
    const kind = params.get("kind") || "";
    let path: string;
    if (view === "list") path = "/admin/list";
    else if (view === "revision") path = `/admin/revisions/${encodeURIComponent(params.get("id") || "")}`;
    else if ((view === "page" || view === "revisions") && isLegalKind(kind)) path = view === "page" ? `/admin/${kind}` : `/admin/${kind}/revisions`;
    else return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });

    const { response, data } = await forward(path, request);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Legal pages proxy error:", error);
    return NextResponse.json({ success: false, message: "Could not reach the server." }, { status: 502 });
  }
}

// ?kind= : publish a new version, then refresh the public page straight away
export async function PUT(request: NextRequest) {
  try {
    const kind = new URL(request.url).searchParams.get("kind") || "";
    if (!isLegalKind(kind)) return NextResponse.json({ success: false, message: "Unknown legal page." }, { status: 400 });
    const body = await request.text();

    const { response, data } = await forward(`/${kind}`, request, { method: "PUT", body });
    if (response.ok) {
      revalidateTag(legalCacheTag(kind), { expire: 0 });
      revalidatePath(PAGE_PATHS[kind]);
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Legal pages save proxy error:", error);
    return NextResponse.json({ success: false, message: "Could not reach the server." }, { status: 502 });
  }
}
