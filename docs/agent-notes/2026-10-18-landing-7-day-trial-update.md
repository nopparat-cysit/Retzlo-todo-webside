# Marketing Landing Page Free 7-Day Trial Update

## Date and Short Objective
- **Date:** 2026-10-18
- **Objective:** Update all copy, badges, stubs, and CTAs across Section 7 (`#buy`) and Section 2 (`#playground`) from "ตลอดชีพ" (lifetime) to "ฟรี 7 วัน" (7-Day Full Access Free Trial) to accurately reflect the 7-day trial offering.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `docs/agent-notes/2026-10-18-landing-7-day-trial-update.md`
- **Modified:**
  - `src/app/(marketing)/page.tsx`:
    - Updated Section 7 eyebrow badge to `FREE TRIAL BOOTH · จุดแลกตั๋วทดลองใช้งานฟรี 7 วัน (เต็มระบบ)`.
    - Updated Section 7 main heading to `สิทธิ์ทดลองใช้งานฟรี 7 วัน`.
    - Updated subtitle to `...แลกตั๋วเข้าใช้งาน Retzlo Workspace เต็มระบบฟรี 7 วัน ไม่มีค่าบริการแอบแฝง ไม่ต้องผูกบัตรเครดิต`.
    - Updated left control booth pill to `FREE 7-DAY TRIAL PASS`.
    - Updated headline and claim toasts to announce 7-day full access free trial.
    - Updated Perk 1 to `ทดลองฟรี 7 วันเต็ม` (`สร้างโปรเจกต์ บอร์ด Kanban ตาราง และปฏิทินได้ไม่จำกัด 7 วันเต็ม`).
    - Updated retro coin gauge target to `50c (เป้าหมาย: ปลดล็อกทดลองฟรี 7 วัน)`.
    - Updated primary action button to `กดแลกสิทธิ์ทดลองฟรี 7 วันทันที! (ใช้ 50 Coins)`.
    - Updated right vintage ticket stub:
      - Title to `7-DAY TRIAL · ตั๋วทดลองใช้ฟรี 7 วัน`.
      - Status badges to `สิทธิ์ทดลองฟรี 7 วันพร้อมใช้งานแล้ว` and `พร้อมแลกตั๋วทดลองใช้ฟรี 7 วัน (ครบ 50c แล้ว!)`.
      - Punch pill to `✓ ฟรี 7 วันเต็ม`.
      - Barcode serial to `RZ-TRIAL-7DAYS-PASS` and `ADMIT ONE CREATOR · 7-DAY FULL ACCESS · NO CREDIT CARD`.
    - Updated header wallet tooltip, mobile drawer link, and Step 2 playground bottom link to `แลกตั๋วทดลองใช้ฟรี 7 วัน (50c)`.

## Important Behavior Changes
- The landing page clearly communicates a 7-day full access free trial without any confusing lifetime claims.
- All redemption logic, wallet coin states, and success toasts are aligned with the 7-day free trial messaging.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/auth/auth-navigation.test.ts` (3/3 passed)
- `npx tsc --noEmit` (0 errors)
- `npm run lint` (0 warnings, 0 errors)
- `npx prisma validate` (valid schema)
- `npm run build` (successful compilation, 42/42 static/dynamic routes generated)

## Follow-ups / Blockers
- None.
