// ─────────────────────────────────────────────────────────────
// components/forms/SubscribeForm.tsx
//
// Switcher — renders the subscribe form variant set in
// configs/forms.ts → formsConfig.subscribeFormType
//
// To change layout: update subscribeFormType in configs/forms.ts
//   "inline"   → horizontal banner (email input + button in one row)
//   "card"     → centered card with optional name field
//   "waitlist" → full hero section with social proof & benefits
// ─────────────────────────────────────────────────────────────

import { formsConfig } from "@/configs/forms";
import SubscribeFormInline from "./SubscribeFormInline";
import SubscribeFormCard from "./SubscribeFormCard";
import SubscribeFormWaitlist from "./SubscribeFormWaitlist";

export default function SubscribeForm() {
  switch (formsConfig.subscribeFormType) {
    case "card":
      return <SubscribeFormCard />;
    case "waitlist":
      return <SubscribeFormWaitlist />;
    case "inline":
    default:
      return <SubscribeFormInline />;
  }
}
