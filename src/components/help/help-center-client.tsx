"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Coins,
  Compass,
  Copy,
  CornerDownRight,
  Download,
  ExternalLink,
  FileText,
  Flag,
  FolderKanban,
  HelpCircle,
  Keyboard,
  KeyRound,
  LayoutGrid,
  Menu,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
  Table,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  X,
  Zap,
} from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface GuideTopic {
  id: string;
  category: "overview" | "ai" | "kanban" | "gamification" | "calendar" | "notes" | "security" | "shortcuts" | "faq";
  icon: typeof BookOpen;
  title: string;
  badge?: string;
  badgeColor?: string;
  summary: string;
  readingTime?: string;
  lastUpdated?: string;
  concept?: string;
  highlights: string[];
  tips?: string;
  codeOrShortcut?: string;
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

export const TOPICS: GuideTopic[] = [
  {
    id: "welcome-overview",
    category: "overview",
    icon: Compass,
    title: "ยินดีต้อนรับสู่ Retzlo Platform & สถาปัตยกรรมระบบ",
    badge: "Getting Started",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-400 dark:text-dusk-lavender",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "แพลตฟอร์มบริหารจัดการชีวิตและการทำงาน (Modular Life & Work Management) สไตล์ Retro Lofi Indigo ผสานขุมพลัง AI และความสามารถระดับองค์กร",
    concept:
      "Retzlo ออกแบบมาภายใต้ปรัชญา Modular Architecture ที่ผสมผสานการบริหารงานโปรเจกต์ระดับมืออาชีพ เข้ากับการติดตามกิจวัตรและสุขภาพจิตในชีวิตประจำวัน โดยใช้โทนสี Retro Lofi Indigo ที่สบายสายตา และไม่สร้างความเครียดระหว่างการทำงานต่อเนื่องเป็นเวลานาน",
    highlights: [
      "สถาปัตยกรรมโมดูลาร์: แบ่งระบบออกเป็นโมดูลชัดเจน ทั้ง Work Module (Kanban/Table), Calendar, Notes, Habit Diary, และ Rewards Store",
      "การเชื่อมต่อแบบเรียลไทม์: ซิงค์การเคลื่อนย้ายการ์ดและข้อมูลระหว่างเพื่อนร่วมทีมทุกคนทันทีด้วย Pusher WebSocket และ Optimistic UI",
      "ขุมพลัง AI ในตัว: เข้าใจบริบทการทำงานของคุณในระดับโปรเจกต์และบอร์ดอย่างลึกซึ้ง พร้อมช่วยเหลือรอบด้าน",
      "ความปลอดภัยและความเป็นส่วนตัว: รองรับ Workspace Owner, Member และระบบ Private Boards สำหรับข้อมูลลับเฉพาะบุคคล",
      "ระบบ Theme คู่: รองรับทั้ง Dark Mode (Retro Lofi Indigo) และ Light Mode (Warm Paper) พร้อมโหมด System ตามอุปกรณ์",
    ],
    tips: "สามารถสลับธีมสีระหว่าง Dark, Light หรือ System ได้ทุกเมื่อผ่านเมนูที่รูปโปรไฟล์ของคุณที่มุมบนขวา",
  },
  {
    id: "ai-assistant",
    category: "ai",
    icon: Bot,
    title: "ผู้ช่วยอัจฉริยะ Retzlo AI",
    badge: "AI Powered",
    badgeColor: "border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "ผู้ช่วย AI ประจำโปรเจกต์ ช่วยวิเคราะห์ สรุปงาน และร่างการ์ดงานอัตโนมัติแบบ Multi-turn",
    concept:
      "Retzlo AI ถูกออกแบบมาให้เป็นเสมือน Scrum Master และผู้ช่วยประจำโปรเจกต์ของคุณ โดยดึงข้อมูลโครงสร้างบอร์ด รายการการ์ด และสถานะปัจจุบันมาวิเคราะห์อย่างรอบด้าน ไม่ใช่เพียงแค่แชทบอทตอบคำถามทั่วไป",
    highlights: [
      "เปิดใช้งานด่วน: คลิกไอคอน 🤖 ที่แถบด้านบนข้างรูปโปรไฟล์ หรือใช้ปุ่มลอยด่วนได้ทุกหน้าจอ",
      "รูปแบบ Responsive อัจฉริยะ: บนจอคอมพิวเตอร์จะเปิดเป็น Side Panel สไตล์ Gemini ตรึงขอบขวา และปรับเป็น Floating Chatbox บนจอมือถือ/แท็บเล็ตโดยอัตโนมัติ",
      "ไม่บดบังเครื่องมืออื่น: ปุ่มดาว FAB Hub ที่มุมล่างจะขยับหลบกล่องแชทอย่างราบรื่น ไม่บดบังปุ่มพิมพ์",
      "เข้าใจบริบทโปรเจกต์: สามารถถามว่า 'งานไหนยังค้างอยู่บ้าง?', 'ใครรับผิดชอบงานเยอะที่สุด?' หรือ 'สรุปงานของสัปดาห์นี้ให้หน่อย' ได้ทันที",
      "Quick Starter Prompts: มีปุ่มคำถามสำเร็จรูปให้กดถามได้อย่างรวดเร็วในคลิกเดียว",
      "รองรับ Custom API Key: สามารถกำหนด API Key ส่วนตัวเพื่อใช้งานได้อย่างอิสระ",
    ],
    tips: "บนหน้าจอคอมพิวเตอร์ สามารถกดปุ่มสลับมุมมองระหว่างแถบข้าง (Side Panel) และกล่องลอยขวาล่างได้ตามความถนัด และสามารถกำหนด API Key ส่วนตัวได้ในหน้าต่างการตั้งค่า AI",
  },
  {
    id: "ai-breakdown-summary",
    category: "ai",
    icon: Sparkles,
    title: "ฟีเจอร์ AI Auto-Breakdown & Executive Summary",
    badge: "Automation",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "เปลี่ยนชิ้นงานขนาดใหญ่ให้กลายเป็น Action Items ที่จับต้องได้ พร้อมสรุปสุขภาพโครงการสำหรับผู้บริหารและทีม",
    concept:
      "การจัดการโครงการที่มีประสิทธิภาพเริ่มต้นจากการย่อยงานขนาดใหญ่ (Epics/Tasks) ให้กลายเป็นขั้นตอนย่อยที่สามารถลงมือทำได้จริง และการติดตามภาพรวมคอขวดของทีมผ่านรายงานสรุปแบบกระชับ",
    highlights: [
      "AI Task Breakdown: คลิกปุ่ม ✨ AI Breakdown ในหน้าต่างการ์ด เพื่อแตกหัวข้อย่อยเป็น Checklist 3-10 ข้ออัตโนมัติ",
      "Executive Project Summary: คลิกปุ่ม AI Summary ที่แถบหัวบอร์ด เพื่อวิเคราะห์ภาพรวม ความคืบหน้า คอขวด และข้อเสนอแนะเชิงกลยุทธ์",
      "AI Create Cards: สั่งในแชทให้สร้างการ์ดลงบอร์ด พร้อมระบบพรีวิวยืนยันรายการก่อนบันทึกจริงเพื่อความปลอดภัย",
      "โครงสร้างเช็คลิสต์อัตโนมัติ: มีช่องติ๊กถูกและระบบคำนวณ Progress Bar ความคืบหน้าให้ในตัว",
    ],
    tips: "หากระบุรายละเอียดในคำอธิบายการ์ดให้ชัดเจน AI จะสามารถสร้างเช็คลิสต์ย่อยที่มีความแม่นยำสูงมากยิ่งขึ้น",
  },
  {
    id: "kanban-boards",
    category: "kanban",
    icon: FolderKanban,
    title: "การจัดการบอร์ด Kanban และการย้ายการ์ด",
    badge: "Core Workflow",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "บอร์ดบริหารจัดการงานแบบเรียลไทม์ รองรับการลากวาง (Drag & Drop) อย่างลื่นไหล และปรับแต่งคอลัมน์ได้อย่างยืดหยุ่น",
    concept:
      "บอร์ด Kanban ของ Retzlo ขับเคลื่อนด้วย Optimistic State Architecture ทำให้การลากย้ายการ์ดหรือเปลี่ยนสถานะเกิดขึ้นทันทีใน 0 วินาที โดยไม่ต้องรอ Round-trip จากเครือข่าย พร้อมระบบ Rollback ปลอดภัยเมื่อการเชื่อมต่อมีปัญหา",
    highlights: [
      "Optimistic Drag & Drop: ลากวางการ์ดสลับคอลัมน์หรือเปลี่ยนลำดับได้ทันที ไร้อาการหน่วงหรือกระตุก",
      "Real-time Collaboration: การ์ดขยับและอัปเดตแบบสดๆ ไปยังหน้าจอเพื่อนร่วมทีมทุกคนในโปรเจกต์ด้วย Pusher WebSocket",
      "Column Settings & WIP Limit: ปรับเปลี่ยนชื่อคอลัมน์ และกำหนดขีดจำกัดงานระหว่างทำ (WIP Limit) เพื่อป้องกันงานคั่งค้าง",
      "Sort Handle ด้านหน้า (⁝⁝): จับลากจุดที่ด้านหน้าเมนูในแถบข้างเพื่อจัดลำดับบอร์ดและเครื่องมือตามใจชอบ",
      "Card Density (Normal / Compact 2x): ปุ่มปรับความหนาแน่นของการ์ดระหว่างโหมด Normal (มาตรฐาน) และ Compact 2x (แสดงข้อมูลแน่นขึ้น 2 เท่า)",
    ],
    tips: "สามารถสลับความหนาแน่นของการ์ดเป็น Compact 2x เมื่อมีงานจำนวนมากในแต่ละคอลัมน์ เพื่อให้เห็นภาพรวมได้กว้างขึ้นโดยไม่ต้องเลื่อนหน้าจอบ่อย",
  },
  {
    id: "spreadsheet-table-view",
    category: "kanban",
    icon: Table,
    title: "มุมมองตารางสเปรดชีต (Spreadsheet Table View)",
    badge: "New Feature",
    badgeColor: "border-dusk-cyan/30 bg-dusk-cyan/10 text-dusk-cyan",
    readingTime: "อ่าน 4 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "สลับมุมมองจาก Kanban Board ไปเป็นตาราง Spreadsheet สไตล์ Excel/Google Sheets สำหรับการจัดการและแก้ไขข้อมูลปริมาณมากอย่างรวดเร็ว",
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
    tips: "ในมุมมองตาราง สามารถเลือกติ๊กผู้รับผิดชอบหลายคนได้อย่างต่อเนื่องโดยที่เมนูดรอปดาวน์ไม่ปิดตัว",
  },
  {
    id: "custom-board-priorities",
    category: "kanban",
    icon: Flag,
    title: "ระดับความสำคัญแบบกำหนดเอง (Custom Priorities สูงสุด 10 ระดับ)",
    badge: "Customization",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-400",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
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
    tips: "หากลบหรือตั้งค่าใหม่ ระบบจะมีปุ่ม 'รีเซ็ตกลับเป็นค่าเริ่มต้น' เพื่อคืนค่ามาตรฐาน High, Medium, Low ได้ทันที",
  },
  {
    id: "board-export",
    category: "kanban",
    icon: Download,
    title: "ระบบส่งออกข้อมูลบอร์ดระดับมืออาชีพ (Dedicated Export: Excel, CSV, PDF, PNG)",
    badge: "Export",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "4 ต.ค. 2026",
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
    tips: "สามารถกดดูตัวอย่างเอกสาร (Live Preview) ก่อนส่งออกได้ในหน้าต่างตัวเลือกเพิ่มเติม หรือเลือกส่งออกด่วนผ่าน Dropdown ได้ทันที",
  },
  {
    id: "card-attributes-customization",
    category: "kanban",
    icon: SlidersHorizontal,
    title: "ศูนย์กลางคุณสมบัติการ์ด (สถานะ, ความสำคัญ, Story Points) ใน Board Settings",
    badge: "Updated",
    badgeColor: "border-purple-400/30 bg-purple-400/10 text-purple-400",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "รวมการตั้งค่าคุณสมบัติการ์ด (สถานะ, ความสำคัญ, Story Points) ไว้ใน Board Settings พร้อมเชื่อมโยงไปยังคอลัมน์, การ์ด, และตารางงานแบบเรียลไทม์",
    concept:
      "รวบรวมการตั้งค่าทุกจุดให้เป็นหนึ่งเดียวใน Board Settings (แท็บคุณสมบัติการ์ด) และเชื่อมโยงทุกมุมมอง เมื่อเพิ่มสถานะใหม่ รายการสถานะนั้นจะปรากฏใน Column Settings และตารางสเปรดชีตทันทีโดยไม่ต้องโหลดหน้าใหม่",
    highlights: [
      "ศูนย์กลางใน Board Settings & Project Settings: เข้าถึงการปรับแต่งครบทั้ง 3 หมวด (Status, Priority, Story Points) ได้ทั้งจากปุ่ม Attributes บนหัวบอร์ด หรือในหน้า Project Settings (/project/[id]/settings?tab=attributes)",
      "เชื่อมโยง Column Settings ทันที: สถานะที่กำหนดเองจะแสดงเป็นตัวเลือก Card Status ในหน้าแก้ไขคอลัมน์และสร้างคอลัมน์ใหม่โดยอัตโนมัติ",
      "ปุ่ม '+' ท้ายหัวข้อในการ์ด: คลิกปุ่ม '+' ท้ายหัวข้อ Status, Priority หรือ Story Points ใน Card Modal จะนำทางไปยังหน้า Project Settings (แท็บ Card Attributes & Types) และเปิดหมวดคุณสมบัตินั้นๆ ให้ปรับแต่งได้ทันทีโดยไม่ซ้อนหน้าต่างหลายชั้น",
      "แท็บสถานะ (Status): เพิ่มสถานะใหม่พร้อมเลือกเฉดสี Retro Lofi, เลื่อนสลับลำดับขึ้น/ลง, ลบ หรือรีเซ็ตกลับเป็นค่าเริ่มต้น",
      "แท็บความสำคัญ (Priority): ปรับแต่งระดับความสำคัญของบอร์ดได้สูงสุด 10 ระดับ พร้อม 12 โทนสีและจัดลำดับความเร่งด่วน",
      "แท็บคะแนนความยาก (Story Points): เลือกใช้ชุดตัวเลขสำเร็จรูป (Retzlo Standard, Fibonacci, Linear/ชม., T-Shirt Sizes) หรือเพิ่มตัวเลขคะแนน 1-100 เอง",
      "ความปลอดภัยสูง: ทุกการลบและรีเซ็ตมี ConfirmModal ยืนยัน พร้อม Toast แจ้งเตือนผลลัพธ์ทันที",
    ],
    tips: "ทุกการปรับแต่งจะซิงค์ผ่าน Custom Events แบบ Real-time ทันที ทำให้ทั้ง Kanban Board, Column Settings, Card Modal, และ Table View สอดคล้องกันตลอดเวลา",
  },
  {
    id: "coffee-cheers-rewards",
    category: "gamification",
    icon: Coffee,
    title: "ระบบ Coffee Cheers และ Rewards Store",
    badge: "Gamification",
    badgeColor: "border-dusk-rose/30 bg-dusk-rose/10 text-dusk-rose",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "4 ต.ค. 2026",
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
    tips: "อย่าลืมแวะไปดู Rewards Store เพื่อตั้งรางวัลกระตุ้นทีม เช่น กาแฟเลี้ยงฟรี หรือขนมยามบ่าย!",
  },
  {
    id: "calendar-due-dates",
    category: "calendar",
    icon: Calendar,
    title: "ปฏิทินงานและตัวเลือกเวลา (Retro Date & Time Picker)",
    badge: "Productivity",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "ไม่พลาดทุกกำหนดส่งด้วยมุมมองปฏิทินแบบรอบด้าน ทั้งระดับโปรเจกต์และภาพรวมทุกงาน พร้อม Global DatePicker ที่เป็นเอกลักษณ์",
    concept:
      "ปฏิทินของ Retzlo ดึงข้อมูลกำหนดส่ง (Due Date) จากการ์ดในทุกบอร์ด และเชื่อมโยงกับรายการไดอารี่ประจำวัน เพื่อให้เห็นตารางชีวิตและการทำงานในที่เดียว",
    highlights: [
      "Global Retro DatePicker: ดีไซน์เฉพาะตัวในโทน Retro Lofi Indigo สบายตา ไม่พึ่งปฏิทินเบราว์เซอร์ที่หน้าตาไม่เข้ากัน",
      "Preset Shortcuts: ปุ่มลัดกำหนดวันด่วน 'วันนี้', 'พรุ่งนี้', 'สุดสัปดาห์นี้', 'สัปดาห์หน้า'",
      "TimePicker รุ่นใหม่: คลิกพิมพ์เวลาได้โดยตรง มีแถบเลื่อนแนวตั้งเดี่ยวไม่งง พร้อมปุ่มลัดเวลายอดนิยม และปุ่มยืนยัน 'ตกลง'",
      "Global Calendar View: ดูภาพรวมกำหนดส่งของทุกโปรเจกต์พร้อมกันได้ในหน้าหลัก Workspaces",
      "Instant Skeleton Loading: โหลดแสดงโครงสร้างปฏิทินทันทีเมื่อเปิดหน้า ไร้อาการกระตุก",
    ],
    tips: "การ์ดที่ใกล้ถึงกำหนดส่งจะแสดงแถบสีเตือนสถานะ เพื่อให้คุณจัดลำดับความสำคัญได้ง่ายขึ้น",
  },
  {
    id: "notes-diary-hub",
    category: "notes",
    icon: StickyNote,
    title: "สมุดโน้ต (Notes) และบันทึกประจำวัน (Diary Hub)",
    badge: "Life & Work",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-400",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "4 ต.ค. 2026",
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
    tips: "ใช้ Diary Hub สำหรับจดบันทึกสั้นๆ ก่อนเริ่มวันและสรุปสิ่งที่ทำสำเร็จในแต่ละวันเพื่อสุขภาพจิตที่ดี",
  },
  {
    id: "roles-and-security",
    category: "security",
    icon: ShieldCheck,
    title: "ระบบสมาชิก สิทธิ์การเข้าถึง และการจัดการทีม (Team Members Hub)",
    badge: "Updated",
    badgeColor: "border-indigo-400/30 bg-indigo-400/10 text-indigo-400 dark:text-dusk-lavender",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "หน้าจัดการสมาชิกโปรเจกต์ดีไซน์ใหม่ แยก 3 แท็บชัดเจน พร้อมระบบเปลี่ยนบทบาท ตรวจสอบสถานะออนไลน์ และลิงก์เชิญด่วน",
    concept:
      "ความโปร่งใสและการควบคุมสิทธิ์การเข้าถึงอย่างปลอดภัย หน้าจัดการสมาชิกของ Retzlo ช่วยให้เจ้าของโปรเจกต์สามารถเชิญทีม ปรับเปลี่ยนบทบาท และติดตามการทำงานร่วมกันได้อย่างมีประสิทธิภาพ",
    highlights: [
      "สถาปัตยกรรม 3 แท็บ: 'สมาชิกในทีม' ดูรายชื่อและสถานะ, 'คำเชิญรอดำเนินการ' ติดตามลิงก์คำเชิญ, และ 'สิทธิ์และการเข้าถึง' ตารางเปรียบเทียบสิทธิ์ละเอียด",
      "Presence Indicator: จุดสถานะออนไลน์บนรูปโปรไฟล์ (🟢 Online, 🟠 Busy, ⚪ Offline)",
      "Role Switcher: เจ้าของโปรเจกต์ (Owner) สามารถปรับเลื่อนขั้น/ลดสิทธิ์สมาชิกเป็น Owner หรือ Member ได้ทันที พร้อมระบบป้องกันไม่ให้ลดสิทธิ์ของเจ้าของคนสุดท้าย",
      "Dedicated Invite Modal: หน้าต่างเชิญเพื่อนร่วมทีมเฉพาะ เลือกกำหนดบทบาท (Member/Owner) ได้ล่วงหน้า พร้อมสร้างลิงก์ที่คัดลอกแชร์ต่อใน LINE/Slack ได้ทันที",
      "Instant Skeleton Loading: แสดงแผง Skeleton โหลดแบบนุ่มนวลลื่นไหล ไม่กระตุก เมื่อเข้าสู่หน้า /project/[id]/members",
      "Confirm Modal มาตรฐาน: ทุกการลบสมาชิกหรือเพิกถอนคำเชิญมีกล่องยืนยันความตั้งใจเสมอ",
    ],
    tips: "สามารถคลิกการ์ดสถิติ (Total Members, Active Now, Pending, Total Coffees) ที่ด้านบนเพื่อสลับแท็บหรือกรองสมาชิกได้อย่างสะดวกรวดเร็ว",
  },
  {
    id: "project-and-board-settings",
    category: "security",
    icon: SlidersHorizontal,
    title: "ศูนย์ตั้งค่าโปรเจกต์และบอร์ด (Master-Detail Space Settings)",
    badge: "Updated",
    badgeColor: "border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "ศูนย์กลางบริหารจัดการโปรเจกต์สไตล์ Jira / Linear ด้วยโครงสร้าง Master-Detail แถบซ้าย จัดหมวดหมู่ชัดเจน พร้อม Space Identity และความยืดหยุ่นเต็มพิกัด",
    concept:
      "ออกแบบตามแนวคิด Modern Workspace Management โดยมีแถบด้านข้าง (Sidebar) ตรึงตำแหน่ง แบ่งเป็นหมวด General, Workflow, System & Privacy, และ Overview ช่วยให้การปรับแต่งโปรเจกต์รวดเร็ว ตรงจุด และไม่สับสน",
    highlights: [
      "เลย์เอาต์ Master-Detail สไตล์ Jira: แถบซ้ายแสดงการ์ดอัตลักษณ์ Space Identity, ปุ่มลัดกลับสู่บอร์ด (Back to board), และเมนูนำทางแยกหมวดหมู่อย่างเป็นระเบียบ",
      "หมวด General (ข้อมูล & สมาชิก): แท็บ Details & Identity สำหรับชื่อ/ภาพปก และแท็บ Access & Team ดูรายชื่อผู้มีสิทธิ์เข้าถึงพร้อมปุ่มเชื่อมต่อไปยังหน้าจัดการสมาชิก",
      "หมวด Workflow (บอร์ด & ขั้นตอนงาน): แท็บ Boards & Sub-projects, แท็บ Board Details & Access (ชื่อ/สิทธิ์ความเป็นส่วนตัว/สมาชิก), แท็บ Columns & Workflow (คอลัมน์และ WIP limit), และแท็บ Card Attributes & Types (สถานะ/Priorities 10 ระดับ/Story points)",
      "ไม่เปิดป๊อปอัปซ้อนอีกต่อไป: การกด Settings จากบอร์ดใดๆ จะสลับสู่หน้าการตั้งค่าบอร์ดในแท็บหลักแบบ Jira ทันที พร้อมสวิตช์เลือกบอร์ดที่ต้องการปรับแต่ง",
      "Jira Sidebar Layout สำหรับ Modal: หน้าต่าง BoardSettingsModal ได้รับการปรับปรุงเป็น Master-Detail แถบข้างซ้ายพร้อมปุ่ม 'เปิดหน้าเต็มจอ (Jira Style)'",
      "หมวด System & Privacy (ฟีเจอร์ & ความเป็นส่วนตัว): เปิด/ปิดแถบบันทึกโน้ต, กำหนดสิทธิ์ไอเทมส่วนตัวของสมาชิก, และ Danger Zone สำหรับลบโปรเจกต์",
      "หมวด Overview (All Settings): แสดงการตั้งค่าทุกหมวดหมู่แบบรวมศูนย์ในหน้าเดียว",
      "Responsive Adaptive: บนหน้าจอมือถือและแท็บเล็ต แถบนำทางจะพับเป็นแถบแท็บแนวนอนเลื่อนได้ (Scrollable Pills) โดยอัตโนมัติ ไม่เปลืองพื้นที่หน้าจอ",
    ],
    tips: "สามารถเข้าถึงแต่ละหมวดได้โดยตรงผ่าน URL Query Param เช่น ?tab=boards, ?tab=access, หรือ ?tab=attributes เพื่อการส่งลิงก์แชร์ทีมงานที่แม่นยำ",
  },
  {
    id: "keyboard-shortcuts",
    category: "shortcuts",
    icon: Keyboard,
    title: "คีย์ลัดระบบและการทำงานความเร็วสูง",
    badge: "Power User",
    badgeColor: "border-stone-400/30 bg-stone-400/10 text-stone-400",
    readingTime: "อ่าน 2 นาที",
    lastUpdated: "4 ต.ค. 2026",
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
    codeOrShortcut: "Ctrl + K / Cmd + K",
    tips: "กด Command Palette แล้วพิมพ์ชื่อการ์ดหรือบอร์ดเพื่อกระโดดข้ามหน้าได้เร็วกว่าการคลิกหลายเท่า",
  },
  {
    id: "faq-credits-offline",
    category: "faq",
    icon: HelpCircle,
    title: "คำถามที่พบบ่อย (FAQ & การแก้ปัญหา)",
    badge: "FAQ",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    readingTime: "อ่าน 3 นาที",
    lastUpdated: "4 ต.ค. 2026",
    summary:
      "รวบรวมข้อสงสัยทั่วไปและแนวทางแก้ไขเมื่อพบปัญหาในการใช้งาน",
    concept:
      "คำตอบสำหรับคำถามที่ผู้ใช้งานสอบถามเข้ามาบ่อยที่สุด พร้อมแนวทางการแก้ไขปัญหาเบื้องต้นด้วยตนเอง",
    highlights: [
      "Q: ถ้าเครดิต AI ในระบบหมด จะทำอย่างไร? -> ตอบ: สามารถคลิกที่การตั้งค่าในหน้าต่าง AI Chat เพื่อใส่ API Key ส่วนตัวของคุณเองได้ฟรีและไม่จำกัด",
      "Q: ข้อมูลจะหายไหมหากอินเทอร์เน็ตหลุดกะทันหัน? -> ตอบ: ระบบมีระบบ Draft Storage สำรองข้อมูลการพิมพ์ไว้ในบราวเซอร์ ปลอดภัยหายห่วง",
      "Q: ธีมสีสามารถเปลี่ยนได้หรือไม่? -> ตอบ: รองรับทั้งธีม Light Mode, Dark Mode และ System โดยกดเปลี่ยนได้ที่รูปโปรไฟล์ของคุณ",
      "Q: บอร์ดแบบ Private คนอื่นในโปรเจกต์จะเห็นไหม? -> ตอบ: ไม่เห็นครับ เฉพาะผู้สร้างและสมาชิกที่ได้รับเลือกใน Board Settings เท่านั้นที่จะมองเห็น",
      "Q: ต้องการรายงานข้อผิดพลาดหรือแนะนำฟีเจอร์? -> ตอบ: สามารถพิมพ์แจ้งผ่านผู้ช่วย Retzlo AI หรือติดต่อทีมพัฒนาได้ตลอดเวลา",
    ],
    tips: "อย่าลืมตรวจสอบการเชื่อมต่ออินเทอร์เน็ตเพื่อให้ WebSocket Pusher ทำงานได้อย่างสมบูรณ์",
  },
];

export function HelpCenterClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTopicId, setActiveTopicId] = useState<string>(TOPICS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"docs" | "grid">("docs");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedShortcut, setCopiedShortcut] = useState(false);
  const [feedbackVote, setFeedbackVote] = useState<"helpful" | "unhelpful" | null>(null);

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
    if (viewMode === "grid") {
      setViewMode("docs");
    }
    // Scroll reader container to top
    if (readerTopRef.current) {
      readerTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy shortcut
  const handleCopyShortcut = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedShortcut(true);
    toast({ message: `คัดลอกคีย์ลัด "${code}" เรียบร้อยแล้ว`, type: "success" });
    setTimeout(() => setCopiedShortcut(false), 2000);
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

  return (
    <main className="soft-grid-bg min-h-screen w-full text-stone-900 dark:text-stone-100 flex flex-col">
      {/* ── Top Header / Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80 transition-colors">
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
                  <span className="hidden sm:inline-flex rounded-full bg-stone-100 dark:bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-stone-600 dark:text-stone-300">
                    v2.4
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
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเอกสาร เช่น AI, Spreadsheet, เหรียญ, คีย์ลัด..."
                className="w-full h-9 rounded-xl border border-stone-200/90 bg-stone-100/70 pl-9 pr-14 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-black/30 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-dusk-lavender/60 dark:focus:ring-dusk-lavender/30 transition"
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

          {/* Right: Actions & View Switcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center rounded-xl border border-stone-200/90 bg-stone-100/70 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setViewMode("docs")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "docs"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="โหมดอ่านบทความเอกสาร"
              >
                <BookOpen className={cn("h-3.5 w-3.5", viewMode === "docs" ? "text-indigo-600 dark:text-dusk-lavender" : "text-stone-400")} />
                <span>Docs</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                  viewMode === "grid"
                    ? "border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                )}
                title="โหมดดูภาพรวมการ์ดทั้งหมด"
              >
                <LayoutGrid className={cn("h-3.5 w-3.5", viewMode === "grid" ? "text-indigo-600 dark:text-dusk-lavender" : "text-stone-400")} />
                <span>Overview</span>
              </button>
            </div>

            {/* Quick AI Trigger Button */}
            <button
              type="button"
              onClick={openAiChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-dusk-lavender/40 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:hover:bg-dusk-lavender dark:hover:text-ink-950 transition cursor-pointer shadow-sm"
              title="เปิดคุยกับ AI Assistant ประจำระบบ"
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

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเอกสาร..."
              className="w-full h-8.5 rounded-xl border border-stone-200/90 bg-stone-100/70 pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-stone-100 dark:placeholder:text-stone-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 gap-8">
        {/* ── Left Sidebar: Documentation Navigation Tree ── */}
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
                      {/* Active indicator bar */}
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

            {/* Quick Agent Guide Link */}
            <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-[11px] text-stone-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-dusk-lavender" />
                <span>docs/system-guide.md</span>
              </div>
              <p className="leading-relaxed">
                คู่มือนี้ซิงค์ตรงกับไฟล์เอกสาร Markdown ในโปรเจกต์ ปฏิบัติตามมาตรฐาน AGENTS.md
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area: Document Reader or Grid Overview ── */}
        <div className="flex-1 min-w-0">
          <div ref={readerTopRef} />

          {viewMode === "docs" ? (
            /* ── Professional Documentation Reader View ── */
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              {/* Document Article Body */}
              <article className="flex-1 min-w-0 lofi-panel rounded-2xl border border-stone-200/80 bg-white/90 p-6 sm:p-8 dark:border-white/10 dark:bg-ink-950/60 shadow-sm space-y-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
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

                {/* Article Header */}
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400">
                      <Clock className="h-3 w-3" />
                      {activeTopic.readingTime || "อ่าน 3 นาที"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-400">
                      <Calendar className="h-3 w-3" />
                      {activeTopic.lastUpdated || "อัปเดต: 4 ต.ค. 2026"}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                    {activeTopic.title}
                  </h1>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs sm:text-sm text-stone-700 leading-relaxed dark:border-dusk-lavender/20 dark:bg-dusk-lavender/5 dark:text-stone-300">
                    <p className="font-medium">{activeTopic.summary}</p>
                  </div>
                </header>

                {/* Section: Overview & Concept */}
                {activeTopic.concept && (
                  <section id="overview" className="space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Compass className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>ภาพรวมและแนวคิดของฟีเจอร์</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      {activeTopic.concept}
                    </p>
                  </section>
                )}

                {/* Section: Key Capabilities & Step-by-Step */}
                <section id="highlights" className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>คุณสมบัติและความสามารถหลัก (Key Capabilities)</span>
                  </h2>

                  <div className="grid gap-3 sm:gap-3.5">
                    {activeTopic.highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5 transition hover:border-indigo-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-dusk-lavender/30 dark:hover:bg-white/[0.04]"
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

                {/* Section: Pro Tips Callout */}
                {activeTopic.tips && (
                  <section id="tips" className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-xs sm:text-sm text-amber-900 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-dusk-amber">
                      <span className="text-base">💡</span>
                      <span>เคล็ดลับจากผู้เชี่ยวชาญ (Pro Tip)</span>
                    </div>
                    <p className="leading-relaxed pl-6 text-amber-900/90 dark:text-stone-300">
                      {activeTopic.tips}
                    </p>
                  </section>
                )}

                {/* Section: Code / Keyboard Shortcut (if available) */}
                {activeTopic.codeOrShortcut && (
                  <section id="shortcuts" className="space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Keyboard className="h-4.5 w-4.5 text-indigo-600 dark:text-dusk-lavender" />
                      <span>คีย์ลัดด่วน (Keyboard Shortcut)</span>
                    </h2>

                    <div className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-900 p-3.5 text-white dark:border-white/10 dark:bg-ink-950 shadow-inner">
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
                        {copiedShortcut ? (
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

                {/* ── Article Feedback Widget ── */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                    {activeTopic.concept && (
                      <a
                        href="#overview"
                        className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                      >
                        • ภาพรวมและแนวคิด
                      </a>
                    )}
                    <a
                      href="#highlights"
                      className="hover:text-indigo-600 dark:hover:text-dusk-lavender transition truncate"
                    >
                      • คุณสมบัติและความสามารถ
                    </a>
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
                    ถามคำถามเกี่ยวกับฟีเจอร์หรือการใช้งานกับผู้ช่วย Retzlo AI ได้ทันที
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
          ) : (
            /* ── Overview Mode: Card Grid Layout ── */
            <div className="space-y-6">
              {/* Category Filter Bar */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer border",
                        isActive
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/60 dark:bg-dusk-lavender/20 dark:text-dusk-lavender shadow-sm"
                          : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-200"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Topics Grid Cards */}
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {filteredTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <article
                      key={topic.id}
                      onClick={() => selectTopic(topic.id)}
                      className="lofi-panel group flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/90 p-5 transition duration-200 hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-ink-950/40 dark:hover:border-dusk-lavender/40 dark:hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50/80 text-indigo-600 group-hover:border-indigo-300 group-hover:bg-indigo-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-dusk-lavender dark:group-hover:border-dusk-lavender/40 dark:group-hover:bg-dusk-lavender/10 transition">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 dark:text-stone-100 dark:group-hover:text-dusk-lavender transition">
                                {topic.title}
                              </h3>
                              {topic.codeOrShortcut && (
                                <span className="inline-block mt-0.5 rounded border border-stone-200 bg-stone-100 px-1.5 py-0.2 font-mono text-[10px] text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-dusk-amber">
                                  {topic.codeOrShortcut}
                                </span>
                              )}
                            </div>
                          </div>
                          {topic.badge && (
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0",
                                topic.badgeColor
                              )}
                            >
                              {topic.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                          {topic.summary}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {topic.highlights.slice(0, 3).map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                              <span className="leading-snug truncate">{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-[11px] font-medium text-indigo-600 dark:text-dusk-lavender">
                        <span>อ่านคู่มือฉบับเต็ม</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition" />
                      </div>
                    </article>
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
