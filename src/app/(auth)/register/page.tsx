import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { MixtapeAuthScene } from "@/components/auth/login-scene";
import { RegisterForm } from "@/components/auth/register-form";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/projects");
  return (
    <MixtapeAuthScene mode="register">
      <Suspense fallback={<p className="text-sm text-theme-muted">Getting your space ready...</p>}>
        <RegisterForm />
      </Suspense>
    </MixtapeAuthScene>
  );
}
