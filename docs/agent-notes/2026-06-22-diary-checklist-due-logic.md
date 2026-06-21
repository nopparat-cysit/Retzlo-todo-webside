# 2026-06-22 Diary Checklist Due Logic

## Objective

Make diary list due/filter behavior use checklist item schedules first, while keeping parent diary recurrence as the fallback for diary items without checklist entries.

## Files Modified

- `src/lib/diary/checklist.ts`
- `src/lib/diary/checklist.test.ts`
- `src/lib/diary/validation.test.ts`
- `src/components/diary/diary-checklist.tsx`
- `src/components/diary/diary-list-panel.tsx`
- `src/components/hub/diary-hub-panel.tsx`
- `src/components/hub/fab-hub.tsx`
- `src/components/project/project-quick-hub.tsx`
- `src/app/api/projects/[id]/diary-items/route.ts`
- `src/app/api/diary-items/[diaryItemId]/route.ts`
- `src/app/api/hub/diary/route.ts`
- `src/app/(dashboard)/project/[id]/diary/page.tsx`
- `src/app/(dashboard)/hub/diary/page.tsx`

## Behavior Changes

- Added diary checklist summary logic so Today/Upcoming filters use checklist item recurrence when checklist items exist.
- Kept parent diary recurrence as the fallback for legacy diary items with no checklist items.
- Changed checklist normalization fallback to use the parent diary start date instead of the current machine date.
- Updated diary badges to show due checklist progress for the selected day, or checklist count when not due.
- Renamed repeat labels so parent recurrence reads as the default repeat for new checklist items.
- Removed the checklist item start-date control from the UI.
- Checklist items now use the parent diary start date as their schedule start.
- Recurring Diary forms now use a two-column details/settings layout on wide screens.
- Checklist item editing remains a simple single-column list inside the details side.
- API validation accepts checklist items without their own start date and normalizes them with the parent diary start date.

## Database Changes

- None.

## Verification

- `npm test -- src/lib/diary/checklist.test.ts` passed.
- `npx prisma validate` passed.
- `npm run lint` passed.
- First `npm run build` failed because a running local dev server locked Prisma's Windows query engine DLL.
- Stopped the local Todo dev server processes that held the Prisma DLL lock.
- Second `npm run build` failed on a TypeScript mismatch in the Zod transform callback after adding the fallback parameter.
- Fixed the Zod transform wrapper.
- Final `npm test -- src/lib/diary/checklist.test.ts` passed.
- Final `npm run lint` passed.
- Final `npm run build` passed.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after removing checklist start-date input.
- `npx prisma validate` passed after removing checklist start-date input.
- `npm run lint` passed after removing checklist start-date input.
- `npm run build` passed after removing checklist start-date input.
- Corrected layout direction so the Recurring Diary modal is split into Details and Settings, while checklist items remain single-column.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after the Recurring Diary layout correction.
- `npx prisma validate` passed after the Recurring Diary layout correction.
- `npm run lint` passed after the Recurring Diary layout correction.
- First `npm run build` after the layout correction failed because running local dev servers locked Prisma's Windows query engine DLL.
- Stopped only the Todo dev-server Node processes that held the Prisma DLL lock.
- Final `npm run build` passed after the Recurring Diary layout correction.
- Recurring Diary modals now use a scroll-safe overlay with top/bottom padding so the workspace topbar does not cover the modal.
- Added a Settings toggle to Recurring Diary modals so the settings side can collapse.
- Removed parent diary due-time controls from Recurring Diary settings; note due-time controls remain unchanged.
- Moved the default repeat control out of Recurring Diary settings and into the Checklist panel, where it controls new checklist item defaults and diary fallback recurrence.
- Raised Recurring Diary modal overlays above the project topbar/sidebar layers.
- Changed Recurring Diary modals to avoid whole-modal scrolling; the Checklist panel now owns the scrollable area.
- Added a shared `ModalPortal` helper so diary modals render under `document.body` and are not trapped below project nav/topbar stacking contexts.
- Fixed edit diary save flow so the modal closes after a successful update and stays open when the API save fails.
- Redesigned diary card checklist previews as full-width compact list panels with progress, internal scrolling, and clearer row states.
- Adjusted diary card action layout so the checklist content no longer gets squeezed into a narrow column.
- Updated the pinned FAB diary panel to render diary checklist tasks instead of only the diary description.
- Added checklist completion updates from the pinned FAB diary panel through the existing diary item PATCH API.
- Added a graceful diary-page database unavailable state for Prisma/Neon connection failures instead of showing the Next.js runtime overlay.
- Verified the local machine could not connect to the configured Neon host on PostgreSQL port 5432 during the investigation.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after adding pinned FAB checklist tasks.
- `npx prisma validate` passed after adding pinned FAB checklist tasks.
- `npm run lint` passed after adding pinned FAB checklist tasks.
- First `npm run build` after adding pinned FAB checklist tasks failed because running local dev servers locked Prisma's Windows query engine DLL.
- Stopped only the Todo dev-server Node processes that held the Prisma DLL lock.
- Final `npm run build` passed after adding pinned FAB checklist tasks.
- First `npm run build` after adding the diary database fallback caught a TypeScript widening issue for diary items with included authors.
- Fixed the diary page item type to match the serializer input.
- Final `npm run lint` and `npm run build` passed after the database fallback type fix.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after diary card UI polish.
- `npx prisma validate` passed after diary card UI polish.
- `npm run lint` passed after diary card UI polish.
- `npm run build` passed after diary card UI polish.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after fixing edit-save modal close behavior.
- `npx prisma validate` passed after fixing edit-save modal close behavior.
- `npm run lint` passed after fixing edit-save modal close behavior.
- `npm run build` passed after fixing edit-save modal close behavior.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after adding modal portal rendering.
- `npx prisma validate` passed after adding modal portal rendering.
- `npm run lint` passed after adding modal portal rendering.
- First `npm run build` after adding modal portal rendering failed because running local dev servers locked Prisma's Windows query engine DLL.
- Stopped only the Todo dev-server Node processes that held the Prisma DLL lock.
- Final `npm run build` passed after adding modal portal rendering.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after moving scroll ownership into the Checklist panel.
- `npx prisma validate` passed after moving scroll ownership into the Checklist panel.
- `npm run lint` passed after moving scroll ownership into the Checklist panel.
- `npm run build` passed after moving scroll ownership into the Checklist panel.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after moving default repeat into the Checklist panel.
- `npx prisma validate` passed after moving default repeat into the Checklist panel.
- `npm run lint` passed after moving default repeat into the Checklist panel.
- First `npm run build` after moving default repeat into the Checklist panel failed because running local dev servers locked Prisma's Windows query engine DLL.
- Stopped only the Todo dev-server Node processes that held the Prisma DLL lock.
- Final `npm run build` passed after moving default repeat into the Checklist panel.
- `npm test -- src/lib/diary/checklist.test.ts src/lib/diary/validation.test.ts` passed after the scroll/collapse settings update.
- `npx prisma validate` passed after the scroll/collapse settings update.
- `npm run lint` passed after the scroll/collapse settings update.
- First `npm run build` after the scroll/collapse settings update failed because running local dev servers locked Prisma's Windows query engine DLL.
- Stopped only the Todo dev-server Node processes that held the Prisma DLL lock.
- Final `npm run build` passed after the scroll/collapse settings update.

## Follow-ups

- Restart `npm run dev` when local browser testing is needed again.
