"use client";

import { useState, FormEvent } from "react";
import { formsConfig } from "@/configs/forms";
import { useCaptcha } from "@/hooks/useCaptcha";
import CaptchaWidget from "./CaptchaWidget";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactFormMinimal() {
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

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[340px] text-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Message sent!</h3>
        <p className="text-gray-500 max-w-xs">
          Thanks for reaching out. We&apos;ll get back to you shortly.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-2 text-sm text-indigo-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Honeypot */}
      <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-min-name" className="text-sm font-medium text-gray-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-min-name"
            type="text"
            required
            value={fields.name}
            onChange={set("name")}
            placeholder="Jane Smith"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-min-email" className="text-sm font-medium text-gray-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-min-email"
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
          <label htmlFor="cf-min-phone" className="text-sm font-medium text-gray-700">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            id="cf-min-phone"
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
        <label htmlFor="cf-min-message" className="text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="cf-min-message"
          required
          rows={5}
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
        {state === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
