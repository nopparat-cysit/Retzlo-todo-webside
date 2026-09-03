# 2026-07-07 Office Module

## Objective

Create a lightweight Retzlo Office module as a separate dashboard route instead of embedding a heavier AI office/game runtime into the landing page.

## Files Modified

- `src/app/(dashboard)/office/page.tsx` created.
- `src/components/office/office-module.tsx` created and updated with project creation form.
- `src/components/office/office-module.test.ts` created and updated with Office project-creation coverage.`r`n- `src/components/project/create-project-modal.tsx` created as the shared New Project modal used by project selection and Office.
- `src/components/modules/module-selector.tsx` modified.
- `src/app/globals.css` modified.

## Behavior Changes

- Added `/office` as an authenticated dashboard route.
- Added an Office card to the module selector.
- Added a lightweight animated office scene using React, Tailwind, and scoped CSS animations; no Phaser or game engine dependency is loaded.
- Office zones link to existing Work, Finance, and Notes areas.`r`n- `/office` now starts at an Office-owned project selector, loads the signed-in user project list, and enters a selected project office through `/office?projectId=...`.`r`n- Office project creation is local to the Office module, posts to `/api/projects` as a WORK project, shows Toast feedback, and redirects back to `/office?projectId=...`.`r`n- Removed the shared project modal extraction so Office no longer imports project-module UI.

## Database/Schema Changes

- None.

## Verification

- `npm test -- src/components/office/office-module.test.ts` passed (4 tests, including Office-owned project selector and no project-module UI import).
- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` initially hit Prisma query-engine `EPERM` while the dev server was running; after stopping the Next dev process, `npm run build` passed.
- `Invoke-WebRequest http://localhost:3000/office -UseBasicParsing` returned HTTP 200 for the login redirect when unauthenticated.
- `Invoke-WebRequest http://localhost:3000/select-module -UseBasicParsing` returned HTTP 200 for the login redirect when unauthenticated.

## Known Follow-Ups

- Connect the office scene to live project/card/reward data in a later phase.






