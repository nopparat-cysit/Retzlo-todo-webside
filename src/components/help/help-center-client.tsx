"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Copy,
  Download,
  FileText,
  Filter,
  Flag,
  Flame,
  FolderKanban,
  HelpCircle,
  Keyboard,
  Layers,
  LayoutGrid,
  ListChecks,
  Menu,
  MessageSquare,
  Play,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  StickyNote,
  Table,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface WorkflowStep {
  step: string;
  title: string;
  desc: string;
}

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface GuideTopic {
  id: string;
  category: "overview" | "ai" | "kanban" | "gamification" | "calendar" | "notes" | "security" | "shortcuts" | "faq";
  icon: typeof BookOpen;
  title: string;
  badge?: string;
  badgeColor?: string;
  scopeBadge?: string;
  summary: string;
  readingTime?: string;
  lastUpdated?: string;
  concept?: string;
  highlights: string[];
  workflowSteps?: WorkflowStep[];
  technicalSpecs?: TechnicalSpec[];
  tips?: string;
  codeOrShortcut?: string;
  relatedTopicIds?: string[];
  demoType?: "architecture" | "ai-chat" | "kanban-table" | "priorities" | "timepicker" | "coffee" | "export" | "habits" | "permissions" | "shortcuts";
}

export const CATEGORIES = [
  { id: "all", label: "🌟 ทั้งหมด", fullLabel: "ทุกหมวดหมู่ (All Topics)" },
  { id: "overview", label: "🌟 เริ่มต้น", fullLabel: "ภาพรวมระบบ (Getting Started)" },
  { id: "ai", label: "🤖 ผู้ช่วย AI", fullLabel: "ผู้ช่วย AI (AI & Automation)" },
  { id: "kanban", label: "📋 บอร์ด & ตาราง", fullLabel: "บอร์ด & ตาราง (Boards & Views)" },
  { id: "gamification", label: "☕ เชียร์ & เหรียญ", fullLabel: "Cheers & รางวัล (Gamification)" },
  { id: "calendar", label: "📅 ปฏิทิน & เวลา", fullLabel: "ปฏิทิน & เวลา (Calendar & Time)" },
  { id: "notes", label: "📝 โน้ต & ไดอารี่", fullLabel: "โน้ต & ไดอารี่ (Notes & Diary)" },
  { id: "security", label: "👥 สมาชิก & สิทธิ์", fullLabel: "สมาชิก & สิทธิ์ (Access & Settings)" },
  { id: "shortcuts", label: "⌨️ คีย์ลัด", fullLabel: "คีย์ลัดระบบ (Keyboard Shortcuts)" },
  { id: "faq", label: "❓ ถาม-ตอบ", fullLabel: "คำถามที่พบบ่อย (FAQ & Help)" },
] as const;

export const SYSTEM_PILLARS = [
  {
    id: "kanban-boards",
    title: "Work Module",
    subtitle: "บอร์ด Kanban & ตาราง Spreadsheet",
    icon: FolderKanban,
    tag: "Dual View",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    id: "ai-assistant",
    title: "Retzlo AI",
    subtitle: "ผู้ช่วยอัจฉริยะในตัว & Breakdown",
    icon: Bot,
    tag: "Zero-Config",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "card-attributes-customization",
    title: "Attributes & Export",
    subtitle: "สถานะ, ความสำคัญ & ส่งออกเอกสาร",
    icon: SlidersHorizontal,
    tag: "Custom 10-Levels",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
  },
  {
    id: "calendar-due-dates",
    title: "Calendar & Time",
    subtitle: "ปฏิทินงาน & Retro TimePicker",
    icon: Calendar,
    tag: "Linear Scroller",
    color: "text-amber-600 bg-amber-50 dark:bg-dusk-amber/10 border-amber-200 dark:border-dusk-amber/25",
  },
  {
    id: "coffee-cheers-rewards",
    title: "Gamification",
    subtitle: "Coffee Cheers & ร้านค้าของรางวัล",
    icon: Coffee,
    tag: "Coffee + Coins",
    color: "text-rose-600 bg-rose-50 dark:bg-dusk-rose/10 border-rose-200 dark:border-dusk-rose/25",
  },
  {
    id: "notes-diary-hub",
    title: "Life Hub",
    subtitle: "สมุดโน้ต, ไดอารี่ & สถิติ Streaks",
    icon: StickyNote,
    tag: "Streak Habits",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20",
  },
];

