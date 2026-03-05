// ============================================================
// configs/header.ts — Header layout & navigation config
//
// This is the ONLY file you need to edit to:
//  • Change the header style (logoType, headerType)
//  • Change the mobile menu behavior (mobileMenuType)
//  • Add/remove nav links (headerNav)
//  • Update the CTA button (ctaLabel, ctaHref)
// ============================================================

// ─── Types ────────────────────────────────────────────────────

export type LogoType =
  | "text"        // bold site name only
  | "image-text"  // image from logoImageSrc + site name
  | "icon-text";  // geometric icon + site name

export type MobileMenuType =
  | "drawer"      // slides in from the left
  | "dropdown"    // expands below the header bar
  | "fullscreen"; // slides down from the top, full screen

export type HeaderType =
  | "nav"         // logo + desktop nav links + mobile hamburger (default)
  | "cta"         // logo + single CTA button, no nav links
  | "menu-only";  // logo + one "Menu" button visible on ALL screen sizes

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type HeaderConfig = {
  name: string;
  description: string;
  copyright: string;
  logoType: LogoType;
  logoImageSrc?: string;   // used when logoType is "image-text"
  headerType: HeaderType;
  mobileMenuType: MobileMenuType;
  headerSticky: boolean;
  ctaLabel?: string;       // used when headerType is "cta"
  ctaHref?: string;        // used when headerType is "cta"
};

// ─── Config ───────────────────────────────────────────────────

export const siteConfig: HeaderConfig = {
  name: "MyApp",
  description: "Your app description here.",
  copyright: `© ${new Date().getFullYear()} MyApp. All rights reserved.`,

  // Logo style — "text" | "image-text" | "icon-text"
  logoType: "icon-text",
  logoImageSrc: "/logo.png",

  // Header layout — "nav" | "cta" | "menu-only"
  headerType: "cta",

  // Mobile menu style — "drawer" | "dropdown" | "fullscreen"
  mobileMenuType: "drawer",

  headerSticky: true,

  // CTA button (only shown when headerType is "cta")
  ctaLabel: "Get Started",
  ctaHref: "/get-started",
};

// ─── Nav links ────────────────────────────────────────────────

export const headerNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Why Choose Us", href: "/why-us" },
  { label: "Services", href: "/services" },
  { label: "Contact Us", href: "/contact" },
];
