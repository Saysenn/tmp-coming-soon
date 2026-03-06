"use client";

// ─────────────────────────────────────────────────────────────
// components/forms/CaptchaWidget.tsx
//
// Renders a visible CAPTCHA widget for Turnstile and reCAPTCHA v2.
// For reCAPTCHA v3 (invisible), this component renders nothing —
// the token is obtained programmatically via the useCaptcha hook.
// ─────────────────────────────────────────────────────────────

import { formsConfig } from "@/configs/forms";
import { Turnstile } from "@marsidev/react-turnstile";
import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
};

export default function CaptchaWidget({ onVerify, onExpire }: Props) {
  const { captchaProvider } = formsConfig;

  if (captchaProvider === "turnstile") {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return null;

    return (
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={onExpire}
        options={{ theme: "light" }}
      />
    );
  }

  if (captchaProvider === "recaptcha-v2") {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;

    return (
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={(token) => { if (token) onVerify(token); }}
        onExpired={onExpire}
      />
    );
  }

  // v3 is invisible — no widget rendered here
  return null;
}
