# Retzlo System Guide & Knowledge Base

> **เอกสารคู่มือระบบและคลังความรู้แพลตฟอร์ม Retzlo**  
> *กฎเหล็กการดูแล:* ทุกครั้งที่มีการพัฒนาฟีเจอร์ใหม่ แก้ไขพฤติกรรมของระบบ ปรับปรุงคีย์ลัด หรือเปลี่ยนแปลงสถาปัตยกรรม ต้องเข้ามาอัปเดตข้อมูลในเอกสารนี้และหน้าแอป `/help` (`src/components/help/help-center-client.tsx`) เสมอ

---

## 1. ภาพรวมระบบและสถาปัตยกรรม (Architecture Overview)

Retzlo คือแพลตฟอร์มบริหารจัดการชีวิตและการทำงาน (Life & Work Management Platform) ในสไตล์ Retro Lofi Indigo ที่เน้นความเรียบง่าย สบายตา และมีประสิทธิภาพสูง

### Tech Stack
- **Framework:** Next.js (App Router, Server Components + Client Components)
- **Database & ORM:** PostgreSQL on Neon Serverless (`neon.tech`) + Prisma ORM
- **Authentication:** NextAuth.js Credentials Provider
- **Real-time Sync:** Pusher WebSocket Channels
- **Styling & Design System:** Tailwind CSS + Semantic Theme Tokens (`retro lofi indigo` palette)
- **AI Engine:** DeepSeek Chat API (`deepseek-v4-pro` default) พร้อมระบบ Fallback และ Custom User API Key

---

## 2. ฟีเจอร์หลักของระบบ (Core Features)

### 2.1 ผู้ช่วยอัจฉริยะ Retzlo AI (DeepSeek-V4 Pro)
- **ตำแหน่งการเรียกใช้:** ไอคอนหุ่นยนต์ (`🤖`) ที่แถบด้านบน (Topbar) ทางด้านซ้ายของรูปโปรไฟล์ผู้ใช้
- **รูปแบบการแสดงผลและโหมดตอบสนอง (Responsive & Docking):**
  - **เปิดครั้งแรกเริ่มที่ Sidebar:** เมื่อเปิดแชท AI ครั้งแรก ระบบจะเริ่มต้นในรูปแบบแถบข้าง **Sidebar (Side Panel)** ตรึงขอบขวาของจอ (กว้าง 380px–450px สไตล์ Gemini ใน Google Sheets)
  - **ย่อจอแสดงที่ล่างขวา (Responsive Float):** เมื่อผู้ใช้ย่อหน้าต่างบราวเซอร์ จอแคบลง หรือใช้งานบนมือถือ/แท็บเล็ต (`< 1024px`) รวมถึงเมื่อเลือกสลับเป็นโหมดกล่องลอย (Float Mode) ระบบจะแสดงผลเป็นกล่องแชทลอยที่ **มุมล่างขวา (Bottom-Right)** โดยอัตโนมัติ
  - **ระบบหลบอัตโนมัติของปุ่มดาว FAB (Star Displacement):** ปุ่มดาวล่างขวา (`FabHub`) จะขยับเลื่อนขึ้นไปลอยอยู่ **เหนือหน้าต่างแชท AI** โดยอัตโนมัติด้วย CSS Transition ที่ลื่นไหล ไม่ทับหรือบดบังช่องพิมพ์ข้อความ และหากอยู่ในโหมด Sidebar บนจอใหญ่ ปุ่มดาวจะขยับไปอยู่ทางซ้ายของแถบข้างอย่างเป็นระเบียบ
- **ความสามารถ:**
  - เข้าใจบริบทของโปรเจกต์ปัจจุบัน (Project Context Aware)
  - ตอบคำถามและให้คำแนะนำแบบหลายรอบ (Multi-turn conversation)
  - แนะนำและร่างการ์ดงานใหม่ลงในบอร์ดได้โดยตรงผ่านคำสั่งแชท (พร้อม Confirmation Modal)
  - รองรับการใส่ DeepSeek API Key ของผู้ใช้เอง และสลับโมเดล AI ในระบบ

