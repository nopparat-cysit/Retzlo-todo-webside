import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { AuthScene } from "@/components/auth/auth-scene";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";
import { DEFAULT_MODULE_COOKIE_NAME, getModuleHref, isValidModuleId } from "@/lib/modules/default-module";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const cookieStore = cookies();
    const defaultModule = cookieStore.get(DEFAULT_MODULE_COOKIE_NAME)?.value;
    const destination = defaultModule && isValidModuleId(defaultModule) ? getModuleHref(defaultModule) : "/select-module";
    redirect(destination);
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
