import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createTransport } from "nodemailer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  purchaseId?: string;
  paymentMethod?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  packageInfo?: {
    title?: string;
    slug?: string;
    destination?: string;
    travelDate?: string;
    travellers?: number;
    unitLabel?: string;
    unitPrice?: number;
    amount?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { message: "Razorpay secret is missing on server." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as VerifyBody;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: "Missing payment verification fields" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ verified: false, message: "Invalid payment signature" }, { status: 400 });
    }

    // Mark purchase as paid in backend DB
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    const internalToken = process.env.INTERNAL_API_TOKEN || "";
    let purchase = null;
    try {
      const markPaidResponse = await fetch(`${backendUrl}/api/purchases/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(internalToken ? { "x-internal-token": internalToken } : {}),
        },
        body: JSON.stringify({
          purchaseId: body.purchaseId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentMethod: body.paymentMethod || "",
        }),
      });
      const markPaidJson = await markPaidResponse.json();
      if (markPaidResponse.ok && markPaidJson?.data) {
        purchase = markPaidJson.data;
      }
    } catch (persistError) {
      console.error("Purchase mark-paid error:", persistError);
    }

    // Send receipt email (customer + admin copy)
    const customerName = purchase?.fullName || body.customer?.fullName || "Customer";
    const customerEmail = purchase?.email || body.customer?.email || "";
    const packageTitle = purchase?.packageTitle || body.packageInfo?.title || "Travel Package";
    const destination = purchase?.destination || body.packageInfo?.destination || "";
    const travelDate = purchase?.travelDate || body.packageInfo?.travelDate || "Flexible";
    const travellers = Number(purchase?.travellers || body.packageInfo?.travellers || 1);
    const unitLabel = purchase?.unitLabel || body.packageInfo?.unitLabel || "Per Person";
    const unitPrice = Number(purchase?.unitPrice || body.packageInfo?.unitPrice || 0);
    const internalOrderId = purchase?.internalOrderId || `PYO-${Date.now()}`;
    const receiptNumber = purchase?.receiptNumber || `PYR-${Date.now()}`;
    const paidAmount = Number(purchase?.amount || body.packageInfo?.amount || 0);
    const currency = purchase?.currency || "INR";

    const senderDisplayName = process.env.MAIL_FROM_NAME || "Paradise Yatra";
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassRaw = process.env.SMTP_PASS;
    const smtpPass = (smtpPassRaw || "").replace(/^"(.*)"$/, "$1");
    const smtpSecure =
      process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465;

    const transporters: Array<{
      label: string;
      senderEmail: string;
      transporter: ReturnType<typeof createTransport>;
    }> = [];

    if (gmailUser && gmailAppPassword) {
      transporters.push({
        label: "gmail",
        senderEmail: gmailUser,
        transporter: createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        }),
      });
    }

    if (smtpHost && smtpUser && smtpPass) {
      transporters.push({
        label: "smtp",
        senderEmail: smtpUser,
        transporter: createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            servername: smtpHost,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 20000,
        }),
      });
    }

    let receiptEmailSentToCustomer = false;
    let receiptEmailSentToAdmin = false;
    let receiptEmailError = "";
    let mailTransport = "";

    const amountText = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(paidAmount);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
        <h2 style="margin-bottom:4px;">Payment Receipt - Paradise Yatra</h2>
        <p style="margin-top:0; color:#555;">Thank you for your purchase. Your payment is confirmed.</p>
        <table style="border-collapse:collapse; width:100%; max-width:560px; margin-top:16px;">
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Receipt Number</td><td style="padding:8px; border:1px solid #e5e7eb;">${receiptNumber}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Internal Order ID</td><td style="padding:8px; border:1px solid #e5e7eb;">${internalOrderId}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Payment Date</td><td style="padding:8px; border:1px solid #e5e7eb;">${new Date().toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Razorpay Order ID</td><td style="padding:8px; border:1px solid #e5e7eb;">${razorpay_order_id}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Razorpay Payment ID</td><td style="padding:8px; border:1px solid #e5e7eb;">${razorpay_payment_id}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Customer</td><td style="padding:8px; border:1px solid #e5e7eb;">${customerName}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Email</td><td style="padding:8px; border:1px solid #e5e7eb;">${customerEmail}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Phone</td><td style="padding:8px; border:1px solid #e5e7eb;">${purchase?.phone || body.customer?.phone || ""}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Package</td><td style="padding:8px; border:1px solid #e5e7eb;">${packageTitle}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Destination</td><td style="padding:8px; border:1px solid #e5e7eb;">${destination}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Travel Date</td><td style="padding:8px; border:1px solid #e5e7eb;">${travelDate}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Travellers</td><td style="padding:8px; border:1px solid #e5e7eb;">${travellers}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Pricing Basis</td><td style="padding:8px; border:1px solid #e5e7eb;">${unitLabel}${unitPrice ? ` (${new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(unitPrice)})` : ""}</td></tr>
          <tr><td style="padding:8px; border:1px solid #e5e7eb; font-weight:600;">Amount Paid</td><td style="padding:8px; border:1px solid #e5e7eb;">${amountText}</td></tr>
        </table>
        <p style="margin-top:16px; color:#374151;">For support, reply to this email with your order id.</p>
      </div>
    `;

    if (!transporters.length) {
      receiptEmailError = "Missing mail config. Set GMAIL_USER + GMAIL_APP_PASSWORD (or SMTP vars).";
    } else {
      for (const candidate of transporters) {
        try {
          await candidate.transporter.verify();
          mailTransport = candidate.label;
          const sender = `${senderDisplayName} <${candidate.senderEmail}>`;

          if (customerEmail) {
            try {
              await candidate.transporter.sendMail({
                from: sender,
                to: customerEmail,
                subject: `Paradise Yatra Payment Receipt ${receiptNumber}`,
                html,
              });
              receiptEmailSentToCustomer = true;
            } catch (customerMailError) {
              const customerErrorText =
                customerMailError instanceof Error
                  ? customerMailError.message
                  : "Failed to send customer receipt";
              receiptEmailError = receiptEmailError
                ? `${receiptEmailError} | customer: ${customerErrorText}`
                : `customer: ${customerErrorText}`;
            }
          } else {
            receiptEmailError = "Customer email missing in verified order";
          }

          try {
            await candidate.transporter.sendMail({
              from: sender,
              to: candidate.senderEmail,
              subject: `Admin Copy - Payment Receipt ${receiptNumber}`,
              html,
            });
            receiptEmailSentToAdmin = true;
          } catch (adminMailError) {
            const adminErrorText =
              adminMailError instanceof Error
                ? adminMailError.message
                : "Failed to send admin receipt copy";
            receiptEmailError = receiptEmailError
              ? `${receiptEmailError} | admin: ${adminErrorText}`
              : `admin: ${adminErrorText}`;
          }

          if (receiptEmailSentToCustomer || receiptEmailSentToAdmin) {
            break;
          }
        } catch (mailError) {
          const errText = mailError instanceof Error ? mailError.message : "Transport verify failed";
          receiptEmailError = receiptEmailError
            ? `${receiptEmailError} | ${candidate.label}: ${errText}`
            : `${candidate.label}: ${errText}`;
        }
      }
    }

    return NextResponse.json({
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      purchaseId: purchase?._id || null,
      internalOrderId: purchase?.internalOrderId || null,
      receiptNumber: purchase?.receiptNumber || null,
      status: purchase?.status || "paid",
      travelDate,
      travellers,
      unitLabel,
      receiptEmailSentToCustomer,
      receiptEmailSentToAdmin,
      mailTransport,
      receiptEmailError,
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
