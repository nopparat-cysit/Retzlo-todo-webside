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
- `src/components/help/docs-primitives.tsx`: Added `FeatureTakeaways`, `WorkflowTimeline`, `SpecsLedger`, `ComparisonMatrix`, and `PromptCookbook` components.
- `src/components/help/data/reference.ts`: Added `KANBAN_VS_TABLE_MATRIX_EN/TH`, `RBAC_PERMISSIONS_MATRIX_EN/TH`, and `AI_PROMPT_RECIPES` datasets.
- `src/components/help/data/topics-en.ts`: Cleaned up runaway 15-line developer changelog text in `welcome-overview` highlights into a concise, punchy highlight bullet.
- `src/components/help/data/topics-th.ts`: Cleaned up runaway changelog paragraph in Thai `welcome-overview` highlights.
- `src/components/help/help-center-client.tsx`: Deconstructed repetitive card-in-card containers. Integrated `FeatureTakeaways`, `WorkflowTimeline`, `SpecsLedger`, and conditionally rendered topic-tailored modules (`PromptCookbook` for AI topics, `ComparisonMatrix` for Kanban/Table and Member Roles/RBAC). Updated right sidebar "On This Page" scroll-spy links.
- `src/components/help/help-center.test.ts`: Updated to verify topic strings across the modular help directory and assert presence of `UserProfilePopover`, `AiChatTrigger`, and `HelpButton` in `ProjectsDashboard`.
- `src/app/globals.css`: Imported `JetBrains Mono` and `Plus Jakarta Sans` from Google Fonts.
- `tailwind.config.ts`: Configured `fontFamily.mono` (`JetBrains Mono`) and `fontFamily.sans` (`Plus Jakarta Sans`).
- `src/components/kanban/board-template-picker.tsx`: Re-exported `BoardTemplateId` type.
- `src/components/project/project-boards-manager.tsx`: Added `createdAt` timestamp to newly appended boards.
- `src/components/project/projects-dashboard.tsx`: Repositioned user profile avatar popover, Retzlo AI assistant trigger, and Help button (`?`) into a dedicated top utilities toolbar directly above the Studio Pulse right rail (`ProjectSupportColumn`), removed redundant middle-header AI trigger, and preserved responsive fallbacks on `< 2xl` screens.
- `src/components/kanban/column.tsx`: Updated curved column resize guide line corner arcs (`top-arc-fade` and `bottom-arc-fade`) with SVG `linearGradient` and `strokeLinecap="round"`, creating a soft luminous fade-out at the tips.
- `src/components/kanban/column-resize.test.ts`: Added unit assertions to verify corner arc gradient fade-out and rounded linecap geometry.
- `docs/theme-system.md`: Documented the new theme tokens and added change log entry.

## Important Behavior & Design Changes
1. **Cohesive Retro Lofi Indigo Identity:** Eliminated the 9-color rainbow theme soup and replaced with a formal Retro Lofi Indigo palette with subtle accent indicators.
2. **De-cardification & Editorial Variety (No More Boring Repeated Structure):**
   - **Feature Takeaways:** Replaced generic 2-column grey card stacks with an editorial takeaway layout with subtle hover highlights, left accent markers, bold keyword titles, and fluid body copy.
   - **Connected Vertical Workflow Timeline:** Replaced disconnected numbered cards with an authentic continuous vertical timeline featuring gradient connector tracks and monospace step badges (`01`, `02`, `03`...).
   - **Engineering Specs Ledger:** Replaced bulky card boxes with a monospace key-value ledger table featuring click-to-copy values and toast feedback.
3. **Topic-Specific Visual Modules:**
   - **AI Copilot Topics:** Features `PromptCookbook` with 4 battle-tested, copy-to-clipboard prompt recipes (Sub-task Decomposition, Risk Audit, Acceptance Criteria, Executive Summary).
   - **Kanban & Spreadsheet Table Topics:** Features `ComparisonMatrix` comparing Kanban vs Table across 6 architectural dimensions (Focus, Interaction, Density, Speed, Metrics, Batch ops).
   - **Member Roles & Security Topics:** Features `ComparisonMatrix` detailing RBAC permissions across Governance, Access, Boards, Cards, Privacy, and Audit trail.
4. **Data Hygiene:** Eliminated the runaway 15-line auth changelog dump in `welcome-overview` highlights, restoring balanced typography and preventing jagged card heights.
5. **Column Resize Guide Line Fade-Out:** Replaced blunt, hard-clipped corner arc ends on the column horizontal resize guide line with smooth `linearGradient` transitions fading to 0 opacity and `strokeLinecap="round"`, eliminating harsh edges on column borders.
6. **Live Column Width Badge Contrast Fix:** Resolved the "empty white box" bug during drag resizing in Light Mode. Previously, global Light Mode CSS mapped `.bg-ink-950/95` to `#ffffff !important` while the badge had `text-white`, rendering white text on a white background. Replaced with `bg-stone-900 text-stone-100 border-stone-800` (dark mode: `dark:bg-[#0c0d1e] dark:text-dusk-lavender`) ensuring crisp monospace pixel readout across all themes.
7. **Cassette Brand Artwork & Mechanical Tape Counter:** Integrated `MixtapeLogoMark` SVG cassette artwork into the top header and replaced the generic SVG circle in the Table of Contents with a retro 3-digit `TapeCounter` (`000` to `100`).
8. **Natural Pedagogical Reading Flow:** Users now read the Overview & Concept first, immediately followed by the live interactive test-bench (`DocsSandboxDeck`), before exploring workflows and technical matrices.
9. **Interactive Sandboxes Intact:** All 4 interactive sandboxes (`InteractiveAiDemo`, `InteractiveKanbanTableDemo`, `InteractivePrioritiesDemo`, `InteractiveCoffeeDemo`) and `RetzloHubDiagram` remain fully interactive and bug-free.
10. **Sticky Navbar & Sidebar Fix:** Replaced `overflow-x: hidden` with `overflow-x: clip` in `globals.css` on `html` and `body` rules to restore browser-level `position: sticky` functionality. Configured the documentation header as `sticky top-0 z-40` and the sidebar as `lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-5.5rem)]` with independent scrollable topic navigation and pinned footer, ensuring both stay firmly anchored in view while scrolling.
11. **Dashboard Top Utilities Toolbar (Profile, AI, Help):** Moved the user profile avatar popover, AI assistant trigger, and Help button (`?`) to a dedicated top toolbar in the right rail directly above the Studio Pulse card. Removed the redundant AI trigger from the middle column workspace header (which was cramped between workspace switch and progress metrics), and kept responsive fallbacks for `< 2xl` screens in the left sidebar quick actions bar.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx tsc --noEmit`: Exited with code 0 (zero TypeScript errors across the entire codebase).
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npx vitest run src/components/kanban/column-resize.test.ts`: Passed (3/3 tests).
- `npm run lint`: Exited with code 0 (No ESLint warnings or errors).
- `npm run build`: Exited with code 0 (production build compiled successfully, 41/41 static pages generated).
- `npx prisma validate`: The schema at `prisma/schema.prisma` is valid.

## Known Follow-ups, Blockers, or Deployment Notes
- Production deployment should verify that Google Fonts (`Plus Jakarta Sans` and `JetBrains Mono`) load properly from CDN. Fallbacks (`ui-monospace`, `SFMono-Regular`, `sans-serif`) ensure zero visual breakage in offline or firewalled environments.
