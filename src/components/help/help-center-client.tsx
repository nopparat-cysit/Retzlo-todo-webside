"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Coins,
  Compass,
  CornerDownRight,
  FolderKanban,
  HelpCircle,
  Keyboard,
  KeyRound,
  LayoutGrid,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Table,
  Zap,
  Flag,
  Download,
} from "lucide-react";

import { BackButton } from "@/components/ui/back-button";
import { useAiChat } from "@/components/ai/ai-chat-context";
import { cn } from "@/lib/utils";

interface GuideTopic {
  id: string;
  category: "all" | "ai" | "kanban" | "gamification" | "calendar" | "notes" | "shortcuts" | "security" | "faq";
  icon: typeof BookOpen;
  title: string;
  badge?: string;
  badgeColor?: string;
  summary: string;
  highlights: string[];
  tips?: string;
  codeOrShortcut?: string;
}

const CATEGORIES = [
  { id: "all", label: "🌟 ทั้งหมด" },
  { id: "ai", label: "🤖 ผู้ช่วย AI" },
  { id: "kanban", label: "📋 บอร์ด & ตาราง" },
  { id: "gamification", label: "☕ Cheers & เหรียญ" },
  { id: "calendar", label: "📅 ปฏิทิน & เวลา" },
  { id: "notes", label: "📝 โน้ต & ไดอารี่" },
  { id: "shortcuts", label: "⌨️ คีย์ลัด" },
  { id: "security", label: "👥 สมาชิก & สิทธิ์" },
  { id: "faq", label: "❓ ถาม-ตอบ" },
] as const;

