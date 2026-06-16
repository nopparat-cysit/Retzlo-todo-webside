"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, CalendarDays, FileText, KanbanSquare, Settings, Users, Gift } from "lucide-react";

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

interface ProjectNavLinkProps {
  href: string;
  label: string;
  iconName: NavIconName;
  segment: string; // e.g. "board", "calendar"
}

export function ProjectNavLink({ href, label, iconName }: ProjectNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const Icon = ICON_MAP[iconName];

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      title={label}
      className={cn(
        "project-nav-link group relative flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-sm transition duration-200",
        isActive && "project-nav-link-active",
        isActive
          ? "border-dusk-lavender/40 bg-dusk-lavender/12 text-stone-50"
          : "border-transparent bg-transparent text-stone-400 hover:border-white/10 hover:bg-white/[0.055] hover:text-stone-100"
      )}
    >
      <span
        className={cn(
          "project-nav-active-marker absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition",
          isActive ? "bg-dusk-lavender shadow-[0_0_10px_rgba(169,162,255,0.55)]" : "bg-transparent group-hover:bg-white/25"
        )}
      />
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 project-sidebar-icon",
            isActive ? "text-dusk-lavender" : "text-stone-400"
          )}
        />
      )}
      <span className="sidebar-expanded-only truncate">{label}</span>
    </Link>
  );
}