export const TOPICS: GuideTopic[] = [
  {
    id: "welcome-overview",
    category: "overview",
    icon: Compass,
    title: "ยินดีต้อนรับสู่ Retzlo Platform & สถาปัตยกรรมระบบ",
    badge: "Getting Started",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-600 dark:text-dusk-lavender",
    scopeBadge: "ภาพรวมระบบ",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "แพลตฟอร์มบริหารจัดการชีวิตและการทำงาน (Modular Life & Work Management) สไตล์ Retro Lofi Indigo ผสานขุมพลัง AI และความสามารถระดับองค์กร ทำงานแบบเรียลไทม์ 0ms",
    concept:
      "Retzlo ออกแบบมาภายใต้ปรัชญา Modular Architecture ที่ผสมผสานการบริหารงานโปรเจกต์ระดับมืออาชีพ เข้ากับการติดตามกิจวัตรและสุขภาพจิตในชีวิตประจำวัน โดยใช้โทนสี Retro Lofi Indigo ที่สบายสายตา และไม่สร้างความเครียดระหว่างการทำงานต่อเนื่องเป็นเวลานาน ทุกโมดูลเชื่อมโยงกันอย่างสมบูรณ์แบบ",
    highlights: [
      "สถาปัตยกรรมโมดูลาร์ (Modular Architecture): แยกส่วนระบบชัดเจน ทั้ง Work Module (Kanban/Table), Calendar, Notes Hub, Habit Diary, และ Rewards Store",
      "การเชื่อมต่อแบบเรียลไทม์ 0ms: ซิงค์การเคลื่อนย้ายการ์ดและข้อมูลระหว่างเพื่อนร่วมทีมทุกคนทันทีด้วย Pusher WebSocket และ Optimistic UI 0ms",
      "ขุมพลัง Retzlo AI ในตัว (Built-in Server AI): ผู้ช่วยอัจฉริยะระดับเซิร์ฟเวอร์ พร้อมใช้งานทันทีแบบอัตโนมัติ 100% เชื่อมต่อและทำงานได้ทันทีโดยไม่ต้องตั้งค่าใดๆ ให้ยุ่งยาก",
      "ความปลอดภัยและความเป็นส่วนตัว: รองรับ Workspace Owner, Member และระบบ Private Boards สำหรับข้อมูลลับเฉพาะบุคคล",
      "ระบบ Theme คู่: รองรับทั้ง Dark Mode (Retro Lofi Indigo) และ Light Mode (Warm Paper) พร้อมโหมด System ตามอุปกรณ์",
      "มาตรฐานความปลอดภัย AGENTS.md: ทุกการลบหรือแก้ไขข้อมูลสำคัญมี ConfirmModal ปกป้อง และแจ้งเตือนผลลัพธ์ผ่าน Toast สม่ำเสมอ",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "สร้างหรือเข้าร่วม Workspace",
        desc: "เข้าสู่แดชบอร์ดสร้างโปรเจกต์ใหม่ กำหนดไอคอนและภาพปก หรือตอบรับคำเชิญจากทีมผ่านลิงก์",
      },
      {
        step: "02",
        title: "จัดโครงสร้างกระดานงาน (Kanban & Table)",
        desc: "เพิ่มคอลัมน์ ปรับแม่แบบสถานะ (Workflow Templates) และเลือกมุมมองบอร์ด Kanban หรือตาราง Spreadsheet",
      },
      {
        step: "03",
        title: "ผสานรวม AI ช่วยเหลือรอบด้าน",
        desc: "เปิดคุยกับ Retzlo AI เพื่อแตกการ์ดย่อย (AI Breakdown) หรือสรุปภาพรวมบอร์ด (AI Summary)",
      },
      {
        step: "04",
        title: "เชื่อมโยงกับปฏิทินและไดอารี่ชีวิต",
        desc: "ติดตามกำหนดส่งงานในปฏิทิน และบันทึกกิจวัตรประจำวันใน Diary Hub เพื่อสร้างสมดุล Work-Life",
      },
    ],
    technicalSpecs: [
      { label: "Architecture", value: "Next.js App Router + Modular Architecture" },
      { label: "Real-time Engine", value: "Pusher WebSocket (0ms Optimistic UI)" },
      { label: "Database & ORM", value: "Neon PostgreSQL + Prisma ORM" },
      { label: "AI Integration", value: "Built-in Server AI (Zero-Config Native)" },
      { label: "Design System", value: "Retro Lofi Indigo (Tailwind Semantic Tokens)" },
    ],
    tips: "สามารถสลับธีมสีระหว่าง Dark, Light หรือ System ได้ทุกเมื่อผ่านเมนูที่รูปโปรไฟล์ของคุณที่มุมบนขวา",
    relatedTopicIds: ["kanban-boards", "ai-assistant", "spreadsheet-table-view", "roles-and-security"],
    demoType: "architecture",
  },
  {
    id: "ai-assistant",
    category: "ai",
    icon: Bot,
    title: "ผู้ช่วยอัจฉริยะ Retzlo AI",
    badge: "AI Powered",
    badgeColor: "border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender",
    scopeBadge: "ระบบช่วยเหลืออัตโนมัติ",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "ผู้ช่วย AI ประจำโปรเจกต์ ช่วยวิเคราะห์ สรุปงาน และร่างการ์ดงานอัตโนมัติแบบ Multi-turn พร้อมใช้งานทันทีในระบบแบบ Zero-Config",
    concept:
      "Retzlo AI ถูกออกแบบมาให้เป็นเสมือน Scrum Master และผู้ช่วยประจำโปรเจกต์ของคุณ โดยดึงข้อมูลโครงสร้างบอร์ด รายการการ์ด สมาชิกผู้รับผิดชอบ และสถานะปัจจุบันมาวิเคราะห์อย่างรอบด้าน ไม่ใช่เพียงแค่แชทบอทตอบคำถามทั่วไป พร้อมระบบความปลอดภัยพรีวิวยืนยันก่อนสร้างงานจริง",
    highlights: [
      "พร้อมใช้งานทันที (Built-in Server AI): ผู้ช่วย AI อัจฉริยะในตัว เชื่อมต่อระดับเซิร์ฟเวอร์แบบเบ็ดเสร็จ ไม่ต้องตั้งค่าใดๆ",
      "เปิดใช้งานด่วน: คลิกไอคอน 🤖 ที่แถบด้านบนข้างรูปโปรไฟล์ หรือใช้ปุ่มลอยด่วนได้ทุกหน้าจอ",
      "รูปแบบ Responsive อัจฉริยะ: บนจอคอมพิวเตอร์จะเปิดเป็น Side Panel สไตล์ Gemini ตรึงขอบขวา และปรับเป็น Floating Chatbox บนจอมือถือ/แท็บเล็ตโดยอัตโนมัติ",
      "ไม่บดบังเครื่องมืออื่น: ปุ่มดาว FAB Hub ที่มุมล่างจะขยับหลบกล่องแชทอย่างราบรื่น ไม่บดบังปุ่มพิมพ์",
      "เข้าใจบริบทโปรเจกต์: สามารถถามว่า 'งานไหนยังค้างอยู่บ้าง?', 'ใครรับผิดชอบงานเยอะที่สุด?' หรือ 'สรุปงานของสัปดาห์นี้ให้หน่อย' ได้ทันที",
      "AI Card Creation: สั่งสร้างการ์ดงานลงบอร์ดผ่านแชท พร้อมระบบพรีวิวยืนยันรายการก่อนบันทึกจริงเพื่อความปลอดภัย",
      "Quick Starter Prompts: มีปุ่มคำถามสำเร็จรูปให้กดถามได้อย่างรวดเร็วในคลิกเดียว",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดกล่องสนทนา AI",
        desc: "คลิกไอคอน 🤖 บนแถบ Topbar ด้านบน หรือกดปุ่มลัด 'ถาม AI' บนหน้าจอ",
      },
      {
        step: "02",
        title: "สั่งการหรือสอบถามข้อมูลโปรเจกต์",
        desc: "พิมพ์คำถามเกี่ยวกับสถานะงาน ค้นหางานคั่งค้าง หรือสั่งให้ 'ช่วยร่างการ์ดงานทำระบบ Login ให้หน่อย'",
      },
      {
        step: "03",
        title: "ตรวจสอบและกดยืนยัน (Preview Modal)",
        desc: "เมื่อ AI นำเสนอร่างการ์ดงาน ตรวจสอบหัวข้อและคอลัมน์เป้าหมาย จากนั้นกดยืนยันเพื่อบันทึกลงบอร์ดทันที",
      },
    ],
    technicalSpecs: [
      { label: "AI Engine", value: "Native Deep Intelligence (Chat & Structured JSON)" },
      { label: "Configuration", value: "Zero Setup (100% Server Managed)" },
      { label: "Context Scope", value: "Project, Boards, Columns, Cards, Assignees" },
      { label: "Adaptive Docking", value: "Desktop Side Panel / Mobile Floating Chat" },
    ],
    tips: "บนหน้าจอคอมพิวเตอร์ สามารถกดปุ่มสลับมุมมองระหว่างแถบข้าง (Side Panel) และกล่องลอยขวาล่างได้ตามความถนัด โดยระบบ AI มีพร้อมใช้งานทันทีแบบเบ็ดเสร็จในตัว",
    relatedTopicIds: ["ai-breakdown-summary", "kanban-boards", "keyboard-shortcuts"],
    demoType: "ai-chat",
  },
  {
    id: "ai-breakdown-summary",
    category: "ai",
    icon: Sparkles,
    title: "ฟีเจอร์ AI Auto-Breakdown & Executive Summary",
    badge: "Automation",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    scopeBadge: "ย่อยงาน & สรุปผล",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "เปลี่ยนชิ้นงานขนาดใหญ่ให้กลายเป็น Action Items ที่จับต้องได้ พร้อมสรุปสุขภาพโครงการสำหรับผู้บริหารและทีม",
    concept:
      "การจัดการโครงการที่มีประสิทธิภาพเริ่มต้นจากการย่อยงานขนาดใหญ่ (Epics/Tasks) ให้กลายเป็นขั้นตอนย่อยที่สามารถลงมือทำได้จริง และการติดตามภาพรวมคอขวดของทีมผ่านรายงานสรุปแบบกระชับ ช่วยประหยัดเวลาการวางแผนได้ถึง 80%",
    highlights: [
      "AI Task Breakdown: คลิกปุ่ม ✨ AI Breakdown ในหน้าต่างการ์ด เพื่อแตกหัวข้อย่อยเป็น Checklist 3-10 ข้ออัตโนมัติ",
      "Executive Project Summary: คลิกปุ่ม AI Summary ที่แถบหัวบอร์ด เพื่อวิเคราะห์ภาพรวม ความคืบหน้า คอขวด และข้อเสนอแนะเชิงกลยุทธ์",
      "โครงสร้างเช็คลิสต์อัตโนมัติ: มีช่องติ๊กถูกและระบบคำนวณ Progress Bar ความคืบหน้าให้ในตัว",
      "บันทึกลงการ์ดทันที: สามารถเลือกแทนที่เช็คลิสต์เดิมหรือเพิ่มต่อท้ายได้ตามต้องการ",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดการ์ดงานที่ต้องการย่อย",
        desc: "คลิกเปิดการ์ดงานในบอร์ด Kanban หรือในมุมมองตาราง Spreadsheet",
      },
      {
        step: "02",
        title: "กดปุ่ม ✨ AI Breakdown",
        desc: "เลือกจำนวนข้อย่อยที่ต้องการ (เช่น 3, 5 หรือ 8 ข้อ) แล้วกดสั่งให้ AI วิเคราะห์",
      },
      {
        step: "03",
        title: "ตรวจสอบและติ๊กความคืบหน้า",
        desc: "เช็คลิสต์จะปรากฏในการ์ดทันที พร้อมหลอด Progress Bar ที่ปรับระดับตามการติ๊กงานจริง",
      },
    ],
    technicalSpecs: [
      { label: "Breakdown Scale", value: "3 - 10 Actionable Checklist Items" },
      { label: "Summary Analysis", value: "Health, Bottlenecks, Velocity & Action Items" },
      { label: "Execution Time", value: "< 2.5 วินาที" },
    ],
    tips: "หากระบุรายละเอียดในคำอธิบายการ์ดให้ชัดเจน AI จะสามารถสร้างเช็คลิสต์ย่อยที่มีความแม่นยำสูงมากยิ่งขึ้น",
    relatedTopicIds: ["ai-assistant", "kanban-boards", "board-export"],
    demoType: "ai-chat",
  },
  {
    id: "kanban-boards",
    category: "kanban",
    icon: FolderKanban,
    title: "การจัดการบอร์ด Kanban และการย้ายการ์ด",
    badge: "Core Workflow",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
    scopeBadge: "กระดานงานหลัก",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "บอร์ดบริหารจัดการงานแบบเรียลไทม์ รองรับการลากวาง (Drag & Drop) อย่างลื่นไหล และปรับแต่งคอลัมน์ได้อย่างยืดหยุ่น",
    concept:
      "บอร์ด Kanban ของ Retzlo ขับเคลื่อนด้วย Optimistic State Architecture ทำให้การลากย้ายการ์ดหรือเปลี่ยนสถานะเกิดขึ้นทันทีใน 0 วินาที โดยไม่ต้องรอ Round-trip จากเครือข่าย พร้อมระบบ Rollback ปลอดภัยเมื่อการเชื่อมต่อมีปัญหา และส่งต่อการอัปเดตไปยังเพื่อนร่วมทีมทุกคนทันที",
    highlights: [
      "Optimistic Drag & Drop: ลากวางการ์ดสลับคอลัมน์หรือเปลี่ยนลำดับได้ทันที ไร้อาการหน่วงหรือกระตุก",
      "Real-time Collaboration: การ์ดขยับและอัปเดตแบบสดๆ ไปยังหน้าจอเพื่อนร่วมทีมทุกคนในโปรเจกต์ด้วย Pusher WebSocket",
      "Column Settings & WIP Limit: ปรับเปลี่ยนชื่อคอลัมน์ และกำหนดขีดจำกัดงานระหว่างทำ (WIP Limit) เพื่อป้องกันงานคั่งค้าง",
      "Sort Handle ด้านหน้า (⁝⁝): จับลากจุดที่ด้านหน้าเมนูในแถบข้างเพื่อจัดลำดับบอร์ดและเครื่องมือตามใจชอบ",
      "Card Density (Normal / Compact 2x): ปุ่มปรับความหนาแน่นของการ์ดระหว่างโหมด Normal (มาตรฐาน) และ Compact 2x (แสดงข้อมูลแน่นขึ้น 2 เท่า)",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "ลากย้ายการ์ดตามขั้นตอน",
        desc: "จับการ์ดลากข้ามคอลัมน์จาก To Do ไปยัง In Progress หรือ Done ข้อมูลจะซิงค์สด 0ms",
      },
      {
        step: "02",
        title: "ปรับ Card Density เมื่อมีงานจำนวนมาก",
        desc: "คลิกปุ่มสลับความหนาแน่นด้านบนเพื่อเลือก Compact 2x ช่วยลดการเลื่อนหน้าจอและเห็นภาพรวมกว้างขึ้น",
      },
      {
        step: "03",
        title: "ตั้งค่า WIP Limit คุมปริมาณงาน",
        desc: "เปิด Column Settings เพื่อกำหนดเพดานงานในคอลัมน์ In Progress ช่วยควบคุมคอขวดของทีม",
      },
    ],
    technicalSpecs: [
      { label: "Sync Engine", value: "Pusher WebSockets Broadcast" },
      { label: "Latency", value: "0ms (Optimistic UI with Auto-Rollback)" },
      { label: "Density Views", value: "Normal (Standard) & Compact 2x (High Density)" },
    ],
    tips: "สามารถสลับความหนาแน่นของการ์ดเป็น Compact 2x เมื่อมีงานจำนวนมากในแต่ละคอลัมน์ เพื่อให้เห็นภาพรวมได้กว้างขึ้นโดยไม่ต้องเลื่อนหน้าจอบ่อย",
    relatedTopicIds: ["spreadsheet-table-view", "card-attributes-customization", "board-export"],
    demoType: "kanban-table",
  },
  {
    id: "spreadsheet-table-view",
    category: "kanban",
    icon: Table,
    title: "มุมมองตารางสเปรดชีต (Spreadsheet Table View)",
    badge: "New Feature",
    badgeColor: "border-dusk-cyan/30 bg-dusk-cyan/10 text-dusk-cyan",
    scopeBadge: "ตารางข้อมูลปริมาณมาก",
    readingTime: "อ่าน 4 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "สลับมุมมองจาก Kanban Board ไปเป็นตาราง Spreadsheet สำหรับการจัดการและแก้ไขข้อมูลปริมาณมากอย่างรวดเร็ว",
    concept:
      "เหมาะสำหรับผู้จัดการโครงการหรือสมาชิกที่ต้องการดูภาพรวมงานทั้งหมดแบบแถวตาราง พร้อมความสามารถในการแก้ไขข้อมูลแบบ Inline (แก้ไขในตารางทันที) โดยไม่ต้องเปิดหน้าต่างการ์ดขึ้นมาทีละใบ",
    highlights: [
      "สลับมุมมองได้ทันที: คลิกปุ่ม 📊 Table บริเวณแถบเครื่องมือหัวบอร์ด (รองรับทั้ง Flat Table ตารางเรียบ และ Grouped Accordion จัดกลุ่มตามคอลัมน์)",
      "ลำดับแถว & Hover Checkbox (#): ปกติแสดงเฉพาะเลขลำดับ เมื่อนำเมาส์ชี้จะสลับเป็น Checkbox ให้กดติ๊กงานเสร็จได้ทันที พร้อมเครื่องหมาย [✓] สีเขียวเมื่อเสร็จสิ้น",
      "Multi-Assignee & Real Avatars: มอบหมายงานให้สมาชิกได้หลายคน พร้อมแสดงรูปโปรไฟล์จริงทั้งในตารางและเมนูดรอปดาวน์",
      "Inline Editing ครบวงจร: คลิกแก้ไขชื่องาน และเลือกเปลี่ยนสถานะการ์ดได้ทันที",
      "Priority Dropdown: แสดงชื่อระดับความสำคัญและสีตาม Custom Priorities ของบอร์ด พร้อมคลิกเปลี่ยนระดับได้ทันที",
      "Interactive DatePicker: คลิกช่องวันที่เพื่อเลือกวันเริ่ม (Start Date) และวันกำหนดส่ง (Due Date) พร้อมรูปแบบ 'DD/MM/YYYY'",
      "Priority Sorting: คลิกที่หัวคอลัมน์ Priority เพื่อเรียงลำดับความเร่งด่วนตามระดับความสำคัญ (Level 1 ด่วนที่สุด)",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "สลับเข้ามุมมอง Table",
        desc: "คลิกปุ่ม Table บริเวณแถบเครื่องมือบนหัวบอร์ด สามารถเลือก Flat หรือ Grouped ตามใจชอบ",
      },
      {
        step: "02",
        title: "แก้ไขข้อมูลแบบ Inline ทันที",
        desc: "คลิกที่ช่องชื่องานเพื่อพิมพ์แก้โดยตรง หรือคลิกดรอปดาวน์สถานะและ Priority เพื่อปรับค่า",
      },
      {
        step: "03",
        title: "มอบหมายสมาชิกหลายคน",
        desc: "คลิกช่องผู้รับผิดชอบแล้วติ๊กเลือกเพื่อนร่วมทีมได้หลายคน เมนูจะไม่ปิดตัวระหว่างการเลือก",
      },
      {
        step: "04",
        title: "ติ๊กงานเสร็จด่วนด้วย Hover Checkbox",
        desc: "นำเมาส์ชี้ที่หมายเลขแถว (#) ด้านหน้าสุด จะเปลี่ยนเป็นช่องติ๊กถูก ให้คลิกเพื่อย้ายงานสู่ Done ได้ทันที",
      },
    ],
    technicalSpecs: [
      { label: "Layout Modes", value: "Flat Table View & Grouped Accordion View" },
      { label: "Inline Editing", value: "Title, Status, Priority, Assignees, Due Date" },
      { label: "Date Display Format", value: "DD/MM/YYYY" },
    ],
    tips: "ในมุมมองตาราง สามารถเลือกติ๊กผู้รับผิดชอบหลายคนได้อย่างต่อเนื่องโดยที่เมนูดรอปดาวน์ไม่ปิดตัว",
    relatedTopicIds: ["kanban-boards", "custom-board-priorities", "board-export"],
    demoType: "kanban-table",
  },
  {
    id: "custom-board-priorities",
    category: "kanban",
    icon: Flag,
    title: "ระดับความสำคัญแบบกำหนดเอง (Custom Priorities สูงสุด 10 ระดับ)",
    badge: "Customization",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-600 dark:text-dusk-lavender",
    scopeBadge: "ปรับแต่งความสำคัญ",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "แต่ละบอร์ดสามารถสร้างและปรับแต่งระดับความสำคัญของงานได้เองสูงสุดถึง 10 ระดับ พร้อมเลือกสีได้ 12 โทนสี Retro Lofi และเรียงลำดับความเร่งด่วน",
    concept:
      "เพราะแต่ละทีมมีเกณฑ์ความสำคัญที่แตกต่างกัน บางทีมใช้ P0-P3, บางทีมใช้ Urgent/Normal, บางทีมใช้ High/Med/Low Retzlo จึงเปิดให้แต่ละบอร์ดสามารถตั้งค่าเกณฑ์ความสำคัญของตัวเองได้อย่างอิสระ",
    highlights: [
      "เปิดจัดการได้ง่าย: ผ่านปุ่ม Priorities บน Header Toolbar หรือแท็บ Priorities ในหน้าต่าง Board Settings",
      "สร้างระดับความสำคัญเพิ่มได้สูงสุด 10 ระดับ และปรับแต่งชื่อได้ตามต้องการ (เช่น P0, Critical, Normal)",
      "เลือกสีได้ถึง 12 โทนสี Retro Lofi (Rose, Orange, Amber, Yellow, Emerald, Teal, Sky, Blue, Indigo, Purple, Pink, Stone)",
      "ปุ่มเลื่อนลำดับขึ้น/ลง เพื่อจัดลำดับความเร่งด่วน โดยระดับ 1 มีความเร่งด่วนสูงสุด",
      "สอดคล้องกันทุกมุมมอง: ป้ายสีกำกับ Priority จะแสดงผลตรงกันทั้งในการ์ด Kanban, Card Detail Modal, และตาราง Spreadsheet",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดศูนย์ปรับแต่ง Priority",
        desc: "คลิกปุ่ม Priorities ที่หัวบอร์ด หรือเข้าไปที่แท็บ Attributes ในหน้าต่าง Board Settings",
      },
      {
        step: "02",
        title: "เลือกแม่แบบสำเร็จรูปหรือเพิ่มเอง",
        desc: "เลือกแม่แบบสากล เช่น P0-P4 Severity Scale, MoSCoW, หรือ Eisenhower Matrix หรือกดเพิ่มระดับใหม่",
      },
      {
        step: "03",
        title: "ปรับแต่งสีและลำดับความเร่งด่วน",
        desc: "เลือกโทนสีจาก 12 พาเลตต์ Retro Lofi แล้วจัดลำดับขึ้นลงตามความเร่งด่วนของโครงการ",
      },
    ],
    technicalSpecs: [
      { label: "Max Priorities", value: "10 ระดับต่อบอร์ด" },
      { label: "Color Palette", value: "12 โทนสี Retro Lofi มาตรฐาน" },
      { label: "Sync Scope", value: "Kanban, Table View, Modal, Export Document" },
    ],
    tips: "หากลบหรือตั้งค่าใหม่ ระบบจะมีปุ่ม 'รีเซ็ตกลับเป็นค่าเริ่มต้น' เพื่อคืนค่ามาตรฐาน High, Medium, Low ได้ทันที",
    relatedTopicIds: ["card-attributes-customization", "spreadsheet-table-view", "kanban-boards"],
    demoType: "priorities",
  },
  {
    id: "board-export",
    category: "kanban",
    icon: Download,
    title: "ระบบส่งออกข้อมูลบอร์ดระดับมืออาชีพ (Dedicated Export: Excel, CSV, PDF, PNG)",
    badge: "Export",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
    scopeBadge: "ส่งออกรายงานผู้บริหาร",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "ส่งออกรายการงานในบอร์ดด้วยเลย์เอาต์พิเศษที่ออกแบบสำหรับการส่งออกโดยเฉพาะ ไม่มีการตัดทอนคอลัมน์ พร้อมหัวเอกสารผู้บริหารและสรุป KPI ครบถ้วน",
    concept:
      "แก้ปัญหาการจับภาพหน้าจอเดิมที่ทำให้คอลัมน์ด้านขวาและการ์ดด้านล่างถูกตัดขอบ ด้วยระบบเรนเดอร์เอกสารเฉพาะ (Dedicated Export Document) ครบถ้วน 100% พร้อมโหมดบอร์ดเต็มแผ่นและโหมดตารางรายงานทางการ",
    highlights: [
      "เลย์เอาต์เฉพาะสำหรับ Export: เรนเดอร์ครบทุกคอลัมน์และทุกใบงาน 100% ไม่มีแถบเลื่อนหรือปุ่มอินเตอร์แอคทีฟกวนสายตา",
      "ระบบ Off-screen Staging ไร้ปัญหาภาพว่าง: แยก Staging Area ชัดเจนและจัดตำแหน่งพิกัดแบบสัมพัทธ์ ป้องกันปัญหาภาพว่างเปล่า (Blank Canvas) และไม่กระทบการเลื่อนหน้าจอของผู้ใช้",
      "Executive Document Header: แถบหัวเอกสารทางการพร้อมสถิติผู้บริหาร (งานทั้งหมด, แต้มความยาก, สถานะงาน, งานเกินกำหนด, % ความสำเร็จ)",
      "เลือกรูปแบบการจัดวาง (Layout View): เลือกได้ทั้งภาพบอร์ดเต็มแผ่น (Full Panoramic Kanban) หรือตารางรายงานสรุป (Executive Table)",
      "เลือกโทนสีเอกสาร (Theme Style): รองรับทั้งกระดาษขาว Clean Light Paper สำหรับงานพิมพ์/PDF และดาร์กโหมดพรีเมียม Dark Slate",
      "PDF (.pdf): จัดหน้า A4 แนวนอนอัตโนมัติ พร้อมระบบตัดแบ่งหน้าหลายแผ่น (Multi-page Pagination) เมื่อเอกสารมีความยาวสูง",
      "PNG (.png): บันทึกภาพความละเอียดสูงระดับ 2x Retina ชัดเจนทุกตัวอักษร เหมาะสำหรับใส่สไลด์นำเสนอ",
      "Excel (.xlsx) & CSV (.csv): สเปรดชีตจัดรูปแบบสมบูรณ์และไฟล์ UTF-8 BOM ภาษาไทยไม่เพี้ยน 100%",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดเมนู Export",
        desc: "คลิกปุ่ม Export บนแถบเครื่องมือของบอร์ด หรือเลือกจากปุ่มส่งออกใน Table View",
      },
      {
        step: "02",
        title: "เลือกประเภทไฟล์และเลย์เอาต์",
        desc: "เลือกฟอร์แมตที่ต้องการ (PDF, PNG, Excel, CSV) และเลือกโหมดจัดวาง (Kanban หรือ Executive Table)",
      },
      {
        step: "03",
        title: "ดูพรีวิวสดก่อนดาวน์โหลด",
        desc: "ตรวจสอบความเรียบร้อยของหัวเอกสารและตารางในหน้าต่าง Live Preview จากนั้นกดดาวน์โหลด",
      },
    ],
    technicalSpecs: [
      { label: "Rendering Engine", value: "Dedicated Off-screen Staging Wrapper" },
      { label: "Supported Formats", value: "PDF (Multi-page A4), PNG (2x Retina), Excel (.xlsx), CSV (UTF-8 BOM)" },
      { label: "Style Themes", value: "Clean Light Paper & Dark Slate" },
    ],
    tips: "สามารถกดดูตัวอย่างเอกสาร (Live Preview) ก่อนส่งออกได้ในหน้าต่างตัวเลือกเพิ่มเติม หรือเลือกส่งออกด่วนผ่าน Dropdown ได้ทันที",
    relatedTopicIds: ["kanban-boards", "spreadsheet-table-view", "ai-breakdown-summary"],
    demoType: "export",
  },
  {
    id: "card-attributes-customization",
    category: "kanban",
    icon: SlidersHorizontal,
    title: "ศูนย์กลางคุณสมบัติการ์ด (สถานะ, ความสำคัญ, Story Points) ใน Board Settings",
    badge: "Updated",
    badgeColor: "border-purple-400/30 bg-purple-400/10 text-purple-600 dark:text-purple-400",
    scopeBadge: "เวิร์กโฟลว์ & โครงสร้าง",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "รวมการตั้งค่าคุณสมบัติการ์ด (สถานะ, ความสำคัญ, Story Points) ไว้ใน Board Settings พร้อมเชื่อมโยงไปยังคอลัมน์, การ์ด, และตารางงานแบบเรียลไทม์",
    concept:
      "รวบรวมการตั้งค่าทุกจุดให้เป็นหนึ่งเดียวใน Board Settings (แท็บคุณสมบัติการ์ด) และเชื่อมโยงทุกมุมมอง เมื่อเพิ่มสถานะใหม่ รายการสถานะนั้นจะปรากฏใน Column Settings และตารางสเปรดชีตทันทีโดยไม่ต้องโหลดหน้าใหม่",
    highlights: [
      "ศูนย์กลางใน Board Settings & Project Settings: เข้าถึงการปรับแต่งครบทั้ง 3 หมวด (Status, Priority, Story Points) ได้ทั้งจากปุ่ม Attributes บนหัวบอร์ด หรือในหน้า Project Settings",
      "เชื่อมโยง Column Settings ทันที: สถานะที่กำหนดเองจะแสดงเป็นตัวเลือก Card Status ในหน้าแก้ไขคอลัมน์และสร้างคอลัมน์ใหม่โดยอัตโนมัติ",
      "ปุ่ม '+' ท้ายหัวข้อในการ์ด: คลิกปุ่ม '+' ท้ายหัวข้อ Status, Priority หรือ Story Points ใน Card Modal จะนำทางไปยังหน้า Project Settings เปิดหมวดคุณสมบัตินั้นๆ ให้ปรับแต่งได้ทันที",
      "แท็บสถานะ (Status) & แม่แบบ Workflow Templates: เลือกปรับใช้แม่แบบขั้นตอนงานสำเร็จรูป (Classic Kanban, Software & IT, Agile & Scrum, Marketing, Bug Tracker, Design, Sales) พร้อมระบบดูตัวอย่างสดแบบอินไลน์ (Instant Inline Preview) คลิกแล้วรายการด้านล่างเปลี่ยนให้ดูทันที",
      "แท็บความสำคัญ (Priority) & แม่แบบสากล: แถบแม่แบบระดับความสำคัญสำเร็จรูป (Classic 3-Level, P0-P4 Severity Scale, MoSCoW Prioritization, Eisenhower Matrix, Customer Support & SLA, Business Value Matrix) ปรับแต่งชื่อ ลำดับ และสีได้ 12 โทนสี",
      "แท็บคะแนนความยาก (Story Points) & สเกลแม่แบบ: แถบแม่แบบสเกลคะแนนประเมินน้ำหนักงาน (Retzlo Standard, Fibonacci Sequence, Linear/ชั่วโมงทำงาน, T-Shirt Sizes, Pomodoro Focus Blocks, Complexity & Risk Scale) เพิ่มคะแนนอิสระ 1-100",
      "ความปลอดภัยสูงสุดตามมาตรฐาน AGENTS.md: ทุกการนำแม่แบบมาใช้ การแก้ไข การลบ และการรีเซ็ตค่าเริ่มต้น จะได้รับการปกป้องด้วย ConfirmModal เพื่อยืนยันเจตนา พร้อมแสดง Toast แจ้งเตือนผลลัพธ์ทันที",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดแท็บ Attributes",
        desc: "คลิกปุ่ม Attributes บนหัวบอร์ด หรือเข้าไปที่ Project Settings แท็บ Card Attributes",
      },
      {
        step: "02",
        title: "คลิกดูตัวอย่างแม่แบบ (Inline Live Preview)",
        desc: "คลิกชิปแม่แบบใดๆ รายการด้านล่างจะเปลี่ยนให้ดูตัวอย่างทันทีโดยไม่ต้องเปิดป๊อปอัป",
      },
      {
        step: "03",
        title: "เลือกโหมดนำมาใช้ (Replace หรือ Append)",
        desc: "เลือกแทนที่รายการเดิมทั้งหมด หรือเพิ่มเฉพาะรายการใหม่ต่อท้าย",
      },
      {
        step: "04",
        title: "ยืนยันการนำมาใช้และซิงค์สด",
        desc: "กดยืนยันผ่าน ConfirmModal ระบบจะส่ง Custom Events ซิงค์สดไปยังทุกมุมมองทันที",
      },
    ],
    technicalSpecs: [
      { label: "Attribute Categories", value: "Card Statuses, Priorities (up to 10), Story Points (1-100)" },
      { label: "Preview Mechanism", value: "Instant Inline Reactive Preview (No Dialog Overhead)" },
      { label: "Sync Protocol", value: "Custom DOM Events (retzlo:statuses-updated, etc.)" },
    ],
    tips: "ทุกการปรับแต่งจะซิงค์ผ่าน Custom Events แบบ Real-time ทันที ทำให้ทั้ง Kanban Board, Column Settings, Card Modal, และ Table View สอดคล้องกันตลอดเวลา",
    relatedTopicIds: ["kanban-boards", "custom-board-priorities", "spreadsheet-table-view"],
    demoType: "priorities",
  },
  {
    id: "coffee-cheers-rewards",
    category: "gamification",
    icon: Coffee,
    title: "ระบบ Coffee Cheers และ Rewards Store",
    badge: "Gamification",
    badgeColor: "border-dusk-rose/30 bg-dusk-rose/10 text-rose-600 dark:text-dusk-rose",
    scopeBadge: "กำลังใจ & รางวัล",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "เสริมสร้างบรรยากาศการทำงานเชิงบวกด้วยการส่งแก้วกาแฟ Cheers ให้กำลังใจเพื่อนร่วมทีม พร้อมสะสมเหรียญแลกรางวัล",
    concept:
      "การให้กำลังใจและการรับรู้ถึงคุณค่าของงาน (Recognition) เป็นปัจจัยสำคัญในการทำงานร่วมกัน ระบบ Coffee Cheers ทำให้การส่งคำชมเป็นเรื่องสนุกและได้รับผลตอบแทนเป็นเหรียญสะสม",
    highlights: [
      "ปุ่ม ☕ Cheers อัตโนมัติ: เมื่อการ์ดย้ายไปยังคอลัมน์ Done หรือทำเสร็จ จะมีปุ่ม Cheers ปรากฏขึ้นเพื่อส่งกำลังใจให้ผู้รับผิดชอบ",
      "กระเป๋าเหรียญสะสม: ได้รับเหรียญรางวัลสะสมเข้ากระเป๋าส่วนตัวทุกครั้งที่มีการ Cheers หรืองานเสร็จสมบูรณ์",
      "Rewards Store: สามารถนำเหรียญไปแลกไอเทมและของรางวัลจริงหรือรางวัลในทีมที่สร้างไว้ในโปรเจกต์",
      "ระบบป้องกันสแปม: มีระบบ Rate-limit ป้องกันการกดรัวเพื่อให้ทุกการ Cheers มีความหมายและเป็นธรรม",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "ย้ายการ์ดสู่งานที่เสร็จสิ้น",
        desc: "เมื่อการ์ดย้ายไปคอลัมน์ Done ปุ่มส่งแก้วกาแฟ ☕ Cheers จะแสดงขึ้น",
      },
      {
        step: "02",
        title: "กดส่ง Coffee Cheers",
        desc: "คลิกปุ่ม Cheers เพื่อส่งคำชมและมอบเหรียญรางวัลแก่ผู้รับผิดชอบงาน",
      },
      {
        step: "03",
        title: "แลกรางวัลในร้านค้าโปรเจกต์",
        desc: "เปิด Rewards Store เพื่อนำเหรียญที่สะสมไว้ไปแลกรางวัลที่ตั้งไว้ในทีม",
      },
    ],
    technicalSpecs: [
      { label: "Gamification Currency", value: "Retzlo Coins (สะสมประจำโปรเจกต์)" },
      { label: "Rate Limit Protection", value: "Anti-spam cool-down timer" },
      { label: "Integration", value: "Card Completion Triggers & Wallet Sync" },
    ],
    tips: "อย่าลืมแวะไปดู Rewards Store เพื่อตั้งรางวัลกระตุ้นทีม เช่น กาแฟเลี้ยงฟรี หรือขนมยามบ่าย!",
    relatedTopicIds: ["kanban-boards", "calendar-due-dates", "roles-and-security"],
    demoType: "coffee",
  },
  {
    id: "calendar-due-dates",
    category: "calendar",
    icon: Calendar,
    title: "ปฏิทินงานและตัวเลือกเวลา (Retro Date & Time Picker)",
    badge: "Productivity",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-amber-600 dark:text-dusk-amber",
    scopeBadge: "การจัดการเวลา",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "ไม่พลาดทุกกำหนดส่งด้วยมุมมองปฏิทินแบบรอบด้าน ทั้งระดับโปรเจกต์และภาพรวมทุกงาน พร้อม Global DatePicker และ Single-Column TimePicker",
    concept:
      "ปฏิทินของ Retzlo ดึงข้อมูลกำหนดส่ง (Due Date) จากการ์ดในทุกบอร์ด และเชื่อมโยงกับรายการไดอารี่ประจำวัน เพื่อให้เห็นตารางชีวิตและการทำงานในที่เดียว",
    highlights: [
      "Global Retro DatePicker: ดีไซน์เฉพาะตัวในโทน Retro Lofi Indigo สบายตา ไม่พึ่งปฏิทินเบราว์เซอร์ที่หน้าตาไม่เข้ากัน",
      "Day View Modal: คลิกที่ช่องวันที่เพื่อเปิดหน้าต่าง Day Overview เต็มรูปแบบ พร้อมหัวข้อวันแบบเต็ม, แถบความคืบหน้า Progress Bar, และแถบกรอง/เรียงลำดับ",
      "Tactile Item Cards: การ์ดแต่ละใบมีแถบสี Accent Bar ด้านซ้าย, ปุ่ม Checkbox ติ๊กเสร็จงานทันทีพร้อมขีดฆ่า, ป้ายประเภทคมชัด, และปุ่มลัด 'Open in Diary'",
      "Preset Shortcuts: ปุ่มลัดกำหนดวันด่วน 'วันนี้', 'พรุ่งนี้', 'สุดสัปดาห์นี้', 'สัปดาห์หน้า'",
      "TimePicker รุ่นใหม่: คลิกพิมพ์เวลาได้โดยตรง มีแถบเลื่อนแนวตั้งเดี่ยวไม่งง พร้อมปุ่มลัดเวลายอดนิยม และปุ่มยืนยัน 'ตกลง'",
      "Global Calendar View: ดูภาพรวมกำหนดส่งของทุกโปรเจกต์พร้อมกันได้ในหน้าหลัก Workspaces",
      "Instant Skeleton Loading: โหลดแสดงโครงสร้างปฏิทินทันทีเมื่อเปิดหน้า ไร้อาการกระตุก",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เปิดมุมมองปฏิทิน",
        desc: "คลิกเมนู Calendar ที่แถบด้านข้าง เพื่อดูงานทั้งหมดในมุมมองเดือนหรือสัปดาห์",
      },
      {
        step: "02",
        title: "คลิกดูรายละเอียดรายวัน (Day View)",
        desc: "คลิกช่องวันที่ใดๆ เพื่อเปิด Day View Modal ดูรายการงาน โน้ต และไดอารี่ทั้งหมดในวันนั้น",
      },
      {
        step: "03",
        title: "กำหนดวันและเวลาด้วย Retro Pickers",
        desc: "คลิกเลือกวันที่และใช้แป้นพิมพ์กรอกเวลาลงใน Intuitive TimePicker ได้โดยตรง",
      },
    ],
    technicalSpecs: [
      { label: "Views", value: "Month Overview, Week Timeline, Day Overview Modal" },
      { label: "TimePicker Scroller", value: "Single-column linear with direct number input" },
      { label: "Presets", value: "Today, Tomorrow, This Weekend, Next Week" },
    ],
    tips: "การ์ดที่ใกล้ถึงกำหนดส่งจะแสดงแถบสีเตือนสถานะ และสามารถติ๊กเปลี่ยนสถานะการ์ดหรือรายการไดอารี่ได้โดยตรงจากในหน้าต่าง Day Overview!",
    relatedTopicIds: ["kanban-boards", "notes-diary-hub", "spreadsheet-table-view"],
    demoType: "timepicker",
  },
  {
    id: "notes-diary-hub",
    category: "notes",
    icon: StickyNote,
    title: "สมุดโน้ต (Notes) และบันทึกประจำวัน (Diary Hub)",
    badge: "Life & Work",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-600 dark:text-indigo-400",
    scopeBadge: "สมดุลชีวิต & กิจวัตร",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "ศูนย์กลางรวบรวมไอเดีย แผนงาน และกิจวัตรประจำวันในชีวิตของคุณที่แยกเป็นสัดส่วน",
    concept:
      "ไม่เพียงแค่งานในบอร์ด Retzlo ให้ความสำคัญกับไอเดียที่ยังไม่เป็นทางการและกิจวัตรส่วนบุคคล สมุดโน้ตและไดอารี่จึงถูกรวมไว้ข้างบอร์ดงานอย่างแนบเนียน",
    highlights: [
      "Notes System: จดบันทึกแยกโฟลเดอร์ ปักหมุดโน้ตสำคัญ และรองรับเนื้อหาแบบ Rich Content",
      "Diary Tracker: ติดตามกิจวัตรประจำวัน (Habit Checklist) พร้อมสะสมสถิติ Streak ความต่อเนื่อง",
      "Draft Storage: ป้องกันข้อความสูญหายด้วยระบบ Auto-save ร่างเอกสารในเครื่องเบราว์เซอร์อัตโนมัติ",
      "เชื่อมโยงกับบอร์ด: นำข้อสรุปจาก AI หรือโน้ตสำคัญไปสร้างเป็นการ์ดงานได้ในคลิกเดียว",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "จดบันทึกไอเดียใน Notes Hub",
        desc: "สร้างเอกสารโน้ต แยกตามโฟลเดอร์ และปักหมุดบันทึกที่สำคัญไว้ด้านบนสุด",
      },
      {
        step: "02",
        title: "เช็คลิสต์กิจวัตรใน Diary Hub",
        desc: "ติ๊กสิ่งที่ทำเสร็จในแต่ละวันเพื่อสะสมสถิติ Streak ความสม่ำเสมอในการดูแลสุขภาพและชีวิต",
      },
      {
        step: "03",
        title: "แปลงโน้ตเป็นการ์ดงาน",
        desc: "คลิกปุ่มแปลงไอเดียในโน้ตให้กลายเป็นการ์ดลงบนบอร์ด Kanban ได้ทันที",
      },
    ],
    technicalSpecs: [
      { label: "Storage", value: "Cloud Database + Local Browser Draft Backup" },
      { label: "Habit Tracking", value: "Daily Checklist + Streak Analytics" },
    ],
    tips: "ใช้ Diary Hub สำหรับจดบันทึกสั้นๆ ก่อนเริ่มวันและสรุปสิ่งที่ทำสำเร็จในแต่ละวันเพื่อสุขภาพจิตที่ดี",
    relatedTopicIds: ["calendar-due-dates", "kanban-boards", "ai-assistant"],
    demoType: "habits",
  },
  {
    id: "roles-and-security",
    category: "security",
    icon: ShieldCheck,
    title: "ระบบสมาชิก สิทธิ์การเข้าถึง และการจัดการทีม (Team Members Hub)",
    badge: "Updated",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-600 dark:text-dusk-lavender",
    scopeBadge: "ความปลอดภัย & ทีม",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "หน้าจัดการสมาชิกโปรเจกต์ดีไซน์ใหม่ แยก 3 แท็บชัดเจน พร้อมระบบเปลี่ยนบทบาท ตรวจสอบสถานะออนไลน์ และลิงก์เชิญด่วน",
    concept:
      "ความโปร่งใสและการควบคุมสิทธิ์การเข้าถึงอย่างปลอดภัย หน้าจัดการสมาชิกของ Retzlo ช่วยให้เจ้าของโปรเจกต์สามารถเชิญทีม ปรับเปลี่ยนบทบาท และติดตามการทำงานร่วมกันได้อย่างมีประสิทธิภาพ",
    highlights: [
      "สถาปัตยกรรม 3 แท็บ: 'สมาชิกในทีม' ดูรายชื่อและสถานะ, 'คำเชิญรอดำเนินการ' ติดตามลิงก์คำเชิญ, และ 'สิทธิ์และการเข้าถึง' ตารางเปรียบเทียบสิทธิ์ละเอียด",
      "Presence Indicator: จุดสถานะออนไลน์บนรูปโปรไฟล์ (🟢 Online, 🟠 Busy, ⚪ Offline)",
      "Role Switcher: เจ้าของโปรเจกต์ (Owner) สามารถปรับเลื่อนขั้น/ลดสิทธิ์สมาชิกเป็น Owner หรือ Member ได้ทันที พร้อมระบบป้องกันไม่ให้ลดสิทธิ์ของเจ้าของคนสุดท้าย",
      "Dedicated Invite Modal: หน้าต่างเชิญเพื่อนร่วมทีมเฉพาะ เลือกกำหนดบทบาท (Member/Owner) ได้ล่วงหน้า พร้อมสร้างลิงก์ที่คัดลอกแชร์ต่อได้ทันที",
      "Instant Skeleton Loading: แสดงแผง Skeleton โหลดแบบนุ่มนวลลื่นไหล ไม่กระตุก เมื่อเข้าสู่หน้า /project/[id]/members",
      "Confirm Modal มาตรฐาน: ทุกการลบสมาชิกหรือเพิกถอนคำเชิญมีกล่องยืนยันความตั้งใจเสมอ",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เข้าสู่หน้าจัดการสมาชิก",
        desc: "คลิกเมนู Members ที่แถบข้างโปรเจกต์ หรือเลือกจัดการสมาชิกจากหน้า Project Settings",
      },
      {
        step: "02",
        title: "เชิญสมาชิกใหม่ด้วย Invite Modal",
        desc: "คลิก 'Invite Teammate' กำหนดบทบาท และคัดลอกลิงก์คำเชิญส่งให้เพื่อนร่วมทีม",
      },
      {
        step: "03",
        title: "จัดการบทบาทและการเข้าถึง",
        desc: "ปรับสิทธิ์ระหว่าง Owner และ Member หรือเพิกถอนสิทธิ์เมื่อสมาชิกสิ้นสุดการทำงาน",
      },
    ],
    technicalSpecs: [
      { label: "Roles", value: "Workspace Owner & Project Member" },
      { label: "Presence States", value: "🟢 Online, 🟠 Busy, ⚪ Offline" },
      { label: "Safety Guards", value: "Last Owner Protection & Mandatory ConfirmModal" },
    ],
    tips: "สามารถคลิกการ์ดสถิติ (Total Members, Active Now, Pending, Total Coffees) ที่ด้านบนเพื่อสลับแท็บหรือกรองสมาชิกได้อย่างสะดวกรวดเร็ว",
    relatedTopicIds: ["project-and-board-settings", "welcome-overview", "coffee-cheers-rewards"],
    demoType: "permissions",
  },
  {
    id: "project-and-board-settings",
    category: "security",
    icon: SlidersHorizontal,
    title: "ศูนย์ตั้งค่าโปรเจกต์และบอร์ด (Master-Detail Space Settings)",
    badge: "Updated",
    badgeColor: "border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender",
    scopeBadge: "การควบคุมพื้นที่ทำงาน",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "หน้าตั้งค่าโปรเจกต์แบบกะทัดรัด จัดกลุ่มตามขอบเขต Project / Boards / Personal ใช้รูปแบบ Settings Row มาตรฐาน กวาดตาเห็นครบโดยไม่ต้องเลื่อนยาว",
    concept:
      "แยกให้ชัดว่ากำลังตั้งค่าอะไร: ระดับโปรเจกต์ (ทุกคนได้รับผล), ระดับบอร์ด (เฉพาะบอร์ดที่เลือก) และระดับส่วนตัว (เฉพาะเบราว์เซอร์นี้) แต่ละหน้าใช้ Label ซ้าย ตัวควบคุมขวา คั่นด้วยเส้นบาง แบบมาตรฐานแบ่งสัดส่วนชัดเจน",
    highlights: [
      "Project › General: ชื่อ คำอธิบาย ภาพปก สวิตช์ฟีเจอร์ (Board notes rail, Private item hiding) และ Danger Zone ลบโปรเจกต์ รวมในหน้าเดียว",
      "Project › Members: รายชื่อสมาชิกแบบแถวกะทัดรัด พร้อมปุ่ม 'จัดการสมาชิกและคำเชิญ' และสรุปสิทธิ์ Owner / Member",
      "Boards › All boards: ค้นหา กรอง Public/Private สลับมุมมองรายการ/Grid และสร้างบอร์ดใหม่ด้วยปุ่ม 'New board'",
      "Boards › Board details / Columns / Card attributes: ใช้แถบ 'Active Board' ด้านบนเพียงแถบเดียวเพื่อเลือกบอร์ดที่จะตั้งค่า",
      "Columns: กด '+ เพิ่มคอลัมน์ใหม่' กำหนดสถานะเริ่มต้น ธีมสี ไอคอน และ WIP limit ได้ทันที (ยืนยันด้วย ConfirmModal และแจ้ง Toast)",
      "Card attributes: แก้ Status, Priority และ Story Points แบบ interactive ซิงค์กับ Kanban, Card modal และ Table view ทันที",
      "Personal › Theme & sound: เลือก Light / Dark / System และเปิด/ปิดเสียงแจ้งเตือน บันทึกเฉพาะเครื่องนี้",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "เลือกขอบเขตการตั้งค่า",
        desc: "เลือกแถบ Project สำหรับภาพรวมทั้งโครงการ, Boards สำหรับเฉพาะบอร์ด, หรือ Personal สำหรับเครื่องนี้",
      },
      {
        step: "02",
        title: "ปรับแต่งตาม Settings Row",
        desc: "ดูชื่อหัวข้อทางซ้าย และปรับสวิตช์หรือกรอกข้อมูลทางขวา กวาดสายตาได้รวดเร็ว",
      },
      {
        step: "03",
        title: "บันทึกการเปลี่ยนแปลง",
        desc: "กด Save เมื่อแก้ไขข้อมูล ระบบจะบันทึกและแสดง Toast ยืนยันผลทันที",
      },
    ],
    technicalSpecs: [
      { label: "Layout Standard", value: "Scope-grouped Settings Row (Modern Minimalist Standard)" },
      { label: "URL Deep Linking", value: "?tab=...&boardId=... sync" },
      { label: "Destructive Action", value: "ConfirmModal verification required" },
    ],
    tips: "แชร์ลิงก์ตรงได้ด้วย ?tab=boards, ?tab=access, ?tab=attributes หรือ ?tab=board-general&boardId=...",
    relatedTopicIds: ["roles-and-security", "card-attributes-customization", "kanban-boards"],
    demoType: "permissions",
  },
  {
    id: "keyboard-shortcuts",
    category: "shortcuts",
    icon: Keyboard,
    title: "คีย์ลัดระบบและการทำงานความเร็วสูง",
    badge: "Power User",
    badgeColor: "border-stone-400/30 bg-stone-400/10 text-stone-600 dark:text-stone-400",
    scopeBadge: "ทางลัดความเร็วสูง",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "เพิ่มประสิทธิภาพการทำงานด้วยคีย์ลัดและการค้นหาด่วนแบบไม่ต้องยกมือจากคีย์บอร์ด",
    concept:
      "ออกแบบมาเพื่อสาย Power Users ที่ต้องการสลับงาน ค้นหาการ์ด หรือสั่งการระบบอย่างรวดเร็วผ่านทางลัดแป้นพิมพ์",
    highlights: [
      "Ctrl / Cmd + K : เปิด Command Palette ค้นหาโปรเจกต์ บอร์ด การ์ด และคำสั่งทั้งหมดในพริบตา",
      "F : สลับโหมด Focus Mode ซ่อนแถบข้างและเครื่องมือเพื่อโฟกัสกับบอร์ดตรงหน้า",
      "Esc : ปิดหน้าต่าง Modal, กล่องแชท หรือ Popover ทั้งหมดทันที",
      "Enter : ส่งข้อความในแชท AI หรือบันทึกช่องกรอกข้อมูล",
      "Ctrl / Cmd + / : เปิดคู่มือและคีย์ลัดระบบนี้ได้ทันที",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "กด Ctrl / Cmd + K เพื่อค้นหา",
        desc: "พิมพ์คำค้นหาชื่อการ์ด ชื่องาน หรือชื่อบอร์ด เพื่อกระโดดข้ามหน้าได้ใน 1 วินาที",
      },
      {
        step: "02",
        title: "กด F เพื่อเข้าสู่ Focus Mode",
        desc: "ซ่อนเมนูด้านข้างและแถบเครื่องมือ เพื่อจดจ่อกับการ์ดงานบนหน้าจออย่างเต็มที่",
      },
      {
        step: "03",
        title: "กด Esc เพื่อปิดหน้าต่าง",
        desc: "ปิดหน้าต่างการ์ด กล่องสนทนา AI หรือเมนูย่อยทันทีโดยไม่ต้องคลิกเมาส์",
      },
    ],
    technicalSpecs: [
      { label: "Global Shortcuts", value: "Ctrl/Cmd+K, F, Esc, Enter" },
      { label: "Search Mechanism", value: "Instant Client-side Fuzzy Matching" },
    ],
    codeOrShortcut: "Ctrl + K / Cmd + K",
    tips: "กด Command Palette แล้วพิมพ์ชื่อการ์ดหรือบอร์ดเพื่อกระโดดข้ามหน้าได้เร็วกว่าการคลิกหลายเท่า",
    relatedTopicIds: ["welcome-overview", "kanban-boards", "ai-assistant"],
    demoType: "shortcuts",
  },
  {
    id: "faq-credits-offline",
    category: "faq",
    icon: HelpCircle,
    title: "คำถามที่พบบ่อย (FAQ & การแก้ปัญหา)",
    badge: "FAQ",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-amber-600 dark:text-dusk-amber",
    scopeBadge: "การแก้ปัญหา & Q&A",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "7 ต.ค. 2026",
    summary:
      "รวบรวมข้อสงสัยทั่วไปและแนวทางแก้ไขเมื่อพบปัญหาในการใช้งาน",
    concept:
      "คำตอบสำหรับคำถามที่ผู้ใช้งานสอบถามเข้ามาบ่อยที่สุด พร้อมแนวทางการแก้ไขปัญหาเบื้องต้นด้วยตนเอง",
    highlights: [
      "Q: การใช้งาน Retzlo AI ต้องติดตั้งหรือตั้งค่าเซิร์ฟเวอร์เพิ่มเติมไหม? -> ตอบ: ระบบ Retzlo AI มีพร้อมใช้งานในตัวทันที (Built-in Server AI) เชื่อมต่ออัตโนมัติในทุก Workspace พร้อมใช้งานได้เลยในคลิกเดียว",
      "Q: ข้อมูลจะหายไหมหากอินเทอร์เน็ตหลุดกะทันหัน? -> ตอบ: ระบบมีระบบ Draft Storage สำรองข้อมูลการพิมพ์ไว้ในบราวเซอร์ ปลอดภัยหายห่วง",
      "Q: ธีมสีสามารถเปลี่ยนได้หรือไม่? -> ตอบ: รองรับทั้งธีม Light Mode, Dark Mode และ System โดยกดเปลี่ยนได้ที่รูปโปรไฟล์ของคุณ",
      "Q: บอร์ดแบบ Private คนอื่นในโปรเจกต์จะเห็นไหม? -> ตอบ: ไม่เห็นครับ เฉพาะผู้สร้างและสมาชิกที่ได้รับเลือกใน Board Settings เท่านั้นที่จะมองเห็น",
      "Q: ต้องการรายงานข้อผิดพลาดหรือแนะนำฟีเจอร์? -> ตอบ: สามารถพิมพ์แจ้งผ่านผู้ช่วย Retzlo AI หรือไปยังหน้าติดต่อเรา (/contact) ได้ตลอดเวลา",
    ],
    workflowSteps: [
      {
        step: "01",
        title: "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        desc: "หากการ์ดไม่อัปเดต ให้ตรวจดูสถานะเน็ตเพื่อให้ Pusher WebSocket เชื่อมต่อได้สมบูรณ์",
      },
      {
        step: "02",
        title: "ส่งแบบฟอร์มติดต่อทีมงาน (/contact)",
        desc: "เลือกประเภทข้อความ เช่น รายงานข้อผิดพลาด หรือ แนะนำฟีเจอร์ใหม่ พร้อมรับหมายเลข Ticket ทันที",
      },
    ],
    technicalSpecs: [
      { label: "Data Resilience", value: "Offline Draft Storage + Optimistic Rollback" },
      { label: "Support Channel", value: "In-app /contact & Built-in AI Assistant" },
    ],
    tips: "อย่าลืมตรวจสอบการเชื่อมต่ออินเทอร์เน็ตเพื่อให้ WebSocket Pusher ทำงานได้อย่างสมบูรณ์",
    relatedTopicIds: ["welcome-overview", "ai-assistant", "roles-and-security"],
  },
];

