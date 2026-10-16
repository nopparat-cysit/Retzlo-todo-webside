export interface PainPointTab {
  id: string;
  num: string;
  tabLabel: string;
  badgeText: string;
  accentColor: string;
  paperTint: string;
  stickerSrc: string;
  beforeIllustSrc: string;
  afterIllustSrc: string;
  title: string;
  beforeQuote: string;
  beforeText: string;
  afterTitle: string;
  afterText: string;
  iconSrc: string;
  previewTitle: string;
  previewItems: { label: string; meta: string; done?: boolean; coin?: number }[];
}

export interface WalkthroughSlide {
  id: string;
  chapter: string;
  tabName: string;
  accentColor: string;
  stickerSrc: string;
  title: string;
  subtitle: string;
  description: string;
  tryHint: string;
  details: string[];
  iconSrc: string;
}

export interface PlaygroundTask {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  coins: number;
  stickerSrc: string;
}

export interface PlaygroundReward {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  iconSrc: string;
  bgTint: string;
}

export interface ComparisonRow {
  feature: string;
  diy: string;
  multiApp: string;
  retzlo: string;
}

export interface FaqItem {
  num: string;
  question: string;
  answer: string;
}

export const PLAYGROUND_TASKS: PlaygroundTask[] = [
  {
    id: "task-brief",
    title: "สรุปโครงสร้างหน้าเว็บลงสมุดโน้ต",
    tag: "Side Note",
    tagColor: "#7858d4",
    coins: 20,
    stickerSrc: "/stickers/retro/retro-sticker-32-idea-lamp.png"
  },
  {
    id: "task-focus",
    title: "เปิดโหมดโฟกัส 25 นาที เคลียร์งานชิ้นหลัก",
    tag: "Focus 25m",
    tagColor: "#d97706",
    coins: 30,
    stickerSrc: "/stickers/retro/retro-sticker-42-hourglass.png"
  },
  {
    id: "task-cheer",
    title: "ส่งแก้วกาแฟให้กำลังใจเพื่อนในบอร์ด",
    tag: "Coffee Cheer",
    tagColor: "#db2777",
    coins: 15,
    stickerSrc: "/stickers/retro/retro-sticker-19-heart.png"
  },
  {
    id: "task-diary",
    title: "เขียนบันทึกสั้นๆ 3 บรรทัดก่อนปิดคอม",
    tag: "Daily Diary",
    tagColor: "#059669",
    coins: 25,
    stickerSrc: "/stickers/retro/retro-sticker-34-paint-palette.png"
  }
];

export const PLAYGROUND_REWARDS: PlaygroundReward[] = [
  {
    id: "reward-coffee",
    title: "พักดริปกาแฟแก้วโปรด 20 นาที",
    subtitle: "วางเมาส์ไปชงกาแฟหอมๆ",
    cost: 30,
    iconSrc: "/stickers/rewards/reward-icon-03-coffee.png",
    bgTint: "#fff4d9"
  },
  {
    id: "reward-ramen",
    title: "มื้อเย็นราเมงชามพิเศษ",
    subtitle: "ฉลองปิดโปรเจกต์ประจำสัปดาห์",
    cost: 45,
    iconSrc: "/stickers/retro/retro-sticker-27-ramen-bowl.png",
    bgTint: "#ffe8f2"
  },
  {
    id: "reward-game",
    title: "ตั๋วเล่นเกม / ดูอนิเมะ 1 ตอน",
    subtitle: "พักสมองแบบไม่ต้องรู้สึกผิด",
    cost: 40,
    iconSrc: "/stickers/rewards/reward-icon-04-game.png",
    bgTint: "#ede9fe"
  }
];

