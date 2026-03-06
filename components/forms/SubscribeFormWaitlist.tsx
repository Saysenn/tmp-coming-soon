"use client";

import { useState, FormEvent } from "react";
import { formsConfig } from "@/configs/forms";

type FormState = "idle" | "loading" | "success" | "error";

const benefits = [
  "Exclusive early access before public launch",
  "Founding member pricing — locked in forever",
  "Direct line to the team to shape the product",
];

export default function SubscribeFormWaitlist() {
  const { showNameField, showRoleField, subscriberCount, roleOptions } = formsConfig.subscribeForm;

  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...(showNameField ? { name } : {}),
          ...(showRoleField && role ? { role } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        setEmail("");
        setName("");
        setRole("");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-6 px-4 py-16">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl">
          🎉
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">You&apos;re on the waitlist!</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
            We&apos;ll be in touch soon. Share with friends to move up the list.
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-gray-600 text-left max-w-xs">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="text-indigo-500 mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Heading */}
      <div className="text-center max-w-xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-indigo-500 mb-4">
          <span className="inline-block w-8 h-px bg-indigo-300" />
          Limited early access
          <span className="inline-block w-8 h-px bg-indigo-300" />
        </span>
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
          Join the waitlist
        </h2>
        <p className="text-gray-500 mt-4 text-base leading-relaxed">
          We&apos;re building something new. Be among the first to experience it
          and help shape what it becomes.
        </p>
      </div>

      {/* Social proof */}
      {subscriberCount > 0 && (
        <div className="flex items-center gap-3">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8"].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {subscriberCount.toLocaleString()}+
            </span>{" "}
            people already signed up
          </p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4"
        noValidate
      >
        {/* Honeypot */}
        <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} />

        {showNameField && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sf-wl-name" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="sf-wl-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sf-wl-email" className="text-sm font-medium text-gray-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="sf-wl-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {showRoleField && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sf-wl-role" className="text-sm font-medium text-gray-700">
              I am a…
            </label>
            <select
              id="sf-wl-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 appearance-none"
            >
              <option value="">Select your role (optional)</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {state === "error" && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "Joining waitlist…" : "Reserve my spot →"}
        </button>
      </form>

      {/* Benefits */}
      <ul className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500 mt-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span className="text-indigo-400">✓</span>
            {b}
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
    </div>
  );
}
