# Board toolbar alignment

- Date and objective: 2026-10-02 — จัดแนวแถวค้นหาและตัวกรองบนบอร์ดตามคำชี้แจงล่าสุด
- Files modified: `src/components/kanban/board.tsx`, `docs/agent-notes/2026-10-02-center-board-toolbar.md`.
- Behavior: จัด controls ให้อยู่กึ่งกลางแนวตั้งด้วย `items-center` และคงการเริ่มกลุ่มจากด้านซ้ายในแนวนอน พร้อมคงการขึ้นบรรทัดใหม่บนหน้าจอแคบ; รายละเอียดการแก้ตามแกนอยู่ใน `2026-10-02-board-toolbar-axis-correction.md`.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx prisma validate` และ `git diff --check` ผ่าน.
- Follow-ups: ไม่มี.
