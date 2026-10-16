export interface PainPointTab {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  description: string;
  solutionTitle: string;
  solutionDesc: string;
  sticker: string;
  accentColor: string;
  mockItems: { label: string; tag: string; done?: boolean }[];
}

export interface WalkthroughSlide {
  id: string;
  code: string;
  tabName: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  sticker: string;
  accent: string;
  badgeText: string;
}

export interface BeforeAfterRow {
  before: string;
  after: string;
  moduleTag: string;
  accentColor: string;
}

export interface ComparisonRow {
  feature: string;
  diy: string;
  multiApp: string;
  retzlo: string;
}

export interface FaqItem {
  code: string;
  question: string;
  answer: string;
}

export const HERO_TYPEWRITER_LINES = [
  "เลิกสลับ 5 แอปไปมา — รวม Kanban, ปฏิทิน, โน้ต, ไดอารี่ และเพลง Lofi ไว้ในสตูดิโอเดียว...",
  "โยนเรื่องรกสมองลง Quick Notes ทันที แล้วให้ AI ช่วยแตกโปรเจกต์เป็นงานย่อยในคลิกเดียว...",
  "เปลี่ยนงานน่าเบื่อให้มีชีวิตชีวา ทำงานเสร็จรับเหรียญ Coin ไปแลกรางวัลและปลูกสวนเซน...",
  "เปิดวิทยุเทปคาสเซ็ต C-60 คลอเบา ๆ พร้อมนาฬิกา Nixie Pomodoro เข้าสู่โหมดโฟกัสแบบไม่ฝืน..."
];

