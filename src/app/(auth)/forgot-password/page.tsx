import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Panel, PageShell } from "@/components/ui/panel";

export default function ForgotPasswordPage() {
  return (
    <PageShell className="grid max-w-lg items-center">
      <Panel className="p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
          <h1 className="mt-2 text-3xl font-semibold">Forgot password</h1>
          <p className="mt-2 text-sm text-stone-400">We will send a 6-digit OTP to your email.</p>
        </div>
        <ForgotPasswordForm />
        <p className="mt-5 text-sm text-stone-400">
          Remembered it?{" "}
          <Link className="text-dusk-lavender" href="/login">
            Sign in
          </Link>
        </p>
      </Panel>
    </PageShell>
  );
}
