import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Bell, Menu, PanelLeftClose } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { CommandPalette } from "@/components/ui/command-palette";
import { ProjectSidebarGreeting } from "@/components/project/project-sidebar-greeting";
import { ProjectNavLink } from "@/components/project/project-nav-link";
import { ProjectSortableNav, type ProjectNavItem } from "@/components/project/project-sortable-nav";
import { ProjectTopbarTools } from "@/components/project/project-topbar-tools";
import { UserProfilePopover } from "@/components/project/user-profile-popover";
import { ErrorState } from "@/components/ui/state";
import { isDatabaseConnectionError } from "@/lib/safe-db";

// Nav items: Boards and Members removed per user request.
const navItems = [
  { href: "board", label: "Board", iconName: "board" },
  { href: "calendar", label: "Calendar", iconName: "calendar" },
  { href: "diary", label: "Diary", iconName: "diary" },
  { href: "notes", label: "Notes", iconName: "notes" },
  { href: "rewards", label: "Rewards Store", iconName: "rewards" },
] as const;

const settingsNavItem = { href: "settings", label: "Settings", iconName: "settings" } as const;

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

const STATUS_COLORS: Record<string, string> = {
  ONLINE: "bg-emerald-400",
  BUSY: "bg-dusk-amber",
  OFFLINE: "bg-stone-500",
};

async function loadProjectShellData(projectId: string, userId: string) {
  return Promise.all([
    prisma.project.findFirst({
      where: {
        id: projectId,
        members: { some: { userId } },
      },
      include: {
        boards: { select: { id: true }, take: 1, orderBy: { createdAt: "asc" } },
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar: true, status: true, email: true },
    }),
  ]);
}

type ProjectShellData = Awaited<ReturnType<typeof loadProjectShellData>>;
type ProjectShellProject = ProjectShellData[0];
type ProjectShellUser = ProjectShellData[1];

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

  let project: ProjectShellProject | null;
  let userRecord: ProjectShellUser;

  try {
    [project, userRecord] = await loadProjectShellData(projectId, session.user.id);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <ProjectDatabaseUnavailable />;
    }

    throw error;
  }

  if (!project) notFound();

  const userEmail = userRecord?.email ?? session.user.email ?? "";
  const userName =
    userRecord?.name ??
    (userEmail.includes("@") ? userEmail.split("@")[0] : userEmail || "you");

  const dotColor = projectDotColor(project.name);
  const statusColor = STATUS_COLORS[userRecord?.status ?? "ONLINE"] ?? "bg-stone-500";
  const isProjectOwner = project.members[0]?.role === "OWNER";
  const sortableNavItems: ProjectNavItem[] = navItems.map((item) => ({
    ...item,
    href: `/project/${projectId}/${item.href}`,
    iconName: item.iconName,
    segment: item.href,
  }));
  const settingsLink = {
    ...settingsNavItem,
    href: `/project/${projectId}/${settingsNavItem.href}`,
    segment: settingsNavItem.href,
  };

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="soft-grid-bg min-h-screen w-full overflow-hidden p-3">
      <input id="project-sidebar-toggle" className="peer sr-only" type="checkbox" />
      <label
        htmlFor="project-sidebar-toggle"
        className="pointer-events-none fixed inset-0 z-[240] bg-ink-950/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 peer-checked:pointer-events-auto peer-checked:opacity-100 lg:hidden"
        aria-hidden="true"
      />
      <div className="project-shell-grid grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 transition-[grid-template-columns] duration-200 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="project-sidebar lofi-panel fixed bottom-3 left-3 top-3 z-[250] flex min-h-0 w-[280px] -translate-x-[calc(100%+1rem)] flex-col overflow-hidden rounded-2xl bg-ink-950/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 peer-checked:translate-x-0 lg:relative lg:bottom-0 lg:left-0 lg:top-0 lg:z-10 lg:w-auto lg:translate-x-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/projects"
                className="sidebar-expanded-only text-xs uppercase tracking-[0.3em] text-dusk-amber transition-opacity hover:opacity-70"
              >
                Projects
              </Link>
              <label
                htmlFor="project-sidebar-toggle"
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.055] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender"
                title="Toggle sidebar"
                aria-label="Toggle sidebar"
              >
                <PanelLeftClose className="project-sidebar-toggle-icon h-4 w-4 transition-transform duration-200" />
              </label>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
              <h1 className="sidebar-expanded-only text-2xl font-semibold leading-tight text-stone-100">
                {project.name}
              </h1>
            </div>

            <p className="sidebar-expanded-only mt-1 text-sm text-stone-400">
              {project.description ?? "No description yet."}
            </p>

            <div className="sidebar-expanded-only mt-3">
              <ProjectSidebarGreeting userName={userName} />
            </div>
          </div>

          <div className="my-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-soft">
            <ProjectSortableNav canSort={isProjectOwner} items={sortableNavItems} projectId={projectId} />
          </div>

          <div className="mt-auto space-y-3 border-t border-white/5 pt-4">
            <ProjectNavLink {...settingsLink} />
            <p className="sidebar-expanded-only flex items-center gap-1.5 text-[10px] text-stone-600">
              <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
              Command palette
            </p>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl">
          <header className="lofi-panel relative z-40 mb-3 flex min-h-14 items-center justify-between gap-3 overflow-visible rounded-2xl px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <label
                htmlFor="project-sidebar-toggle"
                className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-300 transition hover:border-dusk-lavender/45 hover:bg-white/10 hover:text-dusk-lavender lg:hidden"
                title="Open navigation"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </label>
              <BackButton />
              <div className="hidden h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-dusk-lavender sm:grid">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
              </div>
              <div className="hidden min-w-0 min-[560px]:block">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                  <span>Workspace</span>
                  <span className="text-stone-700">/</span>
                  <span className="text-dusk-amber">Retzlo</span>
                </div>
                <h2 className="truncate text-base font-semibold text-stone-100">{project.name}</h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <ProjectTopbarTools />
              <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-stone-500 md:flex">
                <span className="text-stone-400">Command</span>
                <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <UserProfilePopover
                avatar={userRecord?.avatar}
                email={userEmail}
                initials={initials}
                name={userName}
                status={userRecord?.status}
                statusColor={statusColor}
                variant="avatar"
              />
            </div>
          </header>
          <div className="relative z-10 min-h-0 flex-1 overflow-hidden">{children}</div>
        </section>
      </div>

      <CommandPalette projectId={projectId} projectName={project.name} />
    </main>
  );
}

function ProjectDatabaseUnavailable() {
  return (
    <main className="soft-grid-bg grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-xl">
        <ErrorState
          title="Database is taking a quiet break"
          message="We could not reach the project database right now. Your workspace is safe, but this page needs the database before it can load."
          action={(
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <a
            className="motion-interactive inline-flex h-10 items-center justify-center rounded-lg border border-dusk-lavender/25 bg-dusk-lavender px-4 text-sm font-medium text-ink-950 hover:bg-dusk-amber"
            href=""
          >
            Try again
          </a>
          <Link
            className="motion-interactive inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-stone-100 hover:border-dusk-lavender/45 hover:bg-white/10"
            href="/projects"
          >
            Back to projects
          </Link>
            </div>
          )}
        />
      </section>
    </main>
  );
}
