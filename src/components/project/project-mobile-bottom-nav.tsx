"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, CalendarDays, BookOpenCheck, FileText } from "lucide-react";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/browser-compat";
import { cn } from "@/lib/utils";

interface ProjectMobileBottomNavProps {
  projectId?: string;
}

export function ProjectMobileBottomNav({ projectId }: ProjectMobileBottomNavProps) {
  const pathname = usePathname();
  const [optimisticSegment, setOptimisticSegment] = useState<string | null>(null);
  const [resolvedProjectId, setResolvedProjectId] = useState<string>(projectId ?? "");
  const [savedBoardId, setSavedBoardId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      setResolvedProjectId(projectId);
      safeLocalStorageSet("retzlo_last_project_id", projectId);
    } else {
      const saved = safeLocalStorageGet("retzlo_last_project_id");
      if (saved) {
        setResolvedProjectId(saved);
      }
    }
  }, [projectId]);

  const targetId = projectId || resolvedProjectId;

  useEffect(() => {
    if (!targetId) {
      setSavedBoardId(null);
      return;
    }
    const savedBoard =
      (projectId ? safeLocalStorageGet(`project_${projectId}_last_board`) : null) ||
      safeLocalStorageGet(`project_${targetId}_last_board`);
    setSavedBoardId(savedBoard);
  }, [projectId, targetId, pathname]);

  useEffect(() => {
    setOptimisticSegment(null);
  }, [pathname]);

  const navItems = useMemo(() => {
    let boardHref = targetId ? `/project/${targetId}/board` : "/projects";
    if (targetId && savedBoardId) {
      boardHref = `/project/${targetId}/board?boardId=${encodeURIComponent(savedBoardId)}`;
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
  }, [targetId, savedBoardId]);

  // Determine active segment from optimistic state or current pathname
  const activeSegment =
    optimisticSegment ??
    navItems.find((item) => pathname?.includes(`/${item.segment}`))?.segment ?? null;

  const activeIndex = activeSegment ? navItems.findIndex((item) => item.segment === activeSegment) : -1;
  const hasActiveTab = activeIndex >= 0;

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="lg:hidden fixed bottom-2.5 inset-x-3.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[360px] max-w-[380px] mx-auto z-40 rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:border-white/15 dark:bg-[#0c0e24]/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)] transition-all duration-300"
      style={{
        bottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="relative grid grid-cols-4 items-center">
        {/* Animated Sliding Highlight Pill (Transfer Animation) */}
        <div
          className={cn(
            "absolute inset-y-0 w-1/4 p-0.5 pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
            hasActiveTab ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{
            transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
          }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-400/30 shadow-[0_4px_12px_rgba(79,70,229,0.28)] dark:from-dusk-lavender dark:to-[#9f85f8] dark:border-white/20 dark:shadow-[0_4px_14px_rgba(167,139,250,0.35)]" />
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
              className="relative z-10 flex flex-col items-center justify-center h-12 px-1 rounded-xl select-none transition-transform duration-150 active:scale-95 cursor-pointer gap-0.5"
            >
              <div className="grid h-5 w-5 place-items-center transition-all duration-300">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isActive
                      ? "text-white dark:text-ink-950 scale-105 drop-shadow-sm font-bold"
                      : "text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight leading-tight transition-all duration-300 truncate max-w-[62px]",
                  isActive
                    ? "font-bold text-white dark:text-ink-950 drop-shadow-sm"
                    : "font-medium text-stone-500 dark:text-stone-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
