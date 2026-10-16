"use client";

import Image from "next/image";
import {
  Calendar,
  FileText,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Music,
  Search,
  Star,
  Flame
} from "lucide-react";
import type { WalkthroughSlide } from "./landing-data";

export function WalkthroughMockupScreen({
  slide,
  isPlaying,
  onToggleAudio
}: {
  slide: WalkthroughSlide;
  isPlaying: boolean;
  onToggleAudio: () => void;
}) {
  return (
    <div className="relative w-full h-full min-h-[370px] sm:min-h-[410px] bg-[#0b0a1d] text-[#f5efe6] rounded-2xl overflow-hidden border border-[#a9a2ff]/20 shadow-[0_24px_64px_rgba(0,0,0,0.45)] flex flex-col justify-between p-5 sm:p-6 select-none">
      {/* Subtle Ambient Glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-25 transition-colors duration-500"
        style={{ background: slide.accent }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-15 transition-colors duration-500"
        style={{ background: "#a9a2ff" }}
      />

      {/* Top Studio Window Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-[#a9a2ff]/12 pb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d59ab3]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e5bd72]/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#89c7d6]/60" />
          </div>
          <div className="h-3.5 w-px bg-[#a9a2ff]/15" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-4 h-4 shrink-0">
              <Image
                src={slide.sticker}
                alt={slide.tabName}
                fill
                sizes="16px"
                className="object-contain"
              />
            </div>
            <span className="text-xs font-medium text-[#f5efe6] truncate">
              {slide.subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#a9a2ff]/15 bg-[#14122d] px-2.5 py-1 text-[10px] font-mono text-[#a8a29e]">
            <Search className="w-3 h-3 text-[#a9a2ff]" />
            <span>Cmd + K</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#e5bd72]/30 bg-[#e5bd72]/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-[#e5bd72]">
            <span>+240 Coins</span>
          </div>
        </div>
      </div>

      {/* Center Dynamic Module Preview Body */}
      <div className="relative z-10 my-5 flex-1 flex flex-col justify-center">
        {slide.id === "workspaces" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Left Agenda Mini Rail */}
            <div className="rounded-xl border border-[#a9a2ff]/15 bg-[#12112a]/90 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#89c7d6]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Agenda 7 วัน
                </span>
                <span className="rounded-full bg-[#89c7d6]/15 px-2 py-0.5 text-[10px] font-mono">
                  3 งาน
                </span>
              </div>
              {[
                { title: "ส่งมอบดีไซน์ระบบ v2", time: "วันนี้ · 16:00", color: "#e5bd72" },
                { title: "อัปเดตแคมเปญการตลาด", time: "พรุ่งนี้ · 10:30", color: "#a9a2ff" },
                { title: "รีวิวเป้าหมายรายสัปดาห์", time: "ศุกร์ · ทั้งวัน", color: "#89c7d6" }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-[#a9a2ff]/10 bg-[#0d0c20] p-2.5 text-xs"
                >
                  <p className="font-medium text-[#f5efe6] truncate">{item.title}</p>
                  <p className="text-[10px] font-mono mt-1" style={{ color: item.color }}>
                    {item.time}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Workspace Cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  name: "Retzlo Product Studio",
                  type: "WORK MODULE",
                  progress: 78,
                  boards: "4 บอร์ด · 18 การ์ด",
                  accent: "#a9a2ff",
                  sticker: "/stickers/retro/retro-sticker-13-project-folder.png"
                },
                {
                  name: "Second Brain & Life",
                  type: "PERSONAL OS",
                  progress: 92,
                  boards: "3 บอร์ด · 24 โน้ต",
                  accent: "#e5bd72",
                  sticker: "/stickers/retro/retro-sticker-20-sparkles.png"
                }
              ].map((ws) => (
                <div
                  key={ws.name}
                  className="rounded-xl border border-[#a9a2ff]/15 bg-[#15132e] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                        style={{
                          color: ws.accent,
                          borderColor: `${ws.accent}40`,
                          backgroundColor: `${ws.accent}12`
                        }}
                      >
                        {ws.type}
                      </span>
                      <Star className="w-3.5 h-3.5 text-[#e5bd72] fill-[#e5bd72]" />
                    </div>
                    <div className="mt-3.5 flex items-center gap-2.5">
                      <div className="relative w-7 h-7 shrink-0">
                        <Image
                          src={ws.sticker}
                          alt={ws.name}
                          fill
                          sizes="28px"
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#f5efe6]">{ws.name}</h4>
                        <p className="text-[11px] text-[#a8a29e]">{ws.boards}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#a9a2ff]/10">
                    <div className="flex justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-[#a8a29e]">Progress</span>
                      <span style={{ color: ws.accent }}>{ws.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#090817] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${ws.progress}%`, background: ws.accent }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.id === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                col: "TODO",
                color: "#a9a2ff",
                cards: [
                  { title: "ออกแบบโครงสร้าง Database", badge: "AI Breakdown · 4 ขั้นตอน", pts: "+15c" },
                  { title: "เขียนสคริปต์วิดีโอเปิดตัว", badge: "วันนี้", pts: "+10c" }
                ]
              },
              {
                col: "DOING",
                color: "#e5bd72",
                cards: [
                  { title: "พัฒนาหน้า Landing Page", badge: "กำลังทำ · 75%", pts: "+25c" },
                  { title: "ปรับจูนเสียงสังเคราะห์ Lofi", badge: "Web Audio API", pts: "+15c" }
                ]
              },
              {
                col: "DONE",
                color: "#89c7d6",
                cards: [
                  { title: "ระบบสวนเซน Zen Garden", badge: "สำเร็จ ✓", pts: "+30c" },
                  { title: "รองรับ Mac Retina & Safari", badge: "สำเร็จ ✓", pts: "+20c" }
                ]
              }
            ].map((lane) => (
              <div
                key={lane.col}
                className="rounded-xl border border-[#a9a2ff]/15 bg-[#13112b] p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono font-semibold uppercase tracking-widest"
                    style={{ color: lane.color }}
                  >
                    {lane.col}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: lane.color, boxShadow: `0 0 8px ${lane.color}` }}
                  />
                </div>
                {lane.cards.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-lg border border-[#a9a2ff]/12 bg-[#0b0a1a] p-2.5 space-y-1.5"
                  >
                    <p className="text-xs font-medium text-[#f5efe6]">{c.title}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#a8a29e]">{c.badge}</span>
                      <span className="text-[#e5bd72]">{c.pts}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {slide.id === "calendar" && (
          <div className="rounded-xl border border-[#a9a2ff]/15 bg-[#121028] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#f5efe6] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#89c7d6]" />
                ตุลาคม 2026 · ปฏิทินรวมการ์ด โน้ต และไดอารี่
              </span>
              <div className="flex gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#a9a2ff]/15 text-[#a9a2ff]">Todo</span>
                <span className="px-2 py-0.5 rounded bg-[#e5bd72]/15 text-[#e5bd72]">Doing</span>
                <span className="px-2 py-0.5 rounded bg-[#89c7d6]/15 text-[#89c7d6]">Done</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="text-[10px] font-mono text-[#78716c] py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: 14 }).map((_, idx) => {
                const day = idx + 12;
                const hasTask = idx === 2 || idx === 4 || idx === 7 || idx === 10;
                return (
                  <div
                    key={day}
                    className={`rounded-lg border p-1.5 min-h-[52px] text-left flex flex-col justify-between ${
                      idx === 4
                        ? "border-[#89c7d6]/50 bg-[#89c7d6]/10"
                        : "border-[#a9a2ff]/10 bg-[#0d0c20]"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#a8a29e]">{day}</span>
                    {hasTask && (
                      <span
                        className="truncate rounded px-1 py-0.5 text-[9px] font-medium"
                        style={{
                          backgroundColor:
                            idx === 4 ? "#e5bd7225" : idx === 7 ? "#a9a2ff25" : "#89c7d625",
                          color: idx === 4 ? "#e5bd72" : idx === 7 ? "#a9a2ff" : "#89c7d6"
                        }}
                      >
                        {idx === 4 ? "ส่งงานหลัก" : idx === 7 ? "ประชุมทีม" : "ไดอารี่ ✓"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {slide.id === "notes" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                folder: "Pinned",
                title: "คู่มือสไตล์แบรนด์ & โทนสี",
                excerpt: "รวบรวมโค้ดสี Retro Lofi Indigo และฟอนต์หลักสำหรับใช้ทุกแคมเปญ...",
                color: "#d59ab3"
              },
              {
                folder: "Ideas",
                title: "โครงสร้างระบบ AI Automation",
                excerpt: "1. ปูพื้นฐานการวางระบบ 2. เชื่อมต่อฐานข้อมูล 3. เวิร์กชอปลงมือทำ...",
                color: "#e5bd72"
              },
              {
                folder: "Knowledge",
                title: "Second Brain — สรุปแก่นสำคัญ",
                excerpt: "หลักการ CODE: Capture, Organize, Distill, Express เพื่อลดภาระสมอง...",
                color: "#89c7d6"
              }
            ].map((note) => (
              <div
                key={note.title}
                className="rounded-xl border border-[#a9a2ff]/15 bg-[#15132e] p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span
                    className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${note.color}20`, color: note.color }}
                  >
                    {note.folder}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#f5efe6]">{note.title}</h4>
                  <p className="text-[11px] text-[#a8a29e] leading-relaxed">{note.excerpt}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#78716c] pt-2 border-t border-[#a9a2ff]/10">
                  <span>Instant Search</span>
                  <FileText className="w-3.5 h-3.5" style={{ color: note.color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.id === "diary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-[#a9a2ff]/15 bg-[#14122d] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#e5bd72] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  บันทึกประจำวัน · 16 ต.ค.
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#89c7d6]/15 text-[#89c7d6]">
                  Private
                </span>
              </div>
              <p className="text-xs text-[#d6d3d1] leading-relaxed">
                &ldquo;วันนี้โฟกัสงานใหญ่เสร็จตั้งแต่บ่ายสอง เพราะเปิดโหมด Today Filter แล้วไล่ทำทีละการ์ด ตอนเย็นได้เอาเหรียญไปแลกเวลาพัก รู้สึกสมองโล่งขึ้นมาก&rdquo;
              </p>
            </div>
            <div className="rounded-xl border border-[#e5bd72]/25 bg-[#16142e] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#f5efe6]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#e5bd72]" />
                  Habit Checklist
                </span>
                <span className="font-mono text-[#89c7d6]">3/3 สำเร็จ (+15c)</span>
              </div>
              {[
                "วางแผน Today Tasks ตอนเช้า 5 นาที",
                "โฟกัสงานสำคัญด้วย Pomodoro 2 รอบ",
                "เคลียร์ Inbox โน้ตก่อนปิดคอม"
              ].map((habit) => (
                <div
                  key={habit}
                  className="flex items-center gap-2 rounded-lg bg-[#0d0c20] border border-[#a9a2ff]/10 px-3 py-1.5 text-xs text-[#d6d3d1]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#89c7d6] shrink-0" />
                  <span className="line-through opacity-75">{habit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.id === "rewards" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                name: "พักเบรกกาแฟดริปแก้วโปรด",
                cost: "50 Coins",
                desc: "พักสายตาจากหน้าจอ 20 นาทีไปชงกาแฟและฟังเพลงสบาย ๆ",
                sticker: "/stickers/retro/retro-sticker-10-coffee-cup.png"
              },
              {
                name: "ดูซีรีส์ / อนิเมะ 1 ตอน",
                cost: "100 Coins",
                desc: "รางวัลหลังเคลียร์การ์ดงานยากประจำวันสำเร็จ",
                sticker: "/stickers/retro/retro-sticker-27-ramen-bowl.png"
              },
              {
                name: "ซื้อของขวัญพิเศษให้ตัวเอง",
                cost: "500 Coins",
                desc: "ฉลองปิดโปรเจกต์ใหญ่ประจำเดือนด้วยของที่อยากได้",
                sticker: "/stickers/retro/retro-sticker-18-gift.png"
              }
            ].map((reward) => (
              <div
                key={reward.name}
                className="rounded-xl border border-[#a9a2ff]/15 bg-[#14122d] p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src={reward.sticker}
                      alt={reward.name}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#f5efe6]">{reward.name}</h4>
                    <p className="text-[11px] text-[#a8a29e] mt-1">{reward.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#a9a2ff]/10">
                  <span className="text-xs font-mono font-semibold text-[#e5bd72]">{reward.cost}</span>
                  <span className="rounded-lg bg-[#a9a2ff]/15 border border-[#a9a2ff]/30 px-2.5 py-0.5 text-[10px] font-medium text-[#a9a2ff]">
                    Redeem
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.id === "zen-lofi" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-center">
            <div className="rounded-xl border border-[#a9a2ff]/20 bg-[#14122e] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#a9a2ff] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Solitary Zen Garden
                </span>
                <span className="text-[10px] font-mono text-[#e5bd72]">528 Hz Solfeggio</span>
              </div>
              <p className="text-xs text-[#d6d3d1] leading-relaxed">
                คลิกผืนทรายเพื่อสร้างระลอกคลื่นน้ำ รดน้ำต้นบอนไซและซากุระทุกวันเพื่อรับโบนัสความสงบ พร้อมโหมดฝึกหายใจ Box Breathing 4-4-4-4
              </p>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#0b0a1a] border border-[#a9a2ff]/15 text-[#d6d3d1]">ไผ่กวนอิม</span>
                <span className="px-2 py-0.5 rounded bg-[#0b0a1a] border border-[#a9a2ff]/15 text-[#d6d3d1]">บอนไซโบราณ</span>
                <span className="px-2 py-0.5 rounded bg-[#d59ab3]/15 text-[#d59ab3]">ซากุระพันปี</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5bd72]/25 bg-[#16132c] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#e5bd72] flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  Retzlo Cassette C-60 & Pomodoro
                </span>
                <span className="text-xs font-mono font-semibold text-[#e5bd72]">25:00</span>
              </div>
              <p className="text-xs text-[#d6d3d1]">
                เปิดเสียงดนตรี Lofi สังเคราะห์สดจากเบราว์เซอร์ขณะทำงานได้ทันที:
              </p>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
                  isPlaying
                    ? "bg-[#d59ab3]/15 border border-[#d59ab3]/40 text-[#d59ab3]"
                    : "bg-[#a9a2ff] text-[#080817] shadow-lg shadow-[#a9a2ff]/20 hover:opacity-95"
                }`}
              >
                <span>{isPlaying ? "⏸ Stop Lofi Radio" : "▶ Play Focus Beats"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar inside Mockup */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-[#a9a2ff]/12 pt-3 text-[11px] font-mono text-[#a8a29e]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#89c7d6]" />
          <span>พร้อมใช้งานบนเว็บทันที · รองรับทั้ง Dark Lofi & Warm Paper</span>
        </div>
        <div className="flex items-center gap-2 text-[#d6d3d1]">
          <span>Optimistic UI</span>
          <span>·</span>
          <span>TH / EN</span>
        </div>
      </div>
    </div>
  );
}
