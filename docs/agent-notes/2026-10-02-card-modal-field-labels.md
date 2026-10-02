# Card modal field labels

- Date and objective: 2026-10-02 — เพิ่มหัวข้อให้ช่องชื่อและรายละเอียดในการ์ด
- Files modified: `src/components/kanban/card-modal.tsx`, `docs/agent-notes/2026-10-02-card-modal-field-labels.md`.
- Behavior: แสดงป้าย `Card title` และ `Description` พร้อมเชื่อม label กับ input/textarea เพื่อให้ระบุช่องได้แม้กรอกข้อมูลแล้ว.
- Database/schema changes: ไม่มี.
- Verification: `npm run lint`, `npm run build`, `npx prisma validate` และ `git diff --check` ผ่าน.
- Follow-ups: ไม่มี.
