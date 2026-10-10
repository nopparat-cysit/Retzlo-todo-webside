# 2026-10-10 — Interactive login mixtape

Objective: implement the approved purple cassette login direction with a restrained board preview and live interactions.

Files: created `src/components/auth/login-scene.tsx`, `src/components/auth/login-scene.module.css`, `public/images/login-mixtape.png`; modified `src/app/(auth)/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/components/help/help-center-client.tsx`, `docs/system-guide.md`, `docs/theme-system.md`; created this note.

Behavior: dedicated login scene, pointer parallax, local-only clickable board preview, visual player toggle without audio, show/hide password, accessible error/loading states and mobile compact hero. Preserved credentials/session/remember-account/callback logic. Demo interactions only update ephemeral presentation state; no project CUD action is introduced. Reduced-motion preference disables decorative animation.

Database/schema: none. Shared primitives/tokens: unchanged; impact scoped to `/login` and its form. Artwork and decorative preview palette are documented brand exceptions.

Verification:
- `npm run lint`: passed with no warnings/errors after correcting the initial form replacement parser error.
- `npm run build`: passed, 38/38 static pages generated. Initial build failed on the same parser error; corrected and rerun successfully. Existing Next configuration skips build-time lint/type checks, so lint and TypeScript were run independently.
- `npx prisma validate`: passed.
- Focused Vitest: auth navigation, remembered account, login identifier, Help integration and theme contracts: 5 files / 33 tests passed, rerun after the form repair.
- `npx tsc --noEmit --incremental false`: failed with 7 errors in unchanged files: `src/app/api/cards/route.ts` (argument count), `src/components/kanban/board-attributes-tab.tsx` (missing dot property), and `src/components/kanban/card-modal.tsx` (missing updatedAt property). No errors reported in changed login files. An earlier concurrent attempt failed on generated `.next/types` files being replaced during build; final attempt ran after build completion.
- Temporary Playwright script outside repository, installed Edge, local production server: passed demo card cycle, Enter/Space keyboard operation and focus preservation, player toggle, password visibility/value retention, bounded parallax, reduced motion, image loading, mobile overflow and no page errors. Verified pending/error/recovery using an intercepted sign-in response; no real sign-in credentials were submitted.
- Visually inspected desktop 1440x1000 and mobile 390x844 screenshots in light and dark; dark root theme explicitly asserted. Screenshots are outside the repo in the chat visualization directory.
- In-app browser automation failed to initialize because of sandbox setup errors; bundled Playwright with installed Edge completed verification instead. Authorized workspace writes used the host shell after sandbox write/process failures.

Follow-ups: existing Cards/Kanban TypeScript errors remain outside this change. Local production preview is running on port 3100; no deployment performed. Demo interactions do not persist data or require project CUD confirmations/toasts.

## Same-day refinement after visual feedback
- Changed `login-scene.tsx` and `login-scene.module.css`: smaller floating task preview with active status indicators instead of three miniature columns, larger typography and controls, centered form column, brighter artwork and clearer spacing. Mobile breakpoint adjusted to 760px.
- Updated Help copy, system guide and theme log. No authentication, schema or shared primitive/token changes.
- Refinement verification: `npm run lint` passed; `npx prisma validate` passed; focused Vitest passed 5 files / 33 tests; `npm run build` passed with 38/38 generated static pages. The first build attempt hit a Windows Prisma DLL lock from the preview process; stopped only the preview process started by this chat, then rebuilt successfully and restored port 3100.
- Re-ran the temporary Playwright checks successfully: mouse/keyboard card cycle and focus, player, password visibility, parallax, reduced motion, pending/error mocked sign-in feedback, image load, desktop/mobile light/dark, no horizontal overflow or page errors. Visually inspected updated desktop light/dark and mobile light screenshots.
- Existing unrelated project-wide TypeScript errors documented above remain; no new type-heavy behavior was introduced by this refinement.

## Same-day playful background refinement
- Objective: make the login background feel lighter and friendlier after feedback that the city artwork looked too serious.
- Files: added `public/images/login-mixtape-playful.png`; modified `login-scene.tsx` image source/alt, `login-scene.module.css` artwork background/overlays, Help copy, system guide and theme log. Original artwork retained as a separate version.
- Behavior: flat illustrated cassette, soft purple/pink gradient and pixel clouds replace the realistic city scene. Authentication, demo interactions, layout and shared theme tokens unchanged. Database/schema: none.
- Verification: `npm run lint` passed; `npx prisma validate` passed; focused auth navigation/Help/theme Vitest passed 3 files / 28 tests. Production build passed with 38/38 generated static pages, then passed again after the final crop/mobile-overlay adjustment.
- Temporary Playwright checks passed again after the final build: new image loaded, card mouse/keyboard cycle, player, password visibility, parallax, reduced motion, mocked sign-in pending/error, desktop/mobile light/dark, no horizontal overflow or page errors.
- Visually reviewed desktop light/dark and mobile light previews; set artwork alignment to top and strengthened the mobile left overlay for white copy. Decorative player text/icon colors follow the new pastel background.
- Preview restored on port 3100. No deployment, schema change, or real credential submission. Earlier unrelated whole-project TypeScript errors remain documented above.

