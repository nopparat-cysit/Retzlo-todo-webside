import { notFound } from "next/navigation";

import { SettingsForm } from "@/components/project/settings-form";
import { Panel } from "@/components/ui/panel";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, description: true }
  });

  if (!project) {
    notFound();
  }

  return (
    <Panel className="max-w-2xl p-5">
      <h2 className="mb-4 text-2xl font-semibold">Project settings</h2>
      <SettingsForm project={project} />
    </Panel>
  );
}
