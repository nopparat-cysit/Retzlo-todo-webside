"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Coins,
  FileText,
  Flame,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  X
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ProjectSummaryResult } from "@/lib/ai/deepseek";
import { cn } from "@/lib/utils";

export interface AiProjectSummaryModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  boardId?: string;
  projectName?: string;
  boardName?: string;
}

export function AiProjectSummaryModal({
  open,
  onClose,
  projectId,
  boardId,
  projectName = "Project",
  boardName = "Board"
}: AiProjectSummaryModalProps) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [summary, setSummary] = useState<ProjectSummaryResult | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          boardId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          message: data.error || "ไม่สามารถสรุปภาพรวมโปรเจกต์ได้",
          type: "error"
        });
        return;
      }

      setSummary(data.summary);
      if (typeof data.remainingCredits === "number") {
        setCredits(data.remainingCredits);
      }
    } catch {
      toast({
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Server",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, boardId, toast]);

  useEffect(() => {
    if (open && !summary && !isLoading) {
      fetchSummary();
    }
  }, [open, summary, isLoading, fetchSummary]);

  const handleCopyMarkdown = () => {
    if (!summary) return;

    const md = `📊 **สรุปความคืบหน้า: ${projectName} (${boardName})**
สถานะ: ${summary.healthStatus === "HEALTHY" ? "🟢 ปกติ / แข็งแรง" : summary.healthStatus === "ATTENTION" ? "🟡 ต้องจับตาดู" : "🔴 วิกฤต / มีงานค้าง"} (เสร็จแล้ว ${summary.completionRatePercent}%)

📝 **ภาพรวม:**
${summary.overview}

🚀 **งานที่ทีมกำลังโฟกัส (DOING):**
${summary.currentFocus.map((f) => `- ${f}`).join("\n") || "- ไม่มีงานที่ค้างในกระบวนการ"}

⚠️ **จุดเสี่ยง / งานที่ต้องระวัง (Bottlenecks):**
${summary.bottlenecks.map((b) => `- ${b}`).join("\n") || "- ไม่มีจุดเสี่ยงสำคัญ"}

💡 **ข้อเสนอแนะในการทำงานถัดไป:**
${summary.recommendations.map((r) => `- ${r}`).join("\n") || "- ดำเนินการตามแผนงานต่อเนื่อง"}
`;

    navigator.clipboard.writeText(md);
    toast({
      message: "📋 คัดลอกข้อความสรุป Markdown สำหรับส่งใน Line / Discord แล้ว!",
      type: "success"
    });
  };

  const handleSaveToNotes = async () => {
    if (!summary || isSavingNote) return;

    setIsSavingNote(true);
    try {
      const title = `🤖 AI Summary — ${boardName} (${new Date().toLocaleDateString("th-TH")})`;
      const content = `### สถานะโครงการ: ${summary.healthStatus} (${summary.completionRatePercent}%)

${summary.overview}

#### งานที่กำลังทำอยู่:
${summary.currentFocus.map((f) => `- ${f}`).join("\n")}

#### จุดเสี่ยง & งานค้าง:
${summary.bottlenecks.map((b) => `- ${b}`).join("\n")}

#### คำแนะนำถัดไป:
${summary.recommendations.map((r) => `- ${r}`).join("\n")}
`;

      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          boardId: boardId || null,
          color: "LAVENDER"
        })
      });

      if (!res.ok) {
        throw new Error("Could not save note");
      }

      toast({
        message: "💾 บันทึกรายงานสรุปลงในแท็บ Notes ของโปรเจกต์เรียบร้อยแล้ว!",
        type: "success"
      });
    } catch {
      toast({
        message: "ไม่สามารถบันทึกลง Notes ได้ กรุณาลองใหม่อีกครั้ง",
        type: "error"
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      labelledBy="ai-summary-title"
      contentClassName="lofi-panel flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-dusk-lavender/30 shadow-2xl"
    >
      <div className="flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-indigo-400/40 bg-indigo-500/15 text-indigo-400 shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse text-dusk-amber" />
            </div>
            <div>
              <h2
                id="ai-summary-title"
                className="text-base sm:text-lg font-bold tracking-tight text-stone-100 flex items-center gap-2"
              >
                <span>🤖 สรุปความคืบหน้าของงาน (AI Summary)</span>
              </h2>
              <p className="text-xs text-stone-400">
                วิเคราะห์สถานะ Sprint และความคืบหน้าของบอร์ด {boardName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {credits !== null && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-mono text-amber-300">
                <Coins className="h-3 w-3" />
                <span>{credits} cr</span>
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="scrollbar-soft flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-dusk-lavender" />
              <p className="text-sm font-medium text-stone-300 animate-pulse">
                🐱 AI กำลังสแกนบอร์ดและวิเคราะห์ความคืบหน้า...
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Health & Completion Banner */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                      summary.healthStatus === "HEALTHY" &&
                        "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
                      summary.healthStatus === "ATTENTION" &&
                        "border-amber-500/30 bg-amber-500/15 text-amber-300",
                      summary.healthStatus === "CRITICAL" &&
                        "border-rose-500/30 bg-rose-500/15 text-rose-300"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {summary.healthStatus === "HEALTHY"
                        ? "สุขภาพดี (Healthy)"
                        : summary.healthStatus === "ATTENTION"
                          ? "ต้องติดตาม (Attention)"
                          : "มีความเสี่ยง (Critical)"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-stone-300">
                  <TrendingUp className="h-4 w-4 text-dusk-cyan" />
                  <span>เสร็จแล้ว {summary.completionRatePercent}%</span>
                </div>
              </div>

              {/* Executive Overview */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-dusk-amber flex items-center gap-1">
                  <span>📊 ภาพรวมโครงการ</span>
                </span>
                <p className="text-stone-200 leading-relaxed break-words">
                  {summary.overview}
                </p>
              </div>

              {/* Current Focus */}
              {summary.currentFocus.length > 0 && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-indigo-400" />
                    <span>งานที่ทีมกำลังโฟกัสอยู่ (DOING)</span>
                  </span>
                  <ul className="space-y-1 text-stone-300">
                    {summary.currentFocus.map((focus, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 shrink-0">•</span>
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottlenecks & Overdue */}
              {summary.bottlenecks.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span>จุดเสี่ยงและงานค้าง (Bottlenecks & Overdue)</span>
                  </span>
                  <ul className="space-y-1 text-stone-300">
                    {summary.bottlenecks.map((bottle, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{bottle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Action Recommendations */}
              {summary.recommendations.length > 0 && (
                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5 text-teal-400" />
                    <span>ข้อเสนอแนะในการทำงานถัดไป (Recommendations)</span>
                  </span>
                  <ul className="space-y-1 text-stone-300">
                    {summary.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-400 shrink-0">👉</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-stone-400">
              กดปุ่มด้านล่างเพื่อเริ่มสร้างรายงานสรุป
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              onClick={fetchSummary}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              <span>สรุปใหม่ (ใช้ 2 cr)</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {summary && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading || isSavingNote}
                  onClick={handleSaveToNotes}
                  className="gap-1.5 text-xs text-dusk-lavender hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{isSavingNote ? "กำลังบันทึก..." : "บันทึกเป็น Note"}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isLoading}
                  onClick={handleCopyMarkdown}
                  className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span>คัดลอก Markdown</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