export const PAIN_POINT_TABS: PainPointTab[] = [
  {
    id: "overload",
    tabLabel: "งานล้นอยู่ในหัว",
    badge: "BRAIN OVERLOAD",
    title: "งานล้นอยู่ในหัว จนสมองไม่เคยได้พัก",
    description:
      "ต้องคอยเตือนตัวเองทั้งวันว่าอย่าลืมส่งงาน อย่าลืมตอบแชตลูกค้า อย่าลืมตามบรีฟ จนสมองตื้อและเหนื่อยล้าตั้งแต่ยังไม่เริ่มลงมือทำจริง",
    solutionTitle: "โยนออกจากหัวลง Retzlo Inbox & AI Breakdown ทันที",
    solutionDesc:
      "มีไอเดียหรืองานด่วนเมื่อไหร่ กดจดลงการ์ดหรือสั่ง AI แตกงานใหญ่เป็น Checklist ย่อยได้ใน 5 วินาที สมองคุณมีหน้าที่คิด ไม่ใช่ตู้เก็บเอกสาร",
    sticker: "/stickers/retro/retro-sticker-47-sleepy-cloud.png",
    accentColor: "#ff8a4c",
    mockItems: [
      { label: "ส่งดราฟต์ดีไซน์หน้า Landing Page", tag: "TODAY · 14:00", done: true },
      { label: "AI แตกงาน: เตรียมสไลด์ประชุมลูกค้า (4 ขั้นตอน)", tag: "AI BREAKDOWN", done: false },
      { label: "ทบทวนงบประมาณโปรเจกต์ Q4", tag: "HIGH PRIORITY", done: false }
    ]
  },
  {
    id: "scattered",
    tabLabel: "ข้อมูลกระจายทั่วทุกแอป",
    badge: "APP FRAGMENTATION",
    title: "ข้อมูลกระจายอยู่ 5 แอป หาอะไรทีเสียเวลาเป็นสิบนาที",
    description:
      "งานอยู่ใน Trello, กำหนดส่งอยู่ใน Calendar, บรีฟอยู่ใน LINE, โน้ตอยู่ในมือถือ พอจะเริ่มทำงานจริงต้องนั่งเปิดหาจนหมดอารมณ์โฟกัส",
    solutionTitle: "รวมทุกโมดูลไว้ใน Workspace เดียว เชื่อมกันอัตโนมัติ",
    solutionDesc:
      "ใน Retzlo ทุกโปรเจกต์มีครบทั้ง Kanban Board, มุมมองตาราง, ปฏิทินกำหนดส่ง, คลังโน้ต และไดอารี่ กด Command+K ค้นหาเจอทุกอย่างใน 3 วินาที",
    sticker: "/stickers/retro/retro-sticker-13-project-folder.png",
    accentColor: "#a9a2ff",
    mockItems: [
      { label: "Kanban Board ↔ ซิงก์วันส่งขึ้น Calendar อัตโนมัติ", tag: "AUTO SYNC", done: true },
      { label: "คลังโน้ต & เอกสารแนบผูกติดกับการ์ดงานโดยตรง", tag: "NOTES HUB", done: true },
      { label: "ค้นหาข้ามบอร์ดและโน้ตด้วยปุ่มลัด Command + K", tag: "INSTANT SEARCH", done: true }
    ]
  },
  {
    id: "busy-unproductive",
    tabLabel: "ยุ่งทั้งวัน แต่งานหลักไม่เสร็จ",
    badge: "FAKE BUSYNESS",
    title: "ยุ่งวุ่นวายทั้งวัน แต่พอตกเย็นกลับรู้สึกว่างานสำคัญไม่คืบหน้า",
    description:
      "ตื่นเช้ามาเปิดจอแล้วเคว้ง ไม่รู้จะหยิบชิ้นไหนก่อน เลยเผลอทำแต่งานจุกจิกที่แทรกเข้ามา จนงานใหญ่ที่สร้างคุณค่าจริงถูกเลื่อนไปเรื่อย ๆ",
    solutionTitle: "กรองเฉพาะงานสำคัญวันนี้ด้วย Today Filter & Focus Mode",
    solutionDesc:
      "กดปุ่ม Today หรือ My Tasks เพียงคลิกเดียว บอร์ดจะซ่อนความวุ่นวายทั้งหมด เหลือแค่สิ่งที่ต้องทำให้จบในวันนี้ พร้อมเปิด Nixie Pomodoro ลุยได้ทันที",
    sticker: "/stickers/retro/retro-sticker-24-focus-timer.png",
    accentColor: "#e5bd72",
    mockItems: [
      { label: "เปิดโหมด Focus Active (ซ่อนแถบข้างทั้งหมด)", tag: "FOCUS MODE", done: true },
      { label: "กรองเฉพาะ Today Tasks · เหลือ 3 งานสำคัญ", tag: "TODAY FILTER", done: true },
      { label: "จับเวลา Nixie Tube Pomodoro 25:00 นาที", tag: "DEEP WORK", done: false }
    ]
  },
  {
    id: "monday-burnout",
    tabLabel: "ไฟแรงแค่วันจันทร์",
    badge: "MOTIVATION DROP",
    title: "ไฟแรงแค่วันจันทร์ พอถึงวันพุธก็ท้อและทิ้งบอร์ดร้าง",
    description:
      "แอปจัดการงานทั่วไปหน้าตาแห้งแล้งเหมือนตารางงานบริษัท ยิ่งทำยิ่งเครียด เคลียร์งานเสร็จก็ไม่มีความรู้สึกภูมิใจหรือรางวัลตอบแทน",
    solutionTitle: "เปลี่ยนงานเป็นเกมด้วย Coin Rewards, Coffee Cheers & Zen Garden",
    solutionDesc:
      "ทุกครั้งที่ลากการ์ดเข้าช่อง Done คุณจะได้พลุฉลองและเหรียญ Coin สะสม เพื่อนำไปแลกรางวัลที่ตั้งไว้เอง เช่น พักดื่มกาแฟ ดูซีรีส์ หรือปลูกบอนไซในสวนเซน",
    sticker: "/stickers/retro/retro-sticker-01-coin-reward.png",
    accentColor: "#34d399",
    mockItems: [
      { label: "เคลียร์การ์ดยากสำเร็จ! รับทันที +25 Coins 🪙", tag: "REWARD EARNED", done: true },
      { label: "แลกรางวัลใน Arcade Store: พักดูอนิเมะ 1 ตอน", tag: "ARCADE STORE", done: true },
      { label: "รดน้ำต้นซากุระพันปีใน Solitary Zen Garden (+5c)", tag: "ZEN STREAK", done: true }
    ]
  },
  {
    id: "sleepless",
    tabLabel: "นอนไม่หลับ สมองไม่ยอมพัก",
    badge: "NIGHT ANXIETY",
    title: "ปิดคอมเข้านอนแล้ว แต่สมองยังวนคิดเรื่องงานพรุ่งนี้",
    description:
      "กลัวลืมนัดสำคัญ กลัวตกหล่นงานที่รับปากไว้ จนต้องคว้ามือถือมาจดกลางดึก นอนไม่หลับและตื่นมาพร้อมความอ่อนล้า",
    solutionTitle: "ปิดวันอย่างสงบด้วย Daily Diary & Mindful Box Breathing",
    solutionDesc:
      "สรุปสิ่งที่ทำสำเร็จลงไดอารี่ ตรวจสอบ Agenda ล่วงหน้า 7 วัน แล้วแวะเข้าสวนเซนฝึกหายใจ Box Breathing 4-4-4-4 เพื่อปิดสวิตช์สมองก่อนนอน",
    sticker: "/stickers/retro/retro-sticker-07-moon.png",
    accentColor: "#89c7d6",
    mockItems: [
      { label: "บันทึก Daily Diary & เช็กลิสต์กิจวัตรก่อนนอน", tag: "NIGHT ROUTINE", done: true },
      { label: "ฝึกหายใจ Box Breathing 1 นาทีในสวนเซน", tag: "MINDFULNESS", done: true },
      { label: "ระบบจำงานพรุ่งนี้ให้ครบ 100% — ปิดไฟนอนได้อย่างวางใจ", tag: "PEACE OF MIND", done: true }
    ]
  },
  {
    id: "not-lazy",
    tabLabel: "คุณไม่ได้ขี้เกียจ",
    badge: "THE REAL TRUTH",
    title: "คุณไม่ได้ขี้เกียจ... คุณแค่ต้องการระบบที่ไม่ฝืนธรรมชาติมนุษย์",
    description:
      "คนส่วนใหญ่ล้มเหลวกับการจัดระเบียบเพราะพยายามใช้เครื่องมือที่ซับซ้อนเกินไป ต้องคอยนั่งสร้างตารางและผูกสูตรเองจนกลายเป็นงานเพิ่มอีกชิ้น",
    solutionTitle: "Retzlo ออกแบบมาให้พร้อมใช้ทันที อบอุ่น สบายตา และเข้าใจง่าย",
    solutionDesc:
      "ไม่ต้องตั้งค่าซับซ้อน สมัครปุ๊บได้ครบทั้งบอร์ด ปฏิทิน โน้ต ไดอารี่ ร้านค้ารางวัล และวิทยุ Lofi ในบรรยากาศ Retro Studio ที่ทำให้คุณอยากเปิดใช้งานทุกวัน",
    sticker: "/stickers/retro/retro-sticker-09-headphones.png",
    accentColor: "#d59ab3",
    mockItems: [
      { label: "ไม่ต้องเขียนสูตร Database เองให้ปวดหัว", tag: "ZERO SETUP", done: true },
      { label: "สลับโทนสี Retro Lofi Indigo และ Warm Paper ได้ดั่งใจ", tag: "DUAL THEME", done: true },
      { label: "เริ่มต้นใช้งานฟรีทันที ไม่ต้องเสียเวลาลองผิดลองถูก", tag: "READY IN 60S", done: true }
    ]
  }
];

