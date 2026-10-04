# Work Note: Jira-style Master-Detail Project Settings Sidebar Layout

**Date:** 2026-10-04  
**Topic:** Rebuild Project Settings (`/project/[id]/settings`) into a Master-Detail Left Sidebar Layout inspired by Jira Space Settings & Linear.

---

## 1. Objective
Transform the legacy single-column horizontal tab bar on the Project Settings page into a clean, modern **Master-Detail Left Sidebar Navigation** inspired by Jira's Space Settings (as referenced in `media_1791097036765.png`).

Key improvements include:
- Left sticky sidebar with Space Identity Badge, quick back link to board, and categorized navigation menu.
- Four distinct functional groups: **General** (`identity`, `access`), **Workflow** (`boards`, `attributes`), **System & Privacy** (`features`, `preferences`), and **Overview** (`all`).
- New **Access & Team** overview tab showing member roster, role badges, access policy, and a direct action button linking to `/project/[id]/members`.
- New **Card Attributes & Types** overview tab outlining status lifecycles (TODO, DOING, WAITING, DONE), priority matrix (P0–P4), estimation scales (Fibonacci, T-Shirt, Linear), and card features.
- Mobile adaptive folding into horizontal scrollable pills below the `lg:` breakpoint.
- Full theme consistency across Light and Retro Lofi Indigo Dark modes.

---

## 2. Files Created, Modified, Deleted, or Moved

- **Modified:**
  - `src/components/project/project-settings-client.tsx`: Implemented Master-Detail sidebar layout, Space Identity card, categorized nav groups, `access` and `attributes` tabs, and responsive layout.
  - `src/components/help/help-center-client.tsx`: Updated the Settings Hub guide in the in-app Help Center (`/help`) with the new layout specifications and tab mappings.
  - `docs/system-guide.md`: Updated Section 2.11 with the Jira-style Space Settings architectural documentation.
  - `docs/theme-system.md`: Appended dated change log entry for design system tracking.
- **Created:**
  - `src/components/project/project-settings-client.test.ts`: Vitest test suite ensuring layout integrity, tab definitions, category groups, links, and component mounting.
  - `docs/agent-notes/2026-10-04-jira-style-project-settings-sidebar.md`: This work session note.

---

## 3. Important Behavior Changes

- **Navigation Structure:** The tabs are now grouped into structured categories (`General`, `Workflow`, `System & Privacy`, `Overview`) rather than an unorganized single row of horizontal pills.
- **Active Pill Indicator:** Active menu items now feature an accent indicator bar on the left edge (`before:w-1 before:bg-indigo-600 dark:before:bg-dusk-lavender`) mimicking Jira and Linear.
- **Back to Board Quick Link:** Added `← Back to board` at the top of the sidebar for immediate return to work without extra navigation steps.
- **Team Access Overview:** Added direct visibility into who has access to the space and their roles, with a clear CTA to full member management.
- **Card Attributes Overview:** Added visual reference of the project's statuses, priority scale, and story points presets with a button to manage board columns.
- **Deep Linking:** Full backward and forward compatibility with URL search params (`?tab=identity`, `?tab=access`, `?tab=boards`, `?tab=attributes`, `?tab=features`, `?tab=preferences`, `?tab=all`).

---

## 4. Database / Schema Changes

- None required. All data used is sourced from the existing `Project`, `Board`, `ProjectMember`, and `User` models.

---

## 5. Verification Commands & Results

1. **Vitest Unit Tests:**
   ```bash
   npx vitest run src/components/project/project-settings-client.test.ts
   ```
   *Result:* PASSED (6 tests passing).

2. **ESLint:**
   ```bash
   npm run lint
   ```
   *Result:* PASSED (0 warnings, 0 errors).

3. **Prisma Validate:**
   ```bash
   npx prisma validate
   ```
   *Result:* PASSED (`The schema at prisma\schema.prisma is valid 🚀`).

4. **Production Build:**
   ```bash
   npm run build
   ```
   *Result:* PASSED (`✓ Compiled successfully`, `✓ Generating static pages (38/38)`).

---

## 6. Known Follow-ups, Blockers, or Deployment Notes

- None. The feature is self-contained, fully typed, responsive, and tested.
