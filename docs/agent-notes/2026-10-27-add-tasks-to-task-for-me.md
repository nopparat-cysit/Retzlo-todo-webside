# Work Note: Add 5 Decorated Roadmap Tasks to 'Task For Me' Board

- Date: 2026-10-27
- Objective: Insert 5 new roadmap tasks requested by user `losstary` into the Backlog column of the "Task For Me" board, fully decorated with retro stickers, custom color schemes, high priorities, story points difficulty, checklists, and structured markdown descriptions.

## Database Records Created

1. **Card 1: PDF Redesign** (`id: 4159b177-7cf6-45ac-838d-8000d2b9a93c`)
   - Title: `1. PDF Redesign — ปรับดีไซน์ PDF ให้สวยงาม อ่านง่าย และจัดหน้าให้เหมาะสม (3–4 วัน)`
   - Column: `Backlog` (position: 1)
   - Color: `INDIGO`, Priority: `HIGH`, Difficulty: 5 pts
   - Due Date: 2026-10-31
   - Stickers: Paper Note, Paint Palette, Sparkles
   - Checklists: 5 items covering layout, typography, smart page breaks, header/footer page numbers, and print preview.

2. **Card 2: Presentation & Export** (`id: 9562d3a0-6225-406d-b14e-b3209a46927b`)
   - Title: `2. Presentation & Export — โหมดนำเสนอ 16:9 แนวนอน พร้อม Export PDF/PPTX (5–7 วัน)`
   - Column: `Backlog` (position: 2)
   - Color: `CYAN`, Priority: `HIGH`, Difficulty: 8 pts
   - Due Date: 2026-11-03
   - Stickers: Laptop, Play Button, Project Folder
   - Checklists: 6 items covering 16:9 canvas, keyboard controls, presenter notes & timer, PDF landscape export, and PowerPoint .pptx export.

3. **Card 3: Log & Performance MVP** (`id: d965fe81-ace3-45f7-a7a3-170092a64327`)
   - Title: `3. Log & Performance MVP — ระบบดู Error Logs, Performance, API บนเว็บ (4–6 วัน)`
   - Column: `Backlog` (position: 3)
   - Color: `AMBER`, Priority: `HIGH`, Difficulty: 8 pts
   - Due Date: 2026-11-02
   - Stickers: Magnifying Glass, Battery Charge, Wrench
   - Checklists: 6 items covering log storage schema, error & latency middleware, web console UI, latency charts, and week-over-week comparison.

4. **Card 4: Google Calendar 2-Way Sync** (`id: ba90cec9-1127-4e5a-b0d0-cc31da8dde22`)
   - Title: `4. Google Calendar 2-Way Sync — เชื่อม Google Calendar ซิงก์สองฝั่งอัตโนมัติ (8–12 วัน)`
   - Column: `Backlog` (position: 4)
   - Color: `EMERALD`, Priority: `HIGH`, Difficulty: 16 pts
   - Due Date: 2026-11-08
   - Stickers: Calendar, Repeat Arrows, Gem
   - Checklists: 7 items covering Google OAuth2 scopes, settings UI, outbound sync, inbound webhooks, ID mapping, and conflict resolution.

5. **Card 5: CALL System** (`id: fec7d622-8d3d-492c-bb21-ffa71937dc68`)
   - Title: `5. CALL System — พัฒนาระบบโทร เชื่อม PBX, Call History, Recording และ CRM (10–15 วัน)`
   - Column: `Backlog` (position: 5)
   - Color: `ROSE`, Priority: `HIGH`, Difficulty: 21 pts
   - Due Date: 2026-11-11
   - Stickers: Phone Chat, Microphone, Shield
   - Checklists: 8 items covering WebRTC dialer, PBX/SIP gateway, call logs, audio recording player, screen pop, click-to-call, and post-call action tasks.

## Verification

- Queried Prisma directly against PostgreSQL Neon database to verify all 5 cards are stored in column `31e51168-65f4-4daf-b2e1-d6167f66b448` with their nested checklists, stickers, assignees, and dates.
