import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

interface ContactFormData {
  name: string;
  email?: string;
  phone: string;
  subject: string;
  message?: string;
  source?: string;
}

const escapeHtml = (value: string = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization") || "";

    const url = `${BACKEND_URL}/api/contact-form?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Contact form list proxy error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/contact-form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || "Failed to submit contact form." },
        { status: response.status }
      );
    }

    // Send an email notification, the same way lead-capture does -
    // but this must never block or fail the actual form submission.
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassRaw = process.env.SMTP_PASS;
    const smtpPass = (smtpPassRaw || "").replace(/^"(.*)"$/, "$1");
    const smtpSecure =
      process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465;

    const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

    if (isSmtpConfigured) {
      try {
        const transporter = createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const safeName = escapeHtml(body.name);
        const safeEmail = escapeHtml(body.email || "Not provided");
        const safePhone = escapeHtml(body.phone);
        const safeSubject = escapeHtml(body.subject);
        const safeMessage = escapeHtml(body.message || "").replace(/\n/g, "<br>");

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>New Contact Form Submission</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
              .value { color: #333; }
              .timestamp { color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📩 New Contact Form Submission</h1>
                <p>Someone just submitted the Contact Us form on ParadiseYatra</p>
              </div>
              <div class="content">
                <div class="field"><div class="label">Name:</div><div class="value">${safeName}</div></div>
                <div class="field"><div class="label">Email:</div><div class="value">${safeEmail}</div></div>
                <div class="field"><div class="label">Phone:</div><div class="value">${safePhone}</div></div>
                <div class="field"><div class="label">Query Type:</div><div class="value">${safeSubject}</div></div>
                <div class="field"><div class="label">Message:</div><div class="value">${safeMessage}</div></div>
                <div class="timestamp">Submitted on: ${new Date().toLocaleString()}</div>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailText = `New Contact Form Submission

Name: ${body.name}
Email: ${body.email || "Not provided"}
Phone: ${body.phone}
Query Type: ${body.subject}

Message:
${body.message || ""}

Submitted on: ${new Date().toLocaleString()}`;

        await transporter.sendMail({
          from: smtpUser,
          to: smtpUser,
          subject: `New Contact Form Submission - ${body.subject}`,
          text: emailText,
          html: emailHtml,
        });
      } catch (mailError) {
        console.error("Failed to send contact form notification email:", mailError);
        // Don't fail the request - the submission was already saved successfully.
      }
    } else {
      console.warn("SMTP not configured. Skipping contact form notification email.");
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Contact form API proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}