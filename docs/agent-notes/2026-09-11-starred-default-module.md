# 2026-09-11 - Starred Default Module

## Objective

Allow users to star (★) a workspace module on the Module Selector (`/select-module`) so that upon visiting the website (`/`) or completing login, they are automatically routed directly to their preferred module.

## Files changed

- Added `src/lib/modules/default-module.ts`
- Added `src/lib/modules/default-module.test.ts`
- Added `src/components/modules/module-selector.test.ts`
- Modified `src/components/modules/module-selector.tsx`
- Modified `src/app/(marketing)/page.tsx`
- Modified `src/components/auth/login-form.tsx`
- Modified `src/app/(auth)/login/page.tsx`
- Modified `src/components/auth/register-form.tsx`
- Modified `src/app/(auth)/register/page.tsx`

## Behavior changes

- **Star Toggle on Module Cards**: Added an interactive Star (★) button on each available module card in `ModuleSelector`.
  - Clicking the star on an unstarred module sets it as the default startup module with an amber glowing star and a `"★ Default"` status badge.
  - Clicking the star on the active default module unstars it (clears default).
  - Star click event is isolated with `e.stopPropagation()` so it does not trigger module card navigation.
  - Displays instant toast feedback on star (`"{Module}" set as default startup module!`) and unstar (`Removed "{Module}" as default startup module`).
- **Storage Strategy**: The default module ID is persisted in browser `localStorage` (`retzlo:default-module`) and synchronized to a cookie (`retzlo_default_module`), providing instant client-side retrieval and server-side SSR awareness.
- **Auto-Navigation on Website Entry**:
  - When an authenticated user visits the website root (`/`), if a default module is set, they are automatically forwarded to that module's workspace route (e.g. `/projects` for TODO, `/finance` for FINANCE, `/hub` for VITAL, `/office` for OFFICE).
  - Marketing page CTA buttons ("Enter Workspace" and "Get Started Now") automatically navigate to the user's default module if configured.
- **Direct Redirection on Login & Registration**:
  - After logging in or registering, if no specific `callbackUrl` was requested, the user is forwarded directly to their starred module instead of having to select a module every time.
- **Module Switcher Protection**:
  - Direct visits to `/select-module` (such as via the "Switch Module" option in the user profile menu) continue to display the full module picker so the user can easily switch modules or change/remove their default star.

## Database/schema changes

- None.

## Verification

- `npx vitest run src/lib/modules/default-module.test.ts src/components/modules/module-selector.test.ts` passed (9/9 tests).
- `npx vitest run` passed (44 test suites, 149/149 tests passed).
- `npx prisma validate` passed (schema is valid).
- `npm run lint` passed (0 warnings, 0 errors).
- `npm run build` passed (50 static/dynamic routes compiled successfully).

## Follow-ups

- None.
