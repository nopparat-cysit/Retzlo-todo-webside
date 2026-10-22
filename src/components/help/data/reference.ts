export const KEYBOARD_SHORTCUTS_LIST_EN = [
  { key: "Ctrl + K / Cmd + K", title: "Open Command Palette", desc: "Instantly search cards, boards, or switch workspaces", cat: "Navigation" },
  { key: "F", title: "Toggle Focus Mode", desc: "Hide sidebars and tools to focus strictly on active cards", cat: "Navigation" },
  { key: "Esc", title: "Dismiss Modal / Popover", desc: "Close modals, AI chat windows, and popovers immediately", cat: "General" },
  { key: "Ctrl + /", title: "Open System Guide", desc: "Navigate directly to documentation and keyboard shortcuts", cat: "General" },
  { key: "Enter", title: "Submit / Save Input", desc: "Send messages in AI chat or confirm input fields", cat: "General" },
  { key: "N", title: "Quick Create Card", desc: "Open new card form in the first column", cat: "Board" },
  { key: "D", title: "Toggle Card Density", desc: "Switch between Normal and Compact 2x card density", cat: "Board" },
  { key: "T", title: "Toggle Table / Kanban", desc: "Switch between Kanban board and Spreadsheet Table view", cat: "Board" },
];

export const KEYBOARD_SHORTCUTS_LIST_TH = [
  { key: "Ctrl + K / Cmd + K", title: "เปิด Command Palette", desc: "ค้นหาการ์ด บอร์ด หรือสลับโปรเจกต์ด่วน", cat: "Navigation" },
  { key: "F", title: "สลับ Focus Mode", desc: "ซ่อน Sidebar และเครื่องมือเพื่อโฟกัสกับบอร์ดตรงหน้า", cat: "Navigation" },
  { key: "Esc", title: "ปิดหน้าต่าง / เมนู", desc: "ปิด Modal, กล่องแชท AI, และ Popover ทันที", cat: "General" },
  { key: "Ctrl + /", title: "เปิดศูนย์ช่วยเหลือ & คู่มือ", desc: "เข้าสู่หน้าคู่มือและคีย์ลัดระบบทันที", cat: "General" },
  { key: "Enter", title: "บันทึก / ส่งข้อความ", desc: "ส่งข้อความในกล่องแชท AI หรือบันทึกช่องกรอกข้อความ", cat: "General" },
  { key: "N", title: "สร้างการ์ดใหม่ด่วน", desc: "เปิดแบบฟอร์มสร้างการ์ดใหม่ในคอลัมน์แรก", cat: "Board" },
  { key: "D", title: "สลับ Card Density", desc: "สลับโหมดความหนาแน่น Normal กับ Compact 2x", cat: "Board" },
  { key: "T", title: "สลับมุมมอง Table / Kanban", desc: "สลับระหว่างกระดาน Kanban กับตาราง Spreadsheet", cat: "Board" },
];

