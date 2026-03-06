"use client";

// ─────────────────────────────────────────────────────────────
// hooks/useCaptcha.ts
//
// Unified CAPTCHA hook used by all form components.
// Abstracts the three provider patterns:
//
//   turnstile / recaptcha-v2 → visible widget sets a token state
//   recaptcha-v3             → invisible, token obtained on submit
//                              via executeRecaptcha()
//
// Usage in a form component:
//
//   const { isV3, widgetToken, setWidgetToken, getToken } = useCaptcha()
//
//   // In JSX (when !isV3):
//   {requireCaptcha && !isV3 && (
//     <CaptchaWidget onVerify={setWidgetToken} onExpire={() => setWidgetToken(null)} />
//   )}
//
//   // In handleSubmit:
//   const token = await getToken("form_name")
//   if (requireCaptcha && !token) { /* show error */ return }
//   body.captchaToken = token
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { formsConfig } from "@/configs/forms";

export function useCaptcha() {
  const [widgetToken, setWidgetToken] = useState<string | null>(null);
  // Safe to call unconditionally — returns { executeRecaptcha: undefined }
  // when not inside GoogleReCaptchaProvider
  const { executeRecaptcha } = useGoogleReCaptcha();

  const isV3 = formsConfig.captchaProvider === "recaptcha-v3";

  /**
   * Returns the captcha token.
   * - v3: executes the challenge and returns the score-based token
   * - others: returns the token set by the widget via setWidgetToken
   */
  const getToken = useCallback(
    async (action: string): Promise<string | null> => {
      if (isV3) {
        if (!executeRecaptcha) return null;
        return await executeRecaptcha(action);
      }
      return widgetToken;
    },
    [isV3, executeRecaptcha, widgetToken]
  );

  return {
    /** true when captchaProvider is "recaptcha-v3" (no visible widget) */
    isV3,
    /** Current widget token (null until user solves the widget) */
    widgetToken,
    /** Call this from CaptchaWidget's onVerify / onExpire callbacks */
    setWidgetToken,
    /** Get the token — handles v3 execution automatically */
    getToken,
  };
}
