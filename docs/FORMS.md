# Forms Usage

All form customization lives in two files:
- **`configs/forms.ts`** — which layout to show, field toggles, CAPTCHA provider, feature flags
- **`configs/mail.ts`** — which email provider to use and where to deliver submissions

---

## Quick start

### Switch the contact form layout

Open `configs/forms.ts` and change one line:

```ts
contactFormType: "minimal",   // → single centered column
contactFormType: "detailed",  // → two-column with info panel on the left
```

### Switch the subscribe form layout

```ts
subscribeFormType: "inline",    // → horizontal [email] [button] banner
subscribeFormType: "card",      // → centered card with optional name field
subscribeFormType: "waitlist",  // → full hero section with social proof
```

### Hide a form entirely

```ts
enableContactForm: false,
enableSubscribeForm: false,
```

---

## Contact form variants

### `"minimal"` — single column

Clean, centered column. Good for embedding anywhere on the page.

```
┌─────────────────────────────────┐
│  Full name      Email address   │
│  Phone number                   │
│  Message                        │
│  [Send message]                 │
└─────────────────────────────────┘
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showPhone` | `boolean` | `true` | Show / hide the phone field |
| `requireCaptcha` | `boolean` | `false` | Require Cloudflare Turnstile before submit |

### `"detailed"` — two-column

Dark info panel on the left, form on the right. Professional, agency-style.

```
┌──────────────────┬─────────────────────┐
│  Get in touch    │  Full name  Email   │
│  Address         │  Phone              │
│  Email           │  Message            │
│  Phone           │  [Send message →]   │
└──────────────────┴─────────────────────┘
```

The left panel pulls address, email and phone from `configs/footer.ts → companyInfo`.

---

## Subscribe form variants

### `"inline"` — horizontal banner

One-liner form. Best embedded inside a hero section.

```
┌─────────────────────────────────────────────────┐
│  [Name (opt)]  [Email address]  [Get early access] │
│  Join 1,240+ people already on the waitlist        │
└─────────────────────────────────────────────────┘
```

### `"card"` — centered card

Standalone card with heading, subtitle, and spam disclaimer.

```
       ┌──────────────────────┐
       │  Coming soon         │
       │  Be the first to know│
       │                      │
       │  [Name]              │
       │  [Email]             │
       │  [Notify me]         │
       │  1,240 signed up · No spam │
       └──────────────────────┘
```

### `"waitlist"` — full hero section

Full-width section with social proof, benefits checklist, and optional role dropdown.

```
          — Limited early access —
         Join the waitlist
  We're building something new…

  [Avatar][Avatar][Avatar]  1,240+ signed up

  [Full name]
  [Email address]
  [I am a… ▾]   ← only when showRoleField: true
  [Reserve my spot →]

  ✓ Exclusive early access
  ✓ Founding member pricing
  ✓ Direct line to the team
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showNameField` | `boolean` | `true` | Show a name field |
| `showRoleField` | `boolean` | `false` | Show a role / interest dropdown |
| `subscriberCount` | `number` | `1240` | Social proof number (set to `0` to hide) |
| `roleOptions` | `string[]` | see config | Options for the role dropdown |

---

## Mail provider config (`configs/mail.ts`)

### Use Resend (recommended)

Set in `configs/mail.ts`:
```ts
provider: "resend",
```

Set in `.env.local`:
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=hello@yourdomain.com
MAIL_FROM_NAME=MyApp
CONTACT_EMAIL=you@yourdomain.com
```

### Use Gmail / SMTP

```ts
provider: "smtp",
```

```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
CONTACT_EMAIL=you@gmail.com
```

> For Gmail, generate an **App Password** at myaccount.google.com/apppasswords (requires 2FA enabled).

### No provider (development fallback)

If neither `RESEND_API_KEY` nor `SMTP_HOST` is set, submissions are logged to the console. This is the safe default for local development.

---

## API endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/v1/contact` | `POST` | Contact form submissions |
| `/api/v1/subscribe` | `POST` | Early access / waitlist signups |

