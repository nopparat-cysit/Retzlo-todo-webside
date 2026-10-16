"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  Circle,
  ArrowRight,
  Eye,
  EyeOff,
  Pin,
  Disc3,
  Play,
  Pause,
  RotateCcw,
  Sparkles
} from "lucide-react";
import type { WalkthroughSlide } from "./landing-data";

interface KanbanDemoCard {
  id: string;
  title: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  coins: number;
  stage: 0 | 1 | 2;
}

const INITIAL_KANBAN_CARDS: KanbanDemoCard[] = [
  {
    id: "k1",
    title: "ออกแบบหน้าปก Mixtape ซีซันใหม่",
    tag: "Design",
    tagBg: "#ede9fe",
    tagColor: "#6d28d9",
    coins: 20,
    stage: 0
  },
  {
    id: "k2",
    title: "เขียนบรีฟแคมเปญเปิดตัวในสมุดโน้ต",
    tag: "Content",
    tagBg: "#fef3c7",
    tagColor: "#b45309",
    coins: 15,
    stage: 0
  },
  {
    id: "k3",
    title: "ปรับจังหวะการ์ดและติดสติกเกอร์หน้าแรก",
    tag: "Frontend",
    tagBg: "#fce7f3",
    tagColor: "#be185d",
    coins: 25,
    stage: 1
  },
  {
    id: "k4",
    title: "ซิงก์กำหนดส่งขึ้นปฏิทินประจำเดือน",
    tag: "System",
    tagBg: "#d1fae5",
    tagColor: "#047857",
    coins: 20,
    stage: 2
  }
];

const NOTE_PALETTES = [
  { name: "Buttercream", bg: "#fff6d6", border: "#e6c97a", text: "#4a3712", tag: "#b45309" },
  { name: "Sakura Pink", bg: "#ffeaf3", border: "#f2b6d0", text: "#522139", tag: "#be185d" },
  { name: "Mint Sage", bg: "#e6faef", border: "#98dfb9", text: "#164630", tag: "#047857" },
  { name: "Dusk Lilac", bg: "#f1ebff", border: "#c7b3f7", text: "#351f63", tag: "#6d28d9" }
];