## Shared login/register/forgot-password design
- Objective: apply the approved login theme to the three requested authentication pages.
- Modified: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/components/auth/login-scene.tsx`, `src/components/auth/login-scene.module.css`, `src/components/auth/register-form.tsx`, `src/components/auth/forgot-password-form.tsx`, Help component, system guide and theme matrix/log. Created `src/components/auth/mixtape-field.tsx`.
- Shared scene export is now `MixtapeAuthScene` with typed mode-specific form copy/footer; decorative demo/player behavior is reused on all three routes. Registration/recovery fields match login; registration adds password visibility controls. Completion toasts added for existing registration/recovery actions. API payloads, password matching/minimum length and navigation destinations retained.
- No schema/database or global token changes. Shared impact is restricted to the three requested auth routes. Reset-password and invitation layouts are outside this change.
- Verification: `npm run lint` passed; `npx prisma validate` passed; focused Vitest passed 7 files / 42 tests. Initial production build failed with ENOSPC (drive full). Removed only the verified project-local generated `.next/cache/webpack` directory. Retried `npm run build` with webpack disk caching temporarily disabled in `next.config.mjs`; build passed, 38/38 static pages generated. Original configuration was restored exactly in `finally`; `git diff -- next.config.mjs` is empty. Free disk space remains limited; future cached builds may require additional user-managed cleanup.
- Browser verification passed for all three routes: 12 desktop/mobile light/dark screenshots; image loads; no overflow/page errors; shared demo/player controls; registration show/hide passwords, mismatch blocking and mocked payload/pending/error/retry; recovery payload/pending/error and mocked success navigation to the existing OTP step. No real account was created and no recovery email was sent.
- Visually reviewed registration and recovery desktop light and mobile dark previews. Mobile registration stacks fields and scrolls naturally. Preview restored on port 3100.
- Independent `npx tsc --noEmit --incremental false` completed with the same 7 existing Cards/Kanban errors listed above; no errors reported in the shared auth files. `git diff --check` passed. No final `next.config.mjs` changes.

## Subtle Play/Pause effects
- Objective: add a little visual response when the user presses Play, without making the page busy.
- Modified shared scene/CSS, Help copy, system guide and theme log. The three auth routes inherit slow ambient glow, two desktop-only drifting notes and a subtle player halo. Pause clears the effects; reduced motion keeps only a faint static glow. No audio, API or schema changes.
- Verification: lint and Prisma validate passed; focused auth/Help/theme Vitest passed 3 files / 28 tests. Production build passed (38/38 static pages) with webpack disk cache temporarily disabled due to limited space; original config restored, no next.config.mjs diff. Browser checks passed on all three routes: effects start only on Play, Pause clears animations, desktop light/dark screenshots, mobile notes hidden/no overflow, reduced motion has zero running animations, no audio/video or page errors. Initial browser assertion used exact animation names; corrected for CSS Modules-generated names and reran successfully. Visually inspected the playing light preview. git diff --check passed. Preview restored on port 3100.

## Auth logo refinement
- Objective: match the auth logo to the playful cassette theme.
- Created public/images/retzlo-mixtape-mark.svg; modified shared auth scene/CSS, system guide, Help copy, theme log and this note.
- Replaced the asterisk with a crisp pastel cassette beside the lowercase Retzlo wordmark on all three auth routes; added an accessible home-link label and keyboard focus outline. Mobile mark scales down. No schema, auth behavior, global token or other logo changes.
- Verification: npm run lint and npx prisma validate passed. npm run build passed (38/38 static pages), with disk caching temporarily disabled and original next.config.mjs restored exactly. Existing auth/Help/theme tests passed (3 files, 28 tests). The first test launch approval review timed out; the permitted retry passed. Browser checks passed for all three auth routes in desktop/mobile light/dark: SVG loaded, home destination, keyboard focus outline, responsive dimensions, no horizontal overflow or page errors. Visually inspected desktop light and mobile dark screenshots. git diff --check passed. Preview restored on port 3100.

## Idle logo animation
- Objective: animate the logo automatically without needing hover or Play.
- Created src/components/auth/mixtape-logo-mark.tsx; modified shared scene/CSS, Help, system guide, theme log and this note. Static SVG asset retained.
- Small cassette floats 3px/tilts 2 degrees over six seconds; reel spokes rotate over ten seconds. Wordmark stays still, hover/focus pauses the logo, reduced motion disables animations. Shared across the three auth routes; independent of player state. No database/schema or auth changes.
- Verification: npm run lint, npx prisma validate and the existing auth/Help/theme tests passed (3 files, 28 tests). npm run build passed (38/38 static pages) with disk caching temporarily disabled; original next.config.mjs restored. Browser checks passed on all three routes at desktop/mobile sizes in light/dark: idle movement starts without Play, wordmark remains still, hover/focus pauses, reduced motion disables logo animations, no overflow or page errors. git diff --check passed. Preview restored on port 3100.

## Registration navigation layout shift
- Objective: stop the artwork/frame jumping when switching from login to registration.
- Measured registration enlarging the desktop frame by 26–100px, moving its centered top edge. Mobile recovery also centered differently when shorter than the viewport.
- Modified shared auth CSS, Help, system guide, theme log and this note. Desktop routes now use a common viewport-responsive frame height and scrollable form panel with stable scrollbar gutter; mobile stays top-anchored with natural page scrolling.
- No schema, API, palette or global-token changes. Verification: lint, Prisma validate and focused auth/Help/theme tests passed (3 files, 28 tests). Production build passed (38/38 static pages) with temporary disk-cache disabling; original config restored. Browser checks passed across six viewport sizes in light/dark, including actual login/register/recovery link clicks: stable hero and desktop frame bounds, mobile top alignment, registration mismatch error retains geometry, reachable fields and no overflow/page errors. The initial error-state assertion compared viewport coordinates after the browser scrolled to a button; corrected to document coordinates and reran successfully. Visually inspected desktop registration error screenshot. git diff --check passed; preview restored on port 3100.
