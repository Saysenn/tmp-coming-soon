"use client";

// ─────────────────────────────────────────────────────────────
// components/forms/CaptchaProviderWrapper.tsx
//
// Wraps children with GoogleReCaptchaProvider when captchaProvider
// is "recaptcha-v3". Required for useGoogleReCaptcha() hook to work.
// For other providers this is a transparent pass-through.
// ─────────────────────────────────────────────────────────────

import { formsConfig } from "@/configs/forms";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

type Props = { children: React.ReactNode };

export default function CaptchaProviderWrapper({ children }: Props) {
  if (formsConfig.captchaProvider !== "recaptcha-v3") {
    return <>{children}</>;
  }

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return <>{children}</>;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
