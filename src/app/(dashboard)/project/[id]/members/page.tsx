import { InviteForm } from "@/components/project/invite-form";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function MembersPage({ params }: { params: { id: string } }) {
  const members = await prisma.projectMember.findMany({
    where: { projectId: params.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Panel className="p-5">
        <h2 className="mb-4 text-2xl font-semibold">Project members</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.05] p-3">
              <div>
                <p className="font-medium text-stone-100">{member.user.name ?? member.user.email}</p>
                <p className="text-sm text-stone-500">{member.user.email}</p>
              </div>
              <span className="rounded bg-dusk-lavender/10 px-2 py-1 text-xs text-dusk-lavender">{member.role}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-5">
        <h3 className="mb-4 text-lg font-semibold">Invite member</h3>
        <InviteForm projectId={params.id} />
      </Panel>
    </div>
  );
}