export const KEYBOARD_SHORTCUTS_LIST = [
  { key: "Ctrl + K / Cmd + K", title: "เปิด Command Palette", desc: "ค้นหาการ์ด บอร์ด หรือสลับโปรเจกต์ด่วน", cat: "Navigation" },
  { key: "F", title: "สลับ Focus Mode", desc: "ซ่อน Sidebar และเครื่องมือเพื่อโฟกัสกับบอร์ดตรงหน้า", cat: "Navigation" },
  { key: "Esc", title: "ปิดหน้าต่าง / เมนู", desc: "ปิด Modal, กล่องแชท AI, และ Popover ทันที", cat: "General" },
  { key: "Ctrl + /", title: "เปิดศูนย์ช่วยเหลือ & คู่มือ", desc: "เข้าสู่หน้าคู่มือและคีย์ลัดระบบทันที", cat: "General" },
  { key: "Enter", title: "บันทึก / ส่งข้อความ", desc: "ส่งข้อความในกล่องแชท AI หรือบันทึกช่องกรอกข้อความ", cat: "General" },
  { key: "N", title: "สร้างการ์ดใหม่ด่วน", desc: "เปิดแบบฟอร์มสร้างการ์ดใหม่ในคอลัมน์แรก", cat: "Board" },
  { key: "D", title: "สลับ Card Density", desc: "สลับโหมดความหนาแน่น Normal กับ Compact 2x", cat: "Board" },
  { key: "T", title: "สลับมุมมอง Table / Kanban", desc: "สลับระหว่างกระดาน Kanban กับตาราง Spreadsheet", cat: "Board" },
];

