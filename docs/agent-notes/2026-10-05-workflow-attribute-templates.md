# Work Note: Workflow Attribute Templates for Priority & Story Points

## Date & Objective
- **Date:** 2026-10-05
- **Objective:** Implement beautiful, decorated workflow templates for Board Priorities and Story Points scales matching the Status Workflow Templates system, with live preview modals, replace/append mode selectors, custom template saving to localStorage, ConfirmModal protection, and Toast notifications per AGENTS.md standards.

## Files Created, Modified, Deleted, or Moved
- `src/lib/kanban/priority.ts`: Added `PriorityWorkflowTemplate` type and `PRIORITY_WORKFLOW_TEMPLATES` registry (Classic 3-Level, Jira P0–P4 Scale, MoSCoW, Eisenhower Matrix, Customer Support & SLA, Business Value Matrix).
- `src/lib/kanban/difficulty.ts`: Added `StoryPointWorkflowTemplate` type and `STORY_POINT_WORKFLOW_TEMPLATES` registry (Retzlo Standard, Fibonacci Sequence, Linear/Hours, T-Shirt Sizes, Pomodoro Focus Blocks, Complexity & Risk Scale).
- `src/components/kanban/board-priorities-tab.tsx`: Implemented Quick Priority Workflow Templates Bar, Template Preview & Apply Modal with replace/append selection, Save as Custom Priority Template Modal (`retzlo:custom_priority_templates`), ConfirmModal on apply, and Toast notifications.
- `src/components/kanban/board-attributes-tab.tsx`: Upgraded Sub-tab 3 (Story Points) with Quick Story Points Workflow Templates Bar, Story Point Template Preview & Apply Modal, Save as Custom Scale Modal (`retzlo:custom_story_point_templates`), live preview badges, ConfirmModal on apply, and Toast notifications.
- `src/components/kanban/board-settings-attributes.test.ts`: Added tests verifying source integrity, ConfirmModal protection, template registry definitions, and custom template handlers.
- `docs/system-guide.md`: Updated Section 2.3 with detailed documentation for the Workflow Templates across Status, Priority, and Story Points.
- `src/components/help/help-center-client.tsx`: Updated in-app knowledge base with comprehensive guidance on using and saving workflow templates.

## Important Behavior Changes
- **Priority Workflow Templates Bar:** Users can browse and select from 6 standardized priority frameworks or their own saved templates.
- **Priority Template Preview Modal:** Shows interactive sequence of priority badges and allows choosing between "Replace All" or "Append New".
- **Save Custom Priority Template:** Users can save their current board priorities configuration as a reusable custom template stored in localStorage.
- **Story Points Workflow Templates Bar:** Upgraded from plain preset buttons to a decorated template banner with icons, badge counts, and template preview modal.
- **Story Point Template Preview Modal:** Visualizes the score badges, titles, and descriptions, supporting both replace and append modes.
- **Save Custom Story Points Scale:** Users can save their custom story points scales as reusable templates.
- **AGENTS.md Compliance:** Every template application is protected by a `ConfirmModal` and triggers a `Toast` notification upon completion.

## Database / Schema Changes
- None (client-side state, board JSON column, and localStorage templates).

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: PASSED (10 tests).
- `npm run lint`: PASSED (`✔ No ESLint warnings or errors`).
- `npx prisma validate`: PASSED (`The schema at prisma\schema.prisma is valid 🚀`).
- `npm test`: PASSED (89 test files passed, 460 passed, 3 skipped).
- `npm run build`: PASSED (`✓ Compiled successfully`, all 38 static/dynamic routes generated cleanly).

## Follow-ups & Deployment Notes
- Ready for production deployment on main branch.
