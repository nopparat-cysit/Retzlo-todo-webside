# Board templates

- Date and objective: 2026-10-02 — เพิ่ม Template สำเร็จรูปเพื่อใช้ตอนสร้างบอร์ด
- Files created: `src/lib/kanban/board-templates.ts`, `src/components/kanban/board-template-picker.tsx`, `public/board-templates/standard.png`, `public/board-templates/scrum.png`, `public/board-templates/software.png`, `public/board-templates/marketing.png`, `public/board-templates/personal.png`.
- Files modified: `src/app/api/projects/[id]/boards/route.ts`, `src/components/kanban/board-tabs-bar.tsx`, `src/components/project/project-boards-manager.tsx`, `docs/theme-system.md`, `docs/agent-notes/2026-10-02-board-templates.md`.
- Behavior: เพิ่ม Standard, Scrum, Software development, Marketing และ Personal; ทั้ง modal สร้างบอร์ดและ Project Boards manager แสดง preview ของชื่อคอลัมน์, status, สี, icon ก่อนกด Create Board; สร้างภาพไอคอนวาดใหม่ให้แต่ละ Template; จำกัดความกว้าง modal และจัดตัวเลือกเป็นการ์ดภาพประกอบ; modal ใช้ semantic theme tokens; API รับ template ID จาก allowlist แล้วสร้างคอลัมน์แบบ atomic พร้อมบอร์ด; ไม่สร้างการ์ดตัวอย่าง; Template เดิมเป็นค่าเริ่มต้นสำหรับ client/API เก่า.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx tsc --noEmit`, `npx prisma validate` และ `git diff --check` ผ่าน; ตรวจ alpha channel ของภาพไอคอนทั้งห้าแล้วเป็นพื้นโปร่งใส.
- Follow-ups: visual QA ของ modal/preview ใน browser หลังปรับ ทั้ง Light, Dark, System และ mobile; ยืนยันการสร้างกับฐานข้อมูลที่พร้อมใช้งาน.
