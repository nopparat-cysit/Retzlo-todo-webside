# 2026-10-07 English Localization & Language Switcher (i18n)

## Date & Objective
- **Date:** 2026-10-07
- **Objective:** Implement full English localization across the entire web application, establish a primary English system guide and documentation in both `/help` and `docs/system-guide.md`, and introduce an intuitive bilingual Language Switcher (`EN` / `TH`) with local persistence and real-time DOM synchronization.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `src/lib/i18n/translations.ts`: Central typed bilingual translation dictionary supporting `en` and `th` namespaces (`common`, `nav`, `topbar`, `kanban`, `table`, `ai`, `calendar`, `gamification`, `help`).
  - `src/lib/i18n/language-context.tsx`: Context provider (`LanguageProvider`) and hook (`useLanguage()`) with `localStorage` persistence (`retzlo_language`), defaulting to `"en"` (English first per user request), DOM `html lang` sync, and `retzlo:language-changed` event dispatch.
  - `src/components/ui/language-switcher.tsx`: Polymorphic language selector component supporting compact button pill, dropdown picker, and segmented control styles.
- **Modified:**
  - `src/app/layout.tsx`: Wrapped global tree with `<LanguageProvider>`.
  - `src/components/project/project-shell.tsx`: Integrated `<LanguageSwitcher variant="button" />` in header and updated workspace tooltip to English.
  - `src/components/project/projects-dashboard.tsx`: Added `<LanguageSwitcher variant="button" />` to workspace dashboard header.
  - `src/components/project/user-profile-popover.tsx`: Added language switcher dropdown item alongside theme controls.
  - `src/components/help/help-center-client.tsx`: Fully localized with `TOPICS_EN` and `TOPICS_TH` covering all 15 topics, technical specifications, and interactive sandboxes (AI prompt simulator, Dual Kanban/Table view, 10-level priority pills, Coffee Cheers clicker), while preserving backward-compatible test assertions.
  - `src/components/ui/help-button.tsx`: Added `useLanguage()` bilingual support for menu items, descriptions, and the system info about modal.
  - `src/components/notifications/notifications-popover.tsx`: Localized header labels, empty state, and toast feedback.
  - `src/components/project/project-members-view.tsx`: Localized member management tabs and invite button.
  - `src/components/ui/draft-recovery-modal.tsx`: Localized draft recovery dialogue and action buttons.
  - `src/components/ui/date-picker.tsx`: Added bilingual support for month names, weekdays, and preset shortcut chips.
  - `src/components/ui/time-picker.tsx`: Localized hour/minute headers, preset tags, and clear/confirm actions while retaining test strings.
  - `src/components/kanban/board-list-view.tsx`: Standardized default export title to English.
  - `docs/system-guide.md`: Updated with comprehensive English Master System Guide & Knowledge Base as Section 1-2, followed by the Thai reference in Section 3.

## Important Behavior Changes
- Users can switch the entire platform between English (`EN`) and Thai (`TH`) at any time using the header pill or profile dropdown.
- Defaults to English (`EN`) per user instruction, with preference persisted in `localStorage`.
- All user-facing documentation and help hub pages provide fluent, technical English explanations.
- Zero competitor brand names referenced across UI and documentation.
- Zero API key mentions; native server AI intelligence emphasized.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run`: Passed (90/90 test files, 470/470 passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Verified.

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready for commit and push.
