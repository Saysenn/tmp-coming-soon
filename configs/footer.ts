// ============================================================
// configs/footer.ts — Footer layout & content config
//
// This is the ONLY file you need to edit to:
//  • Switch the footer layout (footerLayout)
//  • Add/remove footer nav columns (footerSections)
//  • Add/remove social links (socialLinks)
//  • Edit legal links (legalLinks)
//  • Edit company info (companyInfo) — used by FooterInfo
// ============================================================

// ─── Types ────────────────────────────────────────────────────

export type FooterLayout =
  | "columns"   // FooterColumns  — 3-col grid: brand | links | connect
  | "minimal"   // FooterMinimal  — single compact bar: logo · legal · socials
  | "centered"  // FooterCentered — centered stacked: logo → tagline → socials → legal
  | "brand"     // FooterBrand    — bold brand statement with gradient accent line
  | "split"     // FooterSplit    — two-tone zones: upper (brand+links) / lower (copyright+socials)
  | "info";     // FooterInfo     — plain: logo + company details, no nav menus

export type SocialIconName =
  | "twitter"
  | "github"
  | "linkedin"
  | "instagram"
  | "youtube"
  | "facebook";

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialIconName;
};

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type CompanyInfo = {
  address: string;
  email: string;
  phone: string;
  companyNumber?: string;
};

// ─── Config ───────────────────────────────────────────────────

// Footer layout — switch between: "columns" | "minimal" | "centered" | "brand" | "split" | "info"
export const footerLayout: FooterLayout = "columns";

// ─── Legal links (used by all footer layouts) ─────────────────

export const legalLinks: FooterLink[] = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

// ─── Footer nav columns (used by layouts that show grouped links) ─

export const footerSections: FooterSection[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Why Choose Us", href: "/why-us" },
      { label: "Services", href: "/services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

// ─── Social links ─────────────────────────────────────────────

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "Twitter", href: "https://twitter.com", icon: "twitter" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
];

// ─── Company info (used by FooterInfo layout) ─────────────────

export const companyInfo: CompanyInfo = {
  address: "123 Business Street, Suite 100, New York, NY 10001",
  email: "hello@myapp.com",
  phone: "+1 (555) 123-4567",
  companyNumber: "Reg. No. 12345678",
};
