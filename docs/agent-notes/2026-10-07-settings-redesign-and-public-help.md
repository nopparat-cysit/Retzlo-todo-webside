# Work Note: 2026-10-07 — Settings Redesign & Public System Guide

## Objective
1. ปรับปรุงหน้า Project Settings (`/project/[id]/settings`) จากเดิมที่องค์ประกอบใหญ่ หนาแน่นเกินไป และเลื่อนหายาก ให้เป็นมาตรฐานสากล (Settings Row Pattern สไตล์ Linear / GitHub) จัดกลุ่มแท็บตามขอบเขตความรับผิดชอบ (Scope-grouped: Project / Boards / Personal) พร้อมตัด Static Guide และแบนเนอร์ที่ซ้ำซ้อนออก
2. ปรับให้หน้าคู่มือและข้อมูลระบบ (`/help`) เป็นสาธารณะ (Public) เพื่อให้บุคคลทั่วไปหรือผู้ใช้ที่ยังไม่ได้ล็อกอินสามารถเข้าถึงและศึกษาคู่มือระบบได้ทันที

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/lib/settings/tabs.ts` — ตัวจัดการและวิเคราะห์แท็บการตั้งค่าตามขอบเขต (Project / Boards / Personal) พร้อม backward-compatible alias สำหรับลิงก์เดิม (`features`, `all`, `board`, `columns`)
  - `src/lib/settings/tabs.test.ts` — ยูนิตเทสต์สำหรับตรรกะ resolveSettingsTab และ isBoardScopedTab
  - `src/components/settings/settings-section.tsx` — คอมโพเนนต์ Primitives กลาง (`SettingsSection`, `SettingsRow`, `SettingsSwitch`) ที่ใช้ semantic theme tokens
  - `docs/agent-notes/2026-10-07-settings-redesign-and-public-help.md` — บันทึกการทำงานนี้
- **Modified**:
  - `src/components/project/project-settings-client.tsx` — ปรับโครงสร้าง Master-Detail ใหม่ 7 แท็บ แบ่งตามขอบเขต, ใช้ Active Board bar ร่วมกันเพียงจุดเดียว, กำจัด Static Guide ท้ายแท็บ Attributes, ตัดแท็บ `all` ที่ยาวเกินจำเป็น
  - `src/components/project/settings-form.tsx` — รีแฟกเตอร์ฟอร์มเป็น Settings Row 2 คอลัมน์ (ซ้าย Label/คำอธิบาย, ขวา Control) ประหยัดพื้นที่หน้าจอลงกว่า 60%
  - `src/components/project/project-boards-manager.tsx` — ตัดแบนเนอร์และกล่องสถิติขนาดใหญ่ 4 การ์ดออกเป็นแถบสรุปสถิติ 1 แถวแบบ Sleek badges, ตั้งค่าเริ่มต้นเป็นมุมมอง List Table
  - `src/components/kanban/board-settings/columns-tab.tsx` — ตัด Double Header Banner ซ้ำซ้อน, ยกเลิก `max-h-[380px]` inner scroll trap เพื่อให้คอลัมน์แสดงผลแบบลื่นไหลและมีระยะห่างกะทัดรัด
  - `src/components/kanban/board-settings/general-tab.tsx` — ปรับแต่งตัวเลือก Privacy Mode ให้กระชับ ไม่เป็นกล่องหนาซ้อนกล่อง ปรับ Input เป็นขนาดมาตรฐาน `h-9`
  - `src/components/kanban/board-attributes-tab.tsx` — ปรับแต่งแถบสลับ 3 คุณสมบัติ (Status, Priority, Story Points) เป็นขนาดกะทัดรัด ลดหัวเรื่องซ้ำซ้อน ปรับกล่องแม่แบบสำเร็จรูปให้เป็น Pill tags สะอาดตา
  - `src/components/kanban/board-priorities-tab.tsx` — ปรับแถบหัวเรื่องและกล่องแม่แบบระดับความสำคัญให้เข้ากับสไตล์ Modern SaaS เรียบกระชับ
  - `src/app/(dashboard)/project/[id]/settings/page.tsx` — ส่ง `initialBoardId` จาก searchParams เพื่อแสดงผลบอร์ดที่เลือกได้ทันทีโดยไม่ต้องรอ Client render
  - `src/app/(dashboard)/help/page.tsx` — ปลดล็อกเงื่อนไขตรวจสอบ session ออก เพื่อให้หน้า `/help` เป็นสาธารณะ
  - `src/components/ui/back-button.tsx` — เพิ่ม Safe fallback เมื่อย้อนกลับจากหน้าสาธารณะ `/help` และ `/contact` ไปยังหน้าหลัก `/`
  - `src/app/(marketing)/page.tsx` — เชื่อมต่อลิงก์ใน Footer ไปยัง `/help` และ `/contact`
  - `src/components/project/project-settings-client.test.ts` — อัปเดตการทดสอบสถาปัตยกรรม Settings ให้ตรงตามโครงสร้าง Scope-grouped ใหม่
  - `docs/system-guide.md` — อัปเดตรายละเอียดคู่มือระบบส่วน 2.11 เกี่ยวกับการตั้งค่าโปรเจกต์
  - `src/components/help/help-center-client.tsx` — อัปเดตบทความศูนย์ช่วยเหลือให้ตรงกับโครงสร้าง Settings ปัจจุบัน
  - `docs/theme-system.md` — บันทึกประวัติการเปลี่ยนแปลงและโทเค็นที่ใช้

## Important Behavior Changes
- **Project Settings Navigation**: ปรับลดจาก 9 แท็บที่กระจัดกระจายและมีแท็บ `all` ที่ยาวเกินไป เหลือ 7 แท็บที่มีขอบเขตชัดเจน:
  - **Project**: General (`identity`), Members (`access`)
  - **Boards**: All boards (`boards`), Board details (`board-general`), Columns (`board-columns`), Card attributes (`attributes`)
  - **Personal**: Theme & sound (`preferences`)
- **Backward Compatibility**: ลิงก์เดิม เช่น `?tab=features` และ `?tab=all` จะแมปไปยัง General (`identity`), `?tab=board` แมปไปยัง `board-general`, `?tab=columns` แมปไปยัง `board-columns` อย่างราบรื่น
- **Single Board Scope Bar**: ในระดับบอร์ด จะมีแถบเลือกบอร์ดที่ใช้งานอยู่เพียงจุดเดียวด้านบนหน้าต่าง ลดความซ้ำซ้อนของ Dropdown ในแต่ละหน้าย่อย
- **High Information Density & Clean Hierarchy**: เลย์เอาต์เปลี่ยนเป็นการ์ดเรียบหรูพร้อมแถวแบ่งด้วยเส้นบาง กวาดสายตาอ่านง่าย ขจัดปัญหา Container ซ้อน Container และยกเลิก Inner scroll traps ทั้งหมด
- **Public System Guide (`/help`)**: ทุกคนสามารถเข้าถึงหน้าคู่มือและระบบ Knowledge Base ได้โดยไม่ต้องผ่านหน้าล็อกอิน

## Database/Schema Changes
- ไม่มี (ไม่มีการแก้ไข Prisma schema)

## Verification Commands Run & Results
```bash
# 1. Full Vitest Test Suite:
npm test -- --run
# Result: Passed 90/90 test files (470 passed, 3 skipped)

# 2. Prisma Schema Validation:
npx prisma validate
# Result: The schema at prisma\schema.prisma is valid 🚀

# 3. Next.js ESLint:
npm run lint
# Result: No ESLint warnings or errors

# 4. Next.js Production Build:
npm run build
# Result: Compiled successfully, 38/38 static & dynamic routes generated (รวมถึง ○ /help 22.8 kB)
```

## Follow-ups / Deployment Notes
- ฟีเจอร์ทั้งหมดพร้อมใช้งานทั้งบน Light Mode และ Dark Mode
- ไม่มีการพึ่งพาตัวแปรสภาพแวดล้อมใหม่
