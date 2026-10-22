# 2026-10-22 — Zen Garden Washi skin

## Objective

Give Zen Garden a distinct paper-and-moss visual identity that follows light/dark mode and remains visually connected to Retzlo through muted indigo accents.

## Files changed

- Added `src/components/project/zen-garden/zen-garden-skin.module.css`.
- Updated `src/components/project/zen-garden.tsx` and `src/components/project/zen-garden/zen-sanctuary-modal.tsx` to apply the scoped skin to the Garden popover and sanctuary.
- Added bilingual Zen Garden guidance in `src/components/help/data/topics-en.ts` and `src/components/help/data/topics-th.ts`.
- Updated `docs/system-guide.md` and the Zen Garden entry/change log in `docs/theme-system.md`.
- Added this work note.

## Behavior and design changes

- The Garden now uses a local Washi palette: paper, ink, moss, water, vermilion, and muted indigo. Its light/dark palette follows the resolved app theme; global tokens and other routes are unchanged.
- Coordinated the daily ritual, buttons, tabs, plant catalog, breathing panel, fortune preview, and full-screen modal while retaining the existing SVG garden art.
- Updated the Thai and English in-app guide with current Garden workflows and the dedicated visual identity.
- No database/schema, API, or shared primitive changes.

## Verification

- `npm run lint` — passed with no warnings or errors.
- `npm test -- src/components/project/zen-garden/zen-sanctuary-modal.test.ts` — passed, 4/4 tests.
- `npx prisma validate` — passed.
- `npm run build` — passed, 42/42 static pages generated; Next.js skipped its type-validation step.
- `git diff --check` — passed.

## Follow-ups

- Browser visual QA remains unavailable because the local project preview redirects to sign-in. Check the Garden in light, dark, and system modes, plus desktop and 390×844, when an authenticated browser session is available. Keyboard focus and scroll behavior should be included in that review.
