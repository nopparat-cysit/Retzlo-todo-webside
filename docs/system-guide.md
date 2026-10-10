# Retzlo System Guide & Knowledge Base

> **Official Master System Documentation and Architecture Knowledge Base**  
> *Maintenance Rule:* Whenever new features are built, system behaviors updated, keyboard shortcuts added, or architectural changes made, this document and the in-app guide `/help` (`src/components/help/help-center-client.tsx`) MUST be updated immediately.

---

## 1. System Architecture Overview

Retzlo is a Modular Life and Work Management Platform designed with a warm, clean Retro Lofi Indigo aesthetic. Built for both professional project collaboration and everyday routine habit tracking.

### Tech Stack
- **Framework:** Next.js (App Router, Server Components + Client Components)
- **Database & ORM:** PostgreSQL on Neon Serverless (`neon.tech`) + Prisma ORM
- **Authentication:** NextAuth.js Credentials Provider
- **Real-time Sync:** Pusher WebSocket Channels
- **Styling & Design System:** Tailwind CSS + Semantic Theme Tokens (`retro lofi indigo` palette)
- **AI Engine:** DeepSeek Chat API (`deepseek-v4-pro` default) with built-in server-side intelligence (Zero-Config Native Server Intelligence), ready out of the box with zero configuration required.

---

## 2. Core Features (English Master Guide)

### 2.1 Built-in Retzlo AI Assistant
- **Access Point:** Robot icon (`🤖`) on the top header, positioned to the left of the user profile avatar.
- **Responsive Layout & Docking:**
  - **Sidebar Mode (Desktop):** When opened on widescreen displays, it docks as a side panel on the right (380px–450px width), allowing uninterrupted side-by-side work with the board.
  - **Responsive Floating Mode:** On smaller screens, mobile devices, or when toggled to Float mode, it shifts into a floating panel at the bottom-right corner.
  - **Star FAB Automatic Displacement:** The floating action star button (`FabHub`) smoothly animates upward to hover above the AI chat panel via CSS transitions, preventing any overlapping or obstruction.
- **Capabilities:**
  - Full awareness of the active project and board context (Project Context Aware).
  - Multi-turn conversational planning and intelligent assistance.
  - Direct card suggestion and drafting to the board with ConfirmModal protection.
  - Zero-config native server management for all workspaces.

### 2.2 AI Task Breakdown & Executive Summary
- **AI Task Breakdown:** `✨ AI Breakdown` button in the card modal automatically analyzes the task title and description to produce a 3–10 item actionable checklist in one click.
- **AI Executive Summary:** `AI Summary` button on the board toolbar delivers a strategic overview of board progress, bottlenecks, and recommendations with quick copy and save-to-notes options.

### 2.3 Kanban Board & Spreadsheet Table View
- **Kanban Board:**
  - Optimistic UI drag-and-drop for cards and columns.
  - Real-time synchronization across all project members.
  - Column settings and WIP (Work-In-Progress) limits.
  - Reorder handle (`⁝⁝`) for clean column organization.
  - **Card Density Switcher (Normal / Compact 2x):** Toggle density next to the view switcher (Normal: full spacing and comfort / Compact: double density, tighter borders, ideal for large backlogs).
  - Cards display custom priority badges matching board configuration.
- **Custom Statuses, Priorities & Story Points (Card Attributes & Workflow Templates):**
  - **Card Statuses:** Ready-to-use workflow presets (Software Dev, Bug Triage, Content Pipeline, Growth Marketing, etc.) or create custom statuses with 8 color swatches; save as custom workflow templates.
  - **Custom Board Priorities:** Up to 10 customizable priority levels with global templates (Classic 3-Level, P0–P4 Severity Scale, MoSCoW Prioritization, Eisenhower Matrix, Customer Support & SLA, Business Value Matrix) with 12 retro lofi colors.
  - **Story Points Scales:** Weight scales (Retzlo Standard, Fibonacci Sequence, Linear/Hours, T-Shirt Sizes, Pomodoro Focus Blocks, Complexity & Risk Scale) or custom values 1–100.
  - **Instant Inline Live Preview & Switch:** Click any template chip to preview workflow/points/priorities below in real-time ("changes immediately below") without nested popups. Includes Action Banner with 'Replace All' or 'Append New' modes.
  - **Safety & Global Sync:** Every template application, edit, or reset is guarded by ConfirmModal, displays toast notifications, and dispatches reactive events across all views (Kanban Board, Column Settings, Card Modal, and Spreadsheet Table View).
