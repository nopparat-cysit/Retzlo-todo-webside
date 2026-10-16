import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProjectIndexPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { type: true }
  });

  if (project?.type === "DIARY") {
    redirect(`/project/${params.id}/diary`);
  }

  redirect(`/project/${params.id}/board`);
}
