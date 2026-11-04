"use client";

import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderKanban,
  Kanban,
  Plus,
  Search,
  StickyNote
} from "lucide-react";

interface MockCard {
  id: string;
  title: string;
  priority?: "urgent" | "medium" | "normal";
  priorityLabel?: string;
  completed?: boolean;
  due: string;
  checklist?: string;
  sticker: string;
  assignee?: {
    initials: string;
    bgClass: string;
  };
}

const TODO_CARDS: MockCard[] = [
  {
    id: "card-1",
    title: "ออกแบบโลโก้และดีไซน์ซิสเต็ม 2.4",
    priority: "urgent",
    priorityLabel: "สำคัญมาก",
    due: "พรุ่งนี้",
    sticker: "/stickers/retro/retro-sticker-58-priority-flag.png",
    assignee: {
      initials: "NP",
      bgClass: "bg-[#7858d4]"
    }
  },
  {
    id: "card-2",
    title: "สรุปฟีดแบ็กจากผู้ใช้ช่วง Early Bird",
    priority: "medium",
    priorityLabel: "ปานกลาง",
    due: "10 พ.ย.",
    sticker: "/stickers/retro/retro-sticker-10-coffee-cup.png",
    assignee: {
      initials: "TK",
      bgClass: "bg-amber-600"
    }
  },
  {
    id: "card-3",
    title: "เขียนคู่มือเริ่มต้นใช้งานฉบับสมบูรณ์",
    priority: "normal",
    priorityLabel: "ทั่วไป",
    due: "14 พ.ย.",
    sticker: "/stickers/retro/retro-sticker-12-paper-note.png"
  }
];

const IN_PROGRESS_CARDS: MockCard[] = [
  {
    id: "card-4",
    title: "ซิงก์นัดหมายการ์ดขึ้น Google Calendar",
    priority: "urgent",
    priorityLabel: "สำคัญมาก",
    due: "วันนี้",
    checklist: "3/4 งานย่อย",
    sticker: "/stickers/retro/retro-sticker-04-calendar.png",
    assignee: {
      initials: "AI",
      bgClass: "bg-emerald-600"
    }
  },
  {
    id: "card-5",
    title: "ทำสไลด์นำเสนอโปรเจกต์ 16:9",
    priority: "medium",
    priorityLabel: "ปานกลาง",
    due: "12 พ.ย.",
    sticker: "/stickers/retro/retro-sticker-13-project-folder.png",
    assignee: {
      initials: "NP",
      bgClass: "bg-[#7858d4]"
    }
  }
];

const DONE_CARDS: MockCard[] = [
  {
    id: "card-6",
    title: "เชื่อมต่อฐานข้อมูล Neon Postgres",
    completed: true,
    due: "เมื่อวาน",
    sticker: "/stickers/retro/retro-sticker-72-shield.png",
    assignee: {
      initials: "TK",
      bgClass: "bg-amber-600"
    }
  },
  {
    id: "card-7",
    title: "ติดตั้งระบบความปลอดภัยและ Audit Log",
    completed: true,
    due: "3 วันก่อน",
    sticker: "/stickers/retro/retro-sticker-20-sparkles.png",
    assignee: {
      initials: "AI",
      bgClass: "bg-emerald-600"
    }
  }
];

function CardItem({ card }: { card: MockCard }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--paper)] p-3 shadow-sm hover:border-[var(--accent)]/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className={`font-semibold text-xs sm:text-[13px] leading-snug break-words ${card.completed ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}`}>
          {card.title}
        </p>
        <div className="relative w-7 h-7 shrink-0 drop-shadow-xs">
          <Image
            src={card.sticker}
            alt=""
            fill
            sizes="28px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {card.completed && (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>เสร็จสิ้น</span>
          </span>
        )}

        {card.priority === "urgent" && (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            {card.priorityLabel}
          </span>
        )}

        {card.priority === "medium" && (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300">
            {card.priorityLabel}
          </span>
        )}

        {card.priority === "normal" && (
          <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300">
            {card.priorityLabel}
          </span>
        )}

        {card.checklist && (
          <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300">
            <CheckSquare className="w-2.5 h-2.5" />
            <span>{card.checklist}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--muted)] border-t border-[var(--border)]/40">
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3 h-3" />
          <span>{card.due}</span>
        </span>
        {card.assignee ? (
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-xs ${card.assignee.bgClass}`}
          >
            {card.assignee.initials}
          </span>
        ) : (
          <span className="h-5" />
        )}
      </div>
    </div>
  );
}

export function HeroBoardPreview() {
  return (
    <div
      aria-hidden="true"
      className="w-full rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-3 sm:p-5 shadow-[0_20px_50px_-12px_rgba(84,53,107,0.14),var(--shadow-floating)] overflow-hidden font-thai select-none pointer-events-none"
    >
      {/* Top Bar of Preview */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[var(--border)]">
        {/* Left: Project Title & View Tabs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7858d4]/10 border border-[#7858d4]/20 flex items-center justify-center text-[#7858d4]">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">
              โปรเจกต์ Retzlo Core
            </span>
          </div>

          <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--paper)] p-0.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent)] text-white font-bold shadow-xs">
              <Kanban className="w-3 h-3" />
              <span>บอร์ด</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[var(--muted)] font-medium">
              <Calendar className="w-3 h-3" />
              <span>ปฏิทิน</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[var(--muted)] font-medium">
              <StickyNote className="w-3 h-3" />
              <span>สมุดโน้ต</span>
            </span>
          </div>
        </div>

        {/* Right: Search, Mock Members, New Card Button */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--paper)] text-xs text-[var(--muted)]">
            <Search className="w-3.5 h-3.5" />
            <span>ค้นหาการ์ด...</span>
          </div>

          <div className="flex -space-x-1.5 overflow-hidden">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#7858d4] text-[10px] font-bold text-white ring-2 ring-[var(--panel-strong)]">
              NP
            </span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-[var(--panel-strong)]">
              TK
            </span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-[var(--panel-strong)]">
              AI
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>การ์ดใหม่</span>
          </div>
        </div>
      </div>

      {/* 3 Columns Kanban Layout */}
      <div className="mt-3 sm:mt-4 overflow-x-auto pb-4 flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 snap-x">
        {/* Column 1: ต้องทำ */}
        <div className="w-[280px] sm:w-auto shrink-0 snap-start flex flex-col gap-2.5 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                ต้องทำ
              </span>
            </div>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[var(--paper)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted)]">
              3
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {TODO_CARDS.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Column 2: กำลังทำ */}
        <div className="w-[280px] sm:w-auto shrink-0 snap-start flex flex-col gap-2.5 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                กำลังทำ
              </span>
            </div>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[var(--paper)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted)]">
              2
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {IN_PROGRESS_CARDS.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Column 3: เสร็จแล้ว */}
        <div className="w-[280px] sm:w-auto shrink-0 snap-start flex flex-col gap-2.5 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                เสร็จแล้ว
              </span>
            </div>
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[var(--paper)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted)]">
              2
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {DONE_CARDS.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
