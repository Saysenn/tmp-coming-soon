"use client";

import { useState, FormEvent } from "react";
import { formsConfig } from "@/configs/forms";
import { useCaptcha } from "@/hooks/useCaptcha";
import CaptchaWidget from "./CaptchaWidget";

type FormState = "idle" | "loading" | "success" | "error";

export default function SubscribeFormCard() {
  const { showNameField, subscriberCount, requireCaptcha } = formsConfig.subscribeForm;
  const { isV3, setWidgetToken, getToken } = useCaptcha();

  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    let captchaToken: string | null = null;
    if (requireCaptcha) {
      captchaToken = await getToken("subscribe_form");
      if (!captchaToken) {
        setErrorMsg("Please complete the CAPTCHA before submitting.");
        setState("error");
        return;
      }
    }

    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(showNameField ? { name } : {}), captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        setEmail("");
        setName("");
        setWidgetToken(null);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] text-center gap-4 px-4 py-10">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-gray-900">You&apos;re on the list!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          We&apos;ll send you an email the moment we launch. Stay tuned!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-2">
          Coming soon
        </p>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Be the first to know
        </h2>
        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
          We&apos;re working on something exciting. Sign up to get early access and exclusive updates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Honeypot */}
        <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

        {showNameField && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sf-card-name" className="text-sm font-medium text-gray-700">
              Your name
            </label>
            <input
              id="sf-card-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sf-card-email" className="text-sm font-medium text-gray-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="sf-card-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
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
          {state === "loading" ? "Joining…" : "Notify me"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        {subscriberCount > 0
          ? `${subscriberCount.toLocaleString()} people already signed up · `
          : ""}
        No spam. Unsubscribe at any time.
      </p>
    </div>
  );
}
