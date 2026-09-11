import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { AuthScene } from "@/components/auth/auth-scene";
import { RegisterForm } from "@/components/auth/register-form";
import { authOptions } from "@/lib/auth";
import { DEFAULT_MODULE_COOKIE_NAME, getModuleHref, isValidModuleId } from "@/lib/modules/default-module";

export default async function RegisterPage() {
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
      title="A new page awaits"
      description="The ink is fresh. The night is quiet. Begin your archive here."
    >
      <Suspense fallback={<p className="text-sm text-[#f5efe6]/40">Preparing the inkwell...</p>}>
        <RegisterForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-[#f5efe6]/50">
        Already have a corner?{" "}
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