- **Spreadsheet Table View & Multi-Assignee Support:**
  - Switch via `📊 Table` / `Spreadsheet` button on board toolbar (flat list and column-grouped views).
  - **Row Order & Hover Checkbox (#):** First column displays row number (`1`, `2`, `3`...). Hovering over the number turns it into a checkbox to mark completion instantly, retaining a green checkmark (`[✓]`) for completed items.
  - **Multi-Assignee & Real Avatars:** Assign tasks to multiple teammates with real avatar displays in cells and pickers.
  - Inline title and status editing directly within table rows.
  - Priority dropdown pill reflecting custom board priorities.
  - Global Retro DatePicker for Start and Due dates with standardized `DD/MM/YYYY` format.
  - Sorting support by Custom Priority Level (Level 1 urgent at the top).

### 2.4 Gamification & Rewards
- **Coffee Cheers (`☕`):** Cheer teammates by sending coffees when cards are moved to completed columns.
- **Coins:** Earn coins for completing tasks, routines, and engaging with the workspace.
- **Rewards Store:** Project-level rewards catalog where earned coins can be redeemed.

### 2.5 Project Calendar & Day View Modal
- **Project Calendar View (`/project/[id]/calendar`):**
  - Month and week views aggregating Kanban cards, notes, and diary checklist items.
  - **Day View Modal:** Clicking any date opens a retro lofi indigo Day Overview:
    - **Header & Full Date:** `CalendarDays` icon in neon lavender container with full date name and `Today` badge.
    - **KPI Summary & Progress Bar:** Summary of total items, completed items, and gradient progress indicator (`0% - 100%`).
    - **Filter & Sort Toolbar:** Filter by type (Tasks / Notes / Diaries), status (Pending / Done), and sort by time, title, or priority.
    - **Polished Item Cards:** Left accent bar by item color, interactive completion checkbox with strike-through animation, type badges, and direct links to board/diary.
- **Global Retro DatePicker:** Retro lofi calendar picker with quick presets (Today, Tomorrow, Next Week, Clear).
- **Intuitive TimePicker:**
  - Direct typeable numeric inputs for hours and minutes with auto-advance and arrow steppers.
  - Single-column linear scrollers for hours (00–23) and minutes (00–55) with auto-scroll.
  - Quick time presets (🌅 09:00, ☀️ 12:00, ☕ 13:30, 💼 17:00, 🌙 20:00).
  - Confirmation button (`Confirm` / `ตกลง`) and Clear button (`All Day / Clear` / `ตลอดวัน / ล้าง`).
- **Due Date Indicators:** Visual warning colors for impending or overdue tasks.

### 2.6 Professional Dedicated Board Export (Excel, CSV, PDF, PNG)
- **Export Toolbar Button:** Accessible from board toolbar and table view toolbar with quick presets and full export modal.
- **Dedicated Export Document Layout (`BoardExportDocument`):**
  - Uses a dedicated full document renderer showing all columns and cards without scrollbars or UI controls.
  - **Off-screen Staging Wrapper & Direct Ref:** Uses an off-screen staging container at `(0, 0)` coordinates to prevent blank canvas or white screen issues caused by negative coordinate foreignObjects.
  - **Font Fallback Engine:** Automatic network and font fallback (`skipFonts: true`) ensures 100% reliable PDF and PNG generation.
  - **Executive Document Header:** Official header with board name, project, export timestamp, and executive KPI cards (total tasks, story points, status distribution, overdue count, % completion).
- **Layout Views:**
  1. Full Panoramic Kanban: Side-by-side columns preserving card layout.
  2. Executive Summary Table: Structured table report organized by column, formatted for presentation decks and A4.
- **Theme Styles:**
  1. Clean Light Paper: High contrast, clean paper style ideal for printing and PDF.
  2. Dark Slate: Elegant dark theme matching retro lofi indigo.
- **4 Formats:**
  1. **PDF (.pdf):** Auto landscape A4 with multi-page pagination for tall boards.
  2. **PNG (.png):** 2x Retina high-resolution render.
  3. **Excel (.xlsx):** Auto-sized columns with assignees, dates, and priorities.
  4. **CSV (.csv):** RFC 4180 standard with UTF-8 BOM (`\uFEFF`) preventing encoding distortion in any software.

### 2.7 Notes Hub & Diary Hub
- **Notes Hub:** Organized notebook with folders, pinned notes, and tag filters.
- **Diary Hub:** Daily routine checklist, habit tracking, and streak counters.
- **Draft Recovery:** Automatic draft preservation preventing accidental content loss.

### 2.8 Keyboard Shortcuts
- `Ctrl + K` / `Cmd + K`: Open Command Palette to search anywhere in the app.
- `F`: Toggle Focus Mode to hide sidebars and distractions.
- `Esc`: Close modals, dropdown menus, or AI assistant.
- `Enter`: Submit forms or send messages.

### 2.9 Project Members & Access Control
- **Members Management (`/project/[id]/members`):**
  - **Team Members:** List of members, online presence indicator, role badges, and earned Coffee Cheers.
  - **Pending Invitations:** Outbound invites, expiration timers, and copy invitation link.
  - **Roles & Permissions:** Detailed permission comparison matrix between Owner and Member.
  - **Role Switching:** Project owners can promote or adjust roles with ConfirmModal verification.
  - **Invite Modal:** Dedicated modal to generate invites by email with role assignment.
- **Owner:** Full project governance, member management, danger zone controls.
- **Member:** Collaborative access to create cards, notes, and participate in projects.

### 2.10 Unified Card Attributes & Global Sync
- **Unified in Board Settings:** Attributes tab manages Statuses, Priorities, and Story Points in one central hub.
- **End-to-End Interconnection:** Adding a custom status immediately populates column default pickers, card modals, and table filters without page reloads.

### 2.11 Scope-Grouped Project Settings (`/project/[id]/settings`)
- Left sidebar grouped into 3 scopes: Project (General, Members), Boards (All boards, Details, Columns, Card attributes), and Personal (Theme & sound).
- Master-detail layout with `SettingsSection` / `SettingsRow` standard primitives.

### 2.12 Documentation & Help Hub (`/help`)
- Interactive SaaS docs hub with Welcome Hero, 6-Pillar Bento Navigator, 10 categories in left tree, modular reader with live feature sandboxes, and full bilingual support (English & Thai).
- Integrated Language Switcher (`EN` / `TH`) allowing one-click instant toggling.

### 2.13 Help Dropdown, System Info & Contact Form (`/contact`)
- Topbar `(?)` button with direct links to `/help`, System Info modal, `/contact` form with 7 quick templates, ticket tracking code, and instant AI Assistant launch.

---

## 3. Bilingual Reference & Thai Documentation (คู่มือระบบภาษาไทย)

### 3.1 ภาพรวมระบบและสถาปัตยกรรม (Architecture Overview)

Retzlo คือแพลตฟอร์มบริหารจัดการชีวิตและการทำงาน (Life & Work Management Platform) ในสไตล์ Retro Lofi Indigo ที่เน้นความเรียบง่าย สบายตา และมีประสิทธิภาพสูง

### Tech Stack
- **Framework:** Next.js (App Router, Server Components + Client Components)
- **Database & ORM:** PostgreSQL on Neon Serverless (`neon.tech`) + Prisma ORM
- **Authentication:** NextAuth.js Credentials Provider
- **Real-time Sync:** Pusher WebSocket Channels
- **Styling & Design System:** Tailwind CSS + Semantic Theme Tokens (`retro lofi indigo` palette)
- **AI Engine:** DeepSeek Chat API (`deepseek-v4-pro` default) พร้อมโมเดลผู้ช่วยอัจฉริยะในตัว (Server-side Integrated Intelligence) พร้อมใช้งานทันทีแบบอัตโนมัติ 100%

---

### 3.2 ฟีเจอร์หลักของระบบ (Core Features)

#### ผู้ช่วยอัจฉริยะ Retzlo AI
- **ตำแหน่งการเรียกใช้:** ไอคอนหุ่นยนต์ (`🤖`) ที่แถบด้านบน (Topbar) ทางด้านซ้ายของรูปโปรไฟล์ผู้ใช้
- **รูปแบบการแสดงผลและโหมดตอบสนอง (Responsive & Docking):**
  - **เปิดครั้งแรกเริ่มที่ Sidebar:** เมื่อเปิดแชท AI ครั้งแรก ระบบจะเริ่มต้นในรูปแบบแถบข้าง **Sidebar (Side Panel)** ตรึงขอบขวาของจอ (กว้าง 380px–450px)
  - **ย่อจอแสดงที่ล่างขวา (Responsive Float):** เมื่อผู้ใช้ย่อหน้าต่างบราวเซอร์ จอแคบลง หรือใช้งานบนมือถือ/แท็บเล็ต (`< 1024px`) รวมถึงเมื่อเลือกสลับเป็นโหมดกล่องลอย (Float Mode) ระบบจะแสดงผลเป็นกล่องแชทลอยที่ **มุมล่างขวา (Bottom-Right)** โดยอัตโนมัติ
  - **ระบบหลบอัตโนมัติของปุ่มดาว FAB (Star Displacement):** ปุ่มดาวล่างขวา (`FabHub`) จะขยับเลื่อนขึ้นไปลอยอยู่ **เหนือหน้าต่างแชท AI** โดยอัตโนมัติด้วย CSS Transition ที่ลื่นไหล ไม่ทับหรือบดบังช่องพิมพ์ข้อความ
- **ความสามารถ:**
  - เข้าใจบริบทของโปรเจกต์ปัจจุบัน (Project Context Aware)
  - ตอบคำถามและให้คำแนะนำแบบหลายรอบ (Multi-turn conversation)
  - แนะนำและร่างการ์ดงานใหม่ลงในบอร์ดได้โดยตรงผ่านคำสั่งแชท (พร้อม Confirmation Modal)
  - ระบบประมวลผลอัจฉริยะในตัว (Built-in Server Management) พร้อมทำงานทันทีแบบ Zero-Config ในทุก Workspace

#### ฟีเจอร์ AI Auto-Breakdown & Executive Summary
- **AI Task Breakdown:** ปุ่ม `✨ AI Breakdown` ภายใน Modal ของการ์ด สั่งให้ AI วิเคราะห์ชื่องานและคำอธิบาย แล้วแตกเป็น Checklist 3–10 ข้อย่อยได้ในคลิกเดียว
- **AI Executive Summary:** ปุ่ม `AI Summary` บน Toolbar ของหน้าบอร์ด สรุปภาพรวมสถานะบอร์ด ความคืบหน้า คอขวด และข้อเสนอแนะเชิงกลยุทธ์ พร้อมปุ่มคัดลอกหรือบันทึกลงใน Notes

#### บอร์ดการทำงาน (Kanban Board & Spreadsheet Table View)
- **Kanban Board:**
  - ลากวางการ์ดและสลับคอลัมน์ด้วย Optimistic UI
  - Real-time Sync สดไปยังเพื่อนร่วมทีมทุกคนในโปรเจกต์
  - ตั้งค่าคอลัมน์ (Column Settings) และจำกัดงานระหว่างทำ (WIP Limits)
  - ปุ่มจับลากสลับลำดับ (`⁝⁝`) อยู่ด้านหน้าของเมนูใน Sidebar
  - **Card Density Switcher (Normal / Compact 2x):** สลับความหนาแน่นของการ์ดได้ข้างปุ่มสลับมุมมองบอร์ด (Normal: แสดงรายละเอียดครบ สบายตา / Compact: แสดงการ์ดหนาแน่นขึ้น 2 เท่า ลดขนาดขอบและซ่อนรายละเอียดรอง เหมาะกับงานจำนวนมาก)
  - การ์ดแสดงป้าย Priority ตามระดับและสีที่บอร์ดกำหนด
- **Custom Statuses, Priorities & Story Points:**
  - **Card Statuses (สถานะการ์ด):** เลือกแม่แบบขั้นตอนงานสำเร็จรูป หรือเพิ่ม/แก้ไขสถานะเองได้อิสระพร้อมเลือก 8 โทนสี สามารถบันทึกโฟลว์ที่ปรับแต่งเป็นแม่แบบส่วนตัว (Custom Status Template)
  - **Custom Board Priorities (ระดับความสำคัญ):** ปรับแต่งได้สูงสุด 10 ระดับ พร้อมแม่แบบสากลสำเร็จรูป (Classic 3-Level, P0–P4 Severity Scale, MoSCoW Prioritization, Eisenhower Matrix, Customer Support & SLA, Business Value Matrix) เลือกสีได้ 12 โทนสี Retro Lofi และบันทึกเป็นแม่แบบส่วนตัว
  - **Story Points Scale (สเกลคะแนนความยาก):** เลือกใช้สเกลประเมินน้ำหนักงานสำเร็จรูป (Retzlo Standard, Fibonacci Sequence, Linear/ชม., T-Shirt Sizes, Pomodoro Focus Blocks, Complexity & Risk Scale) หรือเพิ่มคะแนนอิสระ 1–100 และบันทึกสเกลเป็นแม่แบบส่วนตัว
  - **Instant Inline Live Preview & Switch (ดูตัวอย่างสดแบบอินไลน์):** คลิกเลือกชิปแม่แบบเพื่อดูตัวอย่างขั้นตอน/สเกลคะแนน/ระดับความสำคัญด้านล่างได้ทันทีแบบเรียลไทม์ ("ด้านล่างเปลี่ยนให้ดูเลย") โดยไม่ต้องเปิด-ปิดป๊อปอัป มีแถบ Action Banner ให้สลับโหมด 'แทนที่ทั้งหมด (Replace)' หรือ 'เพิ่มต่อท้าย (Append)' พร้อมปุ่มนำมาใช้และปุ่มคืนค่าเดิม
  - **ความปลอดภัยและการซิงค์สด:** ทุกการนำแม่แบบมาใช้ แก้ไข ลบ หรือรีเซ็ต ได้รับการปกป้องด้วย ConfirmModal และแสดง Toast แจ้งเตือน พร้อมส่ง Custom Event ซิงค์สดไปยังทุกมุมมองทันที
- **Spreadsheet Table View & Multi-Assignee Support:**
  - สลับมุมมองตารางได้ที่ปุ่ม `📊 Table` / `Spreadsheet` ที่หัวบอร์ด (มีทั้งมุมมองตารางแบบเรียบ และมุมมองจัดกลุ่มตามคอลัมน์)
  - **ลำดับแถว & Hover Checkbox (#):** คอลัมน์แรกแสดงเลขแถว (`1`, `2`, `3`...) ตรงกลางอย่างเป็นระเบียบ เมื่อนำเมาส์ชี้แถว (Hover) จะสลับเป็น Checkbox ให้กดติ๊กเสร็จงานทันที และแสดงเครื่องหมายถูกสีเขียว (`[✓]`) คงไว้เมื่อการ์ดเสร็จสิ้น
  - **Multi-Assignee & Real Avatars:** รองรับการมอบหมายงานให้ผู้รับผิดชอบได้หลายคน พร้อมแสดงรูปโปรไฟล์จริงของสมาชิกในช่องตารางและดรอปดาวน์
  - แก้ไขชื่องานและสถานะได้แบบ Inline ทันที
  - แสดงและปรับระดับความสำคัญ (Priority Pill Dropdown) ตาม Custom Priorities ของบอร์ด
  - กำหนดวันเริ่มและวันส่ง (Start Date & Due Date) ด้วย Global Retro DatePicker ในตาราง แสดง Placeholder รูปแบบ `DD/MM/YYYY` สม่ำเสมอ
  - รองรับการเรียงลำดับ (Sorting) ตามระดับความสำคัญ Custom Priority Level (ระดับ 1 เร่งด่วนสุดอยู่บนสุด)

#### ระบบ Coffee Cheers & เหรียญสะสม (Gamification & Rewards)
- **Coffee Cheers (`☕`):** ปุ่มส่งกาแฟให้กำลังใจเมื่อการ์ดย้ายไปยังคอลัมน์ที่เสร็จสิ้น
- **Coins:** ได้รับเหรียญรางวัลจากการทำภารกิจและการมีส่วนร่วม
- **Rewards Store:** ร้านค้าแลกของรางวัลประจำโปรเจกต์

#### ปฏิทินงานและตัวเลือกเวลา (Project Calendar & Day View Modal)
- **Project Calendar View (`/project/[id]/calendar`):**
  - แสดงภาพรวมงานตามกำหนดส่งในมุมมองเดือน (Month) และสัปดาห์ (Week) ครอบคลุมทั้ง Kanban Cards, Notes และ Diary Checklist
  - **Day View Modal:** เมื่อคลิกที่ช่องวันที่ใดๆ ในปฏิทิน จะเปิดหน้าต่าง Day Overview ขนาดใหญ่สไตล์ Retro Lofi Indigo พร้อม KPI Summary, Progress Bar, ตัวกรอง Filter & Sort, และ Polished Item Cards
- **Global Retro DatePicker:** ปฏิทินเลือกวันที่สไตล์ Retro Lofi Indigo พร้อม Presets ทางลัด (วันนี้/Today, พรุ่งนี้/Tomorrow, สุดสัปดาห์นี้, สัปดาห์หน้า/Next Week, ล้าง/Clear)
- **Intuitive TimePicker:**
  - ตัวเลือกเวลาที่ออกแบบใหม่ให้ใช้งานง่าย มีช่องตัวเลขชั่วโมงและนาทีพิมพ์ได้โดยตรง พร้อมระบบข้ามโฟกัสอัตโนมัติ
  - รายการชั่วโมง (00–23) และนาที (00–55) เป็นแนวตั้งแถวเดียวตรงๆ ไม่งง พร้อมระบบ Auto-scroll
  - เวลายอดนิยม: 🌅 09:00, ☀️ 12:00, ☕ 13:30, 💼 17:00, 🌙 20:00
  - ปุ่มยืนยัน (ตกลง / Confirm) และปุ่มตลอดวัน/ล้าง (All Day / Clear)

#### ระบบส่งออกข้อมูลบอร์ดระดับมืออาชีพ (Dedicated Board Export)
- **Dedicated Export Document Layout (`BoardExportDocument`):**
  - ไม่ใช้การแคปหน้าจอจาก viewport เดิม แต่ใช้ตัวเรนเดอร์เอกสารเฉพาะที่แสดงผลครบทุกคอลัมน์และทุกการ์ด 100%
  - **Off-screen Staging Wrapper & Direct Ref:** แยกคอนเทนเนอร์แสดงตัวอย่างสำหรับการจับภาพไว้ที่พิกัด `(0, 0)` แบบอิสระ ป้องกันปัญหาภาพว่างเปล่า
  - **Font Fallback Engine:** ตรวจจับและ Fallback อัตโนมัติ (`skipFonts: true`) เมื่อมีข้อจำกัดเครือข่าย
  - **Executive Document Header:** หัวเอกสารทางการระบุสถิติผู้บริหาร (KPI Cards) ครบถ้วน
- **รูปแบบการจัดวาง (Layout Views):**
  1. ภาพบอร์ดเต็มแผ่น (Full Panoramic Kanban)
  2. ตารางรายงานผู้บริหาร (Executive Summary Table)
- **โทนสีเอกสาร:** Clean Light Paper (กระดาษขาว) และ Dark Slate (ดาร์กโหมดพรีเมียม)
- **4 รูปแบบไฟล์:** PDF (.pdf พร้อมแบ่งหน้าอัตโนมัติ), PNG (.png 2x Retina), Excel (.xlsx จัดความกว้างคอลัมน์อัตโนมัติ), CSV (.csv RFC 4180 UTF-8 BOM)

---

## 4. กฎเกณฑ์การบำรุงรักษาคลังความรู้ (Maintenance Protocol)

1. **เมื่อมีการเพิ่มหรือเปลี่ยนแปลงฟีเจอร์:**
   - เพิ่มรายละเอียดของฟีเจอร์ลงในหัวข้อที่เกี่ยวข้องในเอกสารนี้ (`docs/system-guide.md`) ทั้งภาษาอังกฤษและภาษาไทย
   - เพิ่มหรือปรับปรุงการ์ดคำอธิบายในหน้า `/help` (`src/components/help/help-center-client.tsx`)
2. **รักษาความสอดคล้องด้านธีมและ UI:**
   - ทุกหน้าและคอมโพเนนต์ต้องเป็นไปตามแนวทาง Retro Lofi Indigo
   - อ้างอิง Semantic Theme Tokens และหลีกเลี่ยง Hardcoded Colors
3. **การทดสอบความถูกต้อง:**
   - รัน `npm run lint`, `npm run build` และ `npx prisma validate` ทุกครั้งก่อนปิดงาน

### 2026-10-10 — Interactive mixtape login
- `/login` uses a dedicated split scene: cassette illustration, subtle pointer parallax, compact sample Kanban board, and visual Play/Pause control. There is no audio playback.
- Desktop: click the demo card (or focus it and press Enter/Space) to preview To do → In progress → Done → To do. This changes local presentation state only, never project data or stored account data.
- Mobile: compact illustrated header; the sample board is hidden to prioritize the form. Play/Pause remains available.
- Sign in with username/email and password; Remember me stores the account identifier only. Use Show/Hide password, Forgot password, or Create an account as needed. Existing authentication and callback behavior are retained.
- Motion is opt-in for the player; pointer parallax and card transitions respect `prefers-reduced-motion`.

### 2026-10-10 — Login composition refinement
The login hero now gives the cassette illustration more room. A small floating task card with a three-stage indicator replaces the miniature multi-column board. Clicking cycles the same local-only demo states. Form labels, inputs, supporting text and controls are larger, with a narrower centered form column. Mobile switches to the compact layout at 760px.

### 2026-10-10 — Playful login artwork
`/login` now uses a flat illustrated purple/pink cassette with pixel clouds and a soft gradient instead of the detailed city/rooftop scene. The floating demo card, form and visual player interactions remain the same.

### 2026-10-10 — Shared authentication design
- `/login`, `/register`, and `/forgot-password` share `MixtapeAuthScene`: playful cassette artwork, local demo card, visual player, responsive form panel and mode-specific headings/navigation.
- `MixtapeField` gives registration and recovery matching labels/icons, focus styling and accessible show/hide password controls. Register retains name, username, email, password and confirmation; remembered login and callback navigation are unchanged.
- Registration and recovery display success/error toast notifications alongside inline errors. Recovery retains the same email payload and continues to the existing `/reset-password?email=...` OTP step.
- `/reset-password` and invitation routes retain their existing layouts in this change.

### 2026-10-10 — Subtle player effects
On the shared login/register/forgot-password scene, Play adds a slow ambient glow, two quiet drifting music notes on desktop, and a soft halo around the player button. Pause stops the effects. On mobile the notes are hidden. Reduced-motion mode uses a static, faint glow only. The player remains visual-only and does not play audio.

### 2026-10-10 — Auth logo
The three shared auth pages use a lowercase Retzlo wordmark with a small purple/pink vector cassette mark. The logo links to home and has a visible keyboard focus outline.

### 2026-10-10 — Idle logo motion
The cassette logo gently floats and its reels turn automatically on all three shared auth pages, independently of Play/Pause. The wordmark stays still. Hovering or focusing the home logo pauses its motion; reduced-motion preference disables it entirely.

### 2026-10-10 — Stable auth route layout
Login, registration and password recovery share a viewport-responsive desktop frame height, so switching forms keeps the artwork and outer frame in place. Long desktop forms scroll within the form panel; mobile pages stay anchored at the top and scroll normally.

### 2026-10-10 — Layered auth illustration
The shared login/register/recovery artwork now separates the transparent cassette from the gradient backdrop and independent pixel clouds/stars. They gently float automatically and respond to mouse movement at different depths. The demo board freezes at its current position while hovered or keyboard-focused, then resumes pointer response after leaving. Reduced-motion disables decorative movement; mobile uses a compact, quieter composition.
