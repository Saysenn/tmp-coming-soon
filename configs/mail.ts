// ============================================================
// configs/mail.ts — Email provider & delivery config
//
// This is the ONLY file you need to edit to:
//  • Switch email provider (provider: "resend" | "smtp")
//  • Change the sender name / from address
//  • Change where form submissions are delivered (contactEmail)
//
// Environment variables are read from .env.local.
// See .env.example for the full list of supported vars.
// ============================================================

// ─── Types ────────────────────────────────────────────────────

export type EmailProvider =
  | "resend"  // Resend API (recommended) — set RESEND_API_KEY + RESEND_FROM_EMAIL
  | "smtp";   // SMTP relay — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

export type MailConfig = {
  /** Active email provider */
  provider: EmailProvider;

  /** Display name that appears in the "From" field */
  fromName: string;

  /** Destination for all form submissions (your inbox) */
  contactEmail: string;

  /** Resend-specific settings (used when provider === "resend") */
  resend: {
    apiKey: string;
    /** Full from address, e.g. "MyApp <noreply@myapp.com>" */
    fromEmail: string;
  };

  /** SMTP-specific settings (used when provider === "smtp") */
  smtp: {
    host: string;
    port: number;
    /** true for port 465 (SSL), false for 587 (STARTTLS) */
    secure: boolean;
    user: string;
    pass: string;
    /** Defaults to SMTP_USER when not set */
    fromEmail: string;
  };
};

// ─── Config ───────────────────────────────────────────────────

export const mailConfig: MailConfig = {
  // ── Provider ─────────────────────────────────────────────
  // Set EMAIL_PROVIDER=resend  → uses Resend API
  // Set EMAIL_PROVIDER=smtp    → uses nodemailer (Gmail, etc.)
  provider: (process.env.EMAIL_PROVIDER as EmailProvider) || "resend",

  // ── Sender ───────────────────────────────────────────────
  // Shown in the "From" field of every outgoing email
  fromName: process.env.MAIL_FROM_NAME || "MyApp",

  // ── Destination ──────────────────────────────────────────
  // Where contact / subscribe submissions are delivered
  contactEmail: process.env.CONTACT_EMAIL || "",

  // ── Resend ───────────────────────────────────────────────
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
    fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  },

  // ── SMTP (Gmail / any SMTP relay) ────────────────────────
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
  },
};