export const PAIN_POINT_TABS: PainPointTab[] = [
  {
    id: "scattered",
    num: "01",
    tabLabel: "จดไว้ 5 แอป พอจะใช้จริงหาไม่เจอ",
    badgeText: "APP HOPPING SYNDROME",
    accentColor: "#7858d4",
    paperTint: "#f5f0ff",
    stickerSrc: "/stickers/retro/retro-sticker-39-phone-chat.png",
    beforeIllustSrc: "/images/landing/case-01-scattered.png",
    afterIllustSrc: "/images/landing/after-flow-cutout.png",
    title: "งานอยู่ในบอร์ดหนึ่ง บรีฟไหลไปในแชต ส่วนไอเดียเมื่อคืนอยู่ในโน้ตมือถือ",
    beforeQuote: "“จำได้ว่าเคยจดลิงก์เรฟไว้... แต่อยู่ในแชตหรือโน้ตนะ?”",
    beforeText:
      "แค่จะเริ่มทำงานชิ้นเดียว ต้องเปิดหาข้อมูลข้ามไปมา 4-5 หน้าต่าง กว่าจะหาบรีฟเจอ สมาธิที่ตั้งใจไว้ตอนแรกก็หลุดไปกับแจ้งเตือนอื่นเรียบร้อย",
    afterTitle: "เปิดสมุดโน้ตวางคู่กับบอร์ดงานในหน้าจอเดียว",
    afterText:
      "ใน Retzlo คุณเปิดแถบสมุดโน้ต (Notes Side Rail) ข้างบอร์ด Kanban ได้เลย อ่านบรีฟ เช็กรายการย่อย และลากการ์ดงานไปพร้อมกันโดยไม่ต้องสลับแอป",
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-folder-open.png",
    previewTitle: "คลิกติ๊กรายการด้านล่างเพื่อลองขยับงาน",
    previewItems: [
      { label: "ปักหมุดโน้ตบรีฟลูกค้าไว้ข้างบอร์ด", meta: "แนบโน้ตแล้ว", done: true, coin: 15 },
      { label: "ร่างโครงสร้างหน้า Landing Page", meta: "กำลังทำ · วันนี้", done: false, coin: 20 },
      { label: "แนบไฟล์เรฟและส่งให้ทีมรีวิว", meta: "พรุ่งนี้ · 15:00", done: false, coin: 25 }
    ]
  },
  {
    id: "morning-start",
    num: "02",
    tabLabel: "เปิดคอมตอนเช้าแล้วเคว้ง ไม่รู้จะเริ่มชิ้นไหน",
    badgeText: "MORNING OVERWHELM",
    accentColor: "#d97706",
    paperTint: "#fff8e6",
    stickerSrc: "/stickers/retro/retro-sticker-24-focus-timer.png",
    beforeIllustSrc: "/images/landing/case-02-morning.png",
    afterIllustSrc: "/images/landing/hero-lofi-mascot.png",
    title: "การ์ดงานกองเป็นภูเขา จนสุดท้ายเผลอไปนั่งตอบแชตแทนทำงานหลัก",
    beforeQuote: "“งานเยอะไปหมด เริ่มเคลียร์อันง่ายๆ ก่อนละกัน... อ้าว หมดเช้าแล้ว”",
    beforeText:
      "พอทุกอย่างดูสำคัญเท่ากันหมด สมองเราจะหนีไปทำงานจุกจิกที่ใช้แรงน้อยกว่า รู้ตัวอีกทีก็เย็นแล้วโดยที่งานชิ้นสำคัญยังไม่ขยับแม้แต่นิดเดียว",
    afterTitle: "กรองเหลือแค่ 3 ชิ้นของวันนี้ แล้วเปิดเพลง Lofi โฟกัสทีละใบ",
    afterText:
      "กดตัวกรอง Today เพื่อซ่อนงานที่ยังไม่ถึงเวลาออกไปก่อน แล้วเปิดจับเวลา Pomodoro 25 นาทีพร้อมเสียงคอร์ดดนตรีนุ่มๆ ค่อยๆ เคลียร์ทีละชิ้นแบบไม่กดดัน",
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-time-sunrise.png",
    previewTitle: "มุมมองงานวันนี้ (Today Focus)",
    previewItems: [
      { label: "เลือก 3 การ์ดสำคัญที่จะทำให้จบวันนี้", meta: "เสร็จแล้ว", done: true, coin: 15 },
      { label: "เปิดโหมดโฟกัส 25 นาที เขียนต้นฉบับ", meta: "โฟกัส 25 นาที", done: false, coin: 30 },
      { label: "พักยืดเส้นยืดสายและชงกาแฟช่วงบ่าย", meta: "รางวัลหลังโฟกัส", done: false, coin: 15 }
    ]
  },
  {
    id: "deadlines",
    num: "03",
    tabLabel: "จด To-do ไว้ครบ แต่ลืมดูว่างานชนกันวันศุกร์",
    badgeText: "BLIND DEADLINES",
    accentColor: "#db2777",
    paperTint: "#fff0f6",
    stickerSrc: "/stickers/retro/retro-sticker-58-priority-flag.png",
    beforeIllustSrc: "/images/landing/case-03-deadlines.png",
    afterIllustSrc: "/images/landing/case-05-ready.png",
    title: "ดูงานเป็นลิสต์ยาวๆ แล้วมองไม่เห็นภาพรวมของสัปดาห์",
    beforeQuote: "“รับปากเพิ่มไปอีกงาน เพิ่งเห็นว่ากำหนดส่งวันพุธมีรออยู่แล้ว 4 ชิ้น!”",
    beforeText:
      "รายการ To-do แบบเรียงบรรทัดไม่เคยบอกว่าสัปดาห์ไหนเรางานแน่นเกินไป กว่าจะรู้ตัวก็ตอนที่เดดไลน์หลายชิ้นวิ่งมาชนกันในวันเดียว",
    afterTitle: "ใส่วันส่งบนการ์ดปุ๊บ เด้งขึ้นปฏิทินรวมให้เห็นทั้งเดือนทันที",
    afterText:
      "ไม่ต้องคอยก๊อปปี้วันส่งงานไปลงปฏิทินแยก ทุกการ์ดที่มีวันครบกำหนดและทุกบันทึกประจำวันจะปรากฏบนหน้าปฏิทินเดียวกัน ช่วยให้เกลี่ยงานล่วงหน้าได้สบายๆ",
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-calendar-clock.png",
    previewTitle: "ตารางกำหนดส่งประจำสัปดาห์",
    previewItems: [
      { label: "วันจันทร์ · ส่งดราฟต์แรกให้ทีมดู", meta: "ตามกำหนด", done: true, coin: 20 },
      { label: "วันพุธ · อัปเดตดีไซน์หน้าหลัก", meta: "14:00 น.", done: false, coin: 25 },
      { label: "วันศุกร์ · สรุปบันทึกสัปดาห์และแลกรางวัล", meta: "17:00 น.", done: false, coin: 20 }
    ]
  },
  {
    id: "burnout",
    num: "04",
    tabLabel: "ขีดฆ่างานจบไปวันๆ แต่รู้สึกแห้งแล้งเหมือนหุ่นยนต์",
    badgeText: "SOULLESS PRODUCTIVITY",
    accentColor: "#059669",
    paperTint: "#edfcf5",
    stickerSrc: "/stickers/retro/retro-sticker-10-coffee-cup.png",
    beforeIllustSrc: "/images/landing/before-chaos-cutout.png",
    afterIllustSrc: "/images/landing/case-04-burnout.png",
    title: "แอปทำงานส่วนใหญ่หน้าตาเหมือนตารางบัญชี ยิ่งเปิดยิ่งเครียด",
    beforeQuote: "“ทำเสร็จไป 10 งาน ก็แค่มีงานใหม่เติมเข้ามาอีก 10 งาน...”",
    beforeText:
      "เมื่อการเคลียร์งานเสร็จไม่มีจังหวะให้ดีใจหรือพักหายใจ สมองจะเริ่มล้าและหมดไฟ เพราะรู้สึกเหมือนวิ่งอยู่บนลู่วิ่งที่ไม่มีเส้นชัย",
    afterTitle: "เปลี่ยนทุกงานที่ทำเสร็จเป็นเหรียญรางวัล และมุมพักใจระหว่างวัน",
    afterText:
      "ทุกครั้งที่ขยับการ์ดไปช่อง Done หรือส่งกาแฟให้เพื่อน คุณจะได้สะสมเหรียญไว้แลกรางวัลที่ตั้งเอง หรือแวะไปรดน้ำต้นซากุระในสวนหินญี่ปุ่นบนแถบด้านบน",
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-coffee-heart.png",
    previewTitle: "ลูปความสุขเล็กๆ ระหว่างวันทำงาน",
    previewItems: [
      { label: "เคลียร์งานชิ้นหลักของช่วงเช้าสำเร็จ", meta: "+30 เหรียญ", done: true, coin: 30 },
      { label: "ส่ง Coffee Cheer ขอบคุณเพื่อนในทีม", meta: "+15 เหรียญ", done: true, coin: 15 },
      { label: "แลกตั๋วพักดริปกาแฟ 20 นาทีช่วงบ่าย", meta: "ใช้ 30 เหรียญ", done: false, coin: 20 }
    ]
  },
  {
    id: "setup-fatigue",
    num: "05",
    tabLabel: "อยากจัดระเบียบชีวิต แต่ขี้เกียจนั่งสร้างตารางเอง 3 วัน",
    badgeText: "TEMPLATE FATIGUE",
    accentColor: "#4f46e5",
    paperTint: "#eef2ff",
    stickerSrc: "/stickers/retro/retro-sticker-33-magic-wand.png",
    beforeIllustSrc: "/images/landing/fit-heavy-erp.png",
    afterIllustSrc: "/images/landing/fit-cozy-achiever.png",
    title: "ตั้งใจจะจัดระบบงานใหม่ แต่หมดแรงตั้งแต่ตอนนั่งผูกสูตรฐานข้อมูล",
    beforeQuote: "“แต่งหน้าเพจไปครึ่งวัน สุดท้ายตารางพัง เลยกลับไปจดใส่เศษกระดาษเหมือนเดิม”",
    beforeText:
      "เครื่องมือที่เปิดหน้ากระดาษโล่งๆ ให้สร้างเองทุกอย่างมักดูน่าสนุกในวันแรก แต่พองานยุ่งจริงๆ เรากลับไม่มีเวลามานั่งซ่อมระบบที่ตัวเองผูกไว้",
    afterTitle: "โครงสร้างที่คิดมาให้ครบ เปิดปุ๊บเริ่มจดการ์ดใบแรกได้ใน 10 วินาที",
    afterText:
      "Retzlo เตรียมทั้งบอร์ด Kanban, ตาราง Table, ปฏิทิน, สมุดโน้ต และไดอารี่ไว้ให้พร้อมใช้ทันที มีแม่แบบสถานะงานให้เลือก 7 สไตล์ ปรับแต่งเพิ่มได้โดยไม่พัง",
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-kanban-board.png",
    previewTitle: "พร้อมเริ่มงานทันทีตั้งแต่วินาทีแรก",
    previewItems: [
      { label: "เลือกแม่แบบขั้นตอนงานจาก 7 สไตล์มาตรฐาน", meta: "คลิกเดียวจบ", done: true, coin: 15 },
      { label: "สลับดูแบบบอร์ด ตาราง และปฏิทินได้ทันที", meta: "ซิงก์อัตโนมัติ", done: true, coin: 20 },
      { label: "ปรับโทนสี Warm Paper / Lofi Indigo ตามเวลา", meta: "ถนอมสายตา", done: false, coin: 15 }
    ]
  }
];