export const WALKTHROUGH_SLIDES: WalkthroughSlide[] = [
  {
    id: "workspaces",
    code: "00 · Workspaces Hub (ศูนย์บัญชาการหลัก)",
    tabName: "00 · Workspaces",
    title: "แยกบริษัท โปรเจกต์ และพื้นที่ส่วนตัวออกจากกันอย่างเป็นระเบียบ",
    subtitle: "Multi-Workspace Command Hub & Agenda Sidebar",
    description:
      "ศูนย์บัญชาการแรกเมื่อเปิดเข้าสู่ระบบ เห็นความคืบหน้าของทุกโปรเจกต์ แยกหมวดหมู่ Work และ Diary ชัดเจน พร้อมแถบ Agenda ด้านซ้ายที่สรุปกำหนดส่งใน 7 วันและ 30 วันข้างหน้าให้ทันที",
    highlights: [
      "สลับดูระดับบริษัท (All Workspaces) หรือเจาะจงรายบอร์ดได้ในคลิกเดียว",
      "ตกแต่งปกโปรเจกต์และสติกเกอร์เรโทรประจำทีมได้กว่า 40 แบบ",
      "เห็นหลอด Progress Bar เปอร์เซ็นต์งานที่เสร็จแล้วแบบเรียลไทม์"
    ],
    sticker: "/stickers/retro/retro-sticker-13-project-folder.png",
    accent: "#a9a2ff",
    badgeText: "COMMAND CENTER"
  },
  {
    id: "kanban",
    code: "01 · Kanban & Table Board (บอร์ดบริหารงานอัจฉริยะ)",
    tabName: "01 · Kanban & Table",
    title: "ลากวางงานลื่นไหลระดับ 60fps พร้อมสลับมุมมองตารางได้ทันที",
    subtitle: "Optimistic Drag-and-Drop Board + High-Density Table View",
    description:
      "บริหารสถานะงานตั้งแต่ Todo → Doing → Waiting → Done ด้วยระบบ Optimistic UI ที่ตอบสนองทันทีโดยไม่ต้องรอโหลดหน้าใหม่ พร้อมตัวกรอง Today, My Tasks และโหมดย่อการ์ด Compact 2x",
    highlights: [
      "กำหนดความยากง่าย (Difficulty), ลำดับความสำคัญ, ผู้รับผิดชอบ และไฟล์แนบครบครัน",
      "ปุ่ม AI Summary สรุปความคืบหน้าและคอขวดของทั้งบอร์ดในพริบตา",
      "ส่งออกข้อมูลบอร์ดเป็นไฟล์ Excel, CSV, PDF หรือรูปภาพ PNG ได้ทันที"
    ],
    sticker: "/stickers/retro/retro-sticker-03-checklist.png",
    accent: "#ff8a4c",
    badgeText: "CORE WORKFLOW"
  },
  {
    id: "calendar",
    code: "02 · Unified Calendar (ปฏิทินรวมกำหนดส่งและไดอารี่)",
    tabName: "02 · Calendar",
    title: "เห็นภาพรวมทั้งเดือนและสัปดาห์ ไม่พลาดทุกเส้นตายสำคัญ",
    subtitle: "Auto-Synced Project Deadlines & Daily Schedule Grid",
    description:
      "ทุกการ์ดที่ตั้งวันครบกำหนด (Due Date) และบันทึกไดอารี่จะถูกนำมาวางบนปฏิทินให้อัตโนมัติ ช่วยให้คุณวางแผนรับมือล่วงหน้าและเกลี่ยภาระงานในแต่ละวันได้อย่างสมดุล",
    highlights: [
      "แสดงสีตามสถานะการ์ดและแจ้งเตือนงานที่ใกล้ครบกำหนดหรือเลยกำหนด (Overdue)",
      "คลิกที่วันที่เพื่อสร้างการ์ดงานใหม่หรือเปิดแก้ไขรายละเอียดได้ทันที",
      "กรองดูเฉพาะสถานะที่ต้องการตรวจทานได้อย่างอิสระ"
    ],
    sticker: "/stickers/retro/retro-sticker-04-calendar.png",
    accent: "#89c7d6",
    badgeText: "TIME ENGINE"
  },
  {
    id: "notes",
    code: "03 · Second Brain Notes (คลังความรู้และกระดานโน้ต)",
    tabName: "03 · Notes Hub",
    title: "เก็บทุกไอเดีย บรีฟสำคัญ และคลังความรู้ไว้ข้างบอร์ดทำงาน",
    subtitle: "Folder-Organized Knowledge Base & Side-by-Side Board Rail",
    description:
      "จัดหมวดหมู่โน้ตด้วยระบบโฟลเดอร์ ปักหมุดโน้ตสำคัญไว้ด้านบน เลือกสีการ์ดโน้ตแยกตามหัวข้อ หรือเปิดแผง Notes Rail ควบคู่ไปกับหน้า Kanban Board เพื่อดูบรีฟขณะจัดงาน",
    highlights: [
      "รองรับการจัดโฟลเดอร์ ปักหมุด (Pin) และค้นหาข้อความแบบละเอียด",
      "เปิดคู่กับหน้าบอร์ดได้โดยไม่ต้องสลับหน้าจอไปมา",
      "ปรับสีสันการ์ดโน้ตได้ 10 โทนสีที่อ่านสบายตาทั้งโหมดมืดและสว่าง"
    ],
    sticker: "/stickers/retro/retro-sticker-12-paper-note.png",
    accent: "#d59ab3",
    badgeText: "SECOND BRAIN"
  },
  {
    id: "diary",
    code: "04 · Daily Diary & Habit Checklist (บันทึกประจำวันและวินัย)",
    tabName: "04 · Diary & Habits",
    title: "ทบทวนตัวเองทุกวัน พร้อมเช็กลิสต์กิจวัตรที่สร้างนิสัยใหม่แบบไม่ฝืน",
    subtitle: "Private/Project Journaling & Recurring Routine Checklists",
    description:
      "พื้นที่ปลอดภัยสำหรับจดบันทึกประจำวัน สรุปบทเรียนจากการทำงาน และตั้งค่ากิจวัตรซ้ำรายวัน/รายสัปดาห์ เมื่อทำเช็กลิสต์ครบตามเป้าหมายจะได้รับโบนัสเหรียญสะสมเป็นกำลังใจ",
    highlights: [
      "ตั้งเวลาแจ้งเตือนความคืบหน้าของเช็กลิสต์ประจำวัน",
      "รองรับการซ่อนบันทึกส่วนตัว (Hidden Privacy) พร้อมมาตรฐานความปลอดภัยสูงสุด",
      "รับโบนัส Milestone Coins เมื่อเคลียร์กิจวัตรประจำวันสำเร็จ"
    ],
    sticker: "/stickers/retro/retro-sticker-02-diary-notebook.png",
    accent: "#e5bd72",
    badgeText: "DAILY RHYTHM"
  },
  {
    id: "rewards",
    code: "05 · Arcade Rewards Store (ร้านค้าแลกรางวัลจากการทำงาน)",
    tabName: "05 · Rewards Store",
    title: "เปลี่ยนความเหนื่อยล้าให้เป็นรางวัลที่จับต้องได้จริง",
    subtitle: "Gamified Coin Economy, Starter Presets & Redemption Ledger",
    description:
      "สะสมเหรียญจากการทำงานเสร็จและการส่งแก้วกาแฟให้กำลังใจเพื่อนร่วมทีม (Coffee Cheers) แล้วนำมาแลกของรางวัลที่คุณหรือทีมตั้งไว้เอง เช่น พักเบรกกาแฟ ตั๋วหนัง หรือวันหยุดพิเศษ",
    highlights: [
      "มีชุดของรางวัลเริ่มต้น (Starter Showcase 5 รายการ) กดเพิ่มเข้าคลังได้ในคลิกเดียว",
      "ระบบสมุดบัญชีบันทึกประวัติการแลกรางวัลและการอนุมัติอย่างโปร่งใส",
      "กระตุ้นสมองให้เกิด Dopamine เชิงบวก อยากเคลียร์งานให้จบทุกวัน"
    ],
    sticker: "/stickers/retro/retro-sticker-18-gift.png",
    accent: "#34d399",
    badgeText: "GAMIFICATION"
  },
  {
    id: "zen-lofi",
    code: "06 · Lofi Studio & Solitary Zen Garden (มุมโฟกัสและสวนเซน)",
    tabName: "06 · Lofi & Zen",
    title: "ดนตรี Lofi สังเคราะห์สด นาฬิกา Nixie และสวนหินญี่ปุ่นบำบัดใจ",
    subtitle: "Web Audio Synthesizer, Nixie Pomodoro & Interactive Karesansui",
    description:
      "เอกลักษณ์หนึ่งเดียวของ Retzlo ที่รวมเครื่องมือสร้างสมาธิไว้บนแถบด้านบน: เปิดเสียงเพลง Lofi พร้อมเสียงแผ่นเสียงไวนิล จับเวลาโฟกัสด้วยหลอดไฟ Nixie และแวะพักรดน้ำต้นไม้ 10 สายพันธุ์ในสวนเซน",
    highlights: [
      "คลิกพื้นทรายในสวนเซนเพื่อสร้างคลื่นน้ำและเสียงหยดน้ำผ่อนคลายสมอง",
      "โหมดฝึกหายใจ Box Breathing (4-4-4-4) ลดความตึงเครียดระหว่างวันใน 60 วินาที",
      "สะสมต้นไม้ตั้งแต่ต้นอ่อนไม้ไผ่ บอนไซโบราณ ไปจนถึงซากุระพันปีพร้อมคลื่นเสียง Solfeggio"
    ],
    sticker: "/stickers/retro/retro-sticker-09-headphones.png",
    accent: "#a9a2ff",
    badgeText: "SIGNATURE VIBE"
  }
];

