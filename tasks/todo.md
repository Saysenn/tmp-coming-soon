# Task: Form Templates + Mail Provider Config

## Status: ✅ Complete

## What was built

### New config files
- [x] `configs/mail.ts` — provider (`resend` | `smtp`), from name, contact email, credentials
- [x] `configs/forms.ts` — contact form type, subscribe form type, field toggles, feature flags

### Shared mail service
- [x] `lib/services/mail.ts` — `sendEmail()`, `sanitizeInput()`, `validateEmailStrict()` (DRY)

### API routes
- [x] `app/api/v1/contact/route.ts` — refactored to use `lib/services/mail`
- [x] `app/api/v1/subscribe/route.ts` — new subscribe endpoint (rate limit + honeypot)

### Email templates
- [x] `emails/ContactFormEmail.tsx` — unchanged (already working)
- [x] `emails/SubscribeEmail.tsx` — new admin notification for signups

### Form components (2 contact + 3 subscribe)
- [x] `components/forms/ContactFormMinimal.tsx` — single-column card
- [x] `components/forms/ContactFormDetailed.tsx` — two-column with dark info panel
- [x] `components/forms/ContactForm.tsx` — switcher
- [x] `components/forms/SubscribeFormInline.tsx` — horizontal banner row
- [x] `components/forms/SubscribeFormCard.tsx` — centered card
- [x] `components/forms/SubscribeFormWaitlist.tsx` — full hero with social proof
- [x] `components/forms/SubscribeForm.tsx` — switcher

### Page
- [x] `app/page.tsx` — renders both forms, controlled by `enableContactForm` / `enableSubscribeForm`

## How to switch layouts

Edit `configs/forms.ts`:
```ts
contactFormType: "minimal" | "detailed"
subscribeFormType: "inline" | "card" | "waitlist"
```

Edit `configs/mail.ts` (or `.env.local`):
```
EMAIL_PROVIDER=resend   # or smtp
```
