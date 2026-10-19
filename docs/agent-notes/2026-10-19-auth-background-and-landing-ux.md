# Work Session Note: Auth Pages Studio Atmosphere Overhaul & Landing Page UX/UI Polish

**Date**: 2026-10-19  
**Objective**: Decorate the background of all 5 auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/accept-invitation`) with cozy retro lofi studio aesthetics, and polish landing page UX/UI, scroll order, live coin goal progress, and 3-mood interactive Web Audio cassette synthesizer.

## Files Created, Modified, or Moved

- `src/components/auth/login-scene.tsx` (Modified): Added studio backdrop watermarks, floating notes/sparkles, top rainbow mixtape strip, landing pass bonus banner from localStorage, and rAF pointer motion caching.
- `src/components/auth/login-scene.module.css` (Modified): Added multi-layer drafting grid, micro dots, 4-point aurora radial blooms, studio watermarks, floating ornaments, and trial bonus badge styles.
- `src/components/auth/auth-scene.tsx` (Modified): Added `auth-studio-overlay` with watermarks, floating notes/sparkles, and `auth-card-rainbow-strip` while preserving `<AuthScene` contract.
- `src/app/globals.css` (Modified): Upgraded `.auth-scene` and `.auth-card` with drafting grid, micro dots, aurora radial glows, rainbow strip, and light theme overrides (`[data-theme="light"] .auth-scene`).
- `src/app/(marketing)/page.tsx` (Modified):
  - Aligned desktop navbar link order with scroll sequence, upgraded coin pill to display progress toward 50c goal, fixed `#faq` duplicate eyebrow to `05 / QUESTIONS & ANSWERS`, added 3 cassette mood configs for Web Audio synth, connected Room 06 mood handler, updated Before/After frames to `var(--paper)`, and synced wallet coins & trial pass to `localStorage`.
  - **Hero Section (`#cp-hero`) Product Clarity & Interactive Mini-Workspace Overhaul**:
    - Replaced ambiguous lifestyle headline with clear product-defining messaging (`ALL-IN-ONE WORK & LIFE WORKSPACE`, `"จัดการโปรเจกต์ บอร์ดงาน ปฏิทิน และสมุดโน้ต ในพื้นที่เดียวที่ เคลียร์งานสนุกขึ้น ทุกวัน"`).
    - Added a 2x2 Core Pillars Grid (`📋 บอร์ดงาน Kanban & ตาราง`, `📅 ปฏิทินซิงก์วันส่งอัตโนมัติ`, `📝 สมุดโน้ตคู่บอร์ด & ไดอารี่`, `🤖 AI แตกงานย่อย & เหรียญรางวัล`) and an Interactive Preview Switcher Dock.
    - Replaced the static illustration card in the right column with an **Interactive Retzlo Mini-Workspace Window** featuring 4 switchable live tabs (`📋 บอร์ดงาน Kanban` with 3 columns & clickable cards, `📅 ปฏิทินวันส่ง`, `📝 โน้ต & ไดอารี่`, `🤖 AI & รางวัล` with 1-click AI Task Breakdown) plus a compact Focus Radio bar with 3 selectable Lofi moods.
- `src/app/(marketing)/walkthrough-mockup.tsx` (Modified): Added `cassetteMood` and `onSelectMood` props to `WalkthroughMockupScreen`, connected Room 06 mood buttons, and ensured dark mode text contrast on note pin buttons (`text-[#432369]`).
- `docs/theme-system.md` (Modified): Appended dated entry documenting the theme updates, auth background system, and Hero section product-clarity overhaul.
- `docs/agent-notes/2026-10-19-auth-background-and-landing-ux.md` (Created & Updated): This work note.

## Important Behavior Changes

1. **Hero Section 3-Second Product Clarity**: Visitors immediately see what Retzlo is (an All-in-One Work & Life Workspace combining Kanban, Calendar, Side Notes, Private Diary, AI Breakdown, and Coin Rewards) and can interact with a real 3-column mini Kanban board, calendar deadlines, notes/diary checklist, and AI task splitter right inside the Hero window.
2. **Auth Pages Atmosphere**: All 5 auth pages now share a unified, immersive *Cozy Retro-Lofi Mixtape Studio* atmosphere across both Light (Warm Paper) and Dark (Retro Lofi Indigo) modes, rendered via pure CSS radial gradients and grids without performance-degrading blur filters.
3. **Landing-to-Auth Gamification Bridge**: Users who collect coins or claim the 7-day trial pass on the landing page have their status saved to `localStorage` (`retzlo:landing-pass`) and are greeted with a warm golden bonus banner upon arriving at `/register` or `/login`.
4. **Landing Page Navigation & Flow**: Desktop navigation links now cleanly follow the actual section order (`#playground` -> `#pain-tabs` -> `#walkthrough` -> `#comparison` -> `#testimonials` -> `#faq` -> `#buy`), and the FAQ section eyebrow is corrected to `05`.
5. **Interactive Room 06 & Hero Cassette Moods**: Users can switch between `01 · Rainy Cafe`, `02 · Midnight Study`, and `03 · Sunday Vinyl` both in the Hero Mini-Radio bar and inside Room 06 to change Web Audio synthesizer chord voicings, tempos, and filter cutoffs in real time.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npx prisma validate`: Passed.
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm test`: Passed (100 test files, 533 passed).
- `npm run build`: Passed (all 42 routes compiled and statically generated).

## Known Follow-ups, Blockers, or Deployment Notes

- None. Everything is self-contained, typed, test-verified, and follows the project standards.

