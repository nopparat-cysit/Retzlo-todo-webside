# Work Session Note: DONE Coffee Cheers (เลี้ยงกาแฟเพื่อนเมื่อปิดงาน)

## Objective
Implement the "☕ DONE Coffee Cheers (เลี้ยงกาแฟเพื่อนเมื่อปิดงาน)" feature allowing teammates to treat each other to a cup of coffee when a task is completed, with 100% Anti-Cheat protection (no self-cheering, 1 coffee per teammate per card), procedural Web Audio pop sound synthesis, floating steam particle animations (`~ ♨ ~`), real-time in-app and Pusher notifications, and member workspace coffee metrics.

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/lib/kanban/coffee-cheers.ts`: Core helper logic for normalizing cheers data, 100% anti-cheat validation, updating JSON privateCoins, and calculating member total coffee statistics.
  - `src/lib/kanban/coffee-cheers.test.ts`: Vitest suite (9 tests) verifying anti-cheat edge cases, single cheer per user, and member statistics aggregation.
  - `src/app/api/cards/[cardId]/coffee/route.ts`: Secure API endpoint (`POST`, `GET`) with authentication, project/board authorization checks, anti-cheat validation (403 for self-cheer, 400 for duplicate cheer or non-DONE status), notification generation, and Pusher broadcast.
  - `src/components/kanban/coffee-cheers-button.tsx`: UI component with interactive states, procedural sound, steam particle animation, optimistic updates, and contextual anti-cheat tooltips.
  - `src/components/kanban/coffee-cheers-button.test.ts`: Component integration tests (4 tests) verifying DONE exclusivity, anti-cheat wiring, sound synthesis, and metric display.
  - `docs/agent-notes/2026-09-27-done-coffee-cheers.md`: Session documentation note.
- **Modified**:
  - `src/lib/sound.ts`: Added `playCoffeePopSound()` using Web Audio API frequency sweep (320Hz -> 740Hz -> 260Hz) with zero external assets.
  - `src/components/kanban/card.tsx`: Mounted `CoffeeCheersButton` in both Compact and Comfortable views when `card.status === "DONE"`. Updated memoization check `areCardPropsEqual` to compare `card.privateCoins` and `onSaved`.
  - `src/components/notifications/notifications-popover.tsx`: Added amber coffee badge styling and `Coffee` icon for `COFFEE_CHEER` notifications.
  - `src/app/(dashboard)/project/[id]/members/page.tsx`: Added query for project DONE cards and calculated `totalCoffees` per member using `calculateMemberTotalCoffees`.
  - `src/components/project/project-members-view.tsx`: Added `totalCoffees` to `ProjectMemberData`, added Total Coffees KPI metric card, and added coffee cheers badge to each member row.

## Important Behavior Changes
- The coffee button `☕` is rendered exclusively on cards located in the DONE column / status.
- Anti-Cheat: Card assignees cannot cheer their own completed tasks (self-cheering forbidden with 403 on API and explanatory tooltip on UI).
- Teammates can cheer each completed card exactly once.
- Clicking the coffee button plays a Web Audio pop sound, spawns a floating steam animation (`~ ♨ ~`), sends an optimistic update, delivers an in-app notification to card assignees, and broadcasts live sync events via Pusher.
- The Project Members page displays a "Total Coffees" KPI metric card and displays each member's total earned coffee cheers next to their role badge.

## Database / Schema Changes
- None. Extra card data is stored cleanly inside the existing `card.privateCoins` JSON field without requiring schema migrations.
- In-app notifications reuse the existing `Notification` model with `type: "COFFEE_CHEER"`.

## Verification Commands Run & Results
- `npx vitest run`: Passed (69 test files, 339 tests passed).
- `npx prisma validate`: Schema is valid.
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npm run build`: Production build completed successfully (all pages compiled and optimized).

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for deployment. Pusher credentials in `.env` are picked up automatically for multi-user real-time sync.
