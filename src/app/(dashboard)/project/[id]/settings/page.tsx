import { notFound } from "next/navigation";

import { SettingsForm } from "@/components/project/settings-form";
import { SoundToggle } from "@/components/project/sound-toggle";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, description: true, coverImage: true }
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-5 overflow-y-auto p-1">
      {/* Project details */}
      <Panel className="max-w-2xl p-5">
        <h2 className="mb-1 text-2xl font-semibold">Project settings</h2>
        <p className="mb-5 text-sm text-stone-500">Manage this workspace&apos;s name, cover and description.</p>
        <SettingsForm project={project} />
      </Panel>

      {/* Preferences */}
      <Panel className="max-w-2xl p-5">
        <h2 className="mb-1 text-xl font-semibold">Preferences</h2>
        <p className="mb-4 text-sm text-stone-500">Personal settings — stored in your browser only.</p>
        <SoundToggle />
      </Panel>
    </div>
  );
}
