import { Suspense } from "react";

import { AcceptInvitation } from "@/components/auth/accept-invitation";
import { BackButton } from "@/components/ui/back-button";
import { Panel, PageShell } from "@/components/ui/panel";

export default function AcceptInvitationPage() {
  return (
    <PageShell className="grid max-w-xl items-center">
      <Panel className="p-6">
        <div className="mb-6 flex items-start gap-3">
          <BackButton />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">Invitation</p>
            <h1 className="mt-2 text-3xl font-semibold">Join project</h1>
            <p className="mt-2 text-sm text-stone-400">
              Sign in or create an account to enter this workspace.
            </p>
          </div>
        </div>
        <Suspense fallback={<p className="text-sm text-stone-400">Checking invitation...</p>}>
          <AcceptInvitation />
        </Suspense>
      </Panel>
    </PageShell>
  );
}
