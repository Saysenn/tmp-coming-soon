// ============================================================
// configs/forms.ts — Form layout & behaviour config
//
// This is the ONLY file you need to edit to:
//  • Switch the contact form layout (contactFormType)
//  • Switch the subscribe form layout (subscribeFormType)
//  • Show / hide individual form sections on the page
//  • Toggle optional fields (phone, name, role)
//  • Switch CAPTCHA provider and enable/disable per form
// ============================================================

// ─── Types ────────────────────────────────────────────────────

export type ContactFormType =
  | "minimal"   // Single centered column — name, email, phone?, message
  | "detailed"; // Two-column — left info panel + right form

export type SubscribeFormType =
  | "inline"    // Horizontal banner — heading + email input + button in one row
  | "card"      // Centered card — name?, email, full-width submit
  | "waitlist"; // Full hero section — bold heading, subscriber count, name + email + role?

export type CaptchaProvider =
  | "turnstile"      // Cloudflare Turnstile — NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY
  | "recaptcha-v2"   // Google reCAPTCHA v2 checkbox — NEXT_PUBLIC_RECAPTCHA_SITE_KEY + RECAPTCHA_SECRET_KEY
  | "recaptcha-v3";  // Google reCAPTCHA v3 invisible — same keys as v2

export type FormsConfig = {
  // ── Which variant to render ───────────────────────────────
  contactFormType: ContactFormType;
  subscribeFormType: SubscribeFormType;

  // ── Toggle entire sections on/off ─────────────────────────
  enableContactForm: boolean;
  enableSubscribeForm: boolean;

  // ── CAPTCHA ───────────────────────────────────────────────
  captchaProvider: CaptchaProvider;

  // ── Contact form field options ────────────────────────────
  contactForm: {
    /** Show the phone number field */
    showPhone: boolean;
    /** Require CAPTCHA before submit (uses captchaProvider above) */
    requireCaptcha: boolean;
  };

  // ── Subscribe form field & display options ────────────────
  subscribeForm: {
    /** Show a name field alongside the email input */
    showNameField: boolean;
    /** Show a role / interest dropdown (used by "waitlist" layout) */
    showRoleField: boolean;
    /** Social proof number shown in "inline" and "waitlist" layouts */
    subscriberCount: number;
    /** Role options shown in the dropdown when showRoleField is true */
    roleOptions: string[];
    /** Require CAPTCHA before submit (uses captchaProvider above) */
    requireCaptcha: boolean;
  };
};

// ─── Config ───────────────────────────────────────────────────

export const formsConfig: FormsConfig = {
  // ── Active layouts ────────────────────────────────────────
  // Contact:   "minimal" | "detailed"
  contactFormType: "minimal",

  // Subscribe: "inline" | "card" | "waitlist"
  subscribeFormType: "inline",

  // ── Visibility ───────────────────────────────────────────
  enableContactForm: true,
  enableSubscribeForm: true,

  // ── CAPTCHA provider ─────────────────────────────────────
  // "turnstile"    → Cloudflare Turnstile (keys: NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  // "recaptcha-v2" → Google reCAPTCHA v2 checkbox (keys: NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
  // "recaptcha-v3" → Google reCAPTCHA v3 invisible  (same keys as v2)
  captchaProvider: "turnstile",

  // ── Contact form ─────────────────────────────────────────
  contactForm: {
    showPhone: true,
    requireCaptcha: false,
  },

  // ── Subscribe form ────────────────────────────────────────
  subscribeForm: {
    showNameField: true,
    showRoleField: false,
    subscriberCount: 1240,
    requireCaptcha: false,
    roleOptions: [
      "Founder / CEO",
      "Product Manager",
      "Developer",
      "Designer",
      "Investor",
      "Other",
    ],
  },
};
