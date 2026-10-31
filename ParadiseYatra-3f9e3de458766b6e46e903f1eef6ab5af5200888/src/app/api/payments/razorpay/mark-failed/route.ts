import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MarkFailedBody {
  purchaseId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  failureCode?: string;
  failureSource?: string;
  failureStep?: string;
  paymentMethod?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MarkFailedBody;

    if (!body?.purchaseId && !body?.razorpayOrderId) {
      return NextResponse.json(
        { message: "purchaseId or razorpayOrderId is required" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5001";
    const internalToken = process.env.INTERNAL_API_TOKEN || "";

    const response = await fetch(`${backendUrl}/api/purchases/mark-failed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalToken ? { "x-internal-token": internalToken } : {}),
      },
      body: JSON.stringify({
        purchaseId: body.purchaseId,
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        failureReason: body.failureReason || "",
        failureCode: body.failureCode || "",
        failureSource: body.failureSource || "",
        failureStep: body.failureStep || "",
        paymentMethod: body.paymentMethod || "",
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Failed to persist failed payment status" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: data?.data?.status || "failed",
      purchaseId: data?.data?._id || null,
      internalOrderId: data?.data?.internalOrderId || null,
    });
  } catch (error) {
    console.error("Razorpay mark-failed error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
