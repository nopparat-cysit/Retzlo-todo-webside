# 2026-10-04 — Project Members Page Redesign, Role Management & Skeleton Loading

## Objective
Redesign the Project Members view (`/project/[id]/members`) into a clean, modern, tabbed workspace hub with presence indicators, interactive role management (promotion/demotion for owners), dedicated invite modal with shareable link generator, and instant Next.js streaming skeleton loading.

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/app/(dashboard)/project/[id]/members/loading.tsx`: Streaming loading state for `/project/[id]/members`.
  - `docs/agent-notes/2026-10-04-project-members-redesign.md`: This work note.
- **Modified**:
  - `src/app/api/projects/[id]/members/route.ts`: Added `PATCH` handler for workspace owners to update member roles (`OWNER` ↔ `MEMBER`) with single-owner safeguards.
  - `src/components/ui/skeleton.tsx`: Added `MembersSkeleton` component matching the redesigned layout with Retro Lofi shimmering animations.
  - `src/components/project/project-members-view.tsx`: Overhauled from cramped 2-column layout to a 3-tab architecture (`members`, `invitations`, `roles`) with presence indicators, role switcher dropdown, interactive metric cards, and dedicated `AppModal` invite dialog. Preserved test contracts for `coffee-cheers-button.test.ts`.
  - `docs/theme-system.md`: Added dated entry for Project Members redesign and skeleton loading.
  - `docs/system-guide.md`: Updated Section 2.9 to document the new tabbed layout, presence indicators, role switching, invite modal, and skeleton loading.
  - `src/components/help/help-center-client.tsx`: Updated in-app knowledge base topic `roles-and-security` with new members features.

## Important Behavior Changes
- **Tabbed Layout**: Replaced the previous 2-column squeezed layout with three dedicated tabs:
  1. `สมาชิกในทีม (Members)`: Member directory with search filter by name or email, role badges, presence dots, join dates, and coffee counts.
  2. `คำเชิญรอดำเนินการ (Invitations)`: Pending invitation management with expiration tags, direct link copy, and revoke action.
  3. `สิทธิ์และการเข้าถึง (Roles & Permissions)`: Detailed permissions matrix comparing Owner vs Member capabilities.
- **Role Switcher for Owners**: Project owners can now promote members to Owner or demote owners to Member directly from the member row. Includes `ConfirmModal` safety dialog and server-side checks preventing demoting the only owner.
- **Dedicated Invite Modal**: Clicking "Invite Teammate" opens an `AppModal` where the inviter can select the prospective member's role (`MEMBER` or `OWNER`), generate an invitation token, and copy the shareable link with one click.
- **Presence Indicators**: Displays `Online` (green), `Busy` (amber), and `Offline` (gray) presence status dots on user avatars based on `user.status`.
- **Interactive Metric Cards**: Top summary cards (`Total Members`, `Active Now`, `Owners`, `Pending Invitations`, `Total Coffees`) are now clickable filters/tab switchers.
- **Instant Loading**: Added `MembersSkeleton` and `loading.tsx` to prevent blank screen transitions when navigating to `/project/[id]/members`.
- **Compliance & Tests**: Adheres to `AGENTS.md` requiring `ConfirmModal` on mutations and success/error Toasts. Preserves all static text contracts checked by `coffee-cheers-button.test.ts` (`Total Coffees`, `totalCoffeesCount`, `member.totalCoffees`).

## Database / Schema Changes
- None (used existing `ProjectMember`, `ProjectInvitation`, and `User.status` Prisma schema models).

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/coffee-cheers-button.test.ts`: **PASSED** (4 tests passed).
- `npx tsc --noEmit`: **PASSED** (0 errors).
- `npm run lint`: **PASSED** (0 warnings, 0 errors).
- `npx prisma validate`: **PASSED** (schema is valid).
- `npx vitest run`: **84/85 PASSED** (423 tests passed; only external `engine.test.ts` failed due to third-party DeepSeek 402 payment balance).
- `npm run build`: **PASSED** (compiled successfully, all 36 routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
- No blockers.
- Ready for deployment to production.
