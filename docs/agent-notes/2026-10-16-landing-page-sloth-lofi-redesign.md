# 2026-10-16 — Marketing Landing Page Redesign (Cozy Lofi Mixtape Studio, Custom Illustrations & Smooth Physics)

## Objective
Redesign the marketing landing page (`/`) so it is genuinely **fun, tactile, colorful, and playable** right on the page — bringing Retzlo's unique **Cozy Lofi Mixtape & Tactile Studio** personality (`#5942b8` lilac, `#7858d4` violet, `#ffb4d5` sunset pink, `#ffecb1` buttercream post-it notes, bespoke hand-drawn `/images/landing/*.jpg` illustrations, and `/stickers/retro/` & `/stickers/rewards/` art) paired with modern Thai typography (`IBM Plex Sans Thai` & `Anuphan`) and 60fps spring micro-interactions.

## Files Created, Modified, or Deleted
- **Created (14 Transparent Die-Cut Illustrations in `public/images/landing/`):**
  - `zen-stage-1.png` — Japanese Zen sand tray with stones & tiny sprout (Stage 1).
  - `zen-stage-2.png` — Japanese Zen sand tray with fresh bonsai sapling (Stage 2).
  - `zen-stage-3.png` — Japanese Zen sand tray with wooden bridge & pink sakura buds (Stage 3).
  - `zen-stage-4.png` — Japanese Zen sand tray with bridge, torii gate, gold coin & full bloom sakura (Stage 4).
  - `case-01-scattered.png` — Dizzy creator juggling laptop, phones, and flying notes (Case 1 Before).
  - `case-02-morning.png` — Sleepy creator with morning coffee by a mountain of tasks (Case 2 Before).
  - `case-03-deadlines.png` — Startled creator facing colliding calendar deadlines & alarms (Case 3 Before).
  - `case-04-burnout.png` — Energized creator raising coffee mug with star coins & gifts (Case 4 After).
  - `case-05-ready.png` — Smiling creator snapping fingers with floating cards & calendar (Case 5 After / Setup).
  - `hero-lofi-mascot.png` — Relaxed creator with headphones at wooden desk with laptop & cassette tape.
  - `fit-cozy-achiever.png` — Calm creator in warm knitwear with tea & checklist (Fit Check: Suitable).
  - `fit-heavy-erp.png` — Comical oversized retro mainframe spreadsheet robot (Fit Check: Not Suitable).
  - `before-chaos-cutout.png` — Die-cut cutout of overwhelmed worker.
  - `after-flow-cutout.png` — Die-cut cutout of calm focused worker with floating cards.
- **Deleted (Obsolete Square JPEGs):**
  - `public/images/landing/zen-sakura-terrarium.jpg`, `before-chaos-desk.jpg`, `after-flow-desk.jpg`.
