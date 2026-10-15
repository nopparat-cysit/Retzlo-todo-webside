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
    q: "Does Retzlo AI require complex server configuration?",
    a: "Not at all. Retzlo AI is architected as an intelligent built-in server capability. It is provisioned automatically across all workspaces from day one. Simply click the 🤖 robot icon on the topbar to begin issuing instructions.",
    tag: "AI Engine",
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
];

export const FAQ_ITEMS_TH = [
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

