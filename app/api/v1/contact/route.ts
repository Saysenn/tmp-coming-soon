import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import ContactFormEmail from "@/emails/ContactFormEmail";
import { sendEmail, sanitizeInput, validateEmailStrict } from "@/lib/services/mail";
import { verifyCaptchaToken } from "@/lib/services/captcha";
import { mailConfig } from "@/configs/mail";
import { formsConfig } from "@/configs/forms";

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  captchaToken: string | null;
  website?: string; // Honeypot field
};

// ─── Rate limiting ────────────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) rateLimitStore.delete(key);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// ─── Plain text fallback ──────────────────────────────────────

function generatePlainText(name: string, email: string, phone: string, message: string): string {
  return `
NEW CONTACT FORM SUBMISSION
============================

From: ${name}
Email: ${email}
Phone: ${phone}

${message ? `Message:\n${message}` : "No message provided"}

----
Sent from the contact form.
  `.trim();
}

// ─── Handler ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
      );
    }

    const body: ContactFormData = await request.json();

    // Honeypot — silently accept to avoid alerting bots
    if (body.website) {
      console.log("[Security] Honeypot triggered");
      return NextResponse.json({ success: true, message: "Your inquiry has been sent successfully" });
    }

    const name = sanitizeInput(body.name?.trim() || "");
    const email = body.email?.trim();
    const phone = sanitizeInput(body.phone?.trim() || "");
    const message = sanitizeInput(body.message?.trim() || "");
    const captchaToken = body.captchaToken;

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (message.length < 5) {
      return NextResponse.json({ error: "Message must be at least 5 characters" }, { status: 400 });
    }

    const emailValidation = validateEmailStrict(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    if (formsConfig.contactForm.requireCaptcha) {
      if (!captchaToken) {
        return NextResponse.json({ error: "Captcha token missing" }, { status: 400 });
      }
      const passed = await verifyCaptchaToken(captchaToken, formsConfig.captchaProvider);
      if (!passed) {
        return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
      }
    }

    const emailComponent = ContactFormEmail({ name, email, phone, message });
    const html = await render(emailComponent);
    const text = generatePlainText(name, email, phone, message);

    await sendEmail({
      to: mailConfig.contactEmail,
      replyTo: email,
      subject: `[Contact Form] Inquiry from ${name}`,
      html,
      text,
    });

    return NextResponse.json(
      { success: true, message: "Your inquiry has been sent successfully" },
      { headers: { "X-RateLimit-Remaining": remaining.toString() } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact form error:", msg);
    return NextResponse.json({ error: `Email failed: ${msg}` }, { status: 500 });
  }
}