export const FAQ_ITEMS_EN = [
  {
    q: "Does Retzlo AI require complex setup or configuration?",
    a: "Not at all. Retzlo AI is built directly into the platform and available across all workspaces from day one. Simply click the 🤖 robot icon on the topbar to begin issuing instructions.",
    tag: "AI Assistant",
  },
  {
    q: "Will my data be lost if my internet connection drops while typing?",
    a: "Never. Retzlo features an automated Offline Draft Storage mechanism that backs up active drafts in your local browser storage. When connection restores, your data seamlessly synchronizes.",
    tag: "Data Safety",
  },
  {
    q: "What is the difference between Public and Private boards?",
    a: "Public boards are accessible to all project members. Private boards are locked exclusively to the creator and members specifically chosen in Board Settings, safeguarding confidential initiatives.",
    tag: "Security",
  },
  {
    q: "How does the Spreadsheet Table View differ from the Kanban board?",
    a: "Kanban boards excel at tracking stage-by-stage workflow transitions. The Spreadsheet Table View is optimized for scanning large volumes of tasks at once, allowing inline edits to titles, statuses, priorities, and multiple assignees.",
    tag: "Views",
  },
  {
    q: "How does Coffee Cheers work and how do I earn coins?",
    a: "When cards move to the Done column, a ☕ Cheers button illuminates. Teammates can click it to show appreciation, adding +5 coins to the recipient's personal balance for redeeming items in the project Rewards Store.",
    tag: "Gamification",
  },
  {
    q: "How do I toggle between Dark Mode and Warm Light Mode?",
    a: "Click your avatar in the top right corner and open the Theme selector to choose between Dark Mode (Retro Lofi Indigo), Light Mode (Warm Paper), or System.",
    tag: "Appearance",
  },
  {
    q: "How do Morning Dewdrops and the 3×3 Zen Sanctuary work?",
    a: "Every time you complete a task on your Kanban board, you earn +1 Morning Dewdrop (💧). Open the Solitary Zen Garden on the topbar or the 3×3 Full Sanctuary modal to water your plots, bask them in Pomodoro Sunlight, and cultivate ancient botanical guardians.",
    tag: "Zen Garden",
  },
];

