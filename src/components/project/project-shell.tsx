import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommandPalette } from "@/components/ui/command-palette";
import { ProjectNavLink } from "@/components/project/project-nav-link";
import { ProjectSidebarGreeting } from "@/components/project/project-sidebar-greeting";
import { LofiPlayer } from "@/components/project/lofi-player";
import { NixiePomodoro } from "@/components/project/nixie-pomodoro";
import { PixelMoon } from "@/components/project/pixel-moon";
import { ZenGarden } from "@/components/project/zen-garden";

// ---------------------------------------------------------------------------
// Nav items — Boards & Members removed per user request
// ---------------------------------------------------------------------------

const navItems = [
  { href: "board", label: "Board", iconName: "board" },
  { href: "calendar", label: "Calendar", iconName: "calendar" },
  { href: "diary", label: "Diary", iconName: "diary" },
  { href: "notes", label: "Notes", iconName: "notes" },
  { href: "rewards", label: "Rewards Store", iconName: "rewards" },
  { href: "settings", label: "Settings", iconName: "settings" },
] as const;

// ---------------------------------------------------------------------------
// Project color dot
// Derives a stable color from the project name (first char code mod 5).
// ---------------------------------------------------------------------------

const PROJECT_DOT_COLORS = [
  "bg-dusk-lavender",
  "bg-dusk-amber",
  "bg-dusk-rose",
  "bg-dusk-cyan",
  "bg-emerald-400/70",
] as const;

function projectDotColor(name: string): string {
  const code = name.charCodeAt(0) || 0;
  return PROJECT_DOT_COLORS[code % PROJECT_DOT_COLORS.length];
}

// Status dot colors
const STATUS_COLORS: Record<string, string> = {
  ONLINE: "bg-emerald-400",
  BUSY: "bg-dusk-amber",
  OFFLINE: "bg-stone-500",
};

// ---------------------------------------------------------------------------
// Server Component
// ---------------------------------------------------------------------------

export async function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [project, userRecord] = await Promise.all([
    prisma.project.findFirst({
      where: {
        id: projectId,
        members: { some: { userId: session.user.id } },
      },
      include: {
        boards: { select: { id: true }, take: 1, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, avatar: true, status: true, email: true },
    }),
  ]);

  if (!project) notFound();

  // Derive display name
  const userEmail = userRecord?.email ?? session.user.email ?? "";
  const userName =
    userRecord?.name ??
    (userEmail.includes("@") ? userEmail.split("@")[0] : userEmail || "you");

  const dotColor = projectDotColor(project.name);
  const statusColor = STATUS_COLORS[userRecord?.status ?? "ONLINE"] ?? "bg-stone-500";

  // Initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen w-screen overflow-hidden p-3">
      <div className="grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
          {/* Breadcrumb + project identity */}
          <div>
            <Link
              href="/projects"
              className="text-xs uppercase tracking-[0.3em] text-dusk-amber transition-opacity hover:opacity-70"
            >
              Projects
            </Link>

            {/* Project name with color dot */}
            <div className="mt-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotColor}`}
              />
              <h1 className="text-2xl font-semibold leading-tight text-stone-100">
                {project.name}
              </h1>
            </div>

            <p className="mt-1 text-sm text-stone-400">
              {project.description ?? "No description yet."}
            </p>

            {/* Time-based greeting */}
            <div className="mt-3">
              <ProjectSidebarGreeting userName={userName} />
            </div>
          </div>

          {/* Scrollable sidebar widgets section */}
          <div className="flex-1 overflow-y-auto scrollbar-soft pr-1 space-y-4 my-3 min-h-0">
            {/* Navigation */}
            <nav className="grid gap-2" aria-label="Project navigation">
              {navItems.map((item) => (
                <ProjectNavLink
                  key={item.href}
                  href={`/project/${projectId}/${item.href}`}
                  label={item.label}
                  iconName={item.iconName}
                  segment={item.href}
                />
              ))}
            </nav>

            <LofiPlayer />
            <NixiePomodoro />
            <PixelMoon />
            <ZenGarden />
          </div>

          {/* ── User profile card — bottom of sidebar ─────────────────── */}
          <div className="mt-auto space-y-3 border-t border-white/5 pt-4">
            {/* Cmd+K hint */}
            <p className="flex items-center gap-1.5 text-[10px] text-stone-600">
              <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
              Command palette
            </p>

            {/* User card */}
            <Link
              href="/profile"
              className="group flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-dusk-lavender/40 hover:bg-dusk-lavender/5"
            >
              {/* Avatar */}
              <div className="relative h-8 w-8 shrink-0">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/20">
                  {userRecord?.avatar ? (
                    <Image
                      src={userRecord.avatar}
                      alt={userName}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-dusk-lavender/20 text-[11px] font-bold text-dusk-lavender">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Status dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 ${statusColor}`}
                />
              </div>

              {/* Name + status */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-stone-200 group-hover:text-dusk-lavender">
                  {userName}
                </p>
                <p className="text-[10px] text-stone-600">
                  {userRecord?.status === "ONLINE"
                    ? "Online"
                    : userRecord?.status === "BUSY"
                    ? "Busy"
                    : "Offline"}
                </p>
              </div>
            </Link>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <section className="min-h-0 min-w-0">{children}</section>
      </div>

      {/* Command palette — self-manages open/close via keyboard shortcut */}
      <CommandPalette projectId={projectId} projectName={project.name} />
    </main>
  );
}
