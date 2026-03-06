import { formsConfig } from "@/configs/forms";
import ContactForm from "@/components/forms/ContactForm";
import SubscribeForm from "@/components/forms/SubscribeForm";

export default function Home() {
  return (
    <main className="flex flex-col gap-24 py-20 px-4">
      {/* ── Subscribe section ──────────────────────────────── */}
      {formsConfig.enableSubscribeForm && (
        <section className="max-w-4xl mx-auto w-full">
          <SubscribeForm />
        </section>
      )}

      {/* ── Contact section ────────────────────────────────── */}
      {formsConfig.enableContactForm && (
        <section className="max-w-4xl mx-auto w-full">
          {formsConfig.contactFormType === "minimal" && (
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Contact us</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Have a question or want to work together? We&apos;d love to hear from you.
              </p>
            </div>
          )}
          <ContactForm />
        </section>
      )}
    </main>
  );
}
