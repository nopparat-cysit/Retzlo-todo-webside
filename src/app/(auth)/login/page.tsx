import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { MixtapeAuthScene } from "@/components/auth/login-scene";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/projects");
  return (
    <MixtapeAuthScene>
      <Suspense fallback={<p className="text-sm text-theme-muted">Getting your workspace ready...</p>}>
        <LoginForm />
      </Suspense>
    </MixtapeAuthScene>
  );
}
