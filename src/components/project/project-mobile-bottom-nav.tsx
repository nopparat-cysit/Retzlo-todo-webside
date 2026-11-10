"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, CalendarDays, BookOpenCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectMobileBottomNavProps {
  projectId?: string;
}

export function ProjectMobileBottomNav({ projectId }: ProjectMobileBottomNavProps) {
  const pathname = usePathname();
  const [optimisticSegment, setOptimisticSegment] = useState<string | null>(null);
  const [resolvedProjectId, setResolvedProjectId] = useState<string>(projectId ?? "");

  useEffect(() => {
    if (projectId) {
      setResolvedProjectId(projectId);
      try {
        localStorage.setItem("retzlo_last_project_id", projectId);
      } catch {}
    } else {
      try {
        const saved = localStorage.getItem("retzlo_last_project_id");
        if (saved) {
          setResolvedProjectId(saved);
        }
      } catch {}
    }
  }, [projectId]);

  useEffect(() => {
    setOptimisticSegment(null);
  }, [pathname]);

  const navItems = useMemo(() => {
    const targetId = projectId || resolvedProjectId;
    let boardHref = targetId ? `/project/${targetId}/board` : "/projects";
    if (targetId && typeof window !== "undefined") {
      try {
        const savedBoard = localStorage.getItem(`project_${projectId}_last_board`) || localStorage.getItem(`project_${targetId}_last_board`);
        if (savedBoard) {
          boardHref = `/project/${targetId}/board?boardId=${encodeURIComponent(savedBoard)}`;
        }
      } catch {}
    }

    const calendarHref = targetId ? `/project/${targetId}/calendar` : "/projects";
    const diaryHref = targetId ? `/project/${targetId}/diary` : "/projects";
    const notesHref = targetId ? `/project/${targetId}/notes` : "/projects";

    return [
      {
        label: "Board",
        href: boardHref,
        segment: "board",
        icon: KanbanSquare,
      },
      {
        label: "Calendar",
        href: calendarHref,
        segment: "calendar",
        icon: CalendarDays,
      },
      {
        label: "Diary",
        href: diaryHref,
        segment: "diary",
        icon: BookOpenCheck,
      },
      {
        label: "Notes",
        href: notesHref,
        segment: "notes",
        icon: FileText,
      },
    ];
  }, [projectId, resolvedProjectId]);

  // Determine active segment from optimistic state or current pathname
  const activeSegment =
    optimisticSegment ??
    navItems.find((item) => pathname?.includes(`/${item.segment}`))?.segment ?? null;

  const activeIndex = activeSegment ? navItems.findIndex((item) => item.segment === activeSegment) : -1;
  const hasActiveTab = activeIndex >= 0;

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="lg:hidden fixed bottom-2 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[340px] max-w-[360px] mx-auto z-40 rounded-full border border-stone-300 bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:border-white/15 dark:bg-[#0e1025] dark:shadow-[0_12px_28px_rgba(0,0,0,0.6)] transition-all duration-300"
      style={{
        bottom: "calc(0.4rem + env(safe-area-inset-bottom, 0px))",
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
          <div className="w-full h-full rounded-full bg-indigo-50 border border-indigo-200/90 dark:bg-dusk-lavender/20 dark:border-dusk-lavender/40 shadow-xs" />
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
              className="relative z-10 flex flex-col items-center justify-center py-0.5 px-0.5 rounded-full select-none transition-transform duration-150 active:scale-90 cursor-pointer"
            >
              <div
                className={cn(
                  "grid h-5 w-5 place-items-center transition-all duration-300",
                  isActive
                    ? "text-indigo-600 dark:text-dusk-lavender scale-110 font-bold"
                    : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                )}
              >
                <Icon className="h-3.5 w-3.5 transition-transform duration-300" />
              </div>
              <span
                className={cn(
                  "text-[9px] tracking-tight leading-none transition-all duration-300 truncate max-w-[56px]",
                  isActive
                    ? "font-bold text-stone-900 dark:text-stone-100"
                    : "font-medium text-stone-500 dark:text-stone-400"
                )}
              >
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 h-0.5 w-0.5 rounded-full transition-all duration-300",
                  isActive ? "scale-100 opacity-100 bg-indigo-600 dark:bg-dusk-lavender" : "scale-0 opacity-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