export const SUITABLE_FOR_LIST = [
  "มีงาน ไอเดีย และโปรเจกต์กระจายอยู่หลายที่ ยุ่งทั้งวันแต่งานสำคัญไม่ค่อยเสร็จตามแผน",
  "เสียเวลาทุกเช้าไปกับการนั่งเคว้งหน้าจอ คิดว่าจะเริ่มทำงานชิ้นไหนก่อนดี",
  "เคยลองใช้ Notion หรือแอปใหญ่ ๆ แล้วรู้สึกว่าซับซ้อนเกินไป ขี้เกียจนั่งสร้างตารางเอง",
  "อยากมี 'สมองที่สอง' คอยช่วยจำกำหนดส่ง โน้ตสำคัญ และรายการสิ่งที่ต้องทำแทนสมองจริง",
  "ชอบบรรยากาศการทำงานที่อบอุ่น มีเพลง Lofi คลอเบา ๆ และไม่ดูเคร่งเครียดเหมือนโปรแกรมออฟฟิศ",
  "ชอบความรู้สึกเวลาเห็นงานขยับไปช่อง Done และอยากมีระบบสะสมแต้มแลกรางวัลให้ตัวเอง",
  "ต้องรับผิดชอบหลายบทบาทพร้อมกัน ทั้งงานหลัก โปรเจกต์เสริม และเรื่องส่วนตัวในชีวิตประจำวัน"
];

