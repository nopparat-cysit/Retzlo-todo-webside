# Browser tab icon

- Date: 2026-09-23
- Objective: Use the Retzlo illustration symbol as the browser tab icon.
- Files created: `src/app/icon.png` and this note.
- Files deleted: `src/app/icon.svg`.
- Behavior changes: Next.js App Router now publishes the Retzlo illustration as the site icon instead of the previous letter R SVG.
- Database/schema changes: None.
- Verification: Verified the generated icon is a 512×512 RGBA PNG; ran lint, production build, and Prisma validation.
- Known follow-ups: Browsers may retain the previous favicon until their favicon cache is refreshed.
