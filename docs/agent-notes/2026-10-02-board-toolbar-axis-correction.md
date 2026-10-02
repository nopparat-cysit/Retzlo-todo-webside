# Board toolbar axis correction

- Date and objective: 2026-10-02 — แก้การจัดแนว toolbar ตามคำชี้แจงว่าให้จัดกึ่งกลางแกน Y
- Files modified: `src/components/kanban/board.tsx`, `docs/agent-notes/2026-10-02-center-board-toolbar.md`, `docs/agent-notes/2026-10-02-board-toolbar-axis-correction.md`.
- Behavior: ใช้ `items-center` จัด controls ให้อยู่กึ่งกลางแนวตั้ง และคืน `justify-start` เพื่อไม่จัดกลุ่มกลางแนวนอน.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx prisma validate` และ `git diff --check` ผ่าน.
- Follow-ups: ไม่มี.