export const FAQ_ITEMS = [
  {
    q: "การใช้งาน Retzlo AI ต้องติดตั้งหรือตั้งค่าเซิร์ฟเวอร์เพิ่มเติมไหม?",
    a: "ไม่ต้องติดตั้งอะไรเพิ่มเติมทั้งสิ้น ระบบ Retzlo AI ได้รับการออกแบบให้ทำงานแบบ Built-in Server AI อัจฉริยะในตัว พร้อมให้บริการทุก Workspace ทันทีตั้งแต่เริ่มใช้งาน เพียงคลิกไอคอนหุ่นยนต์ 🤖 บน Topbar ก็เริ่มสั่งงานได้เลย",
    tag: "AI Engine",
  },
  {
    q: "ข้อมูลจะสูญหายหรือไม่ หากสัญญาณอินเทอร์เน็ตหลุดระหว่างพิมพ์?",
    a: "ไม่สูญหายแน่นอนครับ Retzlo มีระบบ Offline Draft Storage สำรองข้อมูลข้อความและแบบฟอร์มไว้ในเครื่องคอมพิวเตอร์ของคุณอัตโนมัติ เมื่อเน็ตกลับมาเชื่อมต่อ ระบบจะส่งต่อข้อมูลอย่างราบรื่น",
    tag: "Data Safety",
  },
  {
    q: "ความแตกต่างระหว่างบอร์ด Public และบอร์ด Private ในโปรเจกต์?",
    a: "บอร์ด Public จะเปิดให้สมาชิกทุกคนในโปรเจกต์เข้าถึงและมองเห็นได้ ส่วนบอร์ด Private จะถูกล็อคให้เฉพาะผู้สร้างและสมาชิกที่ถูกระบุไว้ใน Board Settings เท่านั้นที่มองเห็น ช่วยรักษาความลับของงานสำคัญ",
    tag: "Security",
  },
  {
    q: "มุมมองตาราง Spreadsheet View แตกต่างจากบอร์ด Kanban อย่างไร?",
    a: "บอร์ด Kanban เหมาะกับการดูโฟลว์การไหลของงานตามสถานะ ส่วน Spreadsheet Table View เหมาะกับการกวาดดูข้อมูลจำนวนมากในคราวเดียว แก้ไขชื่องาน สถานะ ความสำคัญ และมอบหมายเพื่อนร่วมทีมได้แบบ Inline ทันทีโดยไม่ต้องเปิดหน้าต่างการ์ด",
    tag: "Views",
  },
  {
    q: "ระบบ Coffee Cheers ใช้งานอย่างไรและได้เหรียญอย่างไร?",
    a: "เมื่อการ์ดย้ายไปยังคอลัมน์ที่เสร็จสิ้น (Done) จะมีปุ่ม ☕ Cheers ปรากฏขึ้น เพื่อนร่วมทีมสามารถกดส่งกำลังใจได้ ซึ่งจะเพิ่มเหรียญรางวัลสะสมให้แก่ผู้รับผิดชอบงานเพื่อนำไปแลกของรางวัลใน Rewards Store ประจำโปรเจกต์",
    tag: "Gamification",
  },
  {
    q: "ต้องการเปลี่ยนธีมสีระหว่างมืด (Dark) กับสว่าง (Warm Light) ต้องทำอย่างไร?",
    a: "คลิกที่รูปโปรไฟล์ของคุณที่มุมบนขวา จากนั้นเลือกเมนู Theme เพื่อสลับระหว่าง Dark Mode (Retro Lofi Indigo), Light Mode (Warm Paper) หรือเลือก System เพื่อเปลี่ยนตามการตั้งค่าของอุปกรณ์",
    tag: "Appearance",
  },
];