### 2.2 ฟีเจอร์ AI Auto-Breakdown & Executive Summary
- **AI Task Breakdown:** ปุ่ม `✨ AI Breakdown` ภายใน Modal ของการ์ด สั่งให้ AI วิเคราะห์ชื่องานและคำอธิบาย แล้วแตกเป็น Checklist 3–10 ข้อย่อยได้ในคลิกเดียว
- **AI Executive Summary:** ปุ่ม `AI Summary` บน Toolbar ของหน้าบอร์ด สรุปภาพรวมสถานะบอร์ด ความคืบหน้า คอขวด และข้อเสนอแนะเชิงกลยุทธ์ พร้อมปุ่มคัดลอกหรือบันทึกลงใน Notes

### 2.3 บอร์ดการทำงาน (Kanban Board & Spreadsheet Table View)
- **Kanban Board:**
  - ลากวางการ์ดและสลับคอลัมน์ด้วย Optimistic UI
  - Real-time Sync สดไปยังเพื่อนร่วมทีมทุกคนในโปรเจกต์
  - ตั้งค่าคอลัมน์ (Column Settings) และจำกัดงานระหว่างทำ (WIP Limits)
  - ปุ่มจับลากสลับลำดับ (`⁝⁝`) อยู่ด้านหน้าของเมนูใน Sidebar
  - การ์ดแสดงป้าย Priority ตามระดับและสีที่บอร์ดกำหนด พร้อมโหมดมุมมองทั้ง Comfortable และ Compact
- **Custom Board Priorities (ความสำคัญแบบกำหนดเองได้สูงสุด 10 ระดับ):**
  - แต่ละบอร์ดสามารถกำหนดระดับความสำคัญได้เองสูงสุด 10 ระดับ (Custom Priorities) ผ่านแท็บ `Priorities` ใน Board Settings หรือกดปุ่ม `Priorities` ที่แถบ Header Toolbar
  - สามารถตั้งชื่อระดับความสำคัญเอง (เช่น P0 Urgency, Blocker, Critical, Normal ฯลฯ)
  - เลือกสีประจำระดับได้ถึง 12 โทนสี Retro Lofi (Rose, Orange, Amber, Yellow, Emerald, Teal, Sky, Blue, Indigo, Purple, Pink, Stone)
  - ปรับลำดับความเร่งด่วนขึ้น/ลงได้อย่างอิสระ โดยระดับ 1 คือความสำคัญเร่งด่วนที่สุด
  - ระบบ Card Modal, การ์ด Kanban, มุมมองตาราง และตัวกรองเรียงลำดับ (Sorting) จะปรับใช้ระดับสีและชื่อตามที่บอร์ดกำหนดโดยอัตโนมัติ
- **Spreadsheet Table View & Multi-Assignee Support:**
  - สลับมุมมองตารางได้ที่ปุ่ม `📊 Table` / `Spreadsheet` ที่หัวบอร์ด (มีทั้งมุมมองตารางแบบเรียบ และมุมมองจัดกลุ่มตามคอลัมน์)
  - **Multi-Assignee Support:** รองรับการมอบหมายงานให้ผู้รับผิดชอบได้หลายคน (Multi-Assignee) ผ่านดรอปดาวน์ที่เลือกติ๊กสมาชิกพร้อมกันได้หลายคน
  - แสดง Avatar Stack ซ้อนกันอย่างสวยงาม พร้อมจำนวนผู้รับผิดชอบ และปุ่ม "Clear all assignees" เมื่อต้องการยกเลิกทุกคน
  - แก้ไขชื่องานและสถานะได้แบบ Inline ทันที
  - แสดงและปรับระดับความสำคัญ (Priority Pill Dropdown) ตาม Custom Priorities ของบอร์ด
  - กำหนดวันเริ่มและวันส่ง (Start Date & Due Date) ด้วย Global Retro DatePicker ในตาราง
  - รองรับการเรียงลำดับ (Sorting) ตามระดับความสำคัญ Custom Priority Level (ระดับ 1 เร่งด่วนสุดอยู่บนสุด)

### 2.4 ระบบ Coffee Cheers & เหรียญสะสม (Gamification & Rewards)
- **Coffee Cheers (`☕`):** ปุ่มส่งกาแฟให้กำลังใจเมื่อการ์ดย้ายไปยังคอลัมน์ที่เสร็จสิ้น
- **Coins:** ได้รับเหรียญรางวัลจากการทำภารกิจและการมีส่วนร่วม
- **Rewards Store:** ร้านค้าแลกของรางวัลประจำโปรเจกต์

