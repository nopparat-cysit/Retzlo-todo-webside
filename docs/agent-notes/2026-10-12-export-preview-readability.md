# Export preview readability refinement — 2026-10-12

- Objective: make the board export preview easier to read after review feedback.
- Files created: this work note. Files modified: `src/components/kanban/board-export-modal.tsx`, `src/components/kanban/board-export.test.ts`, `src/lib/kanban/export-config.ts`, `src/lib/kanban/export-config.test.ts`, `src/components/help/help-center-client.tsx`, `docs/system-guide.md`, `docs/theme-system.md`.
- Behavior: desktop dialog gives the preview about 65% of its width; preview opens at 90% and offers explicit 100% actual-size and Fit controls. The paper stage centers when it fits and scrolls when zoomed. Exported PDF/PNG and spreadsheet contents are unchanged. Semantic theme surfaces only; no shared token or primitive changes.
- Database/schema changes: none.
- Verification: focused export tests passed (16/16); full `npm test` passed (92 files, 489 passed, 3 skipped); `npm run lint`, `tsc --noEmit`, `npx prisma validate`, and `npm run build` passed. `git diff --check` passed.
- Follow-ups: screenshot QA for light/dark at desktop/mobile and keyboard interactions remains outstanding; no commit or deployment in this session.
