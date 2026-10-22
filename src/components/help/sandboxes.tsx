"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Check,
  CheckCircle2,
  Coffee,
  Coins,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function InteractiveAiDemo({ isEn }: { isEn: boolean }) {
  const [selectedPrompt, setSelectedPrompt] = useState<string>(
    isEn ? "Summarize this week's sprint progress" : "สรุปงานของสัปดาห์นี้ให้หน่อย"
  );
  const [isThinking, setIsThinking] = useState(false);
  const [simulatedReply, setSimulatedReply] = useState<string>("");

  const prompts = isEn
    ? [
        { label: "Summarize Sprint", text: "Summarize this week's sprint progress" },
        { label: "Break Down Login Task", text: "Break down user login system into 5 checklist items" },
        { label: "Detect Bottlenecks", text: "Are there any tasks blocked in In Progress for over 3 days?" },
      ]
    : [
        { label: "สรุปงานสัปดาห์นี้", text: "สรุปงานของสัปดาห์นี้ให้หน่อย" },
        { label: "แตกงานระบบ Login", text: "ช่วยแตกการ์ดงานทำระบบ Login เป็นเช็คลิสต์ 5 ข้อย่อย" },
        { label: "ตรวจเช็คคอขวด", text: "มีงานไหนที่ติดค้างใน In Progress เกิน 3 วันบ้าง?" },
      ];

  const handleSimulate = useCallback((promptText: string) => {
    setSelectedPrompt(promptText);
    setIsThinking(true);
    setSimulatedReply("");

    setTimeout(() => {
      setIsThinking(false);
      if (promptText.includes("Login") || promptText.includes("login")) {
        setSimulatedReply(
          isEn
            ? "✨ AI Breakdown for 'User Authentication & Login' (5 checklist items):\n" +
              "  ☑️ 01. Design Sign In & Sign Up forms with Retro Lofi UI\n" +
              "  ☑️ 02. Add field validation and helpful feedback messages\n" +
              "  ☑️ 03. Configure secure password recovery workflow\n" +
              "  ☑️ 04. Add toast status notifications upon sign in\n" +
              "  ☑️ 05. Verify cross-device responsiveness and accessibility"
            : "✨ แตกเช็คลิสต์งาน 'ระบบเข้าสู่ระบบ & บัญชีผู้ใช้' (5 ข้อย่อย):\n" +
              "  ☑️ 01. ออกแบบฟอร์ม Sign In & Sign Up ด้วย Retro Lofi UI\n" +
              "  ☑️ 02. เพิ่มการตรวจสอบความถูกต้องของข้อมูลพร้อมข้อความแนะนำ\n" +
              "  ☑️ 03. จัดทำขั้นตอนกู้คืนรหัสผ่านอย่างปลอดภัย\n" +
              "  ☑️ 04. เพิ่มการแจ้งเตือนสถานะเมื่อเข้าสู่ระบบสำเร็จ\n" +
              "  ☑️ 05. ตรวจสอบความพร้อมใช้งานบนคอมพิวเตอร์และมือถือ"
        );
      } else if (promptText.includes("Bottlenecks") || promptText.includes("คอขวด")) {
        setSimulatedReply(
          isEn
            ? "⚡ Board Health Check: Found 2 bottlenecks in 'In Progress':\n" +
              "  • 'Team Real-time Sync Testing' (4 days active - exceeding WIP Limit!)\n" +
              "  • 'Executive Table Export' (Testing multi-page PDF generation)\n" +
              "💡 Recommendation: Reassign task review to a teammate or temporarily increase WIP limit."
            : "⚡ ตรวจสอบสุขภาพบอร์ด: พบคอขวด 2 รายการในคอลัมน์ In Progress:\n" +
              "  • งาน 'ทดสอบการซิงค์ข้อมูลทีม' (กำลังดำเนินการ 4 วัน - เกิน WIP Limit!)\n" +
              "  • งาน 'ส่งออกรายงาน Executive Table' (กำลังทดสอบ PDF Multi-page)\n" +
              "💡 แนะนำ: กระจายงานให้สมาชิกในทีมช่วยรีวิว หรือขยับ WIP Limit ชั่วคราว"
        );
      } else {
        setSimulatedReply(
          isEn
            ? "📊 Sprint Progress Summary:\n" +
              "  • Total Sprint Tasks: 18 cards\n" +
              "  • Completed (Done): 11 cards (61.1% velocity)\n" +
              "  • Active (In Progress): 4 cards\n" +
              "  • Under Review: 3 cards\n" +
              "☕ Teammates have sent 14 Coffee Cheers! Team morale is running high."
            : "📊 สรุปความคืบหน้าประจำสัปดาห์:\n" +
              "  • งานทั้งหมดในสปรินต์: 18 การ์ด\n" +
              "  • ทำเสร็จสิ้นแล้ว (Done): 11 การ์ด (คิดเป็น 61.1%)\n" +
              "  • กำลังดำเนินการ (In Progress): 4 การ์ด\n" +
              "  • รอการทดสอบ (Review): 3 การ์ด\n" +
              "☕ มีการกดส่ง Coffee Cheers ทั้งหมด 14 แก้ว! บรรยากาศทีมยอดเยี่ยมมากครับ"
        );
      }
    }, 400);
  }, [isEn]);

  useEffect(() => {
    handleSimulate(isEn ? "Summarize this week's sprint progress" : "สรุปงานของสัปดาห์นี้ให้หน่อย");
  }, [isEn, handleSimulate]);

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 p-4 sm:p-5 dark:border-dusk-lavender/30 dark:from-dusk-lavender/10 dark:via-ink-950/70 dark:to-ink-950/90 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white dark:bg-dusk-lavender dark:text-ink-950 shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>Retzlo AI Interactive Simulator</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                Live Mock
              </span>
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {isEn ? "Click prompt chips below to preview how Retzlo AI analyzes and responds." : "ทดลองคลิกคำสั่งตัวอย่างเพื่อดูรูปแบบการตอบและวิเคราะห์ของ AI ในระบบ"}
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Selector Pills */}
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSimulate(p.text)}
            className={cn(
              "rounded-xl px-2.5 py-1 text-xs font-medium transition cursor-pointer border",
              selectedPrompt === p.text
                ? "border-indigo-400 bg-indigo-100/80 text-indigo-800 dark:border-dusk-lavender dark:bg-dusk-lavender/25 dark:text-dusk-lavender"
                : "border-stone-200 bg-white text-stone-600 hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Simulated Response Box */}
      <div className="rounded-xl border border-stone-200/90 bg-stone-900 p-3.5 font-mono text-xs text-stone-100 dark:border-white/10 dark:bg-black/60 min-h-[110px] flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-[11px]">
            <span className="text-amber-400">user:</span>
            <span>{selectedPrompt}</span>
          </div>

          <div className="text-[11px] leading-relaxed text-stone-200 whitespace-pre-line">
            {isThinking ? (
              <span className="inline-flex items-center gap-2 text-stone-400">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />
                {isEn ? "Analyzing board context and computing insights..." : "กำลังวิเคราะห์บริบทของบอร์ดและประมวลผล..."}
              </span>
            ) : (
              simulatedReply
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
          <span>{isEn ? "Response: Instant · Context: Live Project Cards" : "การตอบสนอง: รวดเร็ว · บริบท: โครงการ & การ์ดสด"}</span>
          <span className="text-emerald-400 font-semibold">Built-in Retzlo AI</span>
        </div>
      </div>
    </div>
  );
}

export function InteractiveKanbanTableDemo({ isEn }: { isEn: boolean }) {
  const [view, setView] = useState<"kanban" | "table">("table");
  const [density, setDensity] = useState<"normal" | "compact">("compact");
  const [doneCards, setDoneCards] = useState<Record<number, boolean>>({ 3: true });

  const toggleDone = (id: number) => {
    setDoneCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleTasks = isEn
    ? [
        { id: 1, title: "Design interactive bilingual documentation portal", status: "In Progress", priority: "P0 Blocker", pColor: "bg-rose-500 text-white", assignees: ["NR", "AI"] },
        { id: 2, title: "Coordinate real-time team notification updates", status: "In Progress", priority: "P1 Urgent", pColor: "bg-amber-500 text-white", assignees: ["TK"] },
        { id: 3, title: "Review Board Settings modal layout & quick presets", status: "Done", priority: "P2 Normal", pColor: "bg-indigo-500 text-white", assignees: ["NR"] },
      ]
    : [
        { id: 1, title: "ออกแบบหน้าคู่มือระบบใหม่แบบ Interactive", status: "In Progress", priority: "P0 Blocker", pColor: "bg-rose-500 text-white", assignees: ["NR", "AI"] },
        { id: 2, title: "ประสานงานระบบแจ้งเตือนทีมแบบเรียลไทม์", status: "In Progress", priority: "P1 Urgent", pColor: "bg-amber-500 text-white", assignees: ["TK"] },
        { id: 3, title: "ปรับปรุงหน้าต่าง Board Settings และพรีวิวแม่แบบ", status: "Done", priority: "P2 Normal", pColor: "bg-indigo-500 text-white", assignees: ["NR"] },
      ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-ink-950/70 shadow-sm space-y-4">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {isEn ? "Simulated View:" : "จำลองมุมมองบอร์ด:"}
          </span>
          <div className="flex items-center rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-white/10 dark:bg-white/[0.05]">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition cursor-pointer",
                view === "kanban"
                  ? "bg-white text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400"
              )}
            >
              📋 Kanban Board
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition cursor-pointer",
                view === "table"
                  ? "bg-white text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400"
              )}
            >
              📊 Spreadsheet Table View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Card Density:</span>
          <button
            type="button"
            onClick={() => setDensity(density === "normal" ? "compact" : "normal")}
            className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 cursor-pointer"
          >
            {density === "normal"
              ? isEn
                ? "Normal (Standard)"
                : "Normal (มาตรฐาน)"
              : isEn
              ? "Compact 2x"
              : "Compact 2x (หนาแน่น)"}
          </button>
        </div>
      </div>

      {/* Render Table or Kanban View */}
      {view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-stone-200/90 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">{isEn ? "Task Title" : "ชื่องาน (Title)"}</th>
                <th className="py-2.5 px-3">{isEn ? "Status" : "สถานะ (Status)"}</th>
                <th className="py-2.5 px-3">{isEn ? "Priority" : "ระดับความสำคัญ (Priority)"}</th>
                <th className="py-2.5 px-3">{isEn ? "Assignees" : "ผู้รับผิดชอบ (Assignees)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {sampleTasks.map((t) => {
                const isCompleted = doneCards[t.id];
                return (
                  <tr
                    key={t.id}
                    className="group hover:bg-indigo-50/40 dark:hover:bg-dusk-lavender/5 transition"
                  >
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleDone(t.id)}
                        className="mx-auto flex h-5 w-5 items-center justify-center rounded border border-stone-300 bg-white text-stone-600 transition group-hover:border-indigo-400 dark:border-white/20 dark:bg-white/5 dark:text-stone-300 cursor-pointer"
                        title={isEn ? "Hover Checkbox - click to complete" : "คลิกเพื่อติ๊กเสร็จงาน (Hover Checkbox)"}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" />
                        ) : (
                          <span className="text-[10px] text-stone-400 group-hover:hidden">
                            {t.id}
                          </span>
                        )}
                        {!isCompleted && (
                          <Check className="hidden h-3 w-3 text-stone-400 group-hover:inline-block" />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-stone-100">
                      <span className={isCompleted ? "line-through text-stone-400 dark:text-stone-500" : ""}>
                        {t.title}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-indigo-100 text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender"
                        )}
                      >
                        {isCompleted ? "Done" : t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", t.pColor)}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center -space-x-1.5">
                        {t.assignees.map((a, i) => (
                          <div
                            key={i}
                            className="grid h-5 w-5 place-items-center rounded-full border border-white bg-indigo-200 text-[9px] font-bold text-indigo-800 dark:border-ink-950 dark:bg-dusk-lavender/30 dark:text-dusk-lavender"
                          >
                            {a}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <span>{isEn ? "In Progress" : "In Progress (กำลังทำ)"}</span>
              <span className="rounded bg-indigo-100 dark:bg-white/10 px-1.5 py-0.2 text-[10px] text-indigo-700 dark:text-stone-300">
                WIP 2/3
              </span>
            </div>
            {sampleTasks.filter((t) => !doneCards[t.id]).map((t) => (
              <div
                key={t.id}
                className={cn(
                  "rounded-lg border border-stone-200 bg-white shadow-xs dark:border-white/10 dark:bg-stone-800/80 transition",
                  density === "compact" ? "p-2 space-y-1" : "p-3 space-y-2"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
                    {t.title}
                  </span>
                  <span className={cn("rounded px-1.5 py-0.2 text-[9px] font-bold shrink-0", t.pColor)}>
                    {t.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1">
                    {t.assignees.map((a, i) => (
                      <span key={i} className="h-4 w-4 rounded-full bg-indigo-200 text-[8px] flex items-center justify-center font-bold text-indigo-800 dark:bg-dusk-lavender/40 dark:text-dusk-lavender">
                        {a}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDone(t.id)}
                    className="text-[10px] text-indigo-600 hover:underline dark:text-dusk-lavender cursor-pointer"
                  >
                    {isEn ? "Move to Done →" : "ย้ายไป Done →"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400">
              <span>{isEn ? "Done" : "Done (เสร็จสิ้น)"}</span>
              <span className="rounded bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-700 dark:text-emerald-400">
                1
              </span>
            </div>
            {sampleTasks.filter((t) => doneCards[t.id]).map((t) => (
              <div
                key={t.id}
                className={cn(
                  "rounded-lg border border-emerald-200 bg-white p-2.5 shadow-xs dark:border-emerald-500/20 dark:bg-stone-800/80 space-y-1.5"
                )}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-through text-stone-500">
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {isEn ? "☕ 1 Cheers received" : "☕ 1 Cheers ได้รับแล้ว"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDone(t.id)}
                    className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {isEn ? "Revert" : "ย้อนกลับ"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InteractivePrioritiesDemo({ isEn }: { isEn: boolean }) {
  const [selectedColor, setSelectedColor] = useState("rose");

  const colors = [
    { id: "rose", label: "Rose", bg: "bg-rose-500", text: "text-rose-700 dark:text-dusk-rose" },
    { id: "amber", label: "Amber", bg: "bg-amber-500", text: "text-amber-700 dark:text-dusk-amber" },
    { id: "emerald", label: "Emerald", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
    { id: "teal", label: "Teal", bg: "bg-teal-500", text: "text-teal-700 dark:text-teal-400" },
    { id: "cyan", label: "Cyan", bg: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-400" },
    { id: "indigo", label: "Indigo", bg: "bg-indigo-500", text: "text-indigo-700 dark:text-dusk-lavender" },
    { id: "purple", label: "Purple", bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-400" },
    { id: "pink", label: "Pink", bg: "bg-pink-500", text: "text-pink-700 dark:text-pink-400" },
  ];

  const levels = [
    { level: 1, name: "P0 Blocker", color: "bg-rose-500 text-white" },
    { level: 2, name: "P1 Critical", color: "bg-orange-500 text-white" },
    { level: 3, name: "P2 High", color: "bg-amber-500 text-white" },
    { level: 4, name: "P3 Normal", color: "bg-indigo-500 text-white" },
    { level: 5, name: "P4 Low", color: "bg-stone-500 text-white" },
  ];

  const activeColorObj = colors.find((c) => c.id === selectedColor) || colors[0];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-ink-950/70 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-white/10 pb-3">
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            {isEn ? "10-Level Custom Priorities Architecture" : "ระบบความสำคัญ 10 ระดับ (10-Level Custom Priorities)"}
          </h4>
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            {isEn ? "Create up to 10 tiers per board with 12 Retro Lofi semantic color palettes." : "สร้างได้สูงสุด 10 ระดับต่อบอร์ด พร้อมเลือกได้ 12 สี Retro Lofi Palette"}
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
          12 Retro Colors
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
          {isEn ? "Board Priority Tiers:" : "ตัวอย่างระดับความสำคัญของบอร์ด:"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className="flex items-center gap-2 p-2 rounded-xl border border-stone-200/80 bg-stone-50/50 dark:border-white/10 dark:bg-white/[0.02]"
            >
              <span className="font-mono text-[10px] text-stone-400 font-bold">#{lvl.level}</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold truncate", lvl.color)}>
                {lvl.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-white/5">
        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
          {isEn ? "Preview Retro Lofi Color Palettes (Click to test):" : "ทดลองเลือกชุดสี Retro Lofi (คลิกเพื่อทดสอบ):"}
        </span>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedColor(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition cursor-pointer",
                selectedColor === c.id
                  ? "border-stone-900 bg-stone-100 dark:border-white dark:bg-white/10 ring-1 ring-stone-900 dark:ring-white"
                  : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", c.bg)} />
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Card Preview using the selected color */}
        <div className="mt-3 p-3 rounded-xl border border-stone-200/90 bg-stone-50/70 dark:border-white/10 dark:bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs shrink-0",
                activeColorObj.bg
              )}
            >
              {isEn ? `Tier · ${activeColorObj.label}` : `ระดับ · ${activeColorObj.label}`}
            </span>
            <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
              {isEn ? "Sprint card badge renders instantly with 0ms delay" : "ป้ายความสำคัญบนการ์ดแสดงผลทันทีแบบ Real-time 0ms"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            ✓ Live Preview
          </span>
        </div>
      </div>
    </div>
  );
}

export function InteractiveCoffeeDemo({ isEn }: { isEn: boolean }) {
  const [coffees, setCoffees] = useState(12);
  const [coins, setCoins] = useState(60);
  const [isCheersActive, setIsCheersActive] = useState(false);
  const { toast } = useToast();

  const handleCheers = () => {
    setCoffees((c) => c + 1);
    setCoins((c) => c + 5);
    setIsCheersActive(true);
    toast({
      message: isEn ? "☕ Coffee Cheers sent! Earned +5 Coins" : "☕ ส่ง Coffee Cheers สำเร็จ! ได้รับ +5 Coins",
      type: "success",
    });
    setTimeout(() => setIsCheersActive(false), 800);
  };

  return (
    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-4 sm:p-5 dark:border-dusk-rose/30 dark:bg-dusk-rose/5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-rose-500 text-white shadow-xs">
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Coffee Cheers & Gamification Wallet
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {isEn ? "Recognize completed achievements and collect coins for project store rewards." : "ส่งกำลังใจเมื่องานเสร็จสมบูรณ์ และสะสมเหรียญแลกของรางวัล"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-dusk-amber">
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span>{coins} Coins</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-dusk-rose">
            <span>☕ {coffees} Cheers</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 dark:border-white/10 dark:bg-stone-900/80">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {isEn ? 'Task Card: "Ship Retzlo 2.4 Production Release"' : 'การ์ดงาน: "ส่งมอบเวอร์ชัน Retzlo 2.4"'}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {isEn ? "✓ Moved to Done stage" : "✓ ย้ายมาคอลัมน์ Done แล้ว"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheers}
          className={cn(
            "flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-rose-600 hover:to-amber-600 transition cursor-pointer transform active:scale-95",
            isCheersActive && "scale-105 ring-2 ring-rose-400 ring-offset-2"
          )}
        >
          <Coffee className="h-4 w-4" />
          <span>{isEn ? "Send ☕ Cheers (+5 Coins)" : "กด ☕ Cheers (+5 Coins)"}</span>
        </button>
      </div>
    </div>
  );
}

