# 2026-10-22 — Quiet Garden redesign

## Objective

Rebuild Garden as a coherent, calm composition with matching painted artwork, clear daily actions, and useful space on desktop and mobile.

## Files created and modified

- Rebuilt `src/components/project/zen-garden.tsx`, `src/components/project/zen-garden/zen-sanctuary-modal.tsx`, and `src/components/project/zen-garden/zen-garden-skin.module.css`.
- Added `src/components/project/zen-garden/zen-guardian-art.tsx` and eleven optimized WebP assets under `public/zen-garden/`. The asset README records the built-in image generation workflow and both final prompts.
- Updated `src/components/project/project-topbar-tools.tsx` and the opt-in scroll surface prop in `src/components/project/zen-garden/zen-vector-art.tsx`.
- Added `scripts/zen-garden-browser-check.mjs` and `test:zen-browser` in `package.json`.
- Updated the Thai/English Help topic data, `docs/system-guide.md`, `docs/theme-system.md`, and this work note.

## Changes

- Replaced nested gradient cards with a landscape hero, one daily action, an inline guardian row, and a simple fortune preview. The plant catalog uses two columns with clearly visible plants, prices, and states. Breathing controls and progress have their own quiet composition.
- The local palette has soft sage paper and dark forest variants. The painted landscape and botanical assets share one style; the fortune uses warm paper artwork in both modes. All role colors are explicitly scoped to the Garden; utility-color remapping was removed.
- Added arrow/Home/End tab navigation, centered keyboard ripples, modal focus cycling and return, body scroll locking, and a fallback for a watered Garden without a fortune.
- Applied the skin to the actual compact/wide tool popovers and removed the extra Garden frame. All Studio Tools popovers now close on the 1536px layout breakpoint transition. Other tools retain their palette and width.
- `ZenOmikujiScroll.surfaceClassName` is opt-in; its default artwork remains unchanged. Existing native SVG botanical art is retained as a fallback for unknown species.
- API behavior, database schema, and shared global theme tokens were not changed.

## Verification

- `npm run lint` — passed.
- `npm test -- src/components/project/zen-garden/zen-sanctuary-modal.test.ts src/lib/zen-garden/zen-state.test.ts` — passed, 16/16 tests.
- `npx prisma validate` — passed.
- `npm run build` — passed; generated 42/42 pages. Next.js skips its type-validation step.
- `npm run test:zen-browser` with external Playwright/Chromium runtime paths — passed. The fixture imports the real components/global CSS and uses in-memory APIs. Reviewed Thai/English at 1280×960, 1600×1000, and 390×844; light/dark/system including both OS schemes; tabs, water cancellation/pending/error/success, guardian confirmation/cancellation, breathing start/pause/reset, ready and revealed readings, nested confirmation layering/cancellation, focus cycle/return, Escape, scrolling, artwork requests, and actual Studio Tools integration. No runtime or artwork request errors. Screenshots remain in the task visualization directory.
- `npx tsc --noEmit --pretty false` — failed on the 10 existing errors in the untouched `src/app/api/zen-garden/route.ts`: Prisma JSON assignments and the missing `GardenPlot.moisture` field. No errors were reported in the changed UI files.
- `git diff --check` — passed.

## Follow-ups

- Authenticated end-to-end API checks were not run; browser checks used fixtures.
- The existing API TypeScript errors remain a separate follow-up.
