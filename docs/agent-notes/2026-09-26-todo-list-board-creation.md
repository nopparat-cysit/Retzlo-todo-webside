# 2026-09-26: Created 'Todo List' Kanban Board for Product Roadmap

## Objective
Create a new dedicated Kanban board named **"Todo List"** under user `losstary`'s project workspace ("Capital One Real Estate") to track and organize the validated SaaS architecture, monetization, gamification, and security roadmap discussed.

## Changes & Database Records
- **Board Created:** `Todo List` (`id: 187384ca-37d8-4611-a6ea-51d5142b64c1`)
  - Columns:
    - `Backlog` (TODO)
    - `In Progress` (DOING)
    - `Done` (DONE)
- **Cards Created:**
  1. **☕ DONE Coffee Cheers (เลี้ยงกาแฟเพื่อนเมื่อปิดงาน)** (Backlog)
     - Color: `AMBER`, Priority: `HIGH`, Stickers: Coffee Cup & Sparkles.
     - Checklist: Icon UI, Anti-self-give rule, real-time toast via Pusher, Profile coffee stats.
  2. **🎨 Custom Themes ขายแบบ Discord Nitro** (Backlog)
     - Color: `LAVENDER`, Priority: `HIGH`, Stickers: Paint Palette & Soft Star.
     - Checklist: 5 CSS theme variable palettes, preview in settings, Starter/Pro gated access.
  3. **💰 วางโครงสร้าง 4 Tiers (พร้อมโควตา AI ทุกระดับ)** (Backlog)
     - Color: `EMERALD`, Priority: `HIGH`, Stickers: Gem & Coin.
     - Checklist: Config plans.ts, DB project fields, Early bird modal, payment gateway readiness.
  4. **🛡️ เกราะป้องกันสแปมและบอทถล่ม (SaaS Security Shield)** (Backlog)
     - Color: `ROSE`, Priority: `HIGH`, Stickers: First Aid Shield.
     - Checklist: Sliding window rate limits, hard card limits, UI submit debouncing.
  5. **🪙 ปรับสมดุลระบบ Coin 2.0 (กันปั๊ม + โบนัส Streak)** (Backlog)
     - Color: `AMBER`, Priority: `MEDIUM`, Stickers: Coin Reward & Pomodoro Timer.
     - Checklist: Auto-calc by difficulty, Pomodoro bonus, daily cap, streak multiplier.
  6. **🤖 ฟีเจอร์ AI Assistant ช่วยย่อยงานและสรุปความคืบหน้า** (Backlog)
     - Color: `CYAN`, Priority: `MEDIUM`, Stickers: Magic Wand & Idea Lamp.
     - Checklist: LLM integration, Auto-breakdown card button, AI quota deduction.
  7. **⚡ ระบบ Real-Time WebSocket (Pusher Channels)** (Done)
     - Color: `CYAN`, Priority: `HIGH`, Stickers: Sparkles & Laptop.
     - Checklist: Pusher setup, useLiveSync hook, 6 core API mutations, 100% tests passing.

## Verification
- Queried Prisma directly to verify the board and all 7 cards with their nested checklists, stickers, and statuses are successfully written to the Neon PostgreSQL database.
