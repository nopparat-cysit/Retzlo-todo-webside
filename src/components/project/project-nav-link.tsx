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

export function ProjectNavLink({ href, label, iconName, segment }: ProjectNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.includes(`/${segment}`);
  const Icon = ICON_MAP[iconName];

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
        isActive
          ? "border-dusk-lavender/50 bg-dusk-lavender/10 text-dusk-lavender"
          : "border-white/10 bg-white/5 text-stone-200 hover:border-dusk-lavender/60 hover:bg-white/10"
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-dusk-lavender" : "text-stone-400"
          )}
        />
      )}
      {label}
    </Link>
  );
}
