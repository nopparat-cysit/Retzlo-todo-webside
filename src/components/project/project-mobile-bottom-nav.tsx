"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, CalendarDays, BookOpenCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectMobileBottomNavProps {
  projectId: string;
}

export function ProjectMobileBottomNav({ projectId }: ProjectMobileBottomNavProps) {
  const pathname = usePathname();
  const [optimisticSegment, setOptimisticSegment] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticSegment(null);
  }, [pathname]);

  const navItems = useMemo(() => {
    let boardHref = `/project/${projectId}/board`;
    if (typeof window !== "undefined") {
      try {
        const savedBoard = localStorage.getItem(`project_${projectId}_last_board`);
        if (savedBoard) {
          boardHref = `/project/${projectId}/board?boardId=${encodeURIComponent(savedBoard)}`;
        }
      } catch {}
    }

    return [
      {
        label: "Board",
        href: boardHref,
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
  }, [projectId]);

  // Determine active segment from optimistic state or current pathname
  const activeSegment =
    optimisticSegment ??
    (navItems.find((item) => pathname?.includes(`/project/${projectId}/${item.segment}`))?.segment ?? null);

  const activeIndex = activeSegment ? navItems.findIndex((item) => item.segment === activeSegment) : -1;
  const hasActiveTab = activeIndex >= 0;

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="lg:hidden fixed bottom-3 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[380px] max-w-[420px] mx-auto z-40 rounded-full border border-stone-200/80 bg-white/92 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/90 dark:shadow-[0_14px_36px_rgba(0,0,0,0.55)] transition-all duration-300"
      style={{
        bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="relative grid grid-cols-4 items-center">
        {/* Animated Sliding Highlight Pill (Transfer Animation) */}
        <div
          className={cn(
            "absolute inset-y-0.5 w-1/4 p-0.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
            hasActiveTab ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{
            transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
          }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-dusk-lavender/15 border border-dusk-lavender/35 dark:bg-dusk-lavender/25 dark:border-dusk-lavender/45 shadow-xs" />
        </div>

        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const Icon = item.icon;

          return (
            <Link
              key={item.segment}
              href={item.href}
              onClick={() => setOptimisticSegment(item.segment)}
              aria-current={isActive ? "page" : undefined}
              className="relative z-10 flex flex-col items-center justify-center py-1 px-1 rounded-full select-none transition-transform duration-150 active:scale-90 cursor-pointer"
            >
              <div
                className={cn(
                  "grid h-6 w-6 place-items-center transition-all duration-300",
                  isActive
                    ? "text-dusk-lavender scale-110"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                <Icon className="h-4 w-4 transition-transform duration-300" />
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight leading-none transition-all duration-300 truncate max-w-[64px]",
                  isActive
                    ? "font-bold text-stone-900 dark:text-stone-100"
                    : "font-medium text-stone-500 dark:text-stone-400"
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-1 h-1 w-1 rounded-full bg-dusk-lavender transition-all duration-300",
                  isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