export const WALKTHROUGH_SLIDES: WalkthroughSlide[] = [
  {
    id: "workspaces",
    chapter: "ROOM 01 · WORKSPACES",
    tabName: "01 · ห้องโปรเจกต์",
    accentColor: "#7858d4",
    stickerSrc: "/stickers/retro/retro-sticker-13-project-folder.png",
    title: "แยกห้องงานทีมและพื้นที่ส่วนตัวชัดเจน ไม่ปนกัน",
    subtitle: "Project Workspaces & 7-Day Agenda",
    description:
      "หน้าแรกที่จัดวางโปรเจกต์เหมือนชั้นวางเทปคาสเซ็ต แยกเรื่องงานออกจากสมุดบันทึกส่วนตัว พร้อมแถบสรุปงานใน 7 วันข้างหน้าให้เห็นทันทีว่าสัปดาห์นี้มีอะไรรออยู่",
    tryHint: "ลองคลิกสลับห้องโปรเจกต์ หรือติ๊กงานใน 7-Day Agenda ด้านขวา",
    details: [
      "สร้างได้หลายบอร์ดในหนึ่งโปรเจกต์ แยกตามเฟสงานหรือหมวดหมู่ได้อิสระ",
      "เห็นหลอดความคืบหน้าและจำนวนการ์ดที่ค้างอยู่แบบไม่ต้องกดเข้าไปดูทีละห้อง",
      "เชิญเพื่อนร่วมทีมเข้ามาช่วยขยับการ์ดและส่งกาแฟให้กำลังใจกันได้"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-folder-closed.png"
  },
  {
    id: "kanban",
    chapter: "ROOM 02 · BOARD & TABLE",
    tabName: "02 · บอร์ด & ตาราง",
    accentColor: "#d97706",
    stickerSrc: "/stickers/retro/retro-sticker-03-checklist.png",
    title: "ขยับการ์ดบนบอร์ดให้เห็นจังหวะงาน หรือสลับเป็นตารางในคลิกเดียว",
    subtitle: "Interactive Kanban & Table View",
    description:
      "ไม่ว่าจะชอบลากการ์ดข้ามคอลัมน์แบบเห็นภาพ หรือชอบดูเป็นตารางเรียงตามวันส่งและผู้รับผิดชอบ ก็สลับไปมาได้ทันทีบนข้อมูลชุดเดียวกัน",
    tryHint: "ลองคลิกที่การ์ดงานในตัวอย่างด้านขวาเพื่อขยับสถานะข้ามคอลัมน์!",
    details: [
      "มีปุ่มช่วยย่อยงานใหญ่ให้กลายเป็นเช็กลิสต์ย่อยอัตโนมัติเมื่อไม่รู้จะเริ่มตรงไหน",
      "ส่งออกรายการงานเป็นไฟล์ PDF, CSV, Markdown หรือแคปรูปบอร์ดแชร์ให้ทีมได้ทันที",
      "ได้เหรียญรางวัลสะสมทุกครั้งที่ขยับการ์ดเข้าสู่สถานะเสร็จสมบูรณ์"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-kanban-board.png"
  },
  {
    id: "calendar",
    chapter: "ROOM 03 · UNIFIED CALENDAR",
    tabName: "03 · ปฏิทินรวมศูนย์",
    accentColor: "#db2777",
    stickerSrc: "/stickers/retro/retro-sticker-04-calendar.png",
    title: "วันส่งงานบนการ์ดและบันทึกประจำวัน ซิงก์ขึ้นปฏิทินเดียวกันอัตโนมัติ",
    subtitle: "Unified Schedule & Deadlines",
    description:
      "บอกลาการจดวันส่งซ้ำสองที่ ทุกการ์ดที่ระบุ Due Date จะปรากฏบนปฏิทินพร้อมสีสถานะชัดเจน ช่วยให้รู้ล่วงหน้าว่าวันไหนงานแน่นหรือวันไหนยังว่าง",
    tryHint: "ลองคลิกเลือกแต่ละวันบนปฏิทินด้านขวาเพื่อดูและติ๊กงานของวันนั้น",
    details: [
      "คลิกที่ช่องวันที่เพื่อดูรายการงานทั้งหมดและกดติ๊กเสร็จได้จากหน้าปฏิทินเลย",
      "มองเห็นทั้งกำหนดส่งงานและบันทึกไดอารี่ในมุมมองรายเดือนเดียวกัน",
      "กดสร้างการ์ดงานใหม่ลงในวันที่ต้องการได้โดยตรงไม่ต้องกลับไปหน้าบอร์ด"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-calendar-clock.png"
  },
  {
    id: "notes",
    chapter: "ROOM 04 · FOLDER NOTES",
    tabName: "04 · สมุดโน้ต",
    accentColor: "#059669",
    stickerSrc: "/stickers/retro/retro-sticker-12-paper-note.png",
    title: "กระดาษโน้ตหลากสีที่เปิดเทียบข้างบอร์ดงานได้ตลอดเวลา",
    subtitle: "Color-Coded Notes & Side Rail",
    description:
      "เก็บทุกไอเดีย บรีฟลูกค้า ลิงก์อ้างอิง และสรุปประชุมไว้ในโฟลเดอร์ที่เป็นระเบียบ เลือกสีกระดาษโน้ตตามหมวดหมู่ และเปิดแถบอ่านคู่กับบอร์ดงานได้ทันที",
    tryHint: "ลองคลิกเปลี่ยนสีกระดาษโน้ตและกดปักหมุดโน้ตในตัวอย่างด้านขวา",
    details: [
      "เปิด Notes Side Rail ข้างบอร์ด Kanban เพื่อดูบรีฟไปพร้อมกับแตกการ์ดงาน",
      "เปลี่ยนโทนสีกระดาษโน้ตได้หลายเฉด ช่วยให้กวาดสายตาหาเรื่องสำคัญได้ไว",
      "ตั้งค่าความเป็นส่วนตัวของโน้ตแต่ละใบได้ว่าจะแชร์ในโปรเจกต์หรือเก็บไว้ดูคนเดียว"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-note-page.png"
  },
  {
    id: "diary",
    chapter: "ROOM 05 · DIARY & HABITS",
    tabName: "05 · ไดอารี่ & กิจวัตร",
    accentColor: "#8b5cf6",
    stickerSrc: "/stickers/retro/retro-sticker-02-diary-notebook.png",
    title: "มุมเงียบๆ สำหรับทบทวนตัวเองและเช็กกิจวัตรประจำวัน",
    subtitle: "Private Journal & Daily Routines",
    description:
      "เพราะชีวิตไม่ได้มีแค่งานที่ส่งคนอื่น Retzlo จึงมีห้องบันทึกประจำวันและตารางกิจวัตร (Habit Checklist) ที่รีเซ็ตให้ทุกวัน พร้อมโหมดซ่อนเนื้อหาส่วนตัว",
    tryHint: "ลองกดติ๊กกิจวัตรประจำวัน หรือกดปุ่มซ่อนเนื้อหาส่วนตัวด้านขวา",
    details: [
      "เช็กลิสต์กิจวัตรรายวัน รายสัปดาห์ หรือรายเดือนที่ช่วยสร้างวินัยเล็กๆ อย่างสม่ำเสมอ",
      "มีปุ่ม Privacy Mask ซ่อนข้อความไดอารี่ทันทีเมื่อเปิดใช้งานในที่สาธารณะ",
      "สะสมสถิติความต่อเนื่อง (Streak) และรับเหรียญรางวัลเมื่อทำกิจวัตรครบ"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-notebook.png"
  },
  {
    id: "zen-lofi",
    chapter: "ROOM 06 · MIXTAPE & ZEN",
    tabName: "06 · เพลง Lofi & สวนหิน",
    accentColor: "#ec4899",
    stickerSrc: "/stickers/retro/retro-sticker-09-headphones.png",
    title: "เปิดเทปเพลง Lofi จับเวลาโฟกัส และแวะพักสายตาในสวนหินญี่ปุ่น",
    subtitle: "Cassette Synth, Pomodoro & Zen Garden",
    description:
      "เสน่ห์ที่ทำให้ Retzlo ไม่เหมือนแอปทำงานทั่วไป คือเครื่องเล่นเทปสังเคราะห์เสียง Lofi บนแถบด้านบน สวนหินญี่ปุ่นสำหรับฝึกหายใจ และร้านแลกของรางวัล",
    tryHint: "ลองเลือกมู้ดเพลงบนเทปคาสเซ็ตและกดเปิดฟังเสียงสังเคราะห์สดๆ ด้านขวา!",
    details: [
      "สังเคราะห์เสียงคอร์ด Lofi อุ่นๆ จากเบราว์เซอร์โดยตรง ไม่ต้องเปิดยูทูบสลับแท็บ",
      "มุมสวนหินญี่ปุ่นและต้นซากุระที่ค่อยๆ เติบโตตามจังหวะการโฟกัสของคุณ",
      "ร้านค้าแลกรางวัล (Reward Arcade) ที่เปลี่ยนคะแนนการทำงานเป็นเวลาพักที่มีความหมาย"
    ],
    iconSrc: "/stickers/ui-icons-retzlo/retzlo-ui-reward-coin.png"
  }
];

export const SUITABLE_FOR_LIST = [
  "มีทั้งงานหลัก งานเสริม และเรื่องส่วนตัวที่อยากเก็บไว้ในที่เดียวแบบไม่ปนกัน",
  "อยากได้ระบบที่เปิดปุ๊บเริ่มจดได้เลย ไม่ต้องเสียเวลานั่งผูกตารางหรือซ่อมสูตรเอง",
  "ชอบบรรยากาศโต๊ะทำงานที่อบอุ่น มีสีสัน มีเพลง Lofi คลอเบาๆ และไม่ดูตึงเครียดเหมือนโปรแกรมองค์กร",
  "ชอบความรู้สึกเวลาได้ขยับการ์ดไปช่อง Done แล้วได้สะสมเหรียญไว้แลกรางวัลให้ตัวเอง",
  "อยากเห็นทั้งการ์ดงาน สมุดโน้ต และวันครบกำหนดบนปฏิทินเชื่อมถึงกันอัตโนมัติ"
];

export const NOT_SUITABLE_FOR_LIST = [
  "องค์กรขนาดใหญ่ที่ต้องการระบบบัญชี ERP หรือใบสั่งซื้อที่มีขั้นตอนอนุมัติซับซ้อนหลายระดับ",
  "สายเขียนโค้ดผูกฐานข้อมูลเองทุกตารางที่ชอบใช้เวลาปรับแต่งโครงสร้างมากกว่าใช้งานสำเร็จรูป",
  "คนที่ถนัดพกสมุดกระดาษจริงเล่มเดียวและแทบไม่ได้เปิดทำงานหน้าจอคอมพิวเตอร์หรือมือถือ"
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "เวลาที่ใช้ก่อนได้เริ่มงานจริง",
    diy: "นั่งแต่งหน้าเพจและผูกตารางเอง 2–3 วัน",
    multiApp: "ต้องสมัครและตั้งค่าแยกกัน 4–5 แอป",
    retzlo: "เปิดห้องมามีบอร์ด ปฏิทิน และโน้ตพร้อมใช้ใน 10 วินาที"
  },
  {
    feature: "การเชื่อมกันของงาน โน้ต และวันส่ง",
    diy: "ต้องคอยระวังลิงก์หลุดหรือตารางพังเวลาแก้โครงสร้าง",
    multiApp: "ข้อมูลกระจัดกระจาย ค้นหาข้ามแอปยาก",
    retzlo: "การ์ดงาน วันครบกำหนด และสมุดโน้ตซิงก์กันในโปรเจกต์เดียว"
  },
  {
    feature: "ความรู้สึกและพลังใจเวลาเปิดใช้งาน",
    diy: "หน้าเอกสารขาวโล่งที่ดูนิ่งและแห้งแล้ง",
    multiApp: "หน้าตาแต่ละแอปไปคนละทิศ สลับไปมาแล้วล้าสายตา",
    retzlo: "โทนสตูดิโออบอุ่น มีเพลง Lofi สวนหินพักสายตา และเหรียญแลกรางวัล"
  },
  {
    feature: "ความต่อเนื่องในการใช้งานระยะยาว",
    diy: "มักทิ้งร้างเมื่อยุ่งจนไม่มีเวลามานั่งจัดหน้าเพจ",
    multiApp: "เหนื่อยที่จะต้องคอยอัปเดตสถานะซ้ำหลายที่",
    retzlo: "กดกรองดูเฉพาะงานวันนี้ ค่อยๆ เคลียร์ทีละชิ้นได้ทุกวัน"
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    num: "01",
    question: "เริ่มต้นใช้งานยากไหม ต้องตั้งค่าอะไรซับซ้อนหรือเปล่า?",
    answer:
      "ไม่ยากเลยครับ ทันทีที่สร้างโปรเจกต์แรก Retzlo จะเตรียมบอร์ดงาน มุมมองตาราง ปฏิทิน สมุดโน้ต และบันทึกประจำวันไว้ให้ครบ คุณสามารถพิมพ์การ์ดงานใบแรกและกดเปิดเพลง Lofi โฟกัสได้ภายในไม่กี่วินาที"
  },
  {
    num: "02",
    question: "แยกเรื่องงานทีมกับเรื่องส่วนตัวในบัญชีเดียวกันได้ไหม?",
    answer:
      "ได้เต็มที่ครับ คุณสามารถสร้างหลายโปรเจกต์แยกกันได้ เช่น ห้องหนึ่งสำหรับทำงานร่วมกับทีม และอีกห้องหนึ่งเป็นพื้นที่ส่วนตัวสำหรับจดไดอารี่ เป้าหมายชีวิต และโน้ตส่วนตัว"
  },
  {
    num: "03",
    question: "ระบบเหรียญรางวัลและสวนหินญี่ปุ่นทำงานอย่างไร?",
    answer:
      "ทุกครั้งที่คุณเคลียร์การ์ดงานเสร็จ ทำกิจวัตรประจำวัน หรือส่งแก้วกาแฟให้เพื่อน คุณจะได้รับเหรียญสะสมเพื่อนำไปแลกรางวัลที่คุณตั้งไว้เองในร้านค้าโปรเจกต์ หรือแวะไปกดคลื่นน้ำและรดน้ำต้นซากุระในมุมสวนหินบนแถบด้านบนได้ตลอดเวลา"
  },
  {
    num: "04",
    question: "สมุดบันทึกประจำวันและโน้ตส่วนตัวปลอดภัยแค่ไหน?",
    answer:
      "คุณสามารถตั้งค่าโน้ตและไดอารี่ให้เป็นส่วนตัวเฉพาะคุณคนเดียวได้ มีปุ่มซ่อนเนื้อหา (Privacy Mask) เวลาเปิดจอในที่สาธารณะ และระบบปฏิบัติตามมาตรฐานการคุ้มครองข้อมูลส่วนบุคคลอย่างเคร่งครัด"
  },
  {
    num: "05",
    question: "สลับโทนสีสว่างและสีมืดได้ไหม?",
    answer:
      "ได้ครับ รองรับทั้งโหมดกระดาษอุ่น (Warm Paper) สำหรับทำงานช่วงกลางวัน และโหมดสีมืด (Retro Lofi Indigo) ที่นุ่มนวลถนอมสายตาเวลาเปิดใช้งานตอนกลางคืน"
  },
  {
    num: "06",
    question: "ใช้งานบน Mac, Windows, แท็บเล็ต และมือถือได้ครบไหม?",
    answer:
      "ใช้งานผ่านเว็บเบราว์เซอร์ได้ทันทีบนทุกอุปกรณ์โดยไม่ต้องลงโปรแกรมเสริม หน้าจอออกแบบให้ปรับขนาดพอดีทั้งบนจอคอมพิวเตอร์ แท็บเล็ต และสมาร์ตโฟน"
  }
];
