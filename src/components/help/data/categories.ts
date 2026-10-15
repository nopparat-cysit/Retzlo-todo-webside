import {
  Bot,
  Calendar,
  Coffee,
  FolderKanban,
  SlidersHorizontal,
  StickyNote,
} from "lucide-react";
import type { CategoryTheme, GuideTopic } from "./types";

/* ── Cohesive Retro Lofi Field Manual Theme Map ── */

const BASE_THEME: CategoryTheme = {
  eyebrowEn: "SYSTEM DOCUMENTATION",
  eyebrowTh: "เอกสารทางเทคนิค & คู่มือระบบ",
  eyebrowBadge: "bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30",
  iconBox: "border-indigo-200 bg-indigo-50/90 text-indigo-600 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/15 dark:text-dusk-lavender",
  headerAura: "from-indigo-500/10 via-indigo-500/5 to-transparent",
  summaryCard: "border-stone-200/90 bg-white/95 dark:border-white/10 dark:bg-ink-950/70",
  summaryIconBox: "bg-indigo-50 text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender",
  summarySparkleColor: "text-indigo-600 dark:text-dusk-lavender",
  sectionBadge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30",
  stepBadge: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/30",
  activeSidebar: "bg-indigo-50 text-indigo-700 border-indigo-200/90 shadow-2xs dark:bg-dusk-lavender/15 dark:border-dusk-lavender/30 dark:text-dusk-lavender",
  activeSidebarBar: "bg-indigo-600 dark:bg-dusk-lavender",
  activeSidebarIcon: "text-indigo-600 dark:text-dusk-lavender",
};

export const CATEGORY_THEME_MAP: Record<GuideTopic["category"], CategoryTheme> = {
  overview: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 01 // ARCHITECTURE & OVERVIEW",
    eyebrowTh: "หมวด 01 // ภาพรวมระบบ & สถาปัตยกรรม",
  },
  ai: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 02 // RETZLO AI & AUTOMATION",
    eyebrowTh: "หมวด 02 // ผู้ช่วยอัจฉริยะ RETZLO AI",
  },
  kanban: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 03 // WORK MODULE & DUAL VIEWS",
    eyebrowTh: "หมวด 03 // บอร์ด KANBAN & ตาราง SPREADSHEET",
  },
  gamification: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 04 // CHEERS & REWARDS ECONOMY",
    eyebrowTh: "หมวด 04 // COFFEE CHEERS & ร้านของรางวัล",
  },
  calendar: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 05 // CALENDAR & RETRO TIMEPICKER",
    eyebrowTh: "หมวด 05 // ปฏิทินงาน & ตัวเลือกเวลา RETRO",
  },
  notes: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 06 // LIFE HUB & HABIT STREAKS",
    eyebrowTh: "หมวด 06 // สมุดโน้ต, ไดอารี่ & สถิติ STREAKS",
  },
  security: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 07 // MEMBERS, ROLES & PRIVACY",
    eyebrowTh: "หมวด 07 // สมาชิก ทีม และความปลอดภัย",
  },
  shortcuts: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 08 // KEYBOARD SHORTCUTS MATRIX",
    eyebrowTh: "หมวด 08 // ดัชนีคีย์ลัดด่วน POWER USER",
  },
  faq: {
    ...BASE_THEME,
    eyebrowEn: "SECTION 09 // DIAGNOSTICS & TROUBLESHOOTING",
    eyebrowTh: "หมวด 09 // คำถามที่พบบ่อย & การแก้ปัญหา",
  },
};

