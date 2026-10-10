import { Suspense } from "react";
import { MixtapeAuthScene } from "@/components/auth/login-scene";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <MixtapeAuthScene mode="forgot-password">
      <Suspense fallback={<p className="text-sm text-theme-muted">Getting your space ready...</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </MixtapeAuthScene>
  );
}
