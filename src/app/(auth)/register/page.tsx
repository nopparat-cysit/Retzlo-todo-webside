import Link from "next/link";
import { Suspense } from "react";

import { AuthScene } from "@/components/auth/auth-scene";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthScene
      description="Start with one project. Let the system grow around it."
      eyebrow="Retzlo"
      title="Create your workspace"
    >
      <Suspense fallback={<p className="text-sm text-stone-400">Loading account form...</p>}>
        <RegisterForm />
      </Suspense>
      <p className="mt-5 text-center text-sm text-stone-300">
        Already have an account?{" "}
        <Link className="text-dusk-amber transition hover:text-dusk-lavender" href="/login">
          Sign in
        </Link>
      </p>
    </AuthScene>
  );
}
