import Link from "next/link";
import { Suspense } from "react";

import { AuthScene } from "@/components/auth/auth-scene";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthScene
      description="Pick up where the board left off."
      eyebrow="Retzlo"
      title="Welcome back"
    >
      <Suspense fallback={<p className="text-sm text-stone-400">Loading sign in...</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-stone-300">
        Forgot password?{" "}
        <Link className="text-dusk-amber transition hover:text-dusk-lavender" href="/forgot-password">
          Send OTP
        </Link>
      </p>
      <p className="mt-5 text-center text-sm text-stone-300">
        No account?{" "}
        <Link className="text-dusk-amber transition hover:text-dusk-lavender" href="/register">
          Create account
        </Link>
      </p>
    </AuthScene>
  );
}
