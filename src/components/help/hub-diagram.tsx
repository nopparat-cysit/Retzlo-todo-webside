"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Calendar,
  Coffee,
  Download,
  FolderKanban,
  LayoutGrid,
  ShieldCheck,
  StickyNote,
  Table,
  Activity,
  ArrowUpRight,
  Layers,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocsCallout } from "./docs-primitives";

export function RetzloHubDiagram({ isEn }: { isEn: boolean }) {
  const [selectedNode, setSelectedNode] = useState<string>("hub");

  const nodes = [
    {
      id: "kanban",
      title: isEn ? "Kanban Board" : "กระดาน Kanban",
      badge: isEn ? "Core View" : "มุมมองหลัก",
      type: "source",
      icon: FolderKanban,
      color: "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-dusk-lavender/15 dark:text-dusk-lavender",
      role: isEn ? "Visual Stage Flow" : "ติดตามความคืบหน้าตามขั้นตอน",
      scope: isEn ? "Drag-and-Drop Swimlanes" : "ลากวางการ์ดและจัดคอลัมน์",
      details: isEn
        ? "Drag-and-drop workflow stages with custom columns, WIP limits, story points, and flexible card densities."
        : "กระดานลากวางแบ่งสเตจงาน ปรับแต่งคอลัมน์ กำหนด WIP Limits คะแนนงาน และปรับความหนาแน่นของการ์ดได้อิสระ",
    },
    {
      id: "table",
      title: isEn ? "Spreadsheet Table" : "ตาราง Spreadsheet",
      badge: isEn ? "Core View" : "มุมมองหลัก",
      type: "source",
      icon: Table,
      color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      role: isEn ? "High-Density Scanning" : "กวาดดูข้อมูลปริมาณมาก",
      scope: isEn ? "Inline Cell Editing" : "แก้ไขข้อมูลได้โดยตรงในตาราง",
      details: isEn
        ? "High-speed multi-assignee task editing grid with custom priority tiers and instant hover completion checkboxes."
        : "ตารางแก้ไขงานด่วนแบบ Inline กำหนดผู้รับผิดชอบหลายคน ปรับ Priority และมีปุ่ม Hover Checkbox ติ๊กเสร็จงานทันที",
    },
    {
      id: "calendar",
      title: isEn ? "Calendar & Deadlines" : "ปฏิทิน & วันส่งมอบ",
      badge: isEn ? "Time Hub" : "การจัดการเวลา",
      type: "source",
      icon: Calendar,
      color: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
      role: isEn ? "Deadline Coordination" : "วางแผนกำหนดส่งงาน",
      scope: isEn ? "Month / Week / 3 Days" : "มุมมองเดือน / สัปดาห์ / 3 วัน",
      details: isEn
        ? "Card due-date scheduler with sprint roadmap view, Day View overview modal, and quick date item creation."
        : "จัดตารางและวันครบกำหนดของการ์ด พร้อมมุมมองภาพรวมรายวันสร้างงานด่วน และเลือกเวลาด้วย TimePicker",
    },
    {
      id: "notes",
      title: isEn ? "Notes & Habit Diary" : "สมุดโน้ต & ไดอารี่",
      badge: isEn ? "Life Hub" : "สมดุลชีวิต",
      type: "source",
      icon: StickyNote,
      color: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      role: isEn ? "Knowledge & Well-being" : "บันทึกไอเดียและสร้างนิสัย",
      scope: isEn ? "Folders & Habit Streaks" : "จัดโฟลเดอร์ & สถิติ Streaks",
      details: isEn
        ? "Personal markdown notes with folder structures, tag filters, daily habit routines, and streak analytics."
        : "คลังความรู้ส่วนตัวรองรับ Markdown โครงสร้างโฟลเดอร์ และเช็กลิสต์ประจำวันพร้อมสถิติความสม่ำเสมอ",
    },
    {
      id: "hub",
      title: isEn ? "Retzlo Workspace Ecosystem" : "ระบบพื้นที่ทำงาน Retzlo Workspace",
      badge: isEn ? "Unified Hub" : "ศูนย์กลางระบบ",
      type: "hub",
      icon: Layers,
      color: "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:bg-dusk-lavender dark:text-ink-950",
      role: isEn ? "Central Coordination" : "เชื่อมโยงงานทุกส่วนเข้าด้วยกัน",
      scope: isEn ? "Live Synchronized Workspace" : "พื้นที่ทำงานซิงค์สดเรียลไทม์",
      details: isEn
        ? "Unified workspace environment connecting sprint cards, priorities, notes, habit diaries, and teammates into one seamless experience."
        : "ศูนย์กลางพื้นที่ทำงานที่เชื่อมโยงการ์ดงาน, ความสำคัญ, สมุดโน้ต, ไดอารี่ และเพื่อนร่วมทีมเข้าด้วยกันอย่างราบรื่นแบบเรียลไทม์",
    },
    {
      id: "workbench",
      title: isEn ? "Dual-View Switching" : "สลับมุมมองคู่ทันที",
      badge: isEn ? "Interactive" : "ยืดหยุ่น",
      type: "surface",
      icon: LayoutGrid,
      color: "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-dusk-lavender/15 dark:text-dusk-lavender",
      role: isEn ? "Workflow Versatility" : "เลือกมุมมองตามความถนัด",
      scope: isEn ? "Kanban ⇄ Spreadsheet" : "สลับบอร์ด ⇄ ตาราง",
      details: isEn
        ? "Switch freely between visual Kanban swimlanes and dense spreadsheet tables without losing filters or context."
        : "สลับไปมาระหว่างกระดานคันบันและตารางสเปรดชีตได้อย่างอิสระโดยข้อมูลสอดคล้องกันทันที",
    },
    {
      id: "ai",
      title: isEn ? "Retzlo AI Assistant" : "ผู้ช่วยอัจฉริยะ Retzlo AI",
      badge: isEn ? "Built-in" : "พร้อมใช้ทันที",
      type: "surface",
      icon: Bot,
      color: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
      role: isEn ? "Smart Automation" : "ช่วยคิดและแตกงานอัตโนมัติ",
      scope: isEn ? "Task Breakdown & Summaries" : "ย่อยงาน & สรุปผลโครงการ",
      details: isEn
        ? "Project-aware AI assistant helping decompose complex tasks into actionable checklists and generate executive summaries."
        : "ผู้ช่วย AI ประจำโปรเจกต์ เข้าใจบริบทการ์ดในบอร์ด ช่วยแตกหัวข้อย่อย และสรุปความคืบหน้าให้ผู้บริหาร",
    },
    {
      id: "realtime",
      title: isEn ? "Real-time Collaboration" : "ทำงานร่วมกับทีมเรียลไทม์",
      badge: isEn ? "Team Sync" : "ซิงค์สด",
      type: "surface",
      icon: Activity,
      color: "border-cyan-400 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
      role: isEn ? "Instant Teammate Sync" : "เห็นการเปลี่ยนแปลงพร้อมกัน",
      scope: isEn ? "Live Updates & Activity" : "อัปเดตสด & ประวัติกิจกรรม",
      details: isEn
        ? "Team members see card moves, priority adjustments, and status updates appear immediately on their screens."
        : "สมาชิกในทีมจะเห็นการย้ายการ์ด ปรับระดับความสำคัญ และเปลี่ยนสถานะงานได้ทันทีบนหน้าจอของตนเอง",
    },
    {
      id: "rewards",
      title: isEn ? "Coffee Cheers & Rewards" : "กำลังใจ & รางวัลทีม",
      badge: isEn ? "Morale Loop" : "เสริมพลังใจ",
      type: "surface",
      icon: Coffee,
      color: "border-rose-400 bg-rose-50 text-rose-700 dark:bg-dusk-rose/15 dark:text-dusk-rose",
      role: isEn ? "Peer Recognition" : "ชื่นชมความสำเร็จของทีม",
      scope: isEn ? "Coffee Cheers & Coin Wallet" : "ส่งแก้วกาแฟ & แลกรางวัล",
      details: isEn
        ? "Send Coffee Cheers to celebrate finished milestones, earning coins for redeeming custom team perks in the Rewards Store."
        : "ส่งแก้วกาแฟ Cheers ชื่นชมเมื่องานเสร็จสิ้น สะสมเหรียญรางวัลนำไปแลกของรางวัลหรือกิจกรรมสนุกๆ ประจำโปรเจกต์",
    },
    {
      id: "privacy",
      title: isEn ? "Privacy & Access Control" : "ความเป็นส่วนตัว & สิทธิ์",
      badge: isEn ? "Security" : "ปลอดภัย",
      type: "surface",
      icon: ShieldCheck,
      color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      role: isEn ? "Role & Board Governance" : "จำกัดสิทธิ์และรักษาความลับ",
      scope: isEn ? "Public & Private Boards" : "บอร์ดสาธารณะ & บอร์ดส่วนตัว",
      details: isEn
        ? "Easily configure workspace member privileges (Owner vs Member) and secure sensitive projects with Private Boards."
        : "กำหนดสิทธิ์สมาชิกในโปรเจกต์ได้อย่างชัดเจน และแยกบอร์ดส่วนตัว (Private Boards) สำหรับงานสำคัญเฉพาะบุคคล",
    },
    {
      id: "exports",
      title: isEn ? "Dedicated Board Exporter" : "ระบบส่งออกรายงานครบถ้วน",
      badge: isEn ? "Deliverables" : "พร้อมส่งต่อ",
      type: "surface",
      icon: Download,
      color: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      role: isEn ? "Executive Reports" : "ส่งออกเอกสารรายงาน",
      scope: isEn ? "PDF, PNG, Excel, CSV" : "PDF, รูปภาพ PNG, Excel, CSV",
      details: isEn
        ? "Export full-board panoramic views or executive summary tables in PDF, Retina PNG, Excel, or CSV with zero cropping."
        : "ส่งออกกระดานงานเต็มแผ่นหรือตารางสรุปผู้บริหารเป็นไฟล์ PDF, ภาพความละเอียดสูง PNG, Excel หรือ CSV ได้ครบถ้วน 100%",
    },
  ];

  const activeNodeInfo = nodes.find((n) => n.id === selectedNode) || nodes[4];
  const ActiveNodeIcon = activeNodeInfo.icon;

  return (
    <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-b from-stone-50/80 via-white to-stone-50/30 p-5 sm:p-7 dark:border-white/10 dark:from-ink-950/80 dark:via-ink-950/50 dark:to-ink-950/20 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isEn ? "Workspace Ecosystem Map" : "แผนผังการเชื่อมโยงระบบการทำงาน"}
            </span>
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Workflow className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
            <span>{isEn ? "Retzlo Workspace Workflow Ecosystem" : "ระบบนิเวศพื้นที่ทำงาน Retzlo Workspace"}</span>
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            {isEn
              ? "All workspace modules integrate seamlessly into one unified experience, keeping your team focused and productive."
              : "ทุกโมดูลเชื่อมโยงเป็นหนึ่งเดียวในพื้นที่ทำงาน ช่วยให้คุณและทีมทำงานได้อย่างเป็นระบบและราบรื่น"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>{isEn ? "Click any module to inspect" : "คลิกที่แต่ละโมดูลเพื่อดูรายละเอียด"}</span>
          </span>
        </div>
      </div>

      {/* 3-Column Architecture Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Planning & Sources */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            {isEn ? "1. Planning & Organization" : "1. การวางแผนและจัดการงาน"}
          </p>
          <div className="flex flex-col gap-2">
            {nodes.filter((n) => n.type === "source").map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs",
                    isSelected
                      ? "ring-2 ring-indigo-500/30 border-indigo-400 bg-indigo-50/90 dark:bg-dusk-lavender/20 shadow-xs font-semibold"
                      : "border-stone-200/90 bg-white hover:border-indigo-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("grid h-6 w-6 place-items-center rounded-lg border shrink-0", node.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate text-stone-900 dark:text-stone-100">{node.title}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-stone-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Central Workspace Ecosystem */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
          <button
            type="button"
            onClick={() => setSelectedNode("hub")}
            className={cn(
              "w-full relative group p-5 rounded-2xl border-2 text-center transition-all cursor-pointer shadow-md",
              selectedNode === "hub"
                ? "border-indigo-500 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/20 dark:from-[#211f46] dark:to-[#161533] dark:border-dusk-lavender"
                : "border-indigo-300/80 bg-white hover:border-indigo-500 dark:border-white/20 dark:bg-ink-950/80"
            )}
          >
            {/* Glowing Accent Ring */}
            <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500" />
            </div>

            <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-xs mb-3 shadow-inner">
              <Layers className="h-6 w-6" />
            </div>

            <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 bg-white/20 text-white dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              Modular Life & Work
            </span>
            <h4 className="text-sm sm:text-base font-extrabold leading-tight">
              {isEn ? "Retzlo Workspace Ecosystem" : "ระบบพื้นที่ทำงาน Retzlo Workspace"}
            </h4>
            <p className="mt-1.5 text-[11px] leading-relaxed opacity-90 max-w-xs mx-auto">
              {isEn
                ? "Unified platform connecting task boards, priorities, routines, and team members."
                : "แพลตฟอร์มที่เชื่อมโยงกระดานงาน, ความสำคัญ, กิจวัตรชีวิต และทีมงานเข้าด้วยกันอย่างลงตัว"}
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-center gap-3 text-[10px] opacity-80">
              <span>Real-time Sync</span>
              <span>•</span>
              <span>Built-in AI</span>
              <span>•</span>
              <span>Public / Private</span>
            </div>
          </button>
        </div>

        {/* Right Column: Output Surfaces & Workbenches */}
        <div className="lg:col-span-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            {isEn ? "2. Intelligence & Productivity" : "2. เครื่องมือช่วยทำงานและผลลัพธ์"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nodes.filter((n) => n.type === "surface").map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs",
                    isSelected
                      ? "ring-2 ring-indigo-500/30 border-indigo-400 bg-indigo-50/90 dark:bg-dusk-lavender/20 shadow-xs font-semibold"
                      : "border-stone-200/90 bg-white hover:border-indigo-300 hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("grid h-6 w-6 place-items-center rounded-lg border shrink-0", node.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-stone-900 dark:text-stone-100 font-medium">
                        {node.title}
                      </span>
                      <span className="block text-[9px] text-stone-500 dark:text-stone-400 truncate">
                        {node.badge}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-stone-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Node Inspector Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 dark:border-white/10 dark:bg-ink-950/70 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={cn("grid h-7 w-7 place-items-center rounded-lg border", activeNodeInfo.color)}>
              <ActiveNodeIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {activeNodeInfo.title}
              </span>
              <span className="ms-2 rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-400">
                {activeNodeInfo.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
            <span>{isEn ? "Role:" : "บทบาท:"} <strong className="text-stone-800 dark:text-stone-200">{activeNodeInfo.role}</strong></span>
            <span>•</span>
            <span>{isEn ? "Scope:" : "ขอบเขต:"} <strong className="text-indigo-600 dark:text-dusk-lavender">{activeNodeInfo.scope}</strong></span>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          {activeNodeInfo.details}
        </p>
      </div>

      {/* Guidance Callout */}
      <DocsCallout
        type="info"
        title={isEn ? "Seamless modular synchronization" : "การทำงานร่วมกันแบบไร้รอยต่อระหว่างทุกโมดูล"}
      >
        {isEn ? (
          <p>
            Every task, priority setting, and habit in Retzlo updates <strong>instantly across all views</strong>. Whether you prefer the visual swimlanes of Kanban boards, the fast bulk scanning of Spreadsheet tables, or the deadline clarity of the Calendar, all your work remains perfectly coordinated in real time.
          </p>
        ) : (
          <p>
            ทุกการ์ดงาน ระดับความสำคัญ และกิจวัตรใน Retzlo จะได้รับการ<strong>เชื่อมโยงตรงกันแบบเรียลไทม์</strong> ไม่ว่าคุณจะถนัดการมองเห็นภาพรวมด้วยกระดาน Kanban, การกวาดดูข้อมูลปริมาณมากในตาราง Spreadsheet หรือการวางแผนกำหนดส่งในปฏิทิน ข้อมูลทั้งหมดจะตรงกันเสมอในทุกมุมมอง
          </p>
        )}
      </DocsCallout>
    </div>
  );
}
