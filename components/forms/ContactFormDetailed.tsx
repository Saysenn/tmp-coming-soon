"use client";

import { useState, FormEvent } from "react";
import { formsConfig } from "@/configs/forms";
import { companyInfo } from "@/configs/footer";
import { useCaptcha } from "@/hooks/useCaptcha";
import CaptchaWidget from "./CaptchaWidget";

type FormState = "idle" | "loading" | "success" | "error";

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function ContactFormDetailed() {
  const { showPhone, requireCaptcha } = formsConfig.contactForm;
  const { isV3, setWidgetToken, getToken } = useCaptcha();

  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function set(field: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    let captchaToken: string | null = null;
    if (requireCaptcha) {
      captchaToken = await getToken("contact_form");
      if (!captchaToken) {
        setErrorMsg("Please complete the CAPTCHA before submitting.");
        setState("error");
        return;
      }
    }

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        setFields({ name: "", email: "", phone: "", message: "" });
        setWidgetToken(null);
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
      {/* ── Left info panel ─────────────────────────────────── */}
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-10 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Get in touch</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            We&apos;d love to hear from you. Fill in the form and our team will get back to you within one business day.
          </p>

          <div className="mt-10 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 flex-shrink-0 text-indigo-400">
                <MapPinIcon />
              </span>
              <span className="text-slate-300 text-sm">{companyInfo.address}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 text-indigo-400">
                <MailIcon />
              </span>
              <a
                href={`mailto:${companyInfo.email}`}
                className="text-slate-300 text-sm hover:text-white transition-colors"
              >
                {companyInfo.email}
              </a>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex-shrink-0 text-indigo-400">
                <PhoneIcon />
              </span>
              <a
                href={`tel:${companyInfo.phone}`}
                className="text-slate-300 text-sm hover:text-white transition-colors"
              >
                {companyInfo.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="relative mt-12 h-24 overflow-hidden" aria-hidden="true">
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border border-indigo-700/40" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border border-indigo-600/40" />
        </div>
      </div>

      {/* ── Right form ───────────────────────────────────────── */}
      <div className="lg:col-span-3 bg-white p-10">
        {state === "success" ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Message sent!</h3>
            <p className="text-gray-500 max-w-xs text-sm">
              Thanks for reaching out. We&apos;ll be in touch shortly.
            </p>
            <button
              onClick={() => setState("idle")}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Honeypot */}
            <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-det-name" className="text-sm font-medium text-gray-700">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cf-det-name"
                  type="text"
                  required
                  value={fields.name}
                  onChange={set("name")}
                  placeholder="Jane Smith"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-det-email" className="text-sm font-medium text-gray-700">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="cf-det-email"
                  type="email"
                  required
                  value={fields.email}
                  onChange={set("email")}
                  placeholder="jane@company.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {showPhone && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-det-phone" className="text-sm font-medium text-gray-700">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  id="cf-det-phone"
                  type="tel"
                  required
                  value={fields.phone}
                  onChange={set("phone")}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cf-det-message" className="text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cf-det-message"
                required
                rows={6}
                value={fields.message}
                onChange={set("message")}
                placeholder="Tell us how we can help…"
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {requireCaptcha && !isV3 && (
              <CaptchaWidget
                onVerify={setWidgetToken}
                onExpire={() => setWidgetToken(null)}
              />
            )}

            {state === "error" && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {state === "loading" ? "Sending…" : "Send message →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