export const NOT_SUITABLE_FOR_LIST = [
  "เป็นคนความจำดีเลิศระดับซูเปอร์คอมพิวเตอร์ ไม่เคยลืมงานหรือนัดหมายแม้แต่ครั้งเดียว",
  "มีความสุขกับการสลับเปิด-ปิด 10 แอปไปมา และสนุกกับการค้นหาไฟล์ที่กระจัดกระจาย",
  "ชอบนั่งเขียนสูตร Relation & Rollup ซับซ้อนด้วยตัวเองนาน ๆ 30-40 ชั่วโมงมากกว่าการลงมือทำงานจริง",
  "ชอบจดงานใส่เศษกระดาษโพสต์อิทแปะเต็มโต๊ะ แล้วปล่อยให้ปลิวหายไปตามกาลเวลา",
  "ต้องการโปรแกรม ERP องค์กรขนาดยักษ์ที่มีขั้นตอนเอกสารราชการซับซ้อนหลายสิบชั้น",
  "ไม่ชอบฟังเพลงโฟกัส ไม่ชอบความเรียบง่าย และไม่อยากให้รางวัลตัวเองเวลาทำงานสำเร็จ",
  "ยังสนุกกับการแบกงาน 47 แท็บไว้ในหัวตอนเข้านอนทุกคืน"
];