### Contact request body

```ts
{
  name: string;       // required, min 2 chars
  email: string;      // required, strict validation
  phone: string;      // required when showPhone is true
  message: string;    // required, min 5 chars
  captchaToken: string | null;
  website?: string;   // honeypot — leave empty
}
```

### Subscribe request body

```ts
{
  email: string;    // required
  name?: string;    // optional
  role?: string;    // optional
  website?: string; // honeypot — leave empty
}
```

Both routes return:
```ts
{ success: true, message: string }
// or
{ error: string }  // with appropriate HTTP status
```

---

## Email templates

| Template | Used by | Location |
|----------|---------|----------|
| `ContactFormEmail` | `/api/v1/contact` | `emails/ContactFormEmail.tsx` |
| `SubscribeEmail` | `/api/v1/subscribe` | `emails/SubscribeEmail.tsx` |

Both are [React Email](https://react.email) components rendered server-side before sending.

To preview templates locally, run `npx react-email dev` (renders a preview UI at `localhost:3000`).

---

## CAPTCHA

All five form variants support CAPTCHA. One provider is active at a time, set in `configs/forms.ts`.

### Enable CAPTCHA

```ts
// configs/forms.ts
captchaProvider: "turnstile",      // active provider (see below)

contactForm: {
  requireCaptcha: true,            // enable on contact form
},
subscribeForm: {
  requireCaptcha: true,            // enable on subscribe form
},
```

### Provider options

| Value | Widget | Env vars required |
|-------|--------|-------------------|
| `"turnstile"` | Cloudflare Turnstile checkbox (recommended) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` |
| `"recaptcha-v2"` | Google reCAPTCHA v2 checkbox | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` |
| `"recaptcha-v3"` | Google reCAPTCHA v3 invisible | `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` |

**Turnstile** keys are already in `.env.local`. For reCAPTCHA, get keys at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin).

### How it works

- **Turnstile / reCAPTCHA v2** — a visible widget renders inside the form. The user solves it; the token is sent with the submission.
- **reCAPTCHA v3** — invisible. The token is obtained programmatically on submit via `executeRecaptcha()`. No user interaction needed.
- The server verifies the token against the provider's API before processing the form. A score threshold of `0.5` is applied for v3.
- When `requireCaptcha: false`, no widget is shown and no server verification runs.

### Env vars

```
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

# Google reCAPTCHA (v2 or v3, same keys)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
```

---

## Security

Both API routes include:

- **Rate limiting** — 5 req/min per IP for contact, 3 req/min for subscribe
- **Honeypot field** — invisible `website` field; filled = bot, silently rejected
- **Email validation** — blocks 40+ disposable domains, test addresses, and suspicious patterns
- **Input sanitization** — HTML entity encoding on all string inputs to prevent XSS in email bodies
- **CAPTCHA** (optional) — Turnstile, reCAPTCHA v2, or reCAPTCHA v3; enable per-form via `configs/forms.ts`

---

## File structure

```
configs/
  mail.ts          ← provider, credentials, contact email
  forms.ts         ← layout types, field toggles, feature flags

lib/
  services/
    mail.ts        ← sendEmail(), sanitizeInput(), validateEmailStrict()

components/
  forms/
    ContactForm.tsx           ← switcher
    ContactFormMinimal.tsx    ← layout: "minimal"
    ContactFormDetailed.tsx   ← layout: "detailed"
    SubscribeForm.tsx         ← switcher
    SubscribeFormInline.tsx   ← layout: "inline"
    SubscribeFormCard.tsx     ← layout: "card"
    SubscribeFormWaitlist.tsx ← layout: "waitlist"

app/
  api/v1/
    contact/route.ts   ← POST handler
    subscribe/route.ts ← POST handler
  page.tsx             ← renders both forms (controlled by enableContactForm / enableSubscribeForm)

emails/
  ContactFormEmail.tsx ← admin notification for contact submissions
  SubscribeEmail.tsx   ← admin notification for new signups
```