export const CATEGORIES_TH = [
  { id: "all", label: "00 · ทั้งหมด", fullLabel: "ดัชนีหัวข้อทั้งหมด (Complete Index)" },
  { id: "overview", label: "01 · ภาพรวมระบบ", fullLabel: "01 — ภาพรวมระบบ & สถาปัตยกรรม (Architecture)" },
  { id: "ai", label: "02 · ผู้ช่วย AI", fullLabel: "02 — ผู้ช่วยอัจฉริยะ Retzlo AI (Copilot)" },
  { id: "kanban", label: "03 · บอร์ด & ตาราง", fullLabel: "03 — เวิร์กสเปซ บอร์ดคันบัน & ตาราง (Boards & Views)" },
  { id: "gamification", label: "04 · เชียร์ & เหรียญ", fullLabel: "04 — เชียร์กาแฟ & ร้านรางวัล (Cheers & Rewards)" },
  { id: "calendar", label: "05 · ปฏิทิน & เวลา", fullLabel: "05 — ปฏิทินงาน & Retro TimePicker (Calendar)" },
  { id: "notes", label: "06 · โน้ต & ไดอารี่", fullLabel: "06 — สมุดบันทึก & นิสัยประจำวัน (Life Hub)" },
  { id: "security", label: "07 · สิทธิ์ & ความปลอดภัย", fullLabel: "07 — สมาชิก ทีม และความปลอดภัย (Security & RBAC)" },
  { id: "shortcuts", label: "08 · คีย์ลัดระบบ", fullLabel: "08 — คีย์ลัดด่วน Power User (Shortcuts)" },
  { id: "faq", label: "09 · ถาม-ตอบ & แก้ปัญหา", fullLabel: "09 — คำถามที่พบบ่อย (FAQ & Troubleshooting)" },
] as const;

export const CATEGORIES_EN = [
  { id: "all", label: "00 · All Topics", fullLabel: "Complete Topic Index" },
  { id: "overview", label: "01 · System Overview", fullLabel: "01 — Architecture & Getting Started" },
  { id: "ai", label: "02 · Retzlo AI", fullLabel: "02 — AI Copilot & Automated Breakdown" },
  { id: "kanban", label: "03 · Boards & Table", fullLabel: "03 — Dual Workspaces: Kanban & Table" },
  { id: "gamification", label: "04 · Cheers & Coins", fullLabel: "04 — Coffee Cheers & Rewards Economy" },
  { id: "calendar", label: "05 · Calendar & Time", fullLabel: "05 — Calendar Matrix & Retro TimePicker" },
  { id: "notes", label: "06 · Notes & Diary", fullLabel: "06 — Personal Notes & Habit Streaks" },
  { id: "security", label: "07 · Security & Team", fullLabel: "07 — Team Access, Roles & Data Privacy" },
  { id: "shortcuts", label: "08 · Shortcuts", fullLabel: "08 — Power-User Keyboard Shortcuts" },
  { id: "faq", label: "09 · FAQ & Diagnostics", fullLabel: "09 — Troubleshooting & Help" },
] as const;

export const SYSTEM_PILLARS_TH = [
  {
    id: "kanban-boards",
    title: "Work Module",
    subtitle: "บอร์ด Kanban & ตาราง Spreadsheet",
    icon: FolderKanban,
    tag: "Dual View",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
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
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
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
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "notes-diary-hub",
    title: "Life Hub",
    subtitle: "สมุดโน้ต, ไดอารี่ & สถิติ Streaks",
    icon: StickyNote,
    tag: "Streak Habits",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
];

export const SYSTEM_PILLARS_EN = [
  {
    id: "kanban-boards",
    title: "Work Module",
    subtitle: "Kanban Board & Spreadsheet Table",
    icon: FolderKanban,
    tag: "Dual View",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "ai-assistant",
    title: "Retzlo AI",
    subtitle: "Built-in Assistant & Auto-Breakdown",
    icon: Bot,
    tag: "Zero-Config",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "card-attributes-customization",
    title: "Attributes & Export",
    subtitle: "Statuses, 10 Priorities & Export",
    icon: SlidersHorizontal,
    tag: "Custom 10-Levels",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "calendar-due-dates",
    title: "Calendar & Time",
    subtitle: "Task Calendar & Single-Column Scroller",
    icon: Calendar,
    tag: "Linear Scroller",
    color: "text-amber-600 bg-amber-50 dark:bg-dusk-amber/10 border-amber-200 dark:border-dusk-amber/25",
  },
  {
    id: "coffee-cheers-rewards",
    title: "Gamification",
    subtitle: "Coffee Cheers & Rewards Store",
    icon: Coffee,
    tag: "Coffee + Coins",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
  {
    id: "notes-diary-hub",
    title: "Life Hub",
    subtitle: "Notes Notebook, Habit Diary & Streaks",
    icon: StickyNote,
    tag: "Streak Habits",
    color: "text-indigo-600 bg-indigo-50 dark:bg-dusk-lavender/10 border-indigo-200 dark:border-dusk-lavender/25",
  },
];