### 2.5 ปฏิทินและตัวเลือกเวลา (Global Date & Time Picker)
- **Global Retro DatePicker:** ปฏิทินเลือกวันที่สไตล์ Retro Lofi Indigo พร้อม Presets ทางลัด (วันนี้, พรุ่งนี้, สุดสัปดาห์นี้, สัปดาห์หน้า)
- **Intuitive TimePicker:** ตัวเลือกเวลาที่ออกแบบใหม่ให้ใช้งานง่าย ไม่สับสน
  - **Typeable Inputs:** ช่องตัวเลขชั่วโมงและนาทีด้านบนสามารถคลิกแล้วพิมพ์ตัวเลขได้โดยตรง พร้อมระบบกระโดดโฟกัสอัตโนมัติ (พิมพ์ 2 หลักข้ามไปนาทีทันที) และปุ่มลูกศร `▲` `▼` ปรับขึ้นลง
  - **Single-Column Linear Scroller:** รายการชั่วโมง (00–23) และนาที (00–55) เป็นแนวตั้งแถวเดียวตรงๆ ไม่งง ไม่ต้องกวาดสายตาแบบซิกแซก พร้อมระบบ Auto-scroll เลื่อนมายังเวลาปัจจุบันโดยอัตโนมัติ
  - **เวลายอดนิยม (Presets):** ปุ่มเลือกเวลาด่วนพร้อมไอคอน (🌅 09:00 เช้า, ☀️ 12:00 เที่ยง, ☕ 13:30 บ่าย, 💼 17:00 เลิกงาน, 🌙 20:00 ค่ำ)
  - **ปุ่มยืนยัน & ล้างเวลา:** มีปุ่ม "ตกลง" สำหรับบันทึกและปิดหน้าต่างทันที และปุ่ม "ตลอดวัน / ล้าง" เมื่อไม่ต้องการระบุเวลา
- **Due Date Indicator:** สีเตือนความเร่งด่วนของงานที่ใกล้ถึงกำหนดส่ง

### 2.6 สมุดโน้ต (Notes) และบันทึกประจำวัน (Diary Hub)
- **Notes Hub:** จดบันทึกแยกโฟลเดอร์ ปักหมุดโน้ตสำคัญ
- **Diary Hub:** เช็คลิสต์กิจวัตรประจำวันและรักษาสถิติความต่อเนื่อง (Streaks)
- **Draft Storage:** ระบบบันทึกร่างข้อมูลอัตโนมัติป้องกันข้อความหาย

### 2.7 คีย์ลัดระบบ (Keyboard Shortcuts)
- `Ctrl + K` / `Cmd + K`: เปิด Command Palette ค้นหาทุกสิ่งในระบบ
- `F`: สลับโหมด Focus Mode ซ่อนองค์ประกอบที่ไม่จำเป็นเพื่อจดจ่อกับบอร์ด
- `Esc`: ปิด Modal, เมนู หรือแชท AI
- `Enter`: บันทึกข้อมูลหรือส่งข้อความแชท

### 2.8 สมาชิกและสิทธิ์การเข้าถึง (Roles & Permissions)
- **Owner:** เจ้าของโปรเจกต์ มีสิทธิ์จัดการสมาชิก ลบโปรเจกต์ และตั้งค่าขั้นสูง
- **Member:** สมาชิกทั่วไปที่ได้รับเชิญ มีสิทธิ์ร่วมทำงาน สร้างการ์ด และเขียนโน้ต
- **Private Board:** บอร์ดส่วนตัวที่เข้าถึงได้เฉพาะผู้สร้าง

---

## 3. กฎเกณฑ์การบำรุงรักษาคลังความรู้ (Maintenance Protocol)

1. **เมื่อมีการเพิ่มหรือเปลี่ยนแปลงฟีเจอร์:**
   - เพิ่มรายละเอียดของฟีเจอร์ลงในหัวข้อที่เกี่ยวข้องในเอกสารนี้ (`docs/system-guide.md`)
   - เพิ่มหรือปรับปรุงการ์ดคำอธิบายในหน้า `/help` (`src/components/help/help-center-client.tsx`)
2. **รักษาความสอดคล้องด้านธีมและ UI:**
   - ทุกหน้าและคอมโพเนนต์ต้องเป็นไปตามแนวทาง Retro Lofi Indigo
   - อ้างอิง Semantic Theme Tokens และหลีกเลี่ยง Hardcoded Colors
3. **การทดสอบความถูกต้อง:**
   - รัน `npm run lint`, `npm run build` และ `npx prisma validate` ทุกครั้งก่อนปิดงาน
