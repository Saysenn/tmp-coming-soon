// ─────────────────────────────────────────────────────────────
// components/forms/ContactForm.tsx
//
// Switcher — renders the contact form variant set in
// configs/forms.ts → formsConfig.contactFormType
//
// To change layout: update contactFormType in configs/forms.ts
//   "minimal"  → single centered column
//   "detailed" → two-column with left info panel
// ─────────────────────────────────────────────────────────────

import { formsConfig } from "@/configs/forms";
import ContactFormMinimal from "./ContactFormMinimal";
import ContactFormDetailed from "./ContactFormDetailed";

export default function ContactForm() {
  switch (formsConfig.contactFormType) {
    case "detailed":
      return <ContactFormDetailed />;
    case "minimal":
    default:
      return <ContactFormMinimal />;
  }
}