/* ── Interactive Sandboxes & Visual Components ── */

function InteractiveAiDemo() {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("สรุปงานของสัปดาห์นี้ให้หน่อย");
  const [isThinking, setIsThinking] = useState(false);
  const [simulatedReply, setSimulatedReply] = useState<string>("");

  const prompts = [
    { label: "สรุปงานสัปดาห์นี้", text: "สรุปงานของสัปดาห์นี้ให้หน่อย" },
    { label: "แตกงานระบบ Login", text: "ช่วยแตกการ์ดงานทำระบบ Login เป็นเช็คลิสต์ 5 ข้อย่อย" },
    { label: "ตรวจเช็คคอขวด", text: "มีงานไหนที่ติดค้างใน In Progress เกิน 3 วันบ้าง?" },
  ];

  const handleSimulate = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsThinking(true);
    setSimulatedReply("");

    setTimeout(() => {
      setIsThinking(false);
      if (promptText.includes("Login")) {
        setSimulatedReply(
          "✨ แตกเช็คลิสต์งาน 'ระบบ Authentication & Login' (5 ข้อย่อย):\n" +
            "  ☑️ 01. ออกแบบฟอร์ม Sign In & Sign Up ด้วย Retro Lofi UI\n" +
            "  ☑️ 02. เชื่อมต่อ NextAuth Credentials Provider\n" +
            "  ☑️ 03. ทำระบบเข้ารหัสผ่าน Argon2 / Bcrypt ในฐานข้อมูล\n" +
            "  ☑️ 04. เพิ่มการแจ้งเตือนความผิดพลาดผ่าน Toast Notification\n" +
            "  ☑️ 05. ทดสอบ Unit Test การเข้าสู่ระบบแบบอัตโนมัติ"
        );
      } else if (promptText.includes("คอขวด")) {
        setSimulatedReply(
          "⚡ ตรวจสอบสุขภาพบอร์ด: พบคอขวด 2 รายการในคอลัมน์ In Progress:\n" +
            "  • งาน 'เชื่อมต่อ Pusher WebSocket' (กำลังดำเนินการ 4 วัน - เกิน WIP Limit!)\n" +
            "  • งาน 'ส่งออกรายงาน Executive Table' (กำลังทดสอบ PDF Multi-page)\n" +
            "💡 แนะนำ: กระจายงาน WebSocket ให้สมาชิกช่วยรีวิว หรือขยับ WIP Limit ชั่วคราว"
        );
      } else {
        setSimulatedReply(
          "📊 สรุปความคืบหน้าประจำสัปดาห์:\n" +
            "  • งานทั้งหมดในสปรินต์: 18 การ์ด\n" +
            "  • ทำเสร็จสิ้นแล้ว (Done): 11 การ์ด (คิดเป็น 61.1%)\n" +
            "  • กำลังดำเนินการ (In Progress): 4 การ์ด\n" +
            "  • รอการทดสอบ (Review): 3 การ์ด\n" +
            "☕ มีการกดส่ง Coffee Cheers ทั้งหมด 14 แก้ว! บรรยากาศทีมยอดเยี่ยมมากครับ"
        );
      }
    }, 450);
  };

  useEffect(() => {
    handleSimulate("สรุปงานของสัปดาห์นี้ให้หน่อย");
  }, []);

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
              ทดลองคลิกคำสั่งตัวอย่างเพื่อดูรูปแบบการตอบและวิเคราะห์ของ AI ในระบบ
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
                กำลังวิเคราะห์บริบทของบอร์ดและประมวลผล...
              </span>
            ) : (
              simulatedReply
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
          <span>ความเร็ว: ~0.4s · บริบท: โครงการ & การ์ดสด</span>
          <span className="text-emerald-400 font-semibold">Zero-Config Server AI</span>
        </div>
      </div>
    </div>
  );
}

