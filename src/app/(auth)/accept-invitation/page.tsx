import { Suspense } from "react";

import { AcceptInvitation } from "@/components/auth/accept-invitation";
import { AuthScene } from "@/components/auth/auth-scene";

export default function AcceptInvitationPage() {
  return (
    <AuthScene
      eyebrow="Invitation"
      title="Join project"
      description="Enter this workspace to collaborate and organize work together."
      cardClassName="sm:!max-w-md sm:!w-[30rem]"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-8 text-stone-400">
            <div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-dusk-lavender border-t-transparent" />
            <p className="text-xs text-stone-400">กำลังตรวจสอบข้อมูลคำเชิญ...</p>
          </div>
        }
      >
        <AcceptInvitation />
      </Suspense>
    </AuthScene>
  );
}
