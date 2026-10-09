import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Retzlo",
  description: "Terms of Service and Acceptable Use Policy for Retzlo workspace."
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080714] text-stone-200 antialiased selection:bg-dusk-lavender/30 selection:text-dusk-lavender">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 transition hover:text-dusk-lavender mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Retzlo</span>
        </Link>

        <header className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-1 text-xs font-mono font-medium text-dusk-amber mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal & Agreements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-stone-400">Terms of Service and Acceptable Use Policy (Effective as of September 20, 2026)</p>
        </header>

        <article className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-stone-300">
          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">1.</span> Acceptance of Terms
            </h2>
            <p>
              Welcome to Retzlo (&quot;we&quot; or &quot;the platform&quot;). By accessing or using the Retzlo website and application, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to any part of these terms, please discontinue using the service immediately.
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">2.</span> User Account & Security
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for safeguarding your password and account credentials.</li>
              <li>You are directly responsible for all activities and content created under your account.</li>
              <li>If you suspect unauthorized access or security breaches, notify system administrators promptly.</li>
              <li>Each individual may maintain an account for personal task management or team workspace collaboration.</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">3.</span> Acceptable Use Policy
            </h2>
            <p className="mb-2">You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sending unsolicited spam or using invitation systems to harass others (Email Bombing / Spamming).</li>
              <li>Uploading unlawful, infringing, abusive content or malicious software.</li>
              <li>Attempting to penetrate, disrupt, or place unreasonable load on servers and databases (DoS / Brute Force).</li>
              <li>Copying, reverse engineering, or redistributing Retzlo software without explicit authorization.</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">4.</span> User Content & Ownership
            </h2>
            <p>
              All content you create within Retzlo, including boards, cards, notes, and diary entries, remains your intellectual property. We do not distribute or monetize your private workspace content, processing it solely to deliver platform functionality.
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">5.</span> Limitation of Liability
            </h2>
            <p>
              Retzlo is provided &quot;as is&quot; and &quot;as available&quot;. While we strive for maximum reliability, uptime, and security, we do not warrant that operation will be entirely error-free or uninterrupted under all circumstances. Users are encouraged to maintain independent backups of critical records.
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">6.</span> Contact & Inquiries
            </h2>
            <p>
              If you have questions regarding these terms, please contact our support team through the contact channels provided in the Retzlo platform.
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Retzlo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-300 underline">Privacy Policy</Link>
            <Link href="/register" className="hover:text-stone-300 underline">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