function InteractiveKanbanTableDemo() {
  const [view, setView] = useState<"kanban" | "table">("table");
  const [density, setDensity] = useState<"normal" | "compact">("compact");
  const [doneCards, setDoneCards] = useState<Record<number, boolean>>({ 3: true });

  const toggleDone = (id: number) => {
    setDoneCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleTasks = [
    { id: 1, title: "ออกแบบหน้าคู่มือระบบใหม่แบบ Interactive", status: "In Progress", priority: "P0 Blocker", pColor: "bg-rose-500 text-white", assignees: ["NR", "AI"] },
    { id: 2, title: "เชื่อมต่อ WebSocket Pusher เพื่อ Real-time Sync", status: "In Progress", priority: "P1 Urgent", pColor: "bg-amber-500 text-white", assignees: ["TK"] },
    { id: 3, title: "ปรับปรุงขนาด Board Settings Modal ไม่ให้เลยขอบ", status: "Done", priority: "P2 Normal", pColor: "bg-indigo-500 text-white", assignees: ["NR"] },
  ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-ink-950/70 shadow-sm space-y-4">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
            จำลองมุมมองบอร์ด:
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
              📊 Spreadsheet Table
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
            {density === "normal" ? "Normal (มาตรฐาน)" : "Compact 2x (หนาแน่น)"}
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
                <th className="py-2.5 px-3">ชื่องาน (Title)</th>
                <th className="py-2.5 px-3">สถานะ (Status)</th>
                <th className="py-2.5 px-3">ระดับความสำคัญ (Priority)</th>
                <th className="py-2.5 px-3">ผู้รับผิดชอบ (Assignees)</th>
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
                        title="คลิกเพื่อติ๊กเสร็จงาน (Hover Checkbox)"
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
              <span>In Progress (กำลังทำ)</span>
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
                    ย้ายไป Done →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-400">
              <span>Done (เสร็จสิ้น)</span>
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
                    ☕ 1 Cheers ได้รับแล้ว
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDone(t.id)}
                    className="text-[10px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    ย้อนกลับ
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

function InteractivePrioritiesDemo() {
  const [selectedColor, setSelectedColor] = useState("rose");

  const colors = [
    { id: "rose", label: "Rose", bg: "bg-rose-500", text: "text-white" },
    { id: "amber", label: "Amber", bg: "bg-amber-500", text: "text-white" },
    { id: "emerald", label: "Emerald", bg: "bg-emerald-500", text: "text-white" },
    { id: "teal", label: "Teal", bg: "bg-teal-500", text: "text-white" },
    { id: "cyan", label: "Cyan", bg: "bg-cyan-500", text: "text-white" },
    { id: "indigo", label: "Indigo", bg: "bg-indigo-500", text: "text-white" },
    { id: "purple", label: "Purple", bg: "bg-purple-500", text: "text-white" },
    { id: "pink", label: "Pink", bg: "bg-pink-500", text: "text-white" },
  ];

  const levels = [
    { level: 1, name: "P0 Blocker", color: "bg-rose-500 text-white" },
    { level: 2, name: "P1 Critical", color: "bg-orange-500 text-white" },
    { level: 3, name: "P2 High", color: "bg-amber-500 text-white" },
    { level: 4, name: "P3 Normal", color: "bg-indigo-500 text-white" },
    { level: 5, name: "P4 Low", color: "bg-stone-500 text-white" },
  ];

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-ink-950/70 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-white/10 pb-3">
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            ระบบความสำคัญ 10 ระดับ (10-Level Custom Priorities)
          </h4>
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            สร้างได้สูงสุด 10 ระดับต่อบอร์ด พร้อมเลือกได้ 12 สี Retro Lofi Palette
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
          12 Retro Colors
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
          ตัวอย่างระดับความสำคัญของบอร์ด:
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

      <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-white/5">
        <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
          ทดลองเลือกชุดสี Retro Lofi:
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
                  ? "border-stone-900 bg-stone-100 dark:border-white dark:bg-white/10"
                  : "border-stone-200 bg-white hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.02]"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", c.bg)} />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InteractiveCoffeeDemo() {
  const [coffees, setCoffees] = useState(12);
  const [coins, setCoins] = useState(60);
  const [isCheersActive, setIsCheersActive] = useState(false);
  const { toast } = useToast();

  const handleCheers = () => {
    setCoffees((c) => c + 1);
    setCoins((c) => c + 5);
    setIsCheersActive(true);
    toast({ message: "☕ ส่ง Coffee Cheers สำเร็จ! ได้รับ +5 Coins", type: "success" });
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
              ส่งกำลังใจเมื่องานเสร็จสมบูรณ์ และสะสมเหรียญแลกของรางวัล
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-dusk-amber">
            <span>🪙 {coins} Coins</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-dusk-rose">
            <span>☕ {coffees} Cheers</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 dark:border-white/10 dark:bg-stone-900/80">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
            การ์ดงาน: &ldquo;ส่งมอบเวอร์ชัน Retzlo 2.4&rdquo;
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ ย้ายมาคอลัมน์ Done แล้ว
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
          <span>กด ☕ Cheers (+5 Coins)</span>
        </button>
      </div>
    </div>
  );
}

/* ── Main Help Center Client Component ── */

export function HelpCenterClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTopicId, setActiveTopicId] = useState<string>(TOPICS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"docs" | "interactive" | "shortcuts" | "faq">("docs");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);
  const [feedbackVote, setFeedbackVote] = useState<"helpful" | "unhelpful" | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const readerTopRef = useRef<HTMLDivElement>(null);
  const { openAiChat } = useAiChat();
  const { toast } = useToast();

  // Keyboard shortcut listener (Ctrl+K or Cmd+K focuses search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter topics based on category and search query
  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === "all" || topic.category === selectedCategory;
      const matchesSearch =
        !query ||
        topic.title.toLowerCase().includes(query) ||
        topic.summary.toLowerCase().includes(query) ||
        topic.highlights.some((h) => h.toLowerCase().includes(query)) ||
        (topic.codeOrShortcut && topic.codeOrShortcut.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Current active topic in reader view
  const activeTopic = useMemo(() => {
    return (
      TOPICS.find((t) => t.id === activeTopicId) ||
      filteredTopics[0] ||
      TOPICS[0]
    );
  }, [activeTopicId, filteredTopics]);

  // Pagination: Previous and Next topics
  const currentTopicIndex = useMemo(() => {
    return TOPICS.findIndex((t) => t.id === activeTopic.id);
  }, [activeTopic]);

  const prevTopic = currentTopicIndex > 0 ? TOPICS[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < TOPICS.length - 1 ? TOPICS[currentTopicIndex + 1] : null;

  // Jump to topic
  const selectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setFeedbackVote(null);
    setIsMobileSidebarOpen(false);
    setViewMode("docs");
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy shortcut
  const handleCopyShortcut = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedShortcut(code);
    toast({ message: `คัดลอกคีย์ลัด "${code}" เรียบร้อยแล้ว`, type: "success" });
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  // Feedback vote
  const handleFeedback = (type: "helpful" | "unhelpful") => {
    setFeedbackVote(type);
    toast({
      message:
        type === "helpful"
          ? "ขอบคุณสำหรับข้อเสนอแนะ! ดีใจที่บทความนี้มีประโยชน์กับคุณ"
          : "ขอบคุณสำหรับข้อเสนอแนะ! เราจะนำไปพัฒนาเนื้อหาให้ดียิ่งขึ้น",
      type: "success",
    });
  };

  const ActiveIcon = activeTopic.icon;

  return (
    <main className="soft-grid-bg min-h-screen w-full text-stone-900 dark:text-stone-100 flex flex-col">
      {/* ── Top Header / Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/90 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <BackButton />

            {/* Mobile Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-stone-200/80 bg-stone-100/80 text-stone-700 hover:bg-stone-200 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300 dark:hover:bg-white/10 transition cursor-pointer"
              aria-label="Toggle docs navigation"
              title="เปิด/ปิด เมนูสารบัญ"
            >
              {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-600 dark:text-dusk-amber">
                    Retzlo Docs
                  </span>
                  <span className="hidden sm:inline-flex rounded-full bg-indigo-100 dark:bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-700 dark:text-stone-300">
                    v2.4 LTS
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                  ข้อมูลระบบ & คู่มือการใช้งาน
                </h1>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา เช่น AI, Spreadsheet, 10 Priorities, คีย์ลัด..."
                className="w-full h-9 rounded-xl border border-stone-200/90 bg-stone-100/70 pl-10 pr-14 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-black/30 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender/60 dark:focus:ring-dusk-lavender/30 transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title="ล้างคำค้น"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center rounded border border-stone-300/80 bg-stone-200/50 px-1.5 py-0.5 font-mono text-[9px] text-stone-500 dark:border-white/10 dark:bg-white/10 dark:text-stone-400">
                    Ctrl K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right: View Switcher & AI Launcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center rounded-xl border border-stone-200/90 bg-stone-100/70 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setViewMode("docs")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "docs"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="โหมดอ่านคู่มือเอกสาร"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>คู่มือ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "interactive"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="โหมดทดลองฟีเจอร์สด"
              >
                <Play className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
                <span>จำลองสด</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("shortcuts")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "shortcuts"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="โหมดคลังคีย์ลัด"
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>คีย์ลัด</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("faq")}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "faq"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="คำถามที่พบบ่อย"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQ</span>
              </button>
            </div>

            {/* Quick AI Trigger Button */}
            <button
              type="button"
              onClick={openAiChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:hover:bg-dusk-lavender dark:hover:text-ink-950 transition cursor-pointer shadow-sm"
              title="เปิดคุยกับ Retzlo AI ประจำระบบ"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ถาม AI</span>
              <Sparkles className="h-3 w-3 text-amber-500 dark:text-dusk-amber" />
            </button>

            {/* Link to Workspaces */}
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08] transition shadow-sm"
              title="กลับไปยังหน้าโปรเจกต์"
            >
              <FolderKanban className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
              <span className="hidden md:inline">Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Welcome Hero Banner & System Pillars Bento ── */}
      <section className="border-b border-stone-200/80 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-dusk-lavender/10 dark:via-ink-950/60 dark:to-transparent py-6 sm:py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/15 dark:text-dusk-lavender">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-dusk-amber" />
                <span>Retzlo Documentation & Knowledge Hub</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                คู่มือระบบและศูนย์การเรียนรู้แพลตฟอร์ม
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                ทำความเข้าใจสถาปัตยกรรมโมดูลาร์ เวิร์กโฟลว์การทำงานระดับมืออาชีพ และการใช้งานขุมพลัง AI ในตัวแบบเบ็ดเสร็จ
              </p>
            </div>

            {/* Quick System Badge Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white/80 px-3 py-1.5 text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 shadow-xs">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Real-time 0ms Optimistic UI</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white/80 px-3 py-1.5 text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 shadow-xs">
                <Bot className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
                <span>Built-in Server AI (พร้อมใช้งานทันที Zero-Config)</span>
              </span>
            </div>
          </div>

          {/* 6 Core Pillars Bento Grid Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {SYSTEM_PILLARS.map((pillar) => {
              const PillarIcon = pillar.icon;
              const isSelected = activeTopic.id === pillar.id && viewMode === "docs";

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => selectTopic(pillar.id)}
                  className={cn(
                    "group relative flex flex-col p-3 rounded-2xl border text-left transition duration-150 cursor-pointer",
                    isSelected
                      ? "border-indigo-400 bg-indigo-50/80 shadow-sm dark:border-dusk-lavender dark:bg-dusk-lavender/20"
                      : "border-stone-200/80 bg-white/80 hover:border-indigo-300 hover:bg-white hover:shadow-xs dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-dusk-lavender/40 dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("grid h-7 w-7 place-items-center rounded-lg border", pillar.color)}>
                      <PillarIcon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      {pillar.tag}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender transition truncate">
                    {pillar.title}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 leading-snug">
                    {pillar.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Layout Body ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 gap-8">
        {/* ── Left Sidebar (Only in Docs view) ── */}
        {viewMode === "docs" && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 transform bg-white/95 p-5 border-r border-stone-200/80 backdrop-blur-xl transition-transform duration-200 ease-in-out dark:bg-ink-950/95 dark:border-white/10 lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:border-none lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:translate-x-0 flex flex-col",
              isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}
          >
            {/* Mobile Sidebar Header */}
            <div className="flex lg:hidden items-center justify-between pb-4 border-b border-stone-200 dark:border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                <span className="font-bold text-sm text-stone-900 dark:text-stone-100">สารบัญคู่มือ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sticky container on desktop */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-4 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 scrollbar-thin">
              {/* Category Quick Filter Pills */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 px-2">
                  หมวดหมู่
                </p>
                <div className="flex flex-col gap-0.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    const count =
                      cat.id === "all"
                        ? TOPICS.length
                        : TOPICS.filter((t) => t.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition cursor-pointer text-left",
                          isActive
                            ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-stone-200"
                        )}
                      >
                        <span className="truncate">{cat.label}</span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.2 text-[10px]",
                            isActive
                              ? "bg-indigo-100 text-indigo-700 dark:bg-dusk-lavender/25 dark:text-dusk-lavender"
                              : "bg-stone-100 text-stone-500 dark:bg-white/5 dark:text-stone-400"
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-stone-200/80 dark:bg-white/10 my-1" />

              {/* Document Topics Tree */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    หัวข้อบทความ ({filteredTopics.length})
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] text-indigo-600 hover:underline dark:text-dusk-lavender"
                    >
                      ล้างค้นหา
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {filteredTopics.map((topic) => {
                    const isActive = activeTopic.id === topic.id;
                    const Icon = topic.icon;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => selectTopic(topic.id)}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition cursor-pointer text-left",
                          isActive
                            ? "bg-indigo-50 font-semibold text-indigo-700 shadow-sm border border-indigo-200/80 dark:bg-dusk-lavender/15 dark:border-dusk-lavender/30 dark:text-dusk-lavender"
                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-transparent dark:text-stone-400 dark:hover:bg-white/[0.04] dark:hover:text-stone-200"
                        )}
                      >
                        {isActive && (
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full bg-indigo-600 dark:bg-dusk-lavender" />
                        )}

                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition",
                            isActive
                              ? "text-indigo-600 dark:text-dusk-lavender"
                              : "text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"
                          )}
                        />

                        <span className="flex-1 truncate">{topic.title}</span>

                        {topic.badge && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[9px] font-medium shrink-0",
                              topic.badgeColor
                            )}
                          >
                            {topic.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {filteredTopics.length === 0 && (
                    <div className="p-3 text-center text-xs text-stone-500 dark:text-stone-400">
                      ไม่พบบทความที่ค้นหา
                    </div>
                  )}
                </div>
              </div>

              {/* System Guide Reference Footer */}
              <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-[11px] text-stone-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                  <span>docs/system-guide.md</span>
                </div>
                <p className="leading-relaxed">
                  คู่มือนี้ซิงค์ตรงกับมาตรฐาน AGENTS.md และสถาปัตยกรรมระบบ Retzlo v2.4
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* ── Main Content Area ── */}
        <div className="flex-1 min-w-0">
          <div ref={readerTopRef} />

          {/* VIEW MODE 1: Documentation Reader */}
          {viewMode === "docs" && (
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Document Article Body */}
              <article className="flex-1 min-w-0 lofi-panel rounded-3xl border border-stone-200/80 bg-white/95 p-6 sm:p-9 dark:border-white/10 dark:bg-ink-950/70 shadow-sm space-y-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <Link href="/projects" className="hover:text-stone-900 dark:hover:text-stone-200">
                    Home
                  </Link>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="hover:text-stone-900 dark:hover:text-stone-200"
                  >
                    Documentation
                  </button>
                  <ChevronRight className="h-3 w-3 text-stone-400" />
                  <span className="font-semibold text-indigo-600 dark:text-dusk-lavender truncate max-w-[200px] sm:max-w-none">
                    {activeTopic.title}
                  </span>
                </nav>

                {/* Article Header & Lead Hero Card */}
                <header className="space-y-4 border-b border-stone-200/80 pb-6 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeTopic.badge && (
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          activeTopic.badgeColor
                        )}
                      >
                        {activeTopic.badge}
                      </span>
                    )}
                    {activeTopic.scopeBadge && (
                      <span className="rounded-full bg-stone-100 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        {activeTopic.scopeBadge}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400">
                      <Clock className="h-3 w-3" />
                      {activeTopic.readingTime || "อ่าน 3 นาที"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400">
                      <Calendar className="h-3 w-3" />
                      {activeTopic.lastUpdated || "อัปเดต: 7 ต.ค. 2026"}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-indigo-100 bg-indigo-50/80 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender shadow-xs">
                      <ActiveIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                        {activeTopic.title}
                      </h1>
                    </div>
                  </div>

                  {/* Lead Summary Callout Banner */}
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-white p-4 sm:p-5 text-xs sm:text-sm text-stone-700 leading-relaxed dark:border-dusk-lavender/25 dark:from-dusk-lavender/10 dark:via-dusk-lavender/5 dark:to-transparent dark:text-stone-200 shadow-xs">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                          สรุปสาระสำคัญ (Executive Summary)
                        </p>
                        <p>{activeTopic.summary}</p>
                      </div>
                    </div>
                  </div>
                </header>

                {/* ── Interactive Feature Sandbox / Live Demo Widget (Topic-Tailored) ── */}
                {activeTopic.demoType && (
                  <section id="live-demo" className="space-y-2 scroll-mt-24">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Play className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                        <span>ตัวอย่างจำลองฟีเจอร์สด (Interactive Live Sandbox)</span>
                      </h2>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                        ลองคลิกใช้งานได้โดยตรง
                      </span>
                    </div>

                    {activeTopic.demoType === "ai-chat" && <InteractiveAiDemo />}
                    {activeTopic.demoType === "kanban-table" && <InteractiveKanbanTableDemo />}
                    {activeTopic.demoType === "priorities" && <InteractivePrioritiesDemo />}
                    {activeTopic.demoType === "coffee" && <InteractiveCoffeeDemo />}
                    {activeTopic.demoType === "architecture" && (
                      <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02] space-y-3">
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          สถาปัตยกรรมการประมวลผล Retzlo Architecture Pipeline
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-3 rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-800/80 space-y-1">
                            <span className="font-bold text-indigo-600 dark:text-dusk-lavender">01. App Router</span>
                            <p className="text-[10px] text-stone-500">Next.js React Client Components</p>
                          </div>
                          <div className="p-3 rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-800/80 space-y-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">02. Optimistic UI</span>
                            <p className="text-[10px] text-stone-500">0ms State Sync & Auto Rollback</p>
                          </div>
                          <div className="p-3 rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-800/80 space-y-1">
                            <span className="font-bold text-amber-600 dark:text-dusk-amber">03. Pusher WS</span>
                            <p className="text-[10px] text-stone-500">Live Team Collaboration Broadcast</p>
                          </div>
                          <div className="p-3 rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-800/80 space-y-1">
                            <span className="font-bold text-purple-600 dark:text-purple-400">04. Neon & AI</span>
                            <p className="text-[10px] text-stone-500">PostgreSQL + Built-in Intelligence</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Section 1: Overview & Concept */}
                {activeTopic.concept && (
                  <section id="overview" className="space-y-3 scroll-mt-24">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Compass className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>ภาพรวมและแนวคิดของฟีเจอร์</span>
                    </h2>
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 sm:p-5 text-xs sm:text-sm text-stone-700 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-300 leading-relaxed">
                      {activeTopic.concept}
                    </div>
                  </section>
                )}

                {/* Section 2: Key Capabilities & Highlights Grid */}
                <section id="capabilities" className="space-y-4 scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>คุณสมบัติและความสามารถหลัก (Key Capabilities)</span>
                    </h2>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      {activeTopic.highlights.length} รายการ
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeTopic.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/40 p-4 transition hover:border-indigo-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.04] shadow-xs"
                      >
                        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-snug">
                          {highlight}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3: Step-by-Step Workflow Guide */}
                {activeTopic.workflowSteps && activeTopic.workflowSteps.length > 0 && (
                  <section id="workflow" className="space-y-4 scroll-mt-24">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <ListChecks className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>ขั้นตอนการใช้งานจริง (Step-by-Step Workflow Guide)</span>
                    </h2>

                    <div className="grid gap-3">
                      {activeTopic.workflowSteps.map((stepItem, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] shadow-xs"
                        >
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-50 font-mono text-xs font-bold text-indigo-700 border border-indigo-200/80 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30">
                            {stepItem.step}
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                              {stepItem.title}
                            </h3>
                            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                              {stepItem.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 4: Technical Specifications */}
                {activeTopic.technicalSpecs && activeTopic.technicalSpecs.length > 0 && (
                  <section id="technical-specs" className="space-y-3.5 scroll-mt-24">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Zap className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>ข้อมูลจำเพาะทางเทคนิค (Technical Specifications)</span>
                    </h2>

                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-3 sm:p-4 dark:border-white/10 dark:bg-white/[0.02]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeTopic.technicalSpecs.map((spec, i) => (
                          <div key={i} className="flex flex-col gap-0.5 bg-white/80 dark:bg-white/[0.04] p-3 rounded-xl border border-stone-200/60 dark:border-white/5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                              {spec.label}
                            </span>
                            <span className="text-xs font-semibold text-stone-900 dark:text-stone-200 font-mono">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Section 5: Pro Tips Callout */}
                {activeTopic.tips && (
                  <section id="tips" className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-xs sm:text-sm text-amber-900 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber space-y-1.5 shadow-xs scroll-mt-24">
                    <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-dusk-amber">
                      <span className="text-base">💡</span>
                      <span>เคล็ดลับจากผู้เชี่ยวชาญ (Pro Tip)</span>
                    </div>
                    <p className="leading-relaxed pl-6 text-amber-900/90 dark:text-stone-300">
                      {activeTopic.tips}
                    </p>
                  </section>
                )}

                {/* Section 6: Code / Keyboard Shortcut (if available) */}
                {activeTopic.codeOrShortcut && (
                  <section id="shortcuts" className="space-y-3 scroll-mt-24">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Keyboard className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>คีย์ลัดด่วน (Keyboard Shortcut)</span>
                    </h2>

                    <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-900 p-4 text-white dark:border-white/10 dark:bg-ink-950 shadow-inner">
                      <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-amber-300">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span>{activeTopic.codeOrShortcut}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyShortcut(activeTopic.codeOrShortcut!)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-stone-200 hover:bg-white/20 transition cursor-pointer"
                        title="คัดลอกคีย์ลัด"
                      >
                        {copiedShortcut === activeTopic.codeOrShortcut ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>คัดลอก</span>
                          </>
                        )}
                      </button>
                    </div>
                  </section>
                )}

                {/* Section 7: Related Topics Navigation */}
                {activeTopic.relatedTopicIds && activeTopic.relatedTopicIds.length > 0 && (
                  <section className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      บทความและโมดูลที่เกี่ยวข้อง
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeTopic.relatedTopicIds.map((relId) => {
                        const relTopic = TOPICS.find((t) => t.id === relId);
                        if (!relTopic) return null;
                        const RelIcon = relTopic.icon;

                        return (
                          <button
                            key={relId}
                            type="button"
                            onClick={() => selectTopic(relId)}
                            className="group flex items-center gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.04] transition cursor-pointer text-left"
                          >
                            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                              <RelIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender truncate">
                                {relTopic.title}
                              </p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                                {relTopic.summary}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender shrink-0 transition" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ── Article Feedback Widget ── */}
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                      บทความนี้มีประโยชน์กับคุณหรือไม่?
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      คำติชมของคุณช่วยให้เราปรับปรุงคู่มือระบบได้ดียิ่งขึ้น
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {feedbackVote ? (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        ขอบคุณสำหรับข้อเสนอแนะ!
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFeedback("helpful")}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition cursor-pointer shadow-sm"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>มีประโยชน์</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback("unhelpful")}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:border-rose-300 hover:text-rose-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition cursor-pointer shadow-sm"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>ต้องปรับปรุง</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Prev / Next Navigation Buttons ── */}
                <footer className="pt-4 border-t border-stone-200/80 dark:border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prevTopic ? (
                      <button
                        type="button"
                        onClick={() => selectTopic(prevTopic.id)}
                        className="group flex flex-col items-start p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.05] transition cursor-pointer text-left shadow-sm"
                      >
                        <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender">
                          <ChevronLeft className="h-3.5 w-3.5" />
                          บทความก่อนหน้า
                        </span>
                        <span className="mt-1 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender truncate w-full">
                          {prevTopic.title}
                        </span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {nextTopic && (
                      <button
                        type="button"
                        onClick={() => selectTopic(nextTopic.id)}
                        className="group flex flex-col items-end p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.05] transition cursor-pointer text-right shadow-sm"
                      >
                        <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender">
                          บทความถัดไป
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                        <span className="mt-1 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-dusk-lavender truncate w-full">
                          {nextTopic.title}
                        </span>
                      </button>
                    )}
                  </div>
                </footer>
              </article>

              {/* ── Right Column: Table of Contents & Support (Desktop Only) ── */}
              <aside className="hidden xl:block w-64 shrink-0 sticky top-24 space-y-5">
                {/* On This Page Widget */}
                <div className="lofi-panel rounded-2xl border border-stone-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-ink-950/40 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                    ในบทความนี้
                  </p>
                  <nav className="flex flex-col gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                    {activeTopic.demoType && (
                      <a
                        href="#live-demo"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate flex items-center gap-1.5 text-indigo-600 dark:text-dusk-lavender font-semibold"
                      >
                        <Play className="h-3 w-3" />
                        <span>ตัวอย่างจำลองสด</span>
                      </a>
                    )}
                    {activeTopic.concept && (
                      <a
                        href="#overview"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • ภาพรวมและแนวคิด
                      </a>
                    )}
                    <a
                      href="#capabilities"
                      className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                    >
                      • คุณสมบัติและความสามารถ
                    </a>
                    {activeTopic.workflowSteps && activeTopic.workflowSteps.length > 0 && (
                      <a
                        href="#workflow"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • ขั้นตอนการใช้งานจริง
                      </a>
                    )}
                    {activeTopic.technicalSpecs && activeTopic.technicalSpecs.length > 0 && (
                      <a
                        href="#technical-specs"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • ข้อมูลจำเพาะทางเทคนิค
                      </a>
                    )}
                    {activeTopic.tips && (
                      <a
                        href="#tips"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • เคล็ดลับจากผู้เชี่ยวชาญ
                      </a>
                    )}
                    {activeTopic.codeOrShortcut && (
                      <a
                        href="#shortcuts"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • คีย์ลัดด่วน
                      </a>
                    )}
                  </nav>
                </div>

                {/* Need Help AI Card */}
                <div className="lofi-panel rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 text-stone-800 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-stone-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-700 dark:text-dusk-lavender">
                    <Bot className="h-4 w-4" />
                    <span>ต้องการความช่วยเหลือเพิ่มเติม?</span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    ถามคำถามเกี่ยวกับฟีเจอร์หรือการใช้งานกับผู้ช่วย Retzlo AI ได้ทันทีในระบบ
                  </p>
                  <button
                    type="button"
                    onClick={openAiChat}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90 transition cursor-pointer shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 dark:text-ink-950" />
                    <span>ถาม AI Assistant</span>
                  </button>
                </div>

                {/* Quick Share Link */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 text-[11px] text-stone-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 flex items-center justify-between">
                  <span>เวอร์ชัน Retzlo Docs</span>
                  <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">2.4 Stable</span>
                </div>
              </aside>
            </div>
          )}

          {/* VIEW MODE 2: Interactive Feature Playground */}
          {viewMode === "interactive" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>ศูนย์จำลองฟีเจอร์สด (Interactive Playground)</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    ทดลองสัมผัสระบบสำคัญของ Retzlo แบบสดๆ เพื่อทำความเข้าใจก่อนเริ่มทำงานจริง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>กลับไปยังคู่มือบทความ</span>
                </button>
              </div>

              <div className="grid gap-6">
                {/* 1. Kanban & Spreadsheet Table */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span>1. ระบบมุมมองคู่ (Kanban Board & Spreadsheet Table)</span>
                  </h3>
                  <InteractiveKanbanTableDemo />
                </div>

                {/* 2. Retzlo AI */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span>2. ผู้ช่วย Retzlo AI Simulator</span>
                  </h3>
                  <InteractiveAiDemo />
                </div>

                {/* 3. Custom Priorities */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span>3. ปรับแต่งระดับความสำคัญ 10 ระดับ</span>
                  </h3>
                  <InteractivePrioritiesDemo />
                </div>

                {/* 4. Coffee Cheers */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span>4. ระบบ Coffee Cheers และ Coins Wallet</span>
                  </h3>
                  <InteractiveCoffeeDemo />
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Keyboard Shortcuts Cheatsheet Matrix */}
          {viewMode === "shortcuts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>คลังคีย์ลัดระบบ (Keyboard Shortcuts Matrix)</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    เพิ่มความเร็วในการทำงานระดับ Power User ควบคุมระบบได้โดยไม่ต้องยกมือจากคีย์บอร์ด
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>กลับไปยังคู่มือบทความ</span>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {KEYBOARD_SHORTCUTS_LIST.map((sc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl border border-stone-200/80 bg-white dark:border-white/10 dark:bg-ink-950/70 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {sc.title}
                        </span>
                        <span className="rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.2 text-[9px] font-semibold text-stone-600 dark:text-stone-400">
                          {sc.cat}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {sc.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyShortcut(sc.key)}
                      className="ml-3 flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-mono text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-dusk-amber transition cursor-pointer"
                      title="คลิกเพื่อคัดลอกคีย์ลัด"
                    >
                      {copiedShortcut === sc.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-stone-400" />
                      )}
                      <span>{sc.key}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 4: Interactive FAQ Hub */}
          {viewMode === "faq" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 dark:border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>คำถามที่พบบ่อย (Frequently Asked Questions)</span>
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    คำตอบสำหรับคำถามยอดนิยมและแนวทางการแก้ปัญหาเบื้องต้น
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("docs")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>กลับไปยังคู่มือบทความ</span>
                </button>
              </div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200/80 bg-white dark:border-white/10 dark:bg-ink-950/70 overflow-hidden shadow-xs transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer hover:bg-stone-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-50 font-bold text-xs text-indigo-600 dark:bg-dusk-lavender/15 dark:text-dusk-lavender shrink-0">
                            Q
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            {faq.q}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-block rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:text-stone-400">
                            {faq.tag}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-stone-400 transition transform",
                              isOpen && "rotate-180 text-indigo-600 dark:text-dusk-lavender"
                            )}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 dark:border-white/5 bg-stone-50/40 dark:bg-white/[0.01] text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                          <div className="pt-3">{faq.a}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
