"use client";

import { useState, FormEvent } from "react";
import { formsConfig } from "@/configs/forms";
import { useCaptcha } from "@/hooks/useCaptcha";
import CaptchaWidget from "./CaptchaWidget";

type FormState = "idle" | "loading" | "success" | "error";

export default function SubscribeFormInline() {
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
      <div className="text-center py-4">
        <p className="text-green-600 font-semibold text-lg">You&apos;re on the list!</p>
        <p className="text-gray-500 text-sm mt-1">We&apos;ll notify you as soon as we launch.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
        <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

        <div className="flex flex-col sm:flex-row gap-3">
          {showNameField && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="flex-shrink-0 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {state === "loading" ? "Joining…" : "Get early access"}
          </button>
        </div>
      </form>

      {requireCaptcha && !isV3 && (
        <div className="mt-3">
          <CaptchaWidget
            onVerify={setWidgetToken}
            onExpire={() => setWidgetToken(null)}
          />
        </div>
      )}

      {state === "error" && (
        <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
      )}

      {subscriberCount > 0 && state !== "error" && (
        <p className="mt-3 text-xs text-gray-400 text-center sm:text-left">
          Join {subscriberCount.toLocaleString()}+ people already on the waitlist. No spam, ever.
        </p>
      )}
    </div>
  );
}
