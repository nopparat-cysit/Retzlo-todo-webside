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
  Database,
  Network,
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
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "source",
      icon: FolderKanban,
      color: "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-dusk-lavender/15 dark:text-dusk-lavender",
      stack: "Next.js App Router + dnd-kit",
      latency: "0ms Optimistic UI",
      details: isEn
        ? "Drag-and-drop workflow stages with WIP limits, story points, and 0ms optimistic UI state transitions."
        : "กระดานลากวางแบ่งสเตจงาน พร้อม WIP Limits, Story Points และ Optimistic UI 0ms",
    },
    {
      id: "table",
      title: isEn ? "Spreadsheet Table" : "ตาราง Spreadsheet",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "source",
      icon: Table,
      color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      stack: "React Virtualized + Prisma",
      latency: "0ms Inline Edits",
      details: isEn
        ? "High-speed multi-assignee task editing grid with 10 custom priority tiers and quick density switching."
        : "ตารางแก้ไขงานด่วนแบบ Inline กำหนดผู้รับผิดชอบหลายคน และ Priority 10 ระดับ",
    },
    {
      id: "calendar",
      title: isEn ? "Calendar & Deadlines" : "ปฏิทิน & วันส่งมอบ",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "source",
      icon: Calendar,
      color: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
      stack: "CSS Grid + Date-fns",
      latency: "< 10ms Client Parse",
      details: isEn
        ? "Card due-date scheduler with sprint roadmap view and instant day creation overview."
        : "จัดตารางและวันครบกำหนดของการ์ด พร้อมมุมมองภาพรวมรายวันสร้างงานด่วน",
    },
    {
      id: "notes",
      title: isEn ? "Notes & Diary Hub" : "บันทึก & ไดอารี่",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "source",
      icon: StickyNote,
      color: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      stack: "Markdown + Draft Storage",
      latency: "Local Auto-save",
      details: isEn
        ? "Personal markdown knowledge base with folder trees, tag filters, and recurring habit streaks."
        : "คลังความรู้ส่วนตัวรองรับ Markdown โครงสร้างโฟลเดอร์ และเช็กลิสต์ประจำวัน",
    },
    {
      id: "hub",
      title: isEn ? "Retzlo Realtime Data Hub" : "ศูนย์ข้อมูลกลาง Retzlo Data Hub",
      badge: isEn ? "Core Engine" : "แกนหลักระบบ",
      type: "hub",
      icon: Database,
      color: "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:bg-dusk-lavender dark:text-ink-950",
      stack: "PostgreSQL (Neon) + Prisma ORM + Pusher WS",
      latency: "~25ms Server Query",
      details: isEn
        ? "Central Postgres database hosted on Neon with Prisma transactions, Pusher WebSockets for 0ms broadcast, and encrypted legal audit logs."
        : "ฐานข้อมูลกลาง PostgreSQL บน Neon ควบคุมด้วย Prisma Transactions, Pusher WebSocket 0ms broadcast และระบบบันทึก Audit Log ทางกฎหมาย",
    },
    {
      id: "workbench",
      title: isEn ? "Work Workbench (UI)" : "หน้าต่างทำงาน (Dual UI)",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "surface",
      icon: LayoutGrid,
      color: "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-dusk-lavender/15 dark:text-dusk-lavender",
      stack: "Tailwind CSS + Retro Lofi Indigo",
      latency: "Responsive 60fps",
      details: isEn
        ? "Unified dual-view UI allowing instant switching between visual Kanban and dense Spreadsheet table."
        : "หน้าต่างทำงานหลักที่สลับได้ระหว่างบอร์ด Kanban เชิงภาพ และ Spreadsheet Table ทันที",
    },
    {
      id: "ai",
      title: isEn ? "Built-in Server AI" : "ผู้ช่วยอัจฉริยะ Server AI",
      badge: isEn ? "Live Zero-Config" : "พร้อมใช้ทันที",
      type: "surface",
      icon: Bot,
      color: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
      stack: "DeepSeek V4 Pro + Native Context",
      latency: "~0.4s Contextual Gen",
      details: isEn
        ? "Context-aware AI Copilot reading live card statuses, generating task checklists, and analyzing project health."
        : "AI Copilot ฉลาดรับรู้บริบทของการ์ดในโปรเจกต์สด ช่วยแตกย่อยงาน และให้คำแนะนำ",
    },
    {
      id: "realtime",
      title: isEn ? "Pusher 0ms Sync" : "Pusher 0ms Real-time",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "surface",
      icon: Activity,
      color: "border-cyan-400 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
      stack: "WebSocket Pusher Protocol",
      latency: "0ms Teammate Sync",
      details: isEn
        ? "WebSocket broadcast channels instantly transmitting card moves, cheers, and edits to teammates."
        : "ช่องทาง WebSocket ที่ส่งผ่านการย้ายการ์ด กด Cheers และการแก้ไขงานให้เพื่อนร่วมทีมทันที 0ms",
    },
    {
      id: "rewards",
      title: isEn ? "Coffee Cheers Economy" : "ระบบเหรียญ Coffee Cheers",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "surface",
      icon: Coffee,
      color: "border-rose-400 bg-rose-50 text-rose-700 dark:bg-dusk-rose/15 dark:text-dusk-rose",
      stack: "Gamification Wallet + Rewards Store",
      latency: "Instant Balance Update",
      details: isEn
        ? "Recognition loop rewarding completed cards with +5 coins for redeeming custom project store items."
        : "ระบบส่งกำลังใจแก่งานที่เสร็จสิ้น สะสมเหรียญรางวัล +5 นำไปแลกของรางวัลในร้านค้า",
    },
    {
      id: "audit",
      title: isEn ? "Encrypted Audit Vault" : "ระบบ Audit Log ตามกฎหมาย",
      badge: isEn ? "PDPA & CCA" : "PDPA พ.ร.บ.คอมฯ",
      type: "surface",
      icon: ShieldCheck,
      color: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      stack: "Append-Only Immutable Ledger",
      latency: "Legal Grade Logging",
      details: isEn
        ? "Append-only immutable audit trail compliant with Thai PDPA Sec 24(5), Computer Crime Act Sec 26, and GDPR Art 6(1)(f)."
        : "บันทึกประวัติการเปลี่ยนแปลงแบบ Append-Only ปลอดภัยตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และ พ.ร.บ. คอมพิวเตอร์",
    },
    {
      id: "exports",
      title: isEn ? "Universal Exporter" : "ระบบส่งออกข้อมูล",
      badge: isEn ? "Live" : "พร้อมใช้",
      type: "surface",
      icon: Download,
      color: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      stack: "JSON / CSV / Markdown Engine",
      latency: "Instant Client Download",
      details: isEn
        ? "Export boards, spreadsheets, and notes into clean JSON, CSV, Markdown, or print views."
        : "ส่งออกข้อมูลบอร์ด ตาราง และโน้ตเป็นไฟล์ JSON, CSV, Markdown หรือพิมพ์ลงกระดาษ",
    },
    {
      id: "mcp",
      title: isEn ? "MCP / AI Connectors" : "ส่วนต่อขยาย MCP Connectors",
      badge: isEn ? "Planned Roadmap" : "กำลังพัฒนา",
      type: "planned",
      icon: Network,
      color: "border-dashed border-stone-300 bg-stone-50 text-stone-600 dark:border-white/20 dark:bg-white/[0.03] dark:text-stone-400",
      stack: "Model Context Protocol Spec",
      latency: "External Agent Ready",
      details: isEn
        ? "Roadmap extension enabling external AI agents (Claude, Cursor, ChatGPT) to query this exact data hub via Model Context Protocol."
        : "แผนการพัฒนาในอนาคต: เชื่อมต่อ AI Agent ภายนอกผ่าน Model Context Protocol (MCP) เข้ากับ Data Hub",
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
              {isEn ? "System Architecture Map" : "แผนผังสถาปัตยกรรมระบบ"}
            </span>
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Workflow className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
            <span>{isEn ? "Retzlo Platform Data Hub Architecture" : "ศูนย์ข้อมูลกลาง Retzlo Platform Data Hub"}</span>
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            {isEn
              ? "All workspace inputs feed into one unified Postgres hub, powering three main surfaces in real time."
              : "ทุกข้อมูลใน Workspace เชื่อมโยงเข้าสู่ Data Hub ศูนย์กลางจุดเดียว เพื่อกระจายสู่พื้นผิวการทำงานแบบ Real-time"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
          <span className="inline-flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>{isEn ? "Solid = Live" : "เส้นทึบ = ใช้งานได้จริง"}</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-stone-500 dark:text-stone-400">
            <span className="h-2 w-2 rounded-full border border-stone-400 border-dashed" />
            <span>{isEn ? "Dashed = Roadmap" : "เส้นประ = กำลังพัฒนา"}</span>
          </span>
        </div>
      </div>

      {/* 3-Column Architecture Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Workspace Sources (Inputs) */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            {isEn ? "1. Inputs & Sources" : "1. แหล่งข้อมูล (Inputs)"}
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

        {/* Center Column: Retzlo Data Hub */}
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
              <Database className="h-6 w-6" />
            </div>

            <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1 bg-white/20 text-white dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              PostgreSQL on Neon
            </span>
            <h4 className="text-sm sm:text-base font-extrabold leading-tight">
              {isEn ? "Retzlo Realtime Data Hub" : "ศูนย์ข้อมูลกลาง Retzlo Data Hub"}
            </h4>
            <p className="mt-1.5 text-[11px] leading-relaxed opacity-90 max-w-xs mx-auto">
              {isEn
                ? "Single Postgres store holding cards, statuses, priorities, logs & tokens."
                : "แกนข้อมูลเดี่ยวที่บันทึกการ์ด, สถานะ, ความสำคัญ, Audit Log และเหรียญรางวัล"}
            </p>

            <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-center gap-3 text-[10px] font-mono opacity-80">
              <span>Prisma ORM</span>
              <span>•</span>
              <span>Pusher 0ms</span>
              <span>•</span>
              <span>PDPA Audit</span>
            </div>
          </button>
        </div>

        {/* Right Column: Output Surfaces & Workbenches */}
        <div className="lg:col-span-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            {isEn ? "2. Surfaces & Intelligence (Outputs)" : "2. ผลลัพธ์ & พื้นผิวการทำงาน (Outputs)"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nodes.filter((n) => n.type === "surface" || n.type === "planned").map((node) => {
              const Icon = node.icon;
              const isSelected = selectedNode === node.id;
              const isPlanned = node.type === "planned";

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs",
                    isSelected
                      ? "ring-2 ring-indigo-500/30 border-indigo-400 bg-indigo-50/90 dark:bg-dusk-lavender/20 shadow-xs font-semibold"
                      : isPlanned
                      ? "border-dashed border-stone-300 bg-stone-50/70 hover:bg-stone-100 dark:border-white/15 dark:bg-white/[0.02]"
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

      {/* Node Technical Inspector Card */}
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

          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 dark:text-stone-400">
            <span>Stack: <strong className="text-stone-800 dark:text-stone-200">{activeNodeInfo.stack}</strong></span>
            <span>•</span>
            <span>Speed: <strong className="text-emerald-600 dark:text-emerald-400">{activeNodeInfo.latency}</strong></span>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          {activeNodeInfo.details}
        </p>
      </div>

      {/* Handoff-inspired Callout Box: Solid vs. Dashed */}
      <DocsCallout
        type="info"
        title={isEn ? "Solid vs. dashed: what's real today across Retzlo" : "เส้นทึบ vs. เส้นประ: สถาปัตยกรรมที่พร้อมใช้งานจริงวันนี้"}
      >
        {isEn ? (
          <p>
            The <strong>solid nodes</strong> (PostgreSQL on Neon, Prisma ORM, 0ms Optimistic UI, Pusher WebSockets, Dual-View Kanban & Spreadsheet, Server AI Copilot, Coffee Cheers Economy, and Encrypted Legal Audit Vault) are <strong>100% live in production today</strong>. The <strong>dashed nodes</strong> (external Model Context Protocol MCP connectors and third-party integrations) represent our architectural roadmap, designed to read and build upon this exact same unified data hub without schema changes.
          </p>
        ) : (
          <p>
            <strong>โหนดเส้นทึบ</strong> (PostgreSQL บน Neon, Prisma ORM, Optimistic UI 0ms, Pusher WebSockets, ระบบมุมมองคู่ Kanban & Spreadsheet, Server AI Copilot, ระบบเหรียญ Coffee Cheers และ Audit Log เข้ารหัสตามกฎหมาย) <strong>เปิดใช้งานจริงในระบบ 100% แล้วในวันนี้</strong> ส่วน<strong>โหนดเส้นประ</strong> (การเชื่อมต่อ Model Context Protocol MCP และเครื่องมือภายนอก) คือทิศทาง Roadmap ที่ออกแบบบนฐานข้อมูล Hub เดียวกันนี้โดยไม่ต้องเปลี่ยนโครงสร้าง
          </p>
        )}
      </DocsCallout>
    </div>
  );
}

