import Link from "next/link";
import { Suspense } from "react";

import { AuthScene } from "@/components/auth/auth-scene";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthScene
      eyebrow="Retzlo"
      title="Lost your key?"
      description="Don't worry. The night is long. We'll send a quiet signal to your old journal."
    >
      <Suspense fallback={<p className="text-sm text-[#f5efe6]/40">Lighting a match...</p>}>
        <ForgotPasswordForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-[#f5efe6]/50">
        Remembered it?{" "}
        <Link 
          href="/login"
          className="text-dusk-lavender hover:text-dusk-amber transition-colors duration-200 underline-offset-4 hover:underline"
        >
          Return to the desk
        </Link>
      </p>
    </AuthScene>
  );
}
