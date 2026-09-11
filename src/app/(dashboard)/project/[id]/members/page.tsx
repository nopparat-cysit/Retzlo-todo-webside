import { redirect } from "next/navigation";

import { InviteForm } from "@/components/project/invite-form";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";
import { getProjectMembership, requireUserId } from "@/lib/project-auth";

export default async function MembersPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) {
    redirect("/login");
  }

  const membership = await getProjectMembership(params.id, userId);
  if (!membership) {
    redirect("/projects");
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId: params.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto pr-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-100">Project members</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-500">
            Manage team access, invitations, and collaborator roles.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Panel className="lofi-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-100">Active members</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-stone-400">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-dusk-lavender/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-dusk-lavender/15 text-xs font-semibold text-dusk-lavender">
                      {(member.user.name?.[0] ?? member.user.email[0]).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-100">{member.user.name ?? member.user.email}</p>
                      <p className="truncate text-xs text-stone-500">{member.user.email}</p>
                    </div>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full border border-dusk-lavender/30 bg-dusk-lavender/10 px-2.5 py-0.5 text-xs font-medium text-dusk-lavender">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="lofi-panel p-5">
            <h3 className="mb-1 text-lg font-semibold text-stone-100">Invite member</h3>
            <p className="mb-4 text-xs text-stone-500">Send an invitation link to a teammate.</p>
            <InviteForm projectId={params.id} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