export const BEFORE_AFTER_ROWS: BeforeAfterRow[] = [
  {
    before: "ต้องคอยจำงานและเรื่องเร่งด่วนทุกอย่างไว้ในหัวจนสมองล้า",
    after: "โยนลงบอร์ดหรือสั่ง AI แตกงานย่อยทันที สมองโล่ง ไม่กลัวลืม",
    moduleTag: "AI BREAKDOWN & BOARD",
    accentColor: "#ff8a4c"
  },
  {
    before: "เปิดคอมตอนเช้าแล้วเคว้ง ไม่รู้จะเริ่มหยิบงานไหนก่อน",
    after: "กดกรอง Today Tasks เห็นเฉพาะงานสำคัญวันนี้ สั่งลุยได้ทันที",
    moduleTag: "TODAY FOCUS FILTER",
    accentColor: "#e5bd72"
  },
  {
    before: "ไอเดีย บรีฟ และโน้ตสำคัญกระจัดกระจายอยู่คนละแอป",
    after: "รวมอยู่ใน Notes Hub และแนบติดกับการ์ด ค้นเจอใน 3 วินาที",
    moduleTag: "SECOND BRAIN NOTES",
    accentColor: "#a9a2ff"
  },
  {
    before: "ทำงานไปเปิดยูทูบหาเพลงไป เผลอไถคลิปอื่นจนหลุดโฟกัส",
    after: "กดเปิด Lofi Cassette Radio & Nixie Pomodoro บนหัวเว็บได้ทันที",
    moduleTag: "LOFI STUDIO TOOLS",
    accentColor: "#89c7d6"
  },
  {
    before: "ทำงานเสร็จก็แค่ขีดฆ่าทิ้ง หมดแรงและไม่มีกำลังใจทำต่อ",
    after: "ลากการ์ดเข้า Done รับเหรียญ Coin สะสมไปแลกรางวัลให้ตัวเอง",
    moduleTag: "ARCADE REWARDS",
    accentColor: "#34d399"
  },
  {
    before: "เครียดสะสมระหว่างวัน สมองตื้อคิดงานไม่ออก",
    after: "แวะพักรดน้ำบอนไซและฝึกหายใจ Box Breathing 1 นาทีในสวนเซน",
    moduleTag: "SOLITARY ZEN GARDEN",
    accentColor: "#d59ab3"
  },
  {
    before: "ถึงเวลานอนก็ยังกังวล วนเวียนกลัวลืมงานวันพรุ่งนี้",
    after: "ปิดคอมแล้วหลับสบาย มั่นใจว่าระบบและปฏิทินจำแทนให้ครบ 100%",
    moduleTag: "UNIFIED CALENDAR",
    accentColor: "#a9a2ff"
  }
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "เวลาที่ใช้เริ่มต้นระบบ",
    diy: "เสียเวลา 2–4 สัปดาห์ นั่งออกแบบตารางและลองผิดลองถูกเอง",
    multiApp: "ต้องสมัครและตั้งค่าแยก 4–5 แอป ข้อมูลไม่คุยกัน",
    retzlo: "สมัครปุ๊บ ได้ครบทุกโมดูล พร้อมเริ่มงานแรกใน 60 วินาที"
  },
  {
    feature: "การเชื่อมโยงงาน & ปฏิทิน",
    diy: "ต้องคอยผูก Relation เอง ถ้าระบบพังต้องนั่งแก้ใหม่หมด",
    multiApp: "ต้องคัดลอกกำหนดส่งข้ามไประหว่างแอปงานกับแอปปฏิทิน",
    retzlo: "ตั้ง Due Date ในการ์ดปุ๊บ ซิงก์ขึ้นปฏิทินรวมให้อัตโนมัติ 100%"
  },
  {
    feature: "ผู้ช่วย AI อัจฉริยะในตัว",
    diy: "ไม่มี หรือต้องเสียค่ารายเดือนเพิ่มเพื่อเปิดใช้งาน",
    multiApp: "ต้องสลับไปคุยในหน้าต่างแชตอื่นแล้วก๊อปปี้มาวางเอง",
    retzlo: "มี AI Breakdown แตกงานย่อย, AI Summary สรุปบอร์ด และ AI Chat ในตัว"
  },
  {
    feature: "ระบบโฟกัส & เพลงบรรยากาศ",
    diy: "ต้องไปหาแปะลิงก์ Widget ภายนอกที่มักโหลดช้าหรือโฆษณาคั่น",
    multiApp: "ต้องเปิดแอปจับเวลาแยก และเปิดแท็บเพลงแยกต่างหาก",
    retzlo: "มีวิทยุ Lofi สังเคราะห์สด + นาฬิกา Nixie Pomodoro บนแถบเครื่องมือทันที"
  },
  {
    feature: "แรงจูงใจ & การดูแลสุขภาพใจ",
    diy: "พึ่งพาวินัยเหล็กของตัวเองล้วน ๆ หมดไฟง่าย",
    multiApp: "หน้าตาเป็นโปรแกรมออฟฟิศทั่วไป ยิ่งเปิดยิ่งรู้สึกกดดัน",
    retzlo: "มีระบบเหรียญแลกรางวัล, Coffee Cheers และสวนเซนฝึกหายใจคลายเครียด"
  },
  {
    feature: "การรองรับภาษา & คู่มือระบบ",
    diy: "ต้องงมหาดูคลิปสอนภาษาอังกฤษใน YouTube เอง",
    multiApp: "เมนูและคู่มือกระจัดกระจาย ไม่มีแนวทางที่ชัดเจน",
    retzlo: "รองรับภาษาไทย/อังกฤษสมบูรณ์ พร้อม Interactive System Guide ทดลองเล่นได้จริง"
  },
  {
    feature: "ความคุ้มค่าและต้นทุน",
    diy: "เสียเวลาทำงานจริงไปกว่า 30–40 ชั่วโมง",
    multiApp: "เสียค่าสมาชิกรายเดือนรวมกันหลายแอปปีละหลายพันบาท",
    retzlo: "เปิดให้สร้าง Workspace และใช้งานฟีเจอร์หลักได้ฟรีทันที!"
  }
];