export const FAQ_ITEMS_TH = [
  {
    q: "การใช้งาน Retzlo AI ต้องติดตั้งหรือตั้งค่าเพิ่มเติมไหม?",
    a: "ไม่ต้องติดตั้งอะไรเพิ่มเติมทั้งสิ้น ผู้ช่วย Retzlo AI มีพร้อมใช้งานในตัวทันทีในทุก Workspace ตั้งแต่เริ่มใช้งาน เพียงคลิกไอคอนหุ่นยนต์ 🤖 บน Topbar ก็เริ่มสั่งงานได้เลย",
    tag: "AI Assistant",
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
  {
    q: "หยดน้ำค้างยามเช้า (Morning Dewdrops) และสวนบงกช Zen Sanctuary ทำงานอย่างไร?",
    a: "ทุกครั้งที่คุณทำงานเสร็จในบอร์ด Kanban และการ์ดย้ายไปคอลัมน์ DONE ระบบจะมอบ +1 หยดน้ำค้างยามเช้า (💧) ซึ่งสามารถนำไปใช้รดน้ำแปลงดินในสวนเซนจำลอง 3×3 แปลง เพื่อเพาะปลูกพืชพรรณโบราณและฝึกสมาธิลมหายใจได้",
    tag: "Zen Garden",
  },
];

export interface MatrixRowItem {
  dimension: string;
  primary: string;
  secondary: string;
  badge?: string;
}

export const KANBAN_VS_TABLE_MATRIX_EN: MatrixRowItem[] = [
  {
    dimension: "Primary Focus",
    primary: "Visual Stage Flow (WIP limits, column states)",
    secondary: "Data Density & Fast Multi-Row Scanning",
    badge: "WORKFLOW",
  },
  {
    dimension: "Interaction Model",
    primary: "Drag-and-drop cards between swimlanes",
    secondary: "Inline cell editing (press Enter/Tab)",
    badge: "INTERACTION",
  },
  {
    dimension: "Information Density",
    primary: "Rich card preview with cover art & sub-task bars",
    secondary: "Ultra-compact spreadsheet rows (up to 50 tasks per screen)",
    badge: "DENSITY",
  },
  {
    dimension: "Multi-Field Editing",
    primary: "Requires card detail modal dialog",
    secondary: "Instant inline edits across Status, Priority & Assignee",
    badge: "SPEED",
  },
  {
    dimension: "Story Points & Estimates",
    primary: "Column sum header badge (e.g. 18 pts)",
    secondary: "Total sum aggregation footer bar",
    badge: "METRICS",
  },
  {
    dimension: "Bulk Operations",
    primary: "Single card drag or batch column archive",
    secondary: "Multi-select checkboxes with bulk status & delete actions",
    badge: "BATCH",
  },
];

export const KANBAN_VS_TABLE_MATRIX_TH: MatrixRowItem[] = [
  {
    dimension: "จุดเด่นหลัก (Primary Focus)",
    primary: "ดูโฟลว์การไหลของงานตามสถานะและคอลัมน์",
    secondary: "กวาดดูข้อมูลความหนาแน่นสูงและเปรียบเทียบหลายงานพร้อมกัน",
    badge: "WORKFLOW",
  },
  {
    dimension: "รูปแบบการโต้ตอบ",
    primary: "ลากและวาง (Drag & Drop) ข้ามคอลัมน์ได้อย่างลื่นไหล",
    secondary: "แก้ไขข้อมูลในตารางทันที (Inline Editing กด Enter/Tab)",
    badge: "INTERACTION",
  },
  {
    dimension: "ความหนาแน่นข้อมูล",
    primary: "การ์ดสวยงาม เห็นภาพปก ลิสต์ย่อย และความสำคัญชัดเจน",
    secondary: "ตารางสเปรดชีตแสดงงานได้มากถึง 50 งานในหน้าจอเดียว",
    badge: "DENSITY",
  },
  {
    dimension: "การแก้ไขฟิลด์งาน",
    primary: "เปิดหน้าต่าง Modal เพื่อปรับเปลี่ยนรายละเอียดเต็ม",
    secondary: "คลิกแก้ไขสถานะ ความสำคัญ ผู้รับผิดชอบ ได้ทันทีจากเซลล์ตาราง",
    badge: "SPEED",
  },
  {
    dimension: "คะแนน Story Points",
    primary: "สรุปผลรวมบนหัวคอลัมน์ (เช่น 18 pts)",
    secondary: "คำนวณผลรวมอัตโนมัติในแถบสรุปข้อมูลท้ายตาราง",
    badge: "METRICS",
  },
  {
    dimension: "การจัดการหลายงานพร้อมกัน",
    primary: "ลากย้ายทีละการ์ด หรือจัดเก็บทั้งคอลัมน์",
    secondary: "ติ๊ก Checkbox เลือกหลายแถวเพื่อเปลี่ยนสถานะหรือลบพร้อมกัน",
    badge: "BATCH",
  },
];

export const RBAC_PERMISSIONS_MATRIX_EN: MatrixRowItem[] = [
  {
    dimension: "Delete / Rename Project",
    primary: "Workspace Owner Only",
    secondary: "Restricted (Owner only)",
    badge: "GOVERNANCE",
  },
  {
    dimension: "Manage Roles & Invitations",
    primary: "Owner & Admin",
    secondary: "Read-only team list",
    badge: "ACCESS",
  },
  {
    dimension: "Create / Archive Boards",
    primary: "Full Rights (Public & Private)",
    secondary: "Can create within assigned project",
    badge: "BOARDS",
  },
  {
    dimension: "Edit Cards & Story Points",
    primary: "Full Rights (Any card)",
    secondary: "Editable (Assigned or open cards)",
    badge: "CARDS",
  },
  {
    dimension: "Access Private Boards",
    primary: "Owner + Explicit Invitees",
    secondary: "Only if explicitly invited by Owner",
    badge: "PRIVACY",
  },
  {
    dimension: "Board Activity & History",
    primary: "Full Workspace Activity Inspection",
    secondary: "View activities on assigned boards",
    badge: "ACTIVITY",
  },
];

export const RBAC_PERMISSIONS_MATRIX_TH: MatrixRowItem[] = [
  {
    dimension: "ลบหรือเปลี่ยนชื่อโปรเจกต์",
    primary: "Workspace Owner เท่านั้น",
    secondary: "ไม่มีสิทธิ์ (จำกัดเฉพาะเจ้าของ Workspace)",
    badge: "GOVERNANCE",
  },
  {
    dimension: "จัดการบทบาทและส่งคำเชิญ",
    primary: "Owner และ Admin",
    secondary: "ดูรายชื่อทีมได้เท่านั้น ไม่สามารถเชิญหรือเปลี่ยนสิทธิ์",
    badge: "ACCESS",
  },
  {
    dimension: "สร้างหรือจัดเก็บบอร์ด",
    primary: "สิทธิ์เต็ม (ทั้ง Public และ Private)",
    secondary: "สร้างบอร์ดและจัดเก็บบอร์ดของตนเองได้",
    badge: "BOARDS",
  },
  {
    dimension: "แก้ไขการ์ดและ Story Points",
    primary: "สิทธิ์เต็มในทุกการ์ดบนโปรเจกต์",
    secondary: "แก้ไขการ์ดที่ตนรับผิดชอบ หรือการ์ดเปิดทั่วไป",
    badge: "CARDS",
  },
  {
    dimension: "เข้าถึงบอร์ด Private",
    primary: "Owner + สมาชิกที่ได้รับเชิญเฉพาะเจาะจง",
    secondary: "มองเห็นเฉพาะบอร์ด Private ที่ตนได้รับเชิญเท่านั้น",
    badge: "PRIVACY",
  },
  {
    dimension: "ประวัติกิจกรรมในบอร์ด (Activity)",
    primary: "ดูประวัติความเคลื่อนไหวทั้งหมดในโปรเจกต์",
    secondary: "ดูประวัติกิจกรรมในบอร์ดที่ตนเองเข้าร่วม",
    badge: "ACTIVITY",
  },
];

export interface PromptRecipeItem {
  titleEn: string;
  titleTh: string;
  tag: string;
  prompt: string;
  descEn: string;
  descTh: string;
}

export const AI_PROMPT_RECIPES: PromptRecipeItem[] = [
  {
    titleEn: "Decompose Epic into 3-10 Sub-tasks",
    titleTh: "แตกงานใหญ่เป็นงานย่อย 3-10 รายการ",
    tag: "CHECKLIST",
    prompt: "Break down the task 'Implement User Onboarding Funnel' into 5 actionable, sequential checklist steps with estimated story points.",
    descEn: "Generates an atomic checklist ready to be imported directly into card sub-tasks.",
    descTh: "สร้างรายการงานย่อยที่ปฏิบัติได้จริง พร้อมค่า Story Points นำเข้าสู่การ์ดได้ทันที",
  },
  {
    titleEn: "Identify Sprint Bottlenecks & Risk Audit",
    titleTh: "วิเคราะห์จุดติดขัดและความเสี่ยงใน Sprint",
    tag: "RISK_AUDIT",
    prompt: "Review the current Sprint board with 8 in-progress tasks. Identify potential delivery bottlenecks and suggest mitigation tactics for overdue items.",
    descEn: "Analyzes task distribution and flags overdue dependencies before sprint cutoff.",
    descTh: "ประเมินการกระจายตัวของงาน และแจ้งเตือนความเสี่ยงของงานที่อาจส่งมอบไม่ทัน",
  },
  {
    titleEn: "Generate User Acceptance Criteria (Gherkin)",
    titleTh: "สร้างเกณฑ์การตรวจรับงาน (Acceptance Criteria)",
    tag: "SPEC_GEN",
    prompt: "Write 3 acceptance criteria in Given-When-Then format for the feature: 'Offline Draft Auto-Recovery when network connection is restored'.",
    descEn: "Creates standard QA acceptance criteria to ensure definition of done is met.",
    descTh: "ร่างเงื่อนไขตรวจรับงานในรูปแบบ Given-When-Then สำหรับทีม QA และนักพัฒนา",
  },
  {
    titleEn: "Executive Sprint Progress Summary",
    titleTh: "สรุปผลงานภาพรวมสำหรับผู้บริหาร",
    tag: "EXECUTIVE",
    prompt: "Summarize the 14 completed tasks this sprint into a 3-bullet executive briefing highlighting business impact and shipped capabilities.",
    descEn: "Condenses detailed technical work into high-level business stakeholder updates.",
    descTh: "กลั่นกรองงานเทคนิคที่เสร็จสิ้น ให้กลายเป็นบทสรุปสำหรับผู้บริหาร 3 ข้อสั้นกระชับ",
  },
];


