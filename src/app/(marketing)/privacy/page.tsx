import Link from "next/link";
import { ArrowLeft, Shield, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Retzlo",
  description: "Privacy Policy and Data Protection practices for Retzlo workspace."
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-dusk-cyan/30 bg-dusk-cyan/10 px-3 py-1 text-xs font-mono font-medium text-dusk-cyan mb-3">
            <Shield className="h-3.5 w-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-stone-400">Personal Data Protection and Privacy Policy (Effective as of September 20, 2026)</p>
        </header>

        <article className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-stone-300">
          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">1.</span> Introduction
            </h2>
            <p>
              Retzlo values your privacy and is committed to protecting your personal data. This policy explains what categories of data we collect, how it is processed, and your rights under applicable data protection regulations.
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">2.</span> Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> Email address, username, display name, and passwords secured using industry-standard cryptographic hashing (we never store plain-text passwords).</li>
              <li><strong>Profile & Media:</strong> Uploaded profile avatars and project cover images.</li>
              <li><strong>Workspace & Content:</strong> Kanban boards, task cards, checklists, notes, habit diary entries, and card comments.</li>
              <li><strong>Technical Metadata:</strong> Session authentication tokens (Secure JWT Cookie) and IP addresses used for rate limiting and threat prevention.</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">3.</span> Purposes of Processing
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide workspace management, calendar scheduling, and team collaboration features as requested.</li>
              <li>To authenticate user identity, verify access permissions, and maintain platform security.</li>
              <li>To send essential transactional notifications and workspace invitations via email.</li>
              <li>To prevent fraud, automated spam, and malicious cyber attacks.</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">4.</span> Data Sharing & Third Parties
            </h2>
            <p>
              <strong>We do not sell, rent, or monetize your personal information to third parties for advertising.</strong> Data is shared strictly with essential infrastructure providers required to operate the service (such as Neon PostgreSQL database, Cloudinary media storage, and transactional email gateways).
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">5.</span> Your Rights
            </h2>
            <p className="mb-2">Under privacy laws, you retain the following rights:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Right to access and obtain a copy of your personal data.</li>
              <li>Right to rectify inaccurate or incomplete information.</li>
              <li>Right to erasure (you can delete cards, boards, or request full account deletion).</li>
              <li>Right to withdraw processing consent at any time.</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">6.</span> Data Security
            </h2>
            <p>
              Retzlo employs technical and organizational safeguards including HTTPS/TLS encryption in transit, strict password hashing, and role-based access control to prevent unauthorized disclosure, alteration, or data loss.
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Retzlo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-stone-300 underline">Terms of Service</Link>
            <Link href="/register" className="hover:text-stone-300 underline">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
