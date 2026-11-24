"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, CalendarDays, FileText, KanbanSquare, Settings, Users, Gift } from "lucide-react";

import { safeLocalStorageGet } from "@/lib/browser-compat";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  board: KanbanSquare,
  calendar: CalendarDays,
  diary: BookOpenCheck,
  notes: FileText,
  members: Users,
  settings: Settings,
  rewards: Gift,
} as const;

export type NavIconName = keyof typeof ICON_MAP;

const ICON_WELL_MAP: Record<NavIconName, string> = {
  board: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:bg-dusk-lavender/15 dark:border-dusk-lavender/30 dark:text-dusk-lavender",
  calendar: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:bg-dusk-cyan/15 dark:border-dusk-cyan/30 dark:text-dusk-cyan",
  diary: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-dusk-amber/15 dark:border-dusk-amber/30 dark:text-dusk-amber",
  notes: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:bg-dusk-rose/15 dark:border-dusk-rose/30 dark:text-dusk-rose",
  members: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-emerald-400/15 dark:border-emerald-400/30 dark:text-emerald-300",
  rewards: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-dusk-amber/15 dark:border-dusk-amber/30 dark:text-dusk-amber",
  settings: "bg-stone-500/10 border-stone-400/20 text-stone-600 dark:bg-white/10 dark:border-white/15 dark:text-stone-300",
};

interface ProjectNavLinkProps {
  href: string;
  label: string;
  iconName: NavIconName;
  segment: string; // e.g. "board", "calendar"
  dragHandle?: React.ReactNode;
}

function closeMobileSidebarIfNeeded() {
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    const toggle = document.getElementById("project-sidebar-toggle") as HTMLInputElement | null;
    if (toggle && toggle.checked) {
      toggle.checked = false;
    }
  }
}

export function ProjectNavLink({ href, label, iconName, segment, dragHandle }: ProjectNavLinkProps) {
  const pathname = usePathname();
  const cleanHref = href.split("?")[0];
  const isActive = pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  const Icon = ICON_MAP[iconName];

  const currentProjectId = segment === "board" ? pathname?.match(/^\/project\/([^/]+)/)?.[1] : undefined;
  const [savedBoard, setSavedBoard] = useState<{ projectId: string; boardId: string } | null>(null);

  useEffect(() => {
    closeMobileSidebarIfNeeded();
  }, [pathname]);

  useEffect(() => {
    if (!currentProjectId) {
      setSavedBoard(null);
      return;
    }
    const boardId = safeLocalStorageGet(`project_${currentProjectId}_last_board`);
    setSavedBoard(boardId ? { projectId: currentProjectId, boardId } : null);
  }, [currentProjectId, pathname]);

  const targetHref =
    currentProjectId && savedBoard?.projectId === currentProjectId
      ? `/project/${currentProjectId}/board?boardId=${encodeURIComponent(savedBoard.boardId)}`
      : href;

  return (
    <Link
      href={targetHref}
      onClick={closeMobileSidebarIfNeeded}
      aria-current={isActive ? "page" : undefined}
      title={label}
      className={cn(
        "project-nav-link group relative flex h-10.5 w-full items-center gap-2.5 rounded-xl border px-2.5 text-sm transition duration-200",
        isActive && "project-nav-link-active",
        isActive
          ? "border-indigo-300/80 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 shadow-[0_2px_8px_rgba(79,70,229,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-dusk-lavender/45 dark:from-dusk-lavender/20 dark:via-dusk-lavender/10 dark:to-transparent dark:shadow-[0_4px_14px_rgba(169,162,255,0.15),inset_0_1px_0_rgba(255,255,255,0.12)] text-stone-900 font-semibold dark:text-stone-100"
          : "border-transparent bg-transparent text-stone-500 hover:border-stone-300/40 hover:bg-black/5 hover:text-stone-900 dark:text-stone-400 dark:hover:border-white/10 dark:hover:bg-white/[0.055] dark:hover:text-stone-100"
      )}
    >
      {dragHandle}
      {Icon && (
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-all",
            ICON_WELL_MAP[iconName],
            isActive ? "shadow-sm scale-105" : "opacity-85 group-hover:opacity-100"
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 project-sidebar-icon" />
        </span>
      )}
      <span className="sidebar-expanded-only truncate">{label}</span>
      <span
        className={cn(
          "project-nav-active-marker absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition md:group-hover/sort:opacity-0",
          isActive ? "bg-dusk-lavender shadow-[0_0_10px_rgba(169,162,255,0.55)]" : "bg-transparent group-hover:bg-white/25"
        )}
      />
    </Link>
  );
}