- **Modified:**
  - `src/app/globals.css` — Added `@keyframes lpEqualizer`, `.lp-eq-bar` audio visualizer bars, and `.lp-coin-burst` styles.
  - `src/app/(marketing)/page.tsx`:
    - Redesigned **Herobar** with retro 4-color accent tape, `MixtapeLogoMark` + `STUDIO v2.4` live pulse indicator, tactile nav pills, live Coin Wallet pill with auto-expiring bursts (1.2s timeout), and Lofi Audio mini-deck with animated equalizer bars.
    - Fixed **Hero Focus Card bug**: Replaced infinite loop with multi-task rotation (`HERO_FOCUS_TASKS`), tracking completed tasks so coins are only awarded once, with dedicated "งานถัดไป" and "รีเซ็ต" actions.
    - Fixed **Task Completion & Scoring bugs**: Tasks reverse coins upon unchecking to prevent infinite coin farming across Playground Step 1, Pain Point preview checklist, and Walkthrough rooms.
    - Wired up **Zen Garden 4-stage visual growth** (`zen-stage-1.png` → `zen-stage-4.png`) with water ripples and milestone coin awards.
    - Wired up **Unique Before/After Illustrations** across all 5 Pain Point tabs.
    - Added **Custom Fit Check illustrations** (`fit-cozy-achiever.png` & `fit-heavy-erp.png`).
    - Expanded **Herobar and All Section Containers** from cramped `max-w-[1240px]` to expansive `w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12`, with the sticky `<header>` container spanning full width edge-to-edge.
    - Upgraded **Hero Section Right Column** from awkward disparate coordinates to a cohesive **Dual-Panel Studio Workstation Stage**:
      - Left Panel (`sm:col-span-5`): Framed Cozy Studio Desk Monitor (`/images/landing/cozy-desk-hero.jpg`) with retro cream border, `SIDE A` pill, and tilted `less rush, more rhythm.` tag.
      - Right Panel (`sm:col-span-7`): Interactive Daily Board Runner card with 3-stage dots (`To do`, `In progress`, `Done ✓`), direct one-click stage progression, celebratory chime and coin burst (+25 Coins), Next Task rotation, and Reset action.
      - Bottom: Integrated Lofi Cassette Synthesizer Bar with vinyl spinning animation, real-time equalizer bars, and Play/Pause control.
    - Enriched **Page Background & Atmospheric Studio Decor** ("BG มันดูโล่งๆไป"):
      - Replaced invisible 5% opacity grid with tactile retro graph-paper drafting grid (`linear-gradient(rgba(120, 88, 212, 0.12))` in 48px grid) and micro dot-matrix paper pattern (`radial-gradient(1.2px)` in 24px grid).
      - Layered deep multi-point radiant aurora glow washes across the entire page height (top, middle, and bottom).
      - Added floating animated studio doodles (sparkle crosses `✦`, stars `✧`, music notes `♪`, `♫`, cassette tape tags `SIDE A · 45 MIN`, `24/7 LOFI VIBES`, `ZEN FOCUS · SAKURA`, `BPM: 72 · CHILL`, `RETZLO STUDIO`) visible across tablet and desktop viewports.
    - **Airy Navbar Decluttering ("navbar อึดอัดมาก แก้ไข"):**
      - Aligned `<header>` inner container to `w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12` matching the Hero section.
      - Removed clunky nested pill wrapper with 12px padding and bulky borders; converted navigation to clean, breathable typography (`gap-6 xl:gap-8 text-[13.5px] font-medium`).
      - Removed noisy `STUDIO v2.4` badge beside the logo to give the brand logo room to breathe.
      - Compacted right controls: converted bulky 130px Lofi radio pill into an elegant 36px circular button with vinyl/equalizer icon (`w-9 h-9`), and streamlined the Coin Wallet pill into a minimal cute badge (`🪙 {walletCoins}`).
      - Refined "Enter Workspace" button into a comfortable `h-[38px] px-4.5` button with neobrutalist retro shadow, giving over 500px of negative space across standard desktop and laptop screens.
    - **Ultra-Prominent Golden VIP Pass Redemption Station ("มันไม่เด่นเลยอะแบบ แลกสิทธื์ใช้ฟรีอะ ขอเด่นๆ สวยๆ"):**
      - Overhauled Section 7 (`#buy`) from a subdued closing card into a dedicated **Golden VIP Ticket Pavilion & Arcade Prize Booth**.
      - Added high-visibility section eyebrow (`ARCADE REWARD BOOTH · จุดแลกสิทธิ์ VIP PASS ฟรี`) and bold display heading (`นำ Coins ที่สะสม แลกรับ VIP Pass ฟรี ที่นี่!`).
      - Styled the grand container with a golden border (`3px solid #f6c976`), deep twilight radial aurora glow, decorative ticket punch notches on the outer edges, and perforated golden ticket aesthetics.
      - Embedded 3 VIP perks highlight cards: `⭐ ฟรีเต็มระบบ`, `🎧 Mixtape Studio`, and `🪙 โบนัส +100 Coins`.
      - Built a high-contrast Coin HUD terminal with animated coin balance, segmented retro progress gauge with milestone markers (0c, 25c, 50c GOAL), and a one-click bonus booster (`✨ แตะรับโบนัสทันใจ +15c`) for immediate satisfaction.
      - Elevated the CTA to a giant, pulsing Neobrutalist Golden Button (`h-14 sm:h-16`, `font-black`, `bg-gradient-to-r from-[#ffe484] via-[#fcd34d] to-[#f59e0b]`, `border-3 border-[#3b185f]`, `shadow-[6px_6px_0_#2b0f47]`).
      - Upgraded the collector's ticket stub on the right with authentic serial number (`NO. RZ-2026-VIP`), ambient golden backlight glow behind the cassette, rotated rubber ink stamp (`★ CLAIMED VIP ★`), and retro barcode graphic (`0050-VIP-FREE`).
      - Connected the playground and navbar to Section 7: added VIP redemption link in the playground rewards card footer, added `แลก VIP ฟรี 🎟️` link to desktop navbar and mobile menu dropdown, and linked the navbar coin pill directly to `#buy`.
  - `src/app/(marketing)/walkthrough-mockup.tsx`:
    - Replaced duplicate stickers in Room 01 with `retro-sticker-64-team-group.png` and `retro-sticker-37-tiny-house.png`.
    - Replaced repeated hero image in Room 06 with `hero-lofi-mascot.png`.
    - Handled coin deductions on unchecking in agenda, calendar, habits, and kanban cards.
  - `src/app/(marketing)/landing-data.ts` — Assigned `beforeIllustSrc` and `afterIllustSrc` across all tabs and ensured zero duplicate stickers.
  - `docs/theme-system.md` — Updated coverage matrix and change log.

## Verification
- `npx tsc --noEmit`: Passed (0 errors)
- `npx vitest run src/components/auth/auth-navigation.test.ts`: Passed (3/3 tests)
- `npx vitest run`: Passed (100/100 test files, 533 passed)
- `npm run lint`: Passed (0 warnings, 0 errors)
- `npx prisma validate`: Passed (schema is valid)
- `npm run build`: Passed (42/42 static and dynamic pages generated successfully)
