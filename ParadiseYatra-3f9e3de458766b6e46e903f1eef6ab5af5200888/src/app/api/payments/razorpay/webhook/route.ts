import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  method?: string;
  notes?: Record<string, string>;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
};

const parseJsonSafe = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (_error) {
    return null;
  }
};

const secureCompare = (a: string, b: string) => {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const resolvePurchaseId = (notes?: Record<string, string>) =>
  notes?.purchaseId || notes?.purchase_id || "";

const backendBaseUrl = () =>
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5001";

const internalToken = () => process.env.INTERNAL_API_TOKEN || "";

const markPurchasePaid = async (
  purchaseId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  paymentMethod: string,
  signature: string
) => {
  const response = await fetch(`${backendBaseUrl()}/api/purchases/mark-paid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(internalToken() ? { "x-internal-token": internalToken() } : {}),
    },
    body: JSON.stringify({
      purchaseId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: signature,
      paymentMethod,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Failed to mark purchase as paid");
  }
};

const markPurchaseFailed = async (
  purchaseId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  paymentMethod: string,
  failureCode: string,
  failureReason: string,
  failureSource: string,
  failureStep: string
) => {
  const response = await fetch(`${backendBaseUrl()}/api/purchases/mark-failed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(internalToken() ? { "x-internal-token": internalToken() } : {}),
    },
    body: JSON.stringify({
      purchaseId,
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod,
      failureCode,
      failureReason,
      failureSource,
      failureStep,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Failed to mark purchase as failed");
  }
};

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { message: "Razorpay webhook secret is missing on server." },
        { status: 500 }
      );
    }

    const signature = request.headers.get("x-razorpay-signature") || "";
    if (!signature) {
      return NextResponse.json(
        { message: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!secureCompare(generatedSignature, signature)) {
      return NextResponse.json(
        { message: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const body = parseJsonSafe<RazorpayWebhookPayload>(rawBody);
    if (!body) {
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }

    const event = body.event || "";
    const payment = body.payload?.payment?.entity || {};
    const purchaseId = resolvePurchaseId(payment.notes);
    const razorpayOrderId = payment.order_id || "";
    const razorpayPaymentId = payment.id || "";
    const paymentMethod = payment.method || "";

    if (event === "payment.captured") {
      if (!purchaseId && !razorpayOrderId) {
        return NextResponse.json({
          ok: true,
          handled: false,
          event,
          reason: "missing_purchase_reference",
        });
      }

      await markPurchasePaid(
        purchaseId,
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod,
        signature
      );
      return NextResponse.json({ ok: true, handled: true, event });
    }

    if (event === "payment.failed") {
      if (!purchaseId && !razorpayOrderId) {
        return NextResponse.json({
          ok: true,
          handled: false,
          event,
          reason: "missing_purchase_reference",
        });
      }

      await markPurchaseFailed(
        purchaseId,
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod,
        payment.error_code || "",
        payment.error_description || "Payment failed",
        payment.error_source || "",
        payment.error_step || ""
      );
      return NextResponse.json({ ok: true, handled: true, event });
    }

    return NextResponse.json({ ok: true, handled: false, event });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
