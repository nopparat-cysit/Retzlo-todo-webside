import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Panel, PageShell } from "@/components/ui/panel";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { email?: string };
}) {
  return (
    <PageShell className="grid max-w-lg items-center">
      <Panel className="p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
          <h1 className="mt-2 text-3xl font-semibold">Verify OTP</h1>
          <p className="mt-2 text-sm text-stone-400">Enter the OTP from your email and choose a new password.</p>
        </div>
        <ResetPasswordForm email={searchParams.email ?? ""} />
      </Panel>
    </PageShell>
  );
}
