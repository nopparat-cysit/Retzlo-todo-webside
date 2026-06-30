import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AuthScene } from "@/components/auth/auth-scene";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/select-module");
  }
  return (
    <AuthScene
      eyebrow="Retzlo"
      title="The lamp is on"
      description="The vinyl turns slowly in the warm amber glow. Your corner of the night is ready."
    >
      <Suspense fallback={<p className="text-sm text-[#f5efe6]/40">Lighting the lamp...</p>}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-[#f5efe6]/60">
        Lost your key?{" "}
        <Link 
          href="/forgot-password"
          className="text-dusk-amber hover:text-dusk-lavender transition-all duration-200 hover:underline underline-offset-4"
        >
          Send a quiet signal
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-[#f5efe6]/50">
        First time here?{" "}
        <Link 
          href="/register"
          className="text-dusk-lavender hover:text-dusk-amber transition-colors duration-200 underline-offset-4 hover:underline"
        >
          Open a new journal
        </Link>
      </p>
    </AuthScene>
  );
}