export function WalkthroughMockupScreen({
  slide,
  isPlaying,
  onToggleAudio,
  onEarnCoin
}: {
  slide: WalkthroughSlide;
  isPlaying: boolean;
  onToggleAudio: () => void;
  onEarnCoin?: (amount: number, label: string) => void;
}) {
  // Room 01 state: Workspace switcher & 7-day agenda
  const [selectedWs, setSelectedWs] = useState<"work" | "personal">("work");
  const [agendaDone, setAgendaDone] = useState<string[]>(["ag-1"]);

  // Room 02 state: Interactive Kanban cards & view mode
  const [kanbanMode, setKanbanMode] = useState<"board" | "table">("board");
  const [kanbanCards, setKanbanCards] = useState<KanbanDemoCard[]>(INITIAL_KANBAN_CARDS);

  // Room 03 state: Interactive Calendar day selector
  const [selectedDay, setSelectedDay] = useState<number>(2);
  const [calTasksDone, setCalTasksDone] = useState<string[]>(["c-mon"]);

  // Room 04 state: Note color picker & pin toggle
  const [noteColorIdx, setNoteColorIdx] = useState<number>(0);
  const [pinnedNotes, setPinnedNotes] = useState<string[]>(["note-1"]);

  // Room 05 state: Diary privacy lock & routine checklist
  const [isDiaryMasked, setIsDiaryMasked] = useState<boolean>(false);
  const [habitsDone, setHabitsDone] = useState<number[]>([0, 1]);

  // Room 06 state: Cassette mood selector
  const [cassetteMood, setCassetteMood] = useState<number>(0);

  const toggleAgenda = (id: string) => {
    const isNowDone = !agendaDone.includes(id);
    setAgendaDone((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (isNowDone && onEarnCoin) {
      onEarnCoin(15, "เคลียร์งานใน 7-Day Agenda!");
    }
  };

  const advanceKanbanCard = (id: string) => {
    setKanbanCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const nextStage = ((card.stage + 1) % 3) as 0 | 1 | 2;
        if (nextStage === 2 && onEarnCoin) {
          onEarnCoin(card.coins, `ย้าย "${card.title.slice(0, 18)}..." ไป Done!`);
        }
        return { ...card, stage: nextStage };
      })
    );
  };

  const resetKanban = () => setKanbanCards(INITIAL_KANBAN_CARDS);

  const toggleHabit = (idx: number) => {
    const isNowDone = !habitsDone.includes(idx);
    setHabitsDone((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
    if (isNowDone && onEarnCoin) {
      onEarnCoin(10, "เช็กกิจวัตรประจำวันสำเร็จ!");
    }
  };

  const calendarDays = [
    {
      day: "Mon 12",
      badge: "เสร็จแล้ว",
      color: "#10b981",
      tasks: [
        { id: "c-mon", title: "ทบทวนแผนประจำสัปดาห์ 15 นาที", time: "09:30", coins: 15 }
      ]
    },
    {
      day: "Tue 13",
      badge: "มีโน้ต",
      color: "#8b5cf6",
      tasks: [
        { id: "c-tue", title: "จดสรุปเรฟสีและมู้ดบอร์ด", time: "13:00", coins: 15 }
      ]
    },
    {
      day: "Wed 14",
      badge: "2 งานวันนี้",
      color: "#ec4899",
      tasks: [
        { id: "c-wed-1", title: "ส่งมอบงานออกแบบหน้าแรก", time: "14:00", coins: 25 },
        { id: "c-wed-2", title: "เขียนบันทึกไดอารี่กลางสัปดาห์", time: "20:00", coins: 15 }
      ]
    },
    {
      day: "Thu 15",
      badge: "นัดทีม",
      color: "#f59e0b",
      tasks: [
        { id: "c-thu", title: "คุยสรุปฟีดแบ็กและจิบกาแฟบ่าย", time: "15:30", coins: 20 }
      ]
    },
    {
      day: "Fri 16",
      badge: "ปิดสัปดาห์",
      color: "#6366f1",
      tasks: [
        { id: "c-fri", title: "เคลียร์บอร์ดประจำสัปดาห์ & แลกรางวัล", time: "17:00", coins: 30 }
      ]
    }
  ];

  const activeDayObj = calendarDays[selectedDay] || calendarDays[2];
  const activeNoteTheme = NOTE_PALETTES[noteColorIdx] || NOTE_PALETTES[0];

  return (
    <div
      key={slide.id}
      className="lp-tab-stage"
      style={{
        border: "2px solid var(--border-strong, var(--border))",
        borderRadius: "24px",
        background: "var(--panel-strong)",
        boxShadow: "8px 8px 0 rgba(84, 53, 107, 0.14), var(--shadow-panel)",
        overflow: "hidden"
      }}
    >
      {/* Tactile Studio Window Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background:
            "linear-gradient(90deg, rgba(120, 88, 212, 0.12) 0%, rgba(255, 180, 213, 0.14) 100%), var(--paper)"
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#fb7185] inline-block border border-black/15" />
            <span className="w-3 h-3 rounded-full bg-[#fbbf24] inline-block border border-black/15" />
            <span className="w-3 h-3 rounded-full bg-[#34d399] inline-block border border-black/15" />
          </div>
          <div className="h-4 w-[1px] bg-[var(--border)] mx-0.5" />
          <div style={{ position: "relative", width: "22px", height: "22px" }}>
            <Image
              src={slide.stickerSrc || slide.iconSrc}
              alt=""
              fill
              sizes="22px"
              className="object-contain"
            />
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--foreground)"
            }}
          >
            {slide.subtitle}
          </span>
        </div>

        <span
          style={{
            fontSize: "10px",
            letterSpacing: "1px",
            padding: "4px 10px",
            borderRadius: "999px",
            background: "#ffecb1",
            color: "#54356b",
            border: "1px solid rgba(84, 53, 107, 0.35)",
            fontWeight: 700
          }}
        >
          INTERACTIVE PREVIEW · ลองกดเล่นได้!
        </span>
      </div>

      {/* Main Interactive Stage */}
      <div style={{ padding: "22px" }} className="space-y-4">
        {/* ── ROOM 01: WORKSPACES ── */}
        {slide.id === "workspaces" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: "work" as const,
                  tag: "WORK STUDIO",
                  name: "Retzlo Product Launch",
                  meta: "4 บอร์ดงาน · 18 การ์ด · ทีม 5 คน",
                  progress: 78,
                  accent: "#7858d4",
                  tint: "rgba(120, 88, 212, 0.08)",
                  sticker: "/stickers/retro/retro-sticker-13-project-folder.png"
                },
                {
                  id: "personal" as const,
                  tag: "PERSONAL COZY SPACE",
                  name: "สมุดบันทึก & เป้าหมายปี 2026",
                  meta: "3 โฟลเดอร์โน้ต · ไดอารี่ส่วนตัว",
                  progress: 92,
                  accent: "#db2777",
                  tint: "rgba(219, 39, 119, 0.08)",
                  sticker: "/stickers/retro/retro-sticker-02-diary-notebook.png"
                }
              ].map((ws) => {
                const active = selectedWs === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setSelectedWs(ws.id)}
                    className="lp-spring-card text-left"
                    style={{
                      border: active
                        ? `2px solid ${ws.accent}`
                        : "1px solid var(--border)",
                      borderRadius: "16px",
                      padding: "16px",
                      background: active ? ws.tint : "var(--paper)",
                      boxShadow: active
                        ? "4px 4px 0 rgba(84, 53, 107, 0.16)"
                        : "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px"
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          style={{
                            fontSize: "9px",
                            letterSpacing: "1.4px",
                            color: ws.accent,
                            fontWeight: 700
                          }}
                        >
                          {ws.tag}
                        </span>
                        <h4
                          className="lp-font-display"
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            marginTop: "4px",
                            color: "var(--foreground)"
                          }}
                        >
                          {ws.name}
                        </h4>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--muted)",
                            marginTop: "2px"
                          }}
                        >
                          {ws.meta}
                        </p>
                      </div>
                      <div className="relative w-10 h-10 shrink-0">
                        <Image
                          src={ws.sticker}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 w-full">
                      <div className="flex justify-between text-[11px]">
                        <span style={{ color: "var(--muted)" }}>ความคืบหน้าสัปดาห์นี้</span>
                        <strong style={{ color: ws.accent }}>{ws.progress}%</strong>
                      </div>
                      <div
                        style={{
                          height: "7px",
                          borderRadius: "999px",
                          background: "var(--border)",
                          overflow: "hidden"
                        }}
                      >
                        <div
                          style={{
                            width: `${ws.progress}%`,
                            height: "100%",
                            background: ws.accent,
                            borderRadius: "999px",
                            transition: "width 400ms cubic-bezier(0.22, 1, 0.36, 1)"
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive 7-Day Agenda Strip */}
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "14px 16px",
                background: "var(--paper)"
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                  {selectedWs === "work"
                    ? "กำหนดการ 7 วันข้างหน้า · Retzlo Product Launch"
                    : "รายการส่วนตัวสัปดาห์นี้ · สมุดบันทึก & เป้าหมาย"}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                  คลิกติ๊กเพื่อรับ +15 เหรียญ
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(selectedWs === "work"
                  ? [
                      { id: "ag-1", label: "สรุปโครงสร้างหน้าแรกกับทีมดีไซน์", day: "วันนี้ · 14:00" },
                      { id: "ag-2", label: "ตรวจเช็กความเรียบร้อยก่อนปล่อยอัปเดต", day: "พรุ่งนี้ · 11:00" }
                    ]
                  : [
                      { id: "ag-3", label: "อ่านหนังสือที่ซื้อเก็บไว้อย่างน้อย 1 บท", day: "คืนนี้ · 21:00" },
                      { id: "ag-4", label: "จัดกระเป๋าและวางแผนทริปสุดสัปดาห์", day: "วันศุกร์ · 18:00" }
                    ]
                ).map((item) => {
                  const done = agendaDone.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAgenda(item.id)}
                      className="lp-spring-card flex items-center justify-between gap-2 p-2.5 rounded-xl text-left"
                      style={{
                        border: "1px solid var(--border)",
                        background: done
                          ? "rgba(16, 185, 129, 0.1)"
                          : "var(--panel-strong)"
                      }}
                    >
                      <span className="flex items-center gap-2 text-xs min-w-0">
                        {done ? (
                          <Check size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Circle size={14} className="opacity-50 shrink-0" />
                        )}
                        <span
                          className="truncate"
                          style={{
                            textDecoration: done ? "line-through" : "none",
                            opacity: done ? 0.7 : 1
                          }}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-black/5">
                        {item.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ROOM 02: INTERACTIVE KANBAN & TABLE ── */}
        {slide.id === "kanban" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-xl p-1 border border-[var(--border)] bg-[var(--paper)]">
                <button
                  type="button"
                  onClick={() => setKanbanMode("board")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: kanbanMode === "board" ? "#7858d4" : "transparent",
                    color: kanbanMode === "board" ? "#fff" : "var(--muted)"
                  }}
                >
                  Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setKanbanMode("table")}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: kanbanMode === "table" ? "#7858d4" : "transparent",
                    color: kanbanMode === "table" ? "#fff" : "var(--muted)"
                  }}
                >
                  Table View
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                  คลิกการ์ดเพื่อขยับคอลัมน์ →
                </span>
                <button
                  type="button"
                  onClick={resetKanban}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--paper)]"
                >
                  <RotateCcw size={11} /> รีเซ็ต
                </button>
              </div>
            </div>

            {kanbanMode === "board" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { stage: 0 as const, label: "To do", dot: "#a78bfa", bg: "rgba(167, 139, 250, 0.08)" },
                  { stage: 1 as const, label: "In progress", dot: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)" },
                  { stage: 2 as const, label: "Done (+Coins!)", dot: "#10b981", bg: "rgba(16, 185, 129, 0.1)" }
                ].map((col) => {
                  const colCards = kanbanCards.filter((c) => c.stage === col.stage);
                  return (
                    <div
                      key={col.label}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "12px",
                        background: col.bg,
                        minHeight: "195px"
                      }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold">
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: col.dot
                            }}
                          />
                          {col.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 font-semibold">
                          {colCards.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {colCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => advanceKanbanCard(card.id)}
                            className="lp-spring-card w-full text-left p-2.5 rounded-xl"
                            style={{
                              border: "1px solid var(--border)",
                              background: "var(--panel-strong)",
                              boxShadow: "2px 2px 0 rgba(84, 53, 107, 0.12)"
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: "6px",
                                  background: card.tagBg,
                                  color: card.tagColor
                                }}
                              >
                                {card.tag}
                              </span>
                              <span className="text-[10px] font-bold text-amber-600">
                                +{card.coins}c
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                lineHeight: 1.4,
                                color: "var(--foreground)"
                              }}
                            >
                              {card.title}
                            </div>
                            <div
                              className="flex items-center justify-between mt-2 text-[10px]"
                              style={{ color: "var(--muted)" }}
                            >
                              <span>
                                {card.stage === 2 ? "เสร็จสมบูรณ์!" : "คลิกเพื่อขยับ →"}
                              </span>
                              <ArrowRight size={11} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  overflow: "hidden",
                  background: "var(--paper)"
                }}
              >
                {kanbanCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => advanceKanbanCard(card.id)}
                    className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: card.tagBg,
                          color: card.tagColor
                        }}
                      >
                        {card.tag}
                      </span>
                      <span className="text-xs font-semibold truncate">{card.title}</span>
                    </div>
                    <span className="text-[11px] font-semibold shrink-0 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--panel-strong)]">
                      {card.stage === 0
                        ? "To do"
                        : card.stage === 1
                          ? "In progress"
                          : "Done ✓"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ROOM 03: INTERACTIVE CALENDAR ── */}
        {slide.id === "calendar" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-5 gap-2">
              {calendarDays.map((d, idx) => {
                const isSelected = idx === selectedDay;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setSelectedDay(idx)}
                    className="lp-spring-card text-left p-2.5 rounded-xl"
                    style={{
                      border: isSelected
                        ? `2px solid ${d.color}`
                        : "1px solid var(--border)",
                      background: isSelected ? "var(--paper)" : "var(--panel-strong)",
                      boxShadow: isSelected
                        ? "3px 3px 0 rgba(84, 53, 107, 0.15)"
                        : "none"
                    }}
                  >
                    <div className="text-[10px] font-bold" style={{ color: "var(--muted)" }}>
                      {d.day}
                    </div>
                    <div
                      className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: `${d.color}18`,
                        color: d.color
                      }}
                    >
                      {d.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "16px",
                background: "var(--paper)"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold">
                  รายการของวัน {activeDayObj.day}
                </span>
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                  คลิกติ๊กเสร็จจากหน้าปฏิทินได้ทันที
                </span>
              </div>
              <div className="space-y-2">
                {activeDayObj.tasks.map((t) => {
                  const done = calTasksDone.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const willBeDone = !done;
                        setCalTasksDone((prev) =>
                          prev.includes(t.id)
                            ? prev.filter((x) => x !== t.id)
                            : [...prev, t.id]
                        );
                        if (willBeDone && onEarnCoin) {
                          onEarnCoin(t.coins, `เคลียร์ตารางวัน ${activeDayObj.day}!`);
                        }
                      }}
                      className="lp-spring-card w-full flex items-center justify-between p-3 rounded-xl text-left"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--panel-strong)"
                      }}
                    >
                      <span className="flex items-center gap-2.5 text-xs font-medium">
                        {done ? (
                          <Check size={15} className="text-emerald-600" />
                        ) : (
                          <Circle size={15} className="opacity-50" />
                        )}
                        <span
                          style={{
                            textDecoration: done ? "line-through" : "none",
                            opacity: done ? 0.65 : 1
                          }}
                        >
                          {t.title}
                        </span>
                      </span>
                      <span className="text-[11px] font-semibold text-amber-600">
                        {t.time} · +{t.coins}c
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ROOM 04: COLOR-CODED NOTES ── */}
        {slide.id === "notes" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                เลือกสีกระดาษโน้ตที่คุณชอบ:
              </span>
              <div className="flex items-center gap-2">
                {NOTE_PALETTES.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setNoteColorIdx(idx)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-transform"
                    style={{
                      background: p.bg,
                      color: p.text,
                      border:
                        noteColorIdx === idx
                          ? `2px solid ${p.tag}`
                          : `1px solid ${p.border}`,
                      transform: noteColorIdx === idx ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: "note-1",
                  folder: "BRAND STORY",
                  title: "ไอเดียออกแบบหน้า Landing Page สไตล์ Mixtape",
                  body: "ใช้สติกเกอร์วาดมือคู่กับกระดาษโน้ตโทนอุ่น ให้คนเข้ามาลองกดเล่นลูปสะสมเหรียญได้จริงบนหน้าเว็บ"
                },
                {
                  id: "note-2",
                  folder: "WEEKLY SYNC",
                  title: "เช็กลิสต์สิ่งที่ต้องเตรียมก่อนปล่อยอัปเดต",
                  body: "ตรวจความเรียบร้อยทั้งโหมดสว่าง Warm Paper และโหมดมืด Lofi Indigo พร้อมทดสอบเสียงคอร์ดสังเคราะห์"
                }
              ].map((note) => {
                const pinned = pinnedNotes.includes(note.id);
                return (
                  <div
                    key={note.id}
                    className="lp-spring-card flex flex-col justify-between gap-3"
                    style={{
                      border: `2px solid ${activeNoteTheme.border}`,
                      borderRadius: "16px",
                      padding: "16px",
                      background: activeNoteTheme.bg,
                      color: activeNoteTheme.text,
                      boxShadow: "4px 4px 0 rgba(84, 53, 107, 0.12)"
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          style={{
                            fontSize: "9px",
                            letterSpacing: "1.3px",
                            fontWeight: 800,
                            color: activeNoteTheme.tag
                          }}
                        >
                          {note.folder}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPinnedNotes((prev) =>
                              prev.includes(note.id)
                                ? prev.filter((x) => x !== note.id)
                                : [...prev, note.id]
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70"
                        >
                          <Pin size={11} />
                          {pinned ? "ปักหมุดแล้ว" : "ปักหมุด"}
                        </button>
                      </div>
                      <h4
                        className="lp-font-display"
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: 1.35
                        }}
                      >
                        {note.title}
                      </h4>
                      <p className="text-xs mt-2 leading-relaxed opacity-85">
                        {note.body}
                      </p>
                    </div>
                    <div className="text-[10px] font-semibold opacity-75 pt-2 border-t border-black/10">
                      เปิดเทียบข้างบอร์ดงานได้ในคลิกเดียว
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROOM 05: DIARY & HABITS ── */}
        {slide.id === "diary" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "18px",
                background: "var(--paper)"
              }}
              className="flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "1.4px",
                      color: "var(--accent)",
                      fontWeight: 700
                    }}
                  >
                    FRIDAY NIGHT JOURNAL
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDiaryMasked(!isDiaryMasked)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--panel-strong)]"
                  >
                    {isDiaryMasked ? <Eye size={12} /> : <EyeOff size={12} />}
                    {isDiaryMasked ? "แสดงเนื้อหา" : "ซ่อนเนื้อหาส่วนตัว"}
                  </button>
                </div>

                <h4
                  className="lp-font-display"
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    margin: "6px 0",
                    color: "var(--foreground)"
                  }}
                >
                  บันทึกท้ายวันศุกร์ที่แสนสงบ
                </h4>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.7,
                    color: "var(--muted)",
                    filter: isDiaryMasked ? "blur(5px)" : "none",
                    userSelect: isDiaryMasked ? "none" : "auto",
                    transition: "filter 220ms ease"
                  }}
                >
                  &ldquo;วันนี้ลองโฟกัสทีละการ์ดพร้อมเปิดเสียงฝนคลอเบาๆ พอไม่สลับหน้าจอไปดูแชตแล้วงานเสร็จไวกว่าที่คิดเยอะเลย ได้แลกตั๋วดริปกาแฟตอนบ่ายด้วย&rdquo;
                </p>
              </div>

              <div className="text-[11px] pt-2 border-t border-[var(--border)]" style={{ color: "var(--muted)" }}>
                🔒 โหมดส่วนตัวเฉพาะคุณคนเดียว (PDPA Compliant)
              </div>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "18px",
                background: "var(--paper)"
              }}
              className="flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1.4px",
                    color: "var(--accent)",
                    fontWeight: 700
                  }}
                >
                  DAILY HABIT CHECKLIST
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  สำเร็จ {habitsDone.length}/3
                </span>
              </div>

              {[
                "เลือก 3 งานสำคัญที่สุดของวันตอนเช้า",
                "โฟกัสงานหลักโดยไม่สลับแอป 25 นาที",
                "เขียนไดอารี่สรุปวันสั้นๆ ก่อนเข้านอน"
              ].map((text, idx) => {
                const done = habitsDone.includes(idx);
                return (
                  <button
                    key={text}
                    type="button"
                    onClick={() => toggleHabit(idx)}
                    className="lp-spring-card w-full text-left flex items-center justify-between gap-2 p-2.5 rounded-xl"
                    style={{
                      border: "1px solid var(--border)",
                      background: done
                        ? "rgba(16, 185, 129, 0.1)"
                        : "var(--panel-strong)"
                    }}
                  >
                    <span className="flex items-center gap-2 text-xs">
                      {done ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Circle size={14} className="opacity-50 shrink-0" />
                      )}
                      <span
                        style={{
                          textDecoration: done ? "line-through" : "none",
                          opacity: done ? 0.7 : 1
                        }}
                      >
                        {text}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">+10c</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROOM 06: MIXTAPE & ZEN GARDEN ── */}
        {slide.id === "zen-lofi" && (
          <div
            style={{
              borderRadius: "18px",
              padding: "20px",
              background:
                "linear-gradient(135deg, #5942b8 0%, #7858d4 50%, #b184e7 100%)",
              color: "#fff5ff"
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
          >
            <div className="sm:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full bg-white/15">
                <Sparkles size={12} /> BUILT-IN LOFI SYNTHESIZER
              </div>
              <h4
                className="lp-font-display"
                style={{
                  fontSize: "20px",
                  fontWeight: 700
                }}
              >
                เลือกมู้ดเทปคาสเซ็ตที่เข้ากับจังหวะงานของคุณ
              </h4>
              <div className="flex flex-wrap gap-2">
                {["01 · Rainy Cafe", "02 · Midnight Study", "03 · Sunday Vinyl"].map(
                  (mood, idx) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setCassetteMood(idx)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background:
                          cassetteMood === idx
                            ? "#ffecb1"
                            : "rgba(255, 255, 255, 0.14)",
                        color: cassetteMood === idx ? "#432369" : "#fff5ff",
                        border: "1px solid rgba(255, 255, 255, 0.28)"
                      }}
                    >
                      {mood}
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className="lp-press-btn inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: "#fff5fc",
                  color: "#432369",
                  boxShadow: "4px 4px 0 rgba(26, 11, 69, 0.3)"
                }}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>
                  {isPlaying
                    ? "กำลังบรรเลงคอร์ด Lofi สดๆ (คลิกเพื่อพัก)"
                    : "กดเปิดฟังเสียงคอร์ด Lofi ตอนนี้เลย"}
                </span>
              </button>
            </div>

            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/15 border border-white/25 overflow-hidden">
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/30">
                <Image
                  src="/images/landing/cozy-desk-hero.jpg"
                  alt="Cozy Lofi Desk Studio"
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mt-2.5 text-xs text-[#ffecb1] font-semibold">
                <Disc3 size={14} className={isPlaying ? "animate-spin" : undefined} />
                <span>Side A · Cozy Twilight Desk</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
