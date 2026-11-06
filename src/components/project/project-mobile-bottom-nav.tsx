"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, CalendarDays, BookOpenCheck, FileText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectMobileBottomNavProps {
  projectId: string;
}

export function ProjectMobileBottomNav({ projectId }: ProjectMobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Board",
      href: `/project/${projectId}/board`,
      segment: "board",
      icon: KanbanSquare,
    },
    {
      label: "Calendar",
      href: `/project/${projectId}/calendar`,
      segment: "calendar",
      icon: CalendarDays,
    },
    {
      label: "Diary",
      href: `/project/${projectId}/diary`,
      segment: "diary",
      icon: BookOpenCheck,
    },
    {
      label: "Notes",
      href: `/project/${projectId}/notes`,
      segment: "notes",
      icon: FileText,
    },
  ];

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/10 bg-ink-950/95 backdrop-blur-md px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
    >
      {navItems.map((item) => {
        const isActive = pathname.includes(`/project/${projectId}/${item.segment}`);
        const Icon = item.icon;

        return (
          <Link
            key={item.segment}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-medium transition active:scale-95",
              isActive
                ? "text-dusk-lavender font-bold"
                : "text-stone-400 hover:text-stone-200"
            )}
          >
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                isActive ? "bg-dusk-lavender/20 text-dusk-lavender" : "text-stone-400"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="mt-0.5 truncate max-w-[64px]">{item.label}</span>
          </Link>
        );
      })}

      {/* Menu / Sidebar Drawer Toggle */}
      <label
        htmlFor="project-sidebar-toggle"
        className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-medium text-stone-400 hover:text-stone-200 cursor-pointer transition active:scale-95"
        title="Open workspace menu"
        aria-label="Open workspace menu"
      >
        <div className="grid h-7 w-7 place-items-center rounded-lg text-stone-400">
          <Menu className="h-4 w-4" />
        </div>
        <span className="mt-0.5">Menu</span>
      </label>
    </nav>
  );
}
