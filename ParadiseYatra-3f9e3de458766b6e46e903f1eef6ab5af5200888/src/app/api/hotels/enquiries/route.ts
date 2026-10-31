import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const escapeHtml = (value: unknown = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not given");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // The backend rate-limits per visitor, so tell it who the visitor is.
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    const response = await fetch(`${BACKEND_URL}/api/hotels/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(clientIp ? { "X-Forwarded-For": clientIp } : {}) },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to send your enquiry." },
        { status: response.status }
      );
    }

    // Email the team - must never block or fail the visitor's submission.
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = (process.env.SMTP_PASS || "").replace(/^"(.*)"$/, "$1");
    const smtpSecure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : smtpPort === 465;

    const e = data?.enquiry;
    if (e && smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = createTransport({ host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } });
        const rows: [string, string][] = [
          ["Hotel", `${e.hotelName}${e.city ? ` (${e.city})` : ""}`],
          ["Name", e.name],
          ["Phone", e.phone],
          ["Email", e.email || "Not provided"],
          ["Check-in", fmt(e.checkIn)],
          ["Check-out", fmt(e.checkOut)],
          ["Guests", `${e.adults} adult(s), ${e.children} child(ren), ${e.rooms} room(s)`],
          ["Message", e.message || "-"],
        ];
        await transporter.sendMail({
          from: smtpUser,
          to: smtpUser,
          subject: `New Hotel Enquiry - ${e.hotelName}`,
          text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
          html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>New hotel enquiry</h2>${rows
            .map(([k, v]) => `<p><b>${escapeHtml(k)}:</b> ${escapeHtml(v).replace(/\n/g, "<br>")}</p>`)
            .join("")}</div>`,
        });
      } catch (mailError) {
        console.error("Failed to send hotel enquiry email:", mailError);
      }
    }

    // The visitor doesn't need the stored record back.
    return NextResponse.json({ success: true, message: "Enquiry received." }, { status: 201 });
  } catch (error) {
    console.error("Hotel enquiry proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
