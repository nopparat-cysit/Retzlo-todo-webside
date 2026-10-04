"use client";

import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import type { BoardColumnInfo } from "./types";

export interface BoardColumnsTabProps {
  columns: BoardColumnInfo[];
  totalCards: number;
  projectId?: string;
  boardId?: string;
}

export function BoardColumnsTab({ columns, totalCards, projectId, boardId }: BoardColumnsTabProps) {
  return (
    <div className="space-y-4 pt-3 mt-0">
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-dusk-lavender" />
            ขั้นตอนการทำงานของบอร์ด (Workflow Stages)
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            ภาพรวมคอลัมน์, สถานะเริ่มต้น, ขีดจำกัด WIP Limit, และจำนวนงานในแต่ละขั้นตอน
          </p>
        </div>
        <div className="rounded-lg border border-stone-200/90 bg-stone-100/80 px-2.5 py-1 text-right font-mono text-[11px] text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 font-semibold">
          ทั้งหมด: {totalCards} {totalCards === 1 ? "งาน" : "งาน"}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-stone-200/90 bg-stone-100/70 p-2.5 max-h-60 overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-ink-950/40">
        {columns.length === 0 ? (
          <p className="py-6 text-center text-xs text-stone-500 font-mono">
            ไม่พบคอลัมน์บนบอร์ดนี้
          </p>
        ) : (
          columns.map((col, index) => (
            <div
              key={col.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.025]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-stone-100 font-mono text-xs font-bold text-stone-600 dark:bg-white/10 dark:text-stone-300">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-stone-900 truncate dark:text-stone-200">{col.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    <span>สถานะ: {col.defaultCardStatus ?? "TODO"}</span>
                    {col.wipLimit ? (
                      <span className="text-dusk-amber font-semibold">
                        · WIP Limit: {col.wipLimit}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full border border-stone-200/80 bg-stone-100 px-2.5 py-0.5 font-mono text-[10px] text-stone-700 font-semibold dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300">
                  {col.cardCount ?? 0} การ์ด
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-stone-500 italic">
          💡 สามารถเพิ่ม, แก้ไขชื่อ, จัดเรียง หรือกำหนด WIP Limit ของแต่ละคอลัมน์ได้โดยตรงที่หน้ากระดาน Kanban
        </p>
        {projectId ? (
          <Link
            href={`/project/${projectId}/board${boardId ? `?boardId=${boardId}` : ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-dusk-lavender hover:underline shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            เปิดหน้าบอร์ด →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
