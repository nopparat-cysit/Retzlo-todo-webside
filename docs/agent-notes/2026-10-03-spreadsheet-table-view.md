# 2026-10-03 — Interactive Spreadsheet Table View (ตารางงานตามภาพตัวอย่าง)

## Objective
Implement an interactive Spreadsheet Table View (Google Sheets / Airtable / Notion style) in our retro lofi indigo design language, matching the user's reference screenshot (`media_1791041641507.png`) with interactive cell dropdowns (P0/P1/P2 Priority, Status pills, Assignee dropdown, Date editing, Checklist/Files, Notes, and ConfirmModal on task deletion).

## Files Created / Modified
- `src/components/kanban/board-list-view.tsx` (modified): Upgraded to a full interactive Spreadsheet Table View.
  - Added spreadsheet tab pill header matching the screenshot (`[ 📊 ตารางงาน (Table) ]`).
  - Added exact column headers: `Tt งาน (Task Title)`, `รายการสำคัญ (Priority) ▾`, `👤 เจ้าของ (Assignee) ▾`, `◓ สถานะ (Status / Column) ▾`, `📅 วันที่เริ่มต้น ▾`, `📅 วันที่สิ้นสุด (Due Date) ▾`, `⚡ ความยาก/คะแนน ▾`, `📄 ส่งไฟล์/ย่อย ▾`, `📝 โน้ต ▾`, and `•••` action menu.
  - Interactive pill dropdowns for Priority: `P0` (High), `P1` (Medium), `P2` (Low) with distinct retro pill colors.
  - Interactive pill dropdowns for Status: `เสร็จสมบูรณ์` (Done/Green), `กำลังดำเนิน...` (In Progress/Amber), `ยังไม่เริ่ม` (Todo/Blue), `รอการตรวจ` (Waiting/Purple), allowing instant column/status switching.
  - Interactive member assignee selection dropdown.
  - Interactive date picking for start date and due date.
  - Inline title rename and Star ⭐ toggling.
  - Bottom quick-add row (`+ เพิ่มงานใหม่`) with column selection and enter-key submission.
  - Integrated `ConfirmModal` for deleting tasks with Toast notifications for all CUD operations.
- `src/components/kanban/board.tsx` (modified): Updated the view switcher button to use `Table2` icon and "Table" label.
- `src/components/kanban/board-views-and-sidebar.test.ts` (modified): Added comprehensive unit tests asserting all spreadsheet table contracts, columns, pills, and interactive handlers.

## Important Behavior Changes
- Switching to Table view renders a flat spreadsheet grid where every row corresponds to a task.
- Users can change Priority (P0, P1, P2), Status/Column, Assignee, and Dates directly in their table cells without having to open the modal first.
- Clicking any row or the edit action opens the full task modal.
- Includes quick-add row at the bottom of the table to insert tasks rapidly like a spreadsheet.
- Supports filtering by text and status, and sorting by any column.

## Verification Run & Results
- `npx tsc --noEmit`: 0 errors.
- `npm run lint`: 0 errors / warnings.
- `npx prisma validate`: Schema valid.
- `npx vitest run`: 76 test files passed, 378 tests passed (100% pass).
- `npm run build`: Production build verified.
