import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RefundBody {
  purchaseId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  amount?: number; // in paise
  speed?: "normal" | "optimum";
  notes?: Record<string, string>;
}

const auditRefundEvent = (
  event: string,
  data: Record<string, string | number | boolean | null | undefined>
) => {
  console.info(
    `[refund-audit] ${JSON.stringify({
      event,
      at: new Date().toISOString(),
      ...data,
    })}`
  );
};

export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_REFUND_API !== "true") {
      auditRefundEvent("blocked_disabled", {
        reason: "ENABLE_REFUND_API is not enabled",
      });
      return NextResponse.json(
        { message: "Refund API is disabled" },
        { status: 403 }
      );
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      auditRefundEvent("blocked_unauthorized", {
        reason: "missing_or_invalid_auth_header",
      });
      return NextResponse.json(
        { message: "Admin authorization is required" },
        { status: 401 }
      );
    }

    // Double-submit CSRF: header must match cookie.
    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = request.cookies.get("csrf_token")?.value || "";
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      auditRefundEvent("blocked_csrf", { reason: "csrf_mismatch" });
      return NextResponse.json(
        { message: "CSRF validation failed" },
        { status: 403 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5001";
    const profileResponse = await fetch(`${backendUrl}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!profileResponse.ok) {
      auditRefundEvent("blocked_unauthorized", {
        reason: "invalid_auth_token",
        status: profileResponse.status,
      });
      return NextResponse.json(
        { message: "Admin authorization failed" },
        { status: 401 }
      );
    }
    const adminProfile = await profileResponse.json();
    const adminRole =
      adminProfile?.role || adminProfile?.user?.role || "";
    const adminId =
      adminProfile?._id ||
      adminProfile?.id ||
      adminProfile?.user?._id ||
      adminProfile?.user?.id ||
      "";
    const adminEmail =
      adminProfile?.email || adminProfile?.user?.email || "";
    if (adminRole !== "admin") {
      auditRefundEvent("blocked_forbidden_role", {
        reason: "non_admin_user",
        adminId: String(adminId || ""),
        adminEmail: String(adminEmail || ""),
      });
      return NextResponse.json(
        { message: "Admin role required" },
        { status: 403 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { message: "Razorpay credentials are missing on server." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RefundBody;

    if (!body?.razorpayPaymentId) {
      auditRefundEvent("blocked_bad_request", {
        reason: "missing_razorpayPaymentId",
        adminId: String(adminId || ""),
      });
      return NextResponse.json(
        { message: "razorpayPaymentId is required" },
        { status: 400 }
      );
    }

    const refundResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${body.razorpayPaymentId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(Number.isFinite(Number(body.amount)) && Number(body.amount) > 0
            ? { amount: Math.round(Number(body.amount)) }
            : {}),
          speed: body.speed || "normal",
          notes: body.notes || {},
        }),
      }
    );

    const refundData = await refundResponse.json();

    if (!refundResponse.ok) {
      return NextResponse.json(
        { message: refundData?.error?.description || "Refund request failed" },
        { status: refundResponse.status }
      );
    }

    const internalToken = process.env.INTERNAL_API_TOKEN || "";

    const refundedAmount = Number(refundData?.amount || 0) / 100;

    const markRefundedResponse = await fetch(
      `${backendUrl}/api/purchases/mark-refunded`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(internalToken ? { "x-internal-token": internalToken } : {}),
        },
        body: JSON.stringify({
          purchaseId: body.purchaseId,
          razorpayOrderId: body.razorpayOrderId,
          refundId: refundData?.id,
          refundedAmount,
          notes: refundData?.notes || "",
        }),
        cache: "no-store",
      }
    );

    const marked = await markRefundedResponse.json();
    if (!markRefundedResponse.ok) {
      auditRefundEvent("refund_db_update_failed", {
        adminId: String(adminId || ""),
        adminEmail: String(adminEmail || ""),
        purchaseId: String(body.purchaseId || ""),
        razorpayOrderId: String(body.razorpayOrderId || ""),
        razorpayPaymentId: String(body.razorpayPaymentId || ""),
        refundId: String(refundData?.id || ""),
      });
      return NextResponse.json(
        {
          message: marked?.message || "Refund succeeded but DB update failed",
          refundId: refundData?.id || null,
        },
        { status: 502 }
      );
    }

    auditRefundEvent("refund_success", {
      adminId: String(adminId || ""),
      adminEmail: String(adminEmail || ""),
      purchaseId: String(marked?.data?._id || body.purchaseId || ""),
      razorpayOrderId: String(body.razorpayOrderId || ""),
      razorpayPaymentId: String(body.razorpayPaymentId || ""),
      refundId: String(refundData?.id || ""),
      refundedAmount,
    });

    return NextResponse.json({
      success: true,
      status: marked?.data?.status || "refunded",
      refundId: refundData?.id || null,
      refundedAmount,
      purchaseId: marked?.data?._id || null,
      internalOrderId: marked?.data?.internalOrderId || null,
    });
  } catch (error) {
    auditRefundEvent("refund_error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    console.error("Razorpay refund error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