export const FAQ_ROW_1: FaqItem[] = [
  {
    code: "Q·01",
    question: "ไม่เคยใช้ระบบจัดการงานแบบ Kanban มาก่อน จะใช้เป็นไหม?",
    answer:
      "ใช้เป็นตั้งแต่นาทีแรกแน่นอนครับ! Retzlo ออกแบบมาให้เรียบง่ายที่สุด แค่สร้างการ์ดแล้วลากจากช่อง Todo ไป Doing และ Done นอกจากนี้ยังมีหน้า Interactive Help Guide ให้ทดลองกดเล่นได้ทุกฟีเจอร์ครับ"
  },
  {
    code: "Q·02",
    question: "ต้องเสียค่าบริการรายเดือนหรือผูกบัตรเครดิตก่อนไหม?",
    answer:
      "ไม่ต้องผูกบัตรเครดิตและไม่ต้องเสียค่าใช้จ่ายครับ คุณสามารถสมัครสมาชิกและสร้าง Workspace เพื่อใช้งาน Kanban, ปฏิทิน, โน้ต, ไดอารี่, วิทยุ Lofi และสวนเซนได้ฟรีทันที"
  },
  {
    code: "Q·03",
    question: "ใช้งานบน MacBook, iPad หรือโทรศัพท์มือถือได้ไหม?",
    answer:
      "ใช้งานได้สมบูรณ์แบบทุกอุปกรณ์ครับ เราปรับจูน Responsive Layout ให้รองรับทั้งหน้าจอ Mac Retina (Safari/Chrome), Windows, แท็บเล็ต และสมาร์ตโฟน ข้อมูลซิงก์แบบเรียลไทม์"
  },
  {
    code: "Q·04",
    question: "เป็นคนขี้เกียจจัดระเบียบ เคยใช้แอปอื่นแล้วทิ้ง จะรอดไหม?",
    answer:
      "รอดแน่นอนครับ! เพราะ Retzlo ไม่ได้บังคับให้คุณต้องจัดตารางเอง แค่โยนหัวข้อให้ AI ช่วยแตก Task ย่อย แล้วค่อย ๆ ทำทีละชิ้นพร้อมฟังเพลง Lofi พอทำเสร็จก็ได้เหรียญไปแลกรางวัล"
  },
  {
    code: "Q·05",
    question: "สามารถเชิญเพื่อนร่วมทีมหรือแฟนเข้ามาทำงานด้วยกันได้ไหม?",
    answer:
      "ได้ครับ! แต่ละ Workspace รองรับการส่งลิงก์คำเชิญ (Member Invitations) กำหนดสิทธิ์ผู้ดูแล มอบหมายงานรายคน (Assignees) คอมเมนต์คุยงานในการ์ด และส่ง Coffee Cheers ให้กำลังใจกันได้"
  }
];

