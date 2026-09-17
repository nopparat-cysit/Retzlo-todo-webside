import { AuthScene } from "@/components/auth/auth-scene";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({
  searchParams
}: {
  searchParams: { email?: string };
}) {
  return (
    <AuthScene
      eyebrow="Retzlo"
      title="Verify OTP"
      description="Enter the OTP from your email and choose a new password."
      cardClassName="sm:!max-w-md sm:!w-[28rem]"
    >
      <ResetPasswordForm email={searchParams.email ?? ""} />
    </AuthScene>
  );
}