const TOPICS: GuideTopic[] = [
  {
    id: "ai-assistant",
    category: "ai",
    icon: Bot,
    title: "ผู้ช่วยอัจฉริยะ Retzlo AI (DeepSeek-V4 Pro)",
    badge: "AI Powered",
    badgeColor: "border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender",
    summary:
      "ผู้ช่วย AI ประจำโปรเจกต์ ขับเคลื่อนด้วยโมเดล DeepSeek-V4 Pro ช่วยวิเคราะห์ สรุปงาน และร่างการ์ดงานอัตโนมัติแบบ Multi-turn",
    highlights: [
      "เปิดแชทได้ทันทีจากไอคอน 🤖 ที่แถบด้านบนข้างรูปโปรไฟล์",
      "เปิดครั้งแรกเริ่มต้นที่แถบข้าง (Sidebar / Side Panel สไตล์ Gemini ตรึงขอบขวา)",
      "ถ้าย่อหน้าต่างหรือจอเล็ก (< 1024px) จะปรับเป็นกล่องแชทลอยมุมล่างขวา (Bottom-Right) โดยอัตโนมัติ",
      "ปุ่มดาวล่างขวา (FAB Hub) จะขยับเลื่อนขึ้นไปอยู่เหนือแชทอย่างราบรื่น ไม่บดบังการพิมพ์",
      "เข้าใจบริบทของโปรเจกต์ปัจจุบัน สามารถถามเกี่ยวกับสถานะบอร์ดและการ์ดได้โดยตรง",
      "มี Quick Starter Prompts คำถามด่วนให้เลือกคลิกได้ในคลิกเดียว",
    ],
    tips: "บนหน้าจอคอมพิวเตอร์ สามารถกดปุ่มสลับมุมมองระหว่างแถบข้าง (Side Panel) และกล่องลอยขวาล่างได้ตามความถนัด และสามารถกำหนด DeepSeek API Key ส่วนตัวได้ในหน้าต่างการตั้งค่าโมเดล",
  },
  {
    id: "ai-breakdown-summary",
    category: "ai",
    icon: Sparkles,
    title: "ฟีเจอร์ AI Auto-Breakdown & Executive Summary",
    badge: "Automation",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    summary:
      "เปลี่ยนชิ้นงานขนาดใหญ่ให้กลายเป็น Action Items ที่จับต้องได้ พร้อมสรุปสุขภาพโครงการสำหรับผู้บริหารและทีม",
    highlights: [
      "AI Task Breakdown: คลิกปุ่ม ✨ AI Breakdown ในหน้าต่างการ์ด เพื่อแตกหัวข้อย่อยเป็น Checklist 3-10 ข้ออัตโนมัติ",
      "AI Project Summary: คลิกปุ่ม AI Summary ที่แถบหัวบอร์ด เพื่อวิเคราะห์ภาพรวม ความคืบหน้า คอขวด และข้อเสนอแนะ",
      "AI Create Cards: สั่งในแชทให้สร้างการ์ดลงบอร์ด พร้อมระบบพรีวิวยืนยันรายการก่อนบันทึกจริงเพื่อความปลอดภัย",
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
    summary:
      "บอร์ดบริหารจัดการงานแบบเรียลไทม์ รองรับการลากวาง (Drag & Drop) อย่างลื่นไหล และปรับแต่งคอลัมน์ได้อย่างยืดหยุ่น",
    highlights: [
      "Optimistic UI: ลากวางการ์ดสลับคอลัมน์หรือเปลี่ยนลำดับได้ทันที ไม่ต้องรอเซิร์ฟเวอร์ตอบสนอง",
      "Real-time Sync: การ์ดขยับและอัปเดตแบบสดๆ ไปยังเพื่อนร่วมทีมทุกคนในโปรเจกต์ด้วย Pusher WebSocket",
      "Column Settings: ปรับเปลี่ยนชื่อคอลัมน์, กำหนดขีดจำกัดงานระหว่างทำ (WIP Limit) เพื่อป้องกันงานคั่งค้าง",
      "Sort Handle ด้านหน้า: จับลากจุด ⁝⁝ ที่ด้านหน้าเมนูในแถบข้างเพื่อจัดลำดับบอร์ดและเครื่องมือตามใจชอบ",
    ],
    tips: "สามารถกดสร้างบอร์ดใหม่ได้ไม่จำกัดในแต่ละโปรเจกต์เพื่อแยกตาม Sprint หรือประเภทงาน",
  },
  {
    id: "spreadsheet-table-view",
    category: "kanban",
    icon: Table,
    title: "มุมมองตารางสเปรดชีต (Spreadsheet Table View)",
    badge: "New Feature",
    badgeColor: "border-dusk-cyan/30 bg-dusk-cyan/10 text-dusk-cyan",
    summary:
      "สลับมุมมองจาก Kanban Board ไปเป็นตาราง Spreadsheet สไตล์ Excel/Google Sheets สำหรับการจัดการและแก้ไขข้อมูลปริมาณมากอย่างรวดเร็ว",
    highlights: [
      "สลับมุมมองได้ที่ปุ่ม 📊 Table บริเวณด้านบนของหัวบอร์ด (มีทั้งมุมมองตารางเรียบ และมุมมองจัดกลุ่มตามคอลัมน์)",
      "Multi-Assignee: รองรับการมอบหมายงานให้ผู้รับผิดชอบได้หลายคนผ่านดรอปดาวน์ พร้อม Avatar Stack ซ้อนกันและปุ่ม Clear All",
      "Inline Editing: คลิกแก้ไขชื่องาน และเลือกสถานะการ์ดได้ทันที",
      "Priority Dropdown: แสดงชื่อระดับความสำคัญและสีตาม Custom Priorities ของบอร์ด พร้อมคลิกเปลี่ยนระดับความสำคัญได้ทันที",
      "Interactive DatePicker: คลิกช่องวันที่เพื่อเลือกวันเริ่ม (Start Date) และวันกำหนดส่ง (Due Date) ด้วยปฏิทินย้อนยุค Retro Lofi",
      "Priority Sorting: กดหัวคอลัมน์ Priority เพื่อเรียงลำดับความเร่งด่วนตามระดับความสำคัญ (Level 1 ด่วนที่สุด)",
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
    summary:
      "แต่ละบอร์ดสามารถสร้างและปรับแต่งระดับความสำคัญของงานได้เองสูงสุดถึง 10 ระดับ พร้อมเลือกสีได้ 12 โทนสี และเรียงลำดับความเร่งด่วน",
    highlights: [
      "เปิดจัดการได้ง่ายๆ ผ่านปุ่ม Priorities บน Header Toolbar หรือแท็บ Priorities ใน Board Settings",
      "สร้างระดับความสำคัญเพิ่มได้สูงสุด 10 ระดับ และปรับแต่งชื่อได้ตามต้องการ (เช่น P0, Critical, Normal)",
      "เลือกสีได้ถึง 12 โทนสี Retro Lofi (Rose, Orange, Amber, Yellow, Emerald, Teal, Sky, Blue, Indigo, Purple, Pink, Stone)",
      "ปุ่มเลื่อนลำดับขึ้น/ลง เพื่อจัดลำดับความเร่งด่วน โดยระดับ 1 มีความเร่งด่วนสูงสุด",
      "ป้ายสีกำกับ Priority จะแสดงผลสอดคล้องกันทั้งในการ์ด Kanban, Card Detail Modal, และตาราง Spreadsheet",
    ],
    tips: "หากลบหรือตั้งค่าใหม่ ระบบจะมีปุ่ม 'รีเซ็ตกลับเป็นค่าเริ่มต้น' เพื่อคืนค่ามาตรฐาน High, Medium, Low ได้ทันที",
  },
  {
    id: "board-export",
    category: "kanban",
    icon: Download,
    title: "การส่งออกข้อมูลบอร์ด (Export: Excel, CSV, PDF, PNG)",
    badge: "Export",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    summary:
      "ส่งออกรายการงานในบอร์ดได้อย่างอิสระทั้งไฟล์สเปรดชีต เอกสาร และรูปภาพความละเอียดสูง รองรับการนำไปใช้งานต่อได้ทันที",
    highlights: [
      "Excel (.xlsx): สเปรดชีตจัดรูปแบบสมบูรณ์แบบ พร้อมหัวตาราง วันที่ ผู้รับผิดชอบ และความคืบหน้าเช็คลิสต์",
      "CSV (.csv): ไฟล์ข้อมูลสากล UTF-8 พร้อม BOM เปิดบน Excel และ Google Sheets ภาษาไทยไม่เพี้ยน 100%",
      "PDF (.pdf): เอกสารสรุปรายงานจัดหน้ามาตรฐาน A4 พร้อมหัวข้อบอร์ดและสถิติภาพรวม",
      "PNG (.png): บันทึกภาพหน้าจอมุมมองบอร์ดหรือตารางปัจจุบันความละเอียดสูงระดับ 2x Retina",
      "เลือกขอบเขตได้: ส่งออกงานทั้งหมดในบอร์ด หรือส่งออกเฉพาะรายการที่กำลังกรองแสดงผลอยู่",
      "Quick Export Dropdown: คลิกส่งออกด่วนได้ใน 1 วินาที หรือเปิดหน้าต่างตัวเลือกเพิ่มเติมเพื่อตรวจสอบรายละเอียด",
    ],
    tips: "สามารถกด Export ได้ทั้งจากปุ่มบนหัวบอร์ดหลัก หรือปุ่ม Export ในแถบเครื่องมือของมุมมองตาราง (Table View)",
  },
  {
    id: "coffee-cheers-rewards",
    category: "gamification",
    icon: Coffee,
    title: "ระบบ Coffee Cheers และ Rewards Store",
    badge: "Gamification",
    badgeColor: "border-dusk-rose/30 bg-dusk-rose/10 text-dusk-rose",
    summary:
      "เสริมสร้างบรรยากาศการทำงานเชิงบวกด้วยการส่งแก้วกาแฟ Cheers ให้กำลังใจเพื่อนร่วมทีม พร้อมสะสมเหรียญแลกรางวัล",
    highlights: [
      "เมื่อการ์ดย้ายไปยังคอลัมน์ Done หรือทำเสร็จ จะมีปุ่ม ☕ Cheers ปรากฏขึ้นเพื่อส่งกำลังใจ",
      "ได้รับเหรียญรางวัลสะสมเข้ากระเป๋าส่วนตัวทุกครั้งที่มีการ Cheers หรืองานเสร็จสมบูรณ์",
      "สามารถนำเหรียญไปแลกไอเทมและของรางวัลในเมนู Rewards Store ของโปรเจกต์",
      "ระบบป้องกันสแปม (Rate-limit) เพื่อให้ทุกการ Cheers มีความหมายและเป็นธรรม",
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
    summary:
      "ไม่พลาดทุกกำหนดส่งด้วยมุมมองปฏิทินแบบรอบด้าน ทั้งระดับโปรเจกต์และภาพรวมทุกงาน พร้อม Global DatePicker ที่เป็นเอกลักษณ์",
    highlights: [
      "Global Retro DatePicker: ดีไซน์เฉพาะตัวในโทน Retro Lofi Indigo สบายตา",
      "Preset Shortcuts: ปุ่มลัดกำหนดวันด่วน 'วันนี้', 'พรุ่งนี้', 'สุดสัปดาห์นี้', 'สัปดาห์หน้า'",
      "TimePicker: คลิกพิมพ์เวลาได้โดยตรง มีแถบเลื่อนแนวตั้งเดี่ยวไม่งง พร้อมปุ่มลัดเวลายอดนิยม และปุ่มยืนยัน 'ตกลง'",
      "Global Calendar View: ดูภาพรวมกำหนดส่งของทุกโปรเจกต์พร้อมกันได้ในหน้าหลัก Workspaces",
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
    summary:
      "ศูนย์กลางรวบรวมไอเดีย แผนงาน และกิจวัตรประจำวันในชีวิตของคุณที่แยกเป็นสัดส่วน",
    highlights: [
      "Notes System: จดบันทึกแยกโฟลเดอร์ ปักหมุดโน้ตสำคัญ และรองรับ Rich Content",
      "Diary Tracker: ติดตามกิจวัตรประจำวัน (Habit Checklist) พร้อมสะสมสถิติ Streak ความต่อเนื่อง",
      "Draft Storage: ป้องกันข้อความสูญหายด้วยระบบ Auto-save ร่างเอกสารในเครื่อง",
      "เชื่อมโยงกับบอร์ด: นำข้อสรุปจาก AI หรือโน้ตสำคัญไปบันทึกลงการ์ดงานได้อย่างง่ายดาย",
    ],
    tips: "ใช้ Diary Hub สำหรับจดบันทึกสั้นๆ ก่อนเริ่มวันและสรุปสิ่งที่ทำสำเร็จในแต่ละวันเพื่อสุขภาพจิตที่ดี",
  },
  {
    id: "keyboard-shortcuts",
    category: "shortcuts",
    icon: Keyboard,
    title: "คีย์ลัดระบบและการทำงานความเร็วสูง",
    badge: "Power User",
    badgeColor: "border-stone-400/30 bg-stone-400/10 text-stone-400",
    summary:
      "เพิ่มประสิทธิภาพการทำงานด้วยคีย์ลัดและการค้นหาด่วนแบบไม่ต้องยกมือจากคีย์บอร์ด",
    highlights: [
      "Ctrl / Cmd + K : เปิด Command Palette ค้นหาโปรเจกต์ บอร์ด การ์ด และคำสั่งทั้งหมด",
      "F : สลับโหมด Focus Mode ซ่อนแถบข้างและเครื่องมือเพื่อโฟกัสกับบอร์ดตรงหน้า",
      "Esc : ปิดหน้าต่าง Modal, กล่องแชท หรือ Popover ทั้งหมดทันที",
      "Enter : ส่งข้อความในแชท AI หรือบันทึกช่องกรอกข้อมูล",
    ],
    codeOrShortcut: "Ctrl + K / Cmd + K",
    tips: "กด Command Palette แล้วพิมพ์ชื่อการ์ดหรือบอร์ดเพื่อกระโดดข้ามหน้าได้เร็วกว่าการคลิกหลายเท่า",
  },
  {
    id: "roles-and-security",
    category: "security",
    icon: ShieldCheck,
    title: "ระบบสิทธิ์สมาชิกและการรักษาความปลอดภัย",
    badge: "Security",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    summary:
      "ความปลอดภัยและความเป็นส่วนตัวของข้อมูลตามมาตรฐาน มีการแยกบทบาทและสิทธิ์อย่างชัดเจน",
    highlights: [
      "Owner: ผู้สร้างโปรเจกต์ มีสิทธิ์เต็มในการจัดการสมาชิก ลบโปรเจกต์ และตั้งค่าขั้นสูง",
      "Member: สมาชิกที่ได้รับเชิญ สามารถสร้างการ์ด แก้ไขงาน และร่วมกิจกรรมในโปรเจกต์ได้",
      "Private Boards: สามารถสร้างบอร์ดเฉพาะตัวที่มองเห็นได้เฉพาะคุณ แม้จะอยู่ในโปรเจกต์ที่มีหลายคน",
      "Confirm Modal: การลบหรือแก้ไขข้อมูลสำคัญจะมีหน้าต่างยืนยันความตั้งใจเสมอเพื่อป้องกันอุบัติเหตุ",
    ],
    tips: "คุณสามารถเชิญสมาชิกใหม่เข้าร่วมทีมได้ผ่านอีเมลหรือการแชร์ลิงก์คำเชิญ (Invitation Link)",
  },
  {
    id: "faq-credits-offline",
    category: "faq",
    icon: HelpCircle,
    title: "คำถามที่พบบ่อย (FAQ & การแก้ไขปัญหา)",
    badge: "FAQ",
    badgeColor: "border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber",
    summary:
      "รวบรวมข้อสงสัยทั่วไปและแนวทางแก้ไขเมื่อพบปัญหาในการใช้งาน",
    highlights: [
      "Q: ถ้าเครดิต AI ในระบบหมด จะทำอย่างไร? -> ตอบ: สามารถคลิกที่ชื่อโมเดลในหน้าต่าง AI Chat เพื่อใส่ DeepSeek API Key ส่วนตัวของคุณเองได้ฟรีและไม่จำกัด",
      "Q: ข้อมูลจะหายไหมหากอินเทอร์เน็ตหลุดกะทันหัน? -> ตอบ: ระบบมีระบบ Draft Storage สำรองข้อมูลการพิมพ์ไว้ในบราวเซอร์ ปลอดภัยหายห่วง",
      "Q: ธีมสีสามารถเปลี่ยนได้หรือไม่? -> ตอบ: รองรับทั้งธีม Light Mode, Dark Mode และ System โดยกดเปลี่ยนได้ที่รูปโปรไฟล์ของคุณ",
      "Q: ต้องการรายงานข้อผิดพลาดหรือแนะนำฟีเจอร์? -> ตอบ: สามารถพิมพ์แจ้งผ่านผู้ช่วย Retzlo AI หรือติดต่อทีมพัฒนาได้ตลอดเวลา",
    ],
    tips: "อย่าลืมตรวจสอบการเชื่อมต่ออินเทอร์เน็ตเพื่อให้ WebSocket Pusher ทำงานได้อย่างสมบูรณ์",
  },
];

export function HelpCenterClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { openAiChat } = useAiChat();

  const filteredTopics = TOPICS.filter((topic) => {
    const matchesCategory =
      selectedCategory === "all" || topic.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      topic.title.toLowerCase().includes(query) ||
      topic.summary.toLowerCase().includes(query) ||
      topic.highlights.some((h) => h.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="soft-grid-bg min-h-screen w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender shadow-[0_0_12px_rgba(168,143,212,0.15)]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Documentation & Help</p>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
                ข้อมูลระบบ & คู่มือการใช้งาน
              </h1>
            </div>
          </div>

          {/* Quick AI Trigger button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAiChat}
              className="motion-interactive inline-flex items-center gap-2 rounded-xl border border-dusk-lavender/40 bg-dusk-lavender/15 px-3.5 py-2 text-xs font-semibold text-dusk-lavender transition hover:bg-dusk-lavender hover:text-ink-950 cursor-pointer shadow-sm"
              title="เปิดคุยกับ AI Assistant ประจำระบบ"
            >
              <Bot className="h-4 w-4" />
              <span>ถาม AI Assistant</span>
              <Sparkles className="h-3 w-3 text-dusk-amber" />
            </button>
            <Link
              href="/projects"
              className="motion-interactive inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-stone-300 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <FolderKanban className="h-4 w-4 text-stone-400" />
              <span>ไปยัง Workspace</span>
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="lofi-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-dusk-lavender/30 bg-dusk-lavender/10 px-2.5 py-0.5 text-[11px] font-medium text-dusk-lavender">
              <Sparkles className="h-3 w-3 text-dusk-amber" />
              <span>Retzlo Platform Knowledge Base & System Guide</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-100">
              ศูนย์รวมข้อมูลระบบ วิธีใช้งาน และคลังความรู้แบบครบวงจร
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              ยินดีต้อนรับสู่คู่มือการใช้งานแพลตฟอร์ม Retzlo ไม่ว่าคุณจะต้องการเรียนรู้วิธีใช้บอร์ดแบบตารางสเปรดชีต, 
              การสั่งงาน AI Assistant อัจฉริยะ, หรือการจัดลำดับงานด้วยคีย์ลัด คุณสามารถค้นหาคำตอบได้ที่นี่
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mt-5 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาฟีเจอร์ เช่น AI, Spreadsheet, เหรียญ, คีย์ลัด..."
              className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-xs text-stone-100 placeholder:text-stone-500 focus:border-dusk-lavender/60 focus:outline-none focus:ring-1 focus:ring-dusk-lavender/60 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 hover:text-stone-200"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
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
                    ? "border-dusk-lavender/60 bg-dusk-lavender/20 text-dusk-lavender shadow-[0_0_12px_rgba(168,143,212,0.2)]"
                    : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/20 hover:text-stone-200"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Topics Grid */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <article
                key={topic.id}
                id={topic.id}
                className="lofi-panel group flex flex-col justify-between rounded-2xl border border-white/10 bg-ink-950/40 p-5 transition-all duration-200 hover:border-dusk-lavender/40 hover:bg-white/[0.02]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-dusk-lavender group-hover:border-dusk-lavender/40 group-hover:bg-dusk-lavender/10 transition">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-100 group-hover:text-dusk-lavender transition">
                          {topic.title}
                        </h3>
                        {topic.codeOrShortcut && (
                          <span className="inline-block mt-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.2 font-mono text-[10px] text-dusk-amber">
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

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {topic.summary}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {topic.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-stone-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400/80 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {topic.tips && (
                  <div className="mt-4 rounded-xl border border-dusk-amber/20 bg-dusk-amber/5 p-2.5 text-[11px] text-dusk-amber/90 flex items-start gap-2">
                    <span className="font-bold shrink-0">💡 เคล็ดลับ:</span>
                    <span>{topic.tips}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="lofi-panel rounded-2xl border border-white/10 p-8 text-center space-y-3">
            <HelpCircle className="mx-auto h-8 w-8 text-stone-500" />
            <h3 className="text-sm font-semibold text-stone-200">ไม่พบหัวข้อที่ค้นหา</h3>
            <p className="text-xs text-stone-400">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูอีกครั้ง
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="inline-flex text-xs text-dusk-lavender hover:underline"
            >
              แสดงหัวข้อทั้งหมด
            </button>
          </div>
        )}

        {/* Knowledge Base Maintenance Notice for Agents and Maintainers */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 text-xs text-stone-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-stone-200">
            <BookOpen className="h-4 w-4 text-dusk-lavender" />
            <span>คำแนะนำสำหรับการดูแลคู่มือระบบ (System Knowledge Base Maintenance)</span>
          </div>
          <p className="leading-relaxed">
            ระบบความรู้นี้ได้รับการซิงค์และบันทึกไว้ใน <code className="rounded bg-white/10 px-1 py-0.5 text-stone-300">docs/system-guide.md</code> ตามข้อตกลงใน <code className="rounded bg-white/10 px-1 py-0.5 text-stone-300">AGENTS.md</code> โดยเมื่อใดที่มีการพัฒนาฟีเจอร์ใหม่หรือปรับเปลี่ยนการทำงานของระบบ จะต้องอัปเดตข้อมูลคู่มือที่หน้านี้และไฟล์เอกสาร Markdown ควบคู่กันเสมอ
          </p>
        </section>
      </div>
    </main>
  );
}
