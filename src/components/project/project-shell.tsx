import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BookOpenCheck, CalendarDays, FileText, KanbanSquare, Settings, Users } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "board", label: "Board", icon: KanbanSquare },
  { href: "calendar", label: "Calendar", icon: CalendarDays },
  { href: "diary", label: "Diary", icon: BookOpenCheck },
  { href: "notes", label: "Notes", icon: FileText },
  { href: "members", label: "Members", icon: Users },
  { href: "settings", label: "Settings", icon: Settings }
];

export async function ProjectShell({
  projectId,
  children
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: { userId: session.user.id }
      }
    },
    include: {
      boards: { select: { id: true }, take: 1, orderBy: { createdAt: "asc" } }
    }
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen w-screen overflow-hidden p-3">
      <div className="grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lofi-panel min-h-0 rounded-lg p-4">
          <div>
            <Link href="/projects" className="text-xs uppercase tracking-[0.3em] text-dusk-amber">
              Projects
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-stone-100">{project.name}</h1>
            <p className="text-sm text-stone-400">{project.description ?? "No description yet."}</p>
          </div>
          <nav className="mt-5 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={`/project/${projectId}/${item.href}`}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-stone-200 hover:border-dusk-lavender/60 hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-h-0 min-w-0">{children}</section>
      </div>
    </main>
  );
}
