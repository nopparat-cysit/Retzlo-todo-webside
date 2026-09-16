# 2026-09-15 Functional Member Invitations with In-App Notifications, Email Delivery & Confirmation Modal

## Objective
Implement a complete and robust member invitation workflow:
1. When inviting a teammate, check if they exist as a registered user and automatically dispatch an in-app `PROJECT_INVITATION` notification.
2. Send an HTML invitation email via `nodemailer` with a direct call-to-action button ("เข้าร่วมโครงการ (Accept Invitation)").
3. Connect the topbar `Bell` icon to an interactive `NotificationsPopover` with an unread badge, allowing users to view pending invitations and accept them in 1 click.
4. When clicking an invitation link (from email or notification), present an interactive `InvitationConfirmModal` to confirm project joining intent before adding the member and redirecting to the Kanban board.

## Files Created
- `src/components/notifications/invitation-confirm-modal.tsx`: Reusable confirmation modal presenting project name, role, inviter avatar/name, and explicit Accept/Decline action buttons with toast feedback.
- `src/components/notifications/notifications-popover.tsx`: Topbar notification popover with real-time polling, unread counter badge, mark-as-read, and project invitation review/accept actions.
- `src/components/notifications/invitation.test.ts`: Unit tests verifying `InvitationConfirmModal` modal portal, accessible dialog roles, and `NotificationsPopover` triggers.
- `src/lib/mail.test.ts`: Unit tests for `sendProjectInvitationEmail` ensuring graceful fallback when SMTP is not configured.

## Files Modified
- `src/lib/mail.ts`: Added `sendProjectInvitationEmail` with a Retro Lo-Fi styled email template and direct acceptance button.
- `src/app/api/projects/[id]/invite/route.ts`: Integrated duplicate member check, in-app `Notification` creation for existing users, absolute URL construction, and asynchronous email dispatch.
- `src/app/api/auth/accept-invitation/route.ts`: Added `GET` endpoint for fetching invitation metadata without accepting, and updated `POST` & `DELETE` to manage `ProjectMember` records and mark notifications as read.
- `src/app/api/notifications/route.ts`: Enriched `GET` response with live invitation details for `PROJECT_INVITATION` notifications.
- `src/components/auth/accept-invitation.tsx`: Updated page to query invitation metadata via `GET` and render the `InvitationConfirmModal`.
- `src/components/project/invite-form.tsx`: Enhanced feedback toast upon invitation creation.
- `src/components/project/project-shell.tsx`: Connected topbar notification bell to `<NotificationsPopover />`.
- `src/components/project/projects-dashboard.tsx`: Added `<NotificationsPopover />` in dashboard header.

## Database / Schema Changes
- None (100% existing Prisma schema utilized, zero migrations).

## Verification Commands Run & Results
- `npx vitest run`: Passed (51 test files, 189 tests passed, 0 failures).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npm run build`: Passed (31/31 pages compiled and statically generated).

## Follow-ups & Blockers
- None.