export const FAQ_ROW_2: FaqItem[] = [
  {
    code: "Q·06",
    question: "ระบบเหรียญ Coin และสวนเซน (Zen Garden) ทำงานยังไง?",
    answer:
      "เมื่อคุณทำงานในการ์ดเสร็จหรือเช็กกิจวัตรในไดอารี่ครบ คุณจะได้รับเหรียญ Coin สะสม ซึ่งนำไปใช้แลกรางวัลที่คุณตั้งไว้ใน Rewards Store หรือนำไปปลดล็อกพันธุ์ไม้และคลื่นเสียงบำบัดในสวนเซนได้ครับ"
  },
  {
    code: "Q·07",
    question: "ถ้าไม่ชอบโทนสีมืด (Dark Mode) สามารถเปลี่ยนเป็นโทนสว่างได้ไหม?",
    answer:
      "ได้ทันทีครับ! Retzlo มีระบบ Dual Theme Engine ให้คุณสลับระหว่างโหมดมืด 'Retro Lofi Indigo' ยามค่ำคืน และโหมดสว่าง 'Warm Paper' สีกระดาษถนอมสายตาในตอนกลางวันได้ตามใจชอบ"
  },
  {
    code: "Q·08",
    question: "ข้อมูลส่วนตัวและบันทึกไดอารี่ของฉันปลอดภัยแค่ไหน?",
    answer:
      "ปลอดภัยสูงสุดตามมาตรฐาน PDPA และ GDPR ครับ รหัสผ่านถูกเข้ารหัสอย่างแน่นหนา บันทึกไดอารี่สามารถตั้งค่าซ่อน (Hidden) ได้ และเนื้อหาส่วนตัวจะไม่ถูกนำไปบันทึกในระบบล็อกสาธารณะ"
  },
  {
    code: "Q·09",
    question: "วิทยุ Lofi ในเว็บต้องต่อ Spotify หรือเปิด YouTube ทิ้งไว้ไหม?",
    answer:
      "ไม่ต้องครับ! Retzlo มีเครื่องสังเคราะห์เสียง Web Audio Synthesizer ในตัวที่สร้างคอร์ดดนตรี Lofi อบอุ่นพร้อมเสียงแผ่นเสียงไวนิลแบบสด ๆ ทำงานได้ทันทีโดยไม่มีโฆษณาคั่นและไม่กินเน็ต"
  },
  {
    code: "Q·10",
    question: "ถ้าต้องการส่งออกข้อมูลงานไปทำรายงานต่อ ทำได้ไหม?",
    answer:
      "ทำได้ในคลิกเดียวครับ บนหน้าบอร์ดมีปุ่ม Export ที่รองรับการส่งออกตารางงานเป็นไฟล์ Excel (.xlsx), CSV, เอกสาร PDF พร้อมพิมพ์ หรือบันทึกรูปภาพหน้าบอร์ดเป็น PNG ความละเอียดสูง"
  }
];

export const COMMUNITY_TESTIMONIALS = [
  {
    name: "มินตรา ว.",
    role: "Co-founder & Product Designer",
    avatarSticker: "/stickers/retro/retro-sticker-09-headphones.png",
    highlight: "ลดเวลาสลับแอปลง 50% เอาเวลาไปทำงานที่สร้างรายได้จริง",
    quote:
      "เมื่อก่อนเปิด Todoist + Trello + Google Calendar + โน้ตมือถือ สลับ 4 แอปตลอดวัน ข้อมูลกระจัดกระจาย พอย้ายมาใช้ Retzlo ทุกอย่างอยู่ในสตูดิโอเดียว ทั้งบอร์ด โน้ต ปฏิทิน และนาฬิกาจับเวลา ไม่ต้องสลับแท็บไปมาอีกเลย"
  },
  {
    name: "ภัทร อัครธนากาญจน์",
    role: "Full-stack Developer & Indie Hacker",
    avatarSticker: "/stickers/retro/retro-sticker-10-coffee-cup.png",
    highlight: "จากคนผัดวันประกันพรุ่ง ตอนนี้เคลียร์งานได้วันละ 8-10 การ์ดสบาย ๆ",
    quote:
      "ปกติเป็นคนวางแผนเก่งแต่ทำไม่ค่อยจบ พอมาเจอระบบ Coin Rewards กับสวนเซนของ Retzlo กลายเป็นว่าสมองมันอยากเห็นการ์ดเข้าช่อง Done เพื่อเอาเหรียญไปปลดล็อกต้นซากุระพันปี แถมเพลง Lofi ในตัวช่วยให้โค้ดงานตอนดึกโฟกัสดีมาก"
  },
  {
    name: "จุฑามณี ม.",
    role: "Creative Agency Director",
    avatarSticker: "/stickers/retro/retro-sticker-20-sparkles.png",
    highlight: "ประหยัดเวลาวางแผนตอนเช้าไปสัปดาห์ละ 3-4 ชั่วโมง",
    quote:
      "แต่ก่อนทุกเช้าต้องเสียเวลาครึ่งชั่วโมงนั่งนึกว่าวันนี้ต้องทำอะไรบ้าง ตอนนี้เปิด Retzlo มาปุ๊บ กดปุ่ม Today Tasks เห็นเลยว่าต้องลุยชิ้นไหนก่อน หรือถ้าโปรเจกต์ใหญ่ก็กดให้ AI แตกงานย่อยให้ ทีมงานชอบบรรยากาศเว็บมาก ไม่เครียดเหมือนแอปเดิม"
  }
];
