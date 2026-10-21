# 2026-10-21 — Landing Page: Decouple Coin Minigame from Workspace & Free Trial Access

## Objective
Address user feedback: *"coin จากหน้าแรกไม่เกี่ยว เป็นแค่ minigame"* ("Coins from the front page have nothing to do with it; it's just a minigame").
Decouple the interactive demo minigame in Section 2 (`#playground`) so it is purely an optional, fun interactive preview, and eliminate all coin requirements, coin counters, and coin progress bars from the landing page navigation bar, Hero Section, and Section 5 Free Trial Booth (`#buy`). Ensure the 7-day free trial is 100% direct, frictionless, and 1-click for all visitors.

## Files Created, Modified, or Deleted
- **Modified:**
  - `src/app/(marketing)/page.tsx`:
    - **Sticky Herobar (Navbar)**:
      - Removed desktop interactive coin pill (`walletCoins / 50c`) and floating burst particles (`coinBursts`).
      - Removed mobile coin counter (`Pass ✓ / 45c`), replaced with a direct "ทดลองฟรี" button linking to registration/dashboard.
      - Updated navigation item label from "มินิเกมสะสมเหรียญ" to "มินิเกม".
      - Updated mobile menu item labels to remove "(50c)".
    - **Hero Section (`#cp-hero`)**:
      - Updated value proposition copy to remove mentions of earning coins for rewards; focused on calm, cozy focus and productivity.
      - Refined 4th core pillar to "AI ผู้ช่วยแตกงานย่อยอัจฉริยะ" ("วิเคราะห์และแตกงานใหญ่เป็นการ์ดย่อยพร้อมลงมือทำในคลิกเดียว").
      - Replaced right artwork top status pill from `กระเป๋าเหรียญ: {walletCoins}c` to `RETZLO V2.4 · FOCUS WORKSPACE`.
      - Updated anchor link to "ลองเล่นมินิเกมจำลองระบบ".
    - **Section 2 (`#playground`)**:
      - Updated Step 1 footer note to clarify that task-ticking is an interactive simulation preview.
      - Updated Step 2 footer link from "แลกตั๋วทดลองใช้ฟรี 7 วัน (50c)" to "เริ่มต้นทดลองใช้ฟรี 7 วัน".
    - **Pain Points Section (`#pain-tabs`)**:
      - Updated interactive card preview tag from "ลองกดติ๊กเพื่อรับเหรียญ!" to "ลองกดติ๊กเพื่อทดสอบระบบ!".
    - **Section 5 Free Trial Booth (`#buy`)**:
      - Refactored header from "นำ Coins ที่สะสม แลกรับ สิทธิ์ทดลองใช้งานฟรี 7 วัน ที่นี่!" to "เปิดห้องทำงาน Retzlo ของคุณ ทดลองใช้ฟรี 7 วันเต็ม ได้ทันที".
      - Removed all coin gating, coin HUD terminal boxes, and progress gauges (`walletCoins / 50c`).
      - Replaced with direct 1-click primary CTA button: "เริ่มต้นทดลองใช้ฟรี 7 วันทันที" (`<Link href={defaultDestination}>`) with secondary "ดูคู่มือระบบ & ฟีเจอร์ทั้งหมด".
      - Added 3 core guarantee badges: "✓ ทดลองฟรี 7 วันเต็มระบบ", "✓ เพลง Lofi & บรรยากาศโฟกัส", "✓ ไม่มีค่าใช้จ่ายแอบแฝง (ไม่ต้องกรอกบัตรเครดิต)".
      - Added clarifying footnote: "* มินิเกมด้านบนเป็นเพียงเดโมจำลองระบบให้ทดลองเล่นเพื่อความเพลิดเพลิน สิทธิ์ทดลองใช้งานฟรี 7 วันเปิดให้ทุกคนเริ่มต้นได้ทันทีโดยไม่ต้องสะสมเหรียญ".
      - Updated Vintage Pass stub to display "INSTANT ACCESS · UNLOCKED" and "สิทธิ์ทดลองฟรี 7 วันพร้อมเปิดใช้งานทันที" unconditionally.
    - **State Cleanup**:
      - Removed obsolete `TICKET_COST`, `ticketClaimed`, and `handleClaimMixtapePass` states and local storage sync.
  - `docs/theme-system.md`:
    - Updated coverage matrix and changelog for marketing landing page.

## Important Behavior Changes
1. **Unconditional 1-Click 7-Day Free Trial**: Visitors can now click "เริ่มต้นทดลองใช้ฟรี 7 วันทันที" directly from anywhere on the landing page without having to interact with coins or complete tasks in the demo.
2. **Clear Product Positioning**: Retzlo is clearly presented as an all-in-one focus workspace platform (Kanban, Calendar, Notes, Diary, AI breakdown, Lofi music) rather than a gamified token/coin-gated app.
3. **Minigame Boundary Preserved**: The Zen Garden and interactive task playground remain fully playable in Section 2 for visitors who want to test the interactive vibe, but are strictly self-contained.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx tsc --noEmit` — Passed (0 errors).
- `npm run lint` — Passed (No ESLint warnings or errors).
- `npm test` — Passed (101 test files, 557 passed, 3 skipped).
- `npx prisma validate` — Passed (Prisma schema is valid).
- `npm run build` — Passed (Compiled successfully, 42/42 static and dynamic routes generated).

## Follow-ups / Blockers
- None.
