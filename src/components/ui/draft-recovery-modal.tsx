"use client";

import { useEffect, KeyboardEvent } from "react";
import { FileText, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";
import { formatMediumDateTime } from "@/lib/date-format";

interface DraftRecoveryModalProps {
  open: boolean;
  savedAt?: number;
  onRestore: () => void;
  onDiscard: () => void;
  onClose?: () => void;
}

export function DraftRecoveryModal({
  open,
  savedAt,
  onRestore,
  onDiscard,
  onClose
}: DraftRecoveryModalProps) {
  useEffect(() => {
    if (!open) return;
  }, [open]);

  if (!open) return null;

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (e.key === "Escape") {
      if (onClose) onClose();
      else onDiscard();
    }
  }

  const formattedTime = savedAt ? formatMediumDateTime(new Date(savedAt).toISOString(), false) : null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[1200] grid place-items-center overflow-y-auto bg-ink-950/85 px-4 py-6 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-recovery-title"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div
          className="absolute inset-0"
          aria-hidden="true"
          onClick={() => {
            if (onClose) onClose();
            else onDiscard();
          }}
        />

        <div className="lofi-panel relative w-full max-w-md rounded-2xl border border-dusk-amber/30 bg-white/[0.04] p-6 shadow-[0_24px_68px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-amber/40 bg-dusk-amber/15 text-dusk-amber shadow-[0_0_16px_rgba(229,189,114,0.2)]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-dusk-amber">Draft Recovery</p>
              <h2 id="draft-recovery-title" className="text-lg font-semibold text-stone-100">
                พบข้อมูลร่างที่ยังบันทึกไม่เสร็จ
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-stone-400">
                ระบบตรวจพบข้อมูลที่คุณกรอกค้างไว้ก่อนหน้านี้
                {formattedTime ? ` (บันทึกเมื่อ ${formattedTime})` : ""}
                <br />
                คุณต้องการกรอกข้อมูลต่อจากร่างเดิมไหม?
              </p>
            </div>
            <button
              className="shrink-0 rounded-lg p-1.5 text-stone-500 transition hover:bg-white/10 hover:text-stone-200"
              type="button"
              aria-label="Close"
              onClick={() => {
                if (onClose) onClose();
                else onDiscard();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-4 text-xs text-stone-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={onDiscard}
            >
              <Trash2 className="h-3.5 w-3.5" />
              ละทิ้งข้อมูลร่าง
            </Button>
            <Button
              type="button"
              variant="primary"
              className="h-9 px-4 text-xs font-semibold shadow-[0_0_16px_rgba(229,189,114,0.25)]"
              onClick={onRestore}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              กรอกข้อมูลต่อ
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
