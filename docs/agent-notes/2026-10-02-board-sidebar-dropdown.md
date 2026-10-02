# Board sidebar dropdown

- Date and objective: 2026-10-02 — ย้ายตัวเลือกบอร์ดจากแถบเหนือกระดานไปไว้ใน dropdown ของเมนู Boards ใน project sidebar
- Files created: `docs/agent-notes/2026-10-02-board-sidebar-dropdown.md`.
- Files modified: `src/components/kanban/board-sidebar-dropdown.tsx`, `src/components/project/project-shell.tsx`, `src/components/project/project-sortable-nav.tsx`, `src/app/(dashboard)/project/[id]/board/page.tsx`, `src/components/kanban/board-rename.test.ts`, `src/components/kanban/board-switch-skeleton.test.ts`, `docs/theme-system.md`.
- Files moved: `src/components/kanban/board-tabs-bar.tsx` → `src/components/kanban/board-sidebar-dropdown.tsx`.
- Behavior: เลือกบอร์ดจากเมนู Boards; แสดงเฉพาะบอร์ดที่ผู้ใช้เข้าถึงได้; เจ้าของยังตั้งค่าบอร์ดและสร้างบอร์ดจาก dropdown ได้; การสลับบอร์ดยังคงบันทึกบอร์ดล่าสุดและส่ง event สำหรับ skeleton/loading.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx tsc --noEmit`, `npx prisma validate` และ `git diff --check` ผ่าน; ไม่ได้รัน test suite.
- Follow-ups: ตรวจภาพ dropdown ใน light/dark, sidebar ย่อ/ขยาย และ mobile; ตรวจสร้างบอร์ดจริงเมื่อฐานข้อมูลพร้อม.
