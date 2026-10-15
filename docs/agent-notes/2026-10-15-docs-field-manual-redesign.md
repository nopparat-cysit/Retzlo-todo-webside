# Work Note: Retzlo Field Manual Redesign & Documentation Architecture

**Date:** 2026-10-15  
**Objective:** Redesign `/docs` and `/help` into the "Retzlo Field Manual" design direction — establishing a formal, distinctive engineering brand identity, unifying the color palette under Retro Lofi Indigo + Warm Paper, restructuring the reading flow (concept first, followed by live interactive sandboxes), modularizing the monolithic help codebase, and introducing Google's `JetBrains Mono` and `Plus Jakarta Sans` typography.

## Files Created, Modified, Deleted, or Moved

### Created
- `src/components/help/data/types.ts`: TypeScript contracts for `GuideTopic`, `WorkflowStep`, `TechnicalSpec`, and `CategoryTheme`.
- `src/components/help/data/categories.ts`: Standardized categories (`CATEGORIES_TH`, `CATEGORIES_EN`), theme mapping (`CATEGORY_THEME_MAP`), and 6 architecture pillars.
- `src/components/help/data/topics-en.ts`: English guide topics dataset.
- `src/components/help/data/topics-th.ts`: Thai guide topics dataset.
- `src/components/help/data/reference.ts`: Keyboard shortcuts and FAQ datasets.
- `src/components/help/sandboxes.tsx`: Interactive AI Copilot, Kanban/Table dual view, 10-level Custom Priorities, and Coffee Cheers demo sandboxes.
- `src/components/help/hub-diagram.tsx`: Interactive Retzlo Hub diagram component.
- `src/components/help/docs-primitives.tsx`: Field manual primitives (`MixtapeLogoMark`, `TapeCounter`, `DocsSandboxDeck`, `DocsHeading`, `DocsCallout`).
- `docs/agent-notes/2026-10-15-docs-field-manual-redesign.md`: This work note.

### Modified
- `src/components/help/help-center-client.tsx`: Decomposed from monolithic ~4,700 lines down to ~1,500 lines. Integrated `MixtapeLogoMark`, `TapeCounter`, and `DocsSandboxDeck`. Reordered reading sections so Concept/Overview is read first before the interactive sandbox test bench.
- `src/components/help/help-center.test.ts`: Updated to verify topic strings across the modular help directory.
- `src/app/globals.css`: Imported `JetBrains Mono` and `Plus Jakarta Sans` from Google Fonts.
- `tailwind.config.ts`: Configured `fontFamily.mono` (`JetBrains Mono`) and `fontFamily.sans` (`Plus Jakarta Sans`).
- `src/components/kanban/board-template-picker.tsx`: Re-exported `BoardTemplateId` type.
- `src/components/project/project-boards-manager.tsx`: Added `createdAt` timestamp to newly appended boards.
- `src/components/project/projects-dashboard.tsx`: Correctly mapped `CreatedBoardResult` to `ProjectBoardSummary` and passed `open` prop to `CreateBoardModal`.
- `docs/theme-system.md`: Documented the new theme tokens and added change log entry.

## Important Behavior & Design Changes
1. **Cohesive Retro Lofi Indigo Identity:** Eliminated the 9-color rainbow theme soup and replaced with a formal Retro Lofi Indigo palette with subtle accent indicators.
2. **Technical Track Numbering:** Removed cartoon emojis from category titles and replaced with clean track numbering (`00 · ทั้งหมด`, `01 · ภาพรวมระบบ`, `02 · ผู้ช่วย AI`, `03 · บอร์ด & ตาราง`, etc.).
3. **Cassette Brand Artwork & Mechanical Tape Counter:** Integrated `MixtapeLogoMark` SVG cassette artwork into the top header and replaced the generic SVG circle in the Table of Contents with a retro 3-digit `TapeCounter` (`000` to `100`).
4. **Natural Pedagogical Reading Flow:** Users now read the Overview & Concept first, immediately followed by the live interactive test-bench (`DocsSandboxDeck`), before exploring workflows and technical matrices.
5. **Interactive Sandboxes Intact:** All 4 interactive sandboxes (`InteractiveAiDemo`, `InteractiveKanbanTableDemo`, `InteractivePrioritiesDemo`, `InteractiveCoffeeDemo`) and `RetzloHubDiagram` remain fully interactive and bug-free.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx tsc --noEmit`: Exited with code 0 (zero TypeScript errors across the entire codebase).
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests in 10ms).
- `npx vitest run`: Passed (99 test files, 525 passed, 3 skipped, 0 failed).
- `npm run lint`: Exited with code 0 (zero ESLint errors or warnings).
- `npx prisma validate`: The schema at `prisma/schema.prisma` is valid.

## Known Follow-ups, Blockers, or Deployment Notes
- Production deployment should verify that Google Fonts (`Plus Jakarta Sans` and `JetBrains Mono`) load properly from CDN. Fallbacks (`ui-monospace`, `SFMono-Regular`, `sans-serif`) ensure zero visual breakage in offline or firewalled environments.
