// ─────────────────────────────────────────────────────────────
// lib/services/captcha.ts
//
// Server-side CAPTCHA token verification.
// Provider is read from configs/forms.ts → captchaProvider.
// ─────────────────────────────────────────────────────────────

import type { CaptchaProvider } from "@/configs/forms";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

type RecaptchaResponse = {
  success: boolean;
  score?: number; // v3 only: 0.0–1.0 (higher = more likely human)
  "error-codes"?: string[];
};

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data: TurnstileResponse = await res.json();
  return data.success;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data: RecaptchaResponse = await res.json();

  // v3: require score >= 0.5 (human threshold)
  if (data.score !== undefined) {
    return data.success && data.score >= 0.5;
  }

  return data.success;
}

/**
 * Verify a CAPTCHA token server-side.
 * Pass the provider explicitly so the route doesn't need to import formsConfig
 * (which may cause issues in edge/server contexts).
 */
export async function verifyCaptchaToken(
  token: string,
  provider: CaptchaProvider
): Promise<boolean> {
  switch (provider) {
    case "turnstile":
      return verifyTurnstile(token);
    case "recaptcha-v2":
    case "recaptcha-v3":
      return verifyRecaptcha(token);
    default:
      return false;
  }
}
