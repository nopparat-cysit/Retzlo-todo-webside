# Center board toolbar

- Date and objective: 2026-10-02 — จัดแถวค้นหาและตัวกรองบนบอร์ดให้อยู่กึ่งกลางพื้นที่
- Files modified: `src/components/kanban/board.tsx`, `docs/agent-notes/2026-10-02-center-board-toolbar.md`.
- Behavior: จัดกลุ่มช่องค้นหา ตัวกรอง ปุ่มเรียงลำดับ Undo และเพิ่มคอลัมน์ให้อยู่ตรงกลาง พร้อมคงการขึ้นบรรทัดใหม่บนหน้าจอแคบ.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx prisma validate` และ `git diff --check` ผ่าน.
- Follow-ups: ไม่มี.
