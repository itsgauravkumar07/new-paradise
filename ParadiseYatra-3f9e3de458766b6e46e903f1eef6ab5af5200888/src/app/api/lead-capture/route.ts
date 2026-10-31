import { NextRequest, NextResponse } from "next/server";
import { createTransport } from "nodemailer";

interface LeadData {
  fullName: string;
  email: string;
  phone: string;
  destination?: string;
  budget?: string;
  message?: string;
  departureDate?: string;
  newsletterConsent?: boolean;
  packageTitle?: string;
  packagePrice?: string;
  source?: string; // e.g. "chatbot"; the backend defaults to "website"
  destinationUrl?: string;
  /** Hidden "honeypot" form field: people never see it, so anything in it means a bot filled the form. */
  website?: string;
  timestamp: string;
}

  const escapeHtml = (value: unknown): string =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    // Spam bots fill every field, including the hidden one: pretend it worked and drop the lead
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ success: true, message: "Inquiry submitted successfully" }, { status: 200 });
    }
    const lead: Partial<LeadData> = { ...body };
    delete lead.website;

    // Validate required fields: a name, and a phone number or an email to reply to
    const hasText = (value: unknown) => typeof value === "string" && value.trim() !== "";
    if (!hasText(body.fullName)) {
      return NextResponse.json({ error: "Missing required field: fullName" }, { status: 400 });
    }
    if (!hasText(body.phone) && !hasText(body.email)) {
      return NextResponse.json({ error: "Missing required field: phone or email" }, { status: 400 });
    }

    // Validate email format only if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (body.email && body.email.trim() && !emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone number only if provided
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (hasText(body.phone) && !phoneRegex.test(body.phone.replace(/[\s\-\(\)]/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const safeMessage = (body.message || "").trim();

    // Create email transporter (SMTP)
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

    // Email content
    const sourceLabel = body.source === "chatbot" ? " (Chatbot)" : body.source === "popup" ? " (Website popup)" : "";
    const emailSubject = `New Travel Inquiry${sourceLabel} - ${body.packageTitle || "General Inquiry"}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Travel Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .package-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .timestamp { color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 New Travel Inquiry</h1>
            <p>You have received a new travel inquiry from ParadiseYatra</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Full Name:</div>
              <div class="value">${escapeHtml(body.fullName)}</div>
            </div>
            <div class="field">
              <div class="label">Email Address:</div>
              <div class="value">${escapeHtml(body.email)}</div>
            </div>
            <div class="field">
              <div class="label">Phone Number:</div>
              <div class="value">${escapeHtml(body.phone)}</div>
            </div>
              <div class="field">
                <div class="label">Departure Date:</div>
                <div class="value">${escapeHtml(body.departureDate || 'Not specified')}</div>
              </div>
            <div class="field">
              <div class="label">Message/Requirements:</div>
                <div class="value">${safeMessage ? escapeHtml(safeMessage).replace(/\n/g, '<br>') : 'Not provided'}</div>
            </div>
            <div class="field">
              <div class="label">Newsletter Consent:</div>
              <div class="value">${body.newsletterConsent ? '✅ Yes - Subscribed to newsletter' : '❌ No - Not subscribed to newsletter'}</div>
            </div>
            ${body.packageTitle ? `
            <div class="package-info">
              <div class="field">
                <div class="label">Package:</div>
                <div class="value">${escapeHtml(body.packageTitle)}</div>
              </div>
              ${body.packagePrice ? `
              <div class="field">
                <div class="label">Price:</div>
                <div class="value">${escapeHtml(body.packagePrice)}</div>
              </div>
              ` : ''}
            </div>
            ` : ''}
            <div class="timestamp">
              Inquiry received on: ${new Date(body.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Travel Inquiry - ParadiseYatra

Full Name: ${body.fullName}
Email: ${body.email}
Phone: ${body.phone}
Departure Date: ${body.departureDate || 'Not specified'}

Message/Requirements:
${safeMessage || 'Not provided'}

Newsletter Consent: ${body.newsletterConsent ? 'Yes - Subscribed to newsletter' : 'No - Not subscribed to newsletter'}

${body.packageTitle ? `Package: ${body.packageTitle}` : ''}
${body.packagePrice ? `Price: ${body.packagePrice}` : ''}

Inquiry received on: ${new Date(body.timestamp).toLocaleString()}
    `;

    // Save lead to database
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    let leadSaved = false;
    let duplicate = false;
    let leadId: string | null = null;
    // The backend limits enquiries per visitor, so it needs the visitor's IP rather than this server's
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    let emailSent = false;
    let emailWarning: string | null = null;

    try {
      const dbResponse = await fetch(`${backendUrl}/api/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
        },
        body: JSON.stringify({
          ...lead,
          timestamp: body.timestamp || new Date().toISOString(),
        }),
      });

      if (dbResponse.status === 429) {
        // Too many enquiries from this visitor: don't save and don't email the team
        const data = await dbResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: data?.message || "Too many enquiries. Please try again later." },
          { status: 429 }
        );
      }

      if (!dbResponse.ok) {
        console.error("Failed to save lead to database:", await dbResponse.text());
      } else {
        leadSaved = true;
        const saved = await dbResponse.json().catch(() => null);
        leadId = saved?.data?._id ? String(saved.data._id) : null;
        duplicate = saved?.duplicate === true;
        console.log("Lead saved to database successfully");
      }
    } catch (dbError) {
      console.error("Error connecting to backend to save lead:", dbError);
      // Continue and try email notification as a fallback signal.
    }

    // The same enquiry sent again within a few minutes: the team was already emailed about it
    if (duplicate) {
      return NextResponse.json(
        { success: true, duplicate: true, message: "Inquiry already received", ...(leadId ? { leadId } : {}) },
        { status: 200 }
      );
    }

    // Send email notification only when SMTP is configured.
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

        const mailOptions = {
          from: smtpUser,
          to: smtpUser,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailError) {
        console.error("Failed to send lead notification email:", mailError);
        emailWarning = "Lead saved, but notification email could not be sent.";
      }
    } else {
      emailWarning = "Lead saved without email notification (SMTP not configured).";
      console.warn("SMTP not configured. Skipping email notification.");
    }

    if (!leadSaved && !emailSent) {
      return NextResponse.json(
        { error: "Failed to submit inquiry. Please try again later." },
        { status: 500 }
      );
    }

    // Log the lead
    console.log("New lead captured and processed:", {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      packageTitle: body.packageTitle,
      timestamp: body.timestamp,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully",
        ...(leadId ? { leadId } : {}),
        ...(emailWarning ? { warning: emailWarning } : {})
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing lead capture:", error);

    return NextResponse.json(
      {
        error: "Failed to submit inquiry. Please try again later."
      },
      { status: 500 }
    );
  }
} 
