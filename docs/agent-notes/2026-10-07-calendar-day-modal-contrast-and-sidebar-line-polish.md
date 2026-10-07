# Work Note: Calendar Day Modal Contrast & Sidebar Tree Line Polish

**Date:** 2026-10-07  
**Objective:** แก้ไขปัญหาการมองไม่เห็นปุ่ม Checkbox ในหน้าต่างรายละเอียดวันของ Calendar, ปรับปรุงสีแถบสรุป Progress & Summary Bar ให้สว่างสบายตาใน Light mode, และเพิ่มความคมชัดของเส้นนำสายตาเมนูย่อยของ Sidebar (Sidebar Tree Guide Line) ให้มองเห็นเด่นชัดตามภาพที่ผู้ใช้แจ้ง

## Files Modified

- `src/components/kanban/project-calendar.tsx`:
  - ปรับ Checkbox ปุ่มเลือกสถานะใน Day Overview Modal และ Calendar Item Pills ให้มีขอบ `border-2 border-stone-400 bg-white` ใน Light Mode เพื่อให้มองเห็นและคลิกได้ชัดเจน ไม่กลืนกับพื้นหลังการ์ด และใช้สีเขียวมรกต `border-emerald-600 bg-emerald-600 text-white` เมื่อทำเสร็จ
  - ปรับ Progress & Summary Bar ให้ใช้ `bg-stone-100/80 border-b border-stone-200/80` พร้อมปรับสีตัวเลขนับจำนวน แถบ Progress Track และเปอร์เซ็นต์ ให้คมชัดสวยงามเข้ากับธีม
  - ปรับแถบตัวกรอง (Type, Status, Sort selects) และปุ่ม Reset ให้ใช้ `border-stone-200/90 bg-white text-stone-800` ใน Light Mode
  - ปรับพื้นหลังและการ์ดรายการงาน/ไดอารี/โน้ตใน Day Modal ให้มี Contrast ชัดเจน ทั้งชื่อเรื่อง หัวข้อย่อย รายละเอียด และ chevron icon
  - ปรับปรุงปุ่ม Go to Board และ Close ใน Modal Footer
- `src/components/kanban/board-sidebar-dropdown.tsx`:
  - ปรับความหนาและความเข้มของเส้น Tree Guide Line แสดงรายการบอร์ดภายใต้เมนู Boards เป็น `border-l-2 border-stone-400/90 pl-2.5 py-0.5 scrollbar-soft dark:border-stone-600`
- `src/components/project/project-shell.tsx`:
  - ปรับเส้นแบ่งขอบล่าง Sidebar ให้คมชัดใน Light mode (`border-t border-stone-200/80 dark:border-white/5`)
- `src/app/globals.css`:
  - ปรับเส้นขอบด้านขวาของ `.project-sidebar` ในโหมดสว่างให้คมชัดขึ้น (`border-right: 1.5px solid #d6cfc4 !important;`)
- `docs/theme-system.md`:
  - บันทึกการอัปเดตระบบธีมและ Contrast Matrix สำหรับ Calendar Day Modal และ Sidebar Tree Line

## Important Behavior Changes

1. **Checkbox Buttons High Contrast**: ผู้ใช้สามารถมองเห็นปุ่ม Checkbox บนการ์ดงานและเช็กลิสต์ได้อย่างชัดเจนทันที ทั้งในหน้าต่าง Day Overview Modal และบนมุมมองปฏิทินแบบรายวัน/สัปดาห์
2. **Progress & Summary Bar**: แถบสรุปรายการสิ่งที่ต้องทำในแต่ละวันไม่แสดงเป็นแถบสีเทาดำมืดมนบนธีมสว่างอีกต่อไป โดยปรับเป็นโทนสีอบอุ่นเข้ากับ Warm Paper Palette
3. **Sidebar Tree Guide Line**: เส้นลากบอกลำดับขั้นของบอร์ดย่อยใต้เมนู Boards ใน Sidebar มีความหนา 2px และสี stone-400/90 ช่วยนำสายตาให้เห็นความสัมพันธ์ของเมนูได้อย่างชัดเจน

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npm test` (Vitest): ผ่านครบทั้ง 90 test files (470 passed, 3 skipped).
- `npm run lint` (ESLint): ผ่าน 0 errors, 0 warnings.
- `npx prisma validate`: Prisma schema is valid 🚀.
- `npm run build` (Next.js production build): สำเร็จ 100% ครบทุก 38 routes.

## Known Follow-ups, Blockers, or Deployment Notes

- ไม่มี blockers การเปลี่ยนแปลงครอบคลุมทั้ง Light Mode และ Dark Mode สอดคล้องกับ Retro Lofi Design System
