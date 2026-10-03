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
- **รูปแบบการแสดงผล:**
  - **Floating Box:** หน้าต่างแชทลอยขนาดพอเหมาะที่มุมล่างซ้าย
  - **Side Panel:** แถบข้างแบบ Side Panel ขวามือ (สไตล์ Gemini ใน Google Sheets)
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
- **Spreadsheet Table View:**
  - สลับมุมมองตารางได้ที่ปุ่ม `📊 Spreadsheet` ที่หัวบอร์ด
  - แก้ไขชื่องานและสถานะได้แบบ Inline ทันที
  - กำหนดวันส่ง (Due Date / Due Time) ด้วยปฏิทินในตาราง
  - แสดงป้ายกำกับเหรียญส่วนตัว (Private Coins) และสีการ์ด

### 2.4 ระบบ Coffee Cheers & เหรียญสะสม (Gamification & Rewards)
- **Coffee Cheers (`☕`):** ปุ่มส่งกาแฟให้กำลังใจเมื่อการ์ดย้ายไปยังคอลัมน์ที่เสร็จสิ้น
- **Coins:** ได้รับเหรียญรางวัลจากการทำภารกิจและการมีส่วนร่วม
- **Rewards Store:** ร้านค้าแลกของรางวัลประจำโปรเจกต์

### 2.5 ปฏิทินและตัวเลือกเวลา (Global Date & Time Picker)
- **Global Retro DatePicker:** ปฏิทินเลือกวันที่และเวลาสไตล์ Retro Lofi Indigo
- **Presets:** ทางลัดเลือกวันที่ด่วน (วันนี้, พรุ่งนี้, สุดสัปดาห์นี้, สัปดาห์หน้า)
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
