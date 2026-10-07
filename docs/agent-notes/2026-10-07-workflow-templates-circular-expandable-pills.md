# Work Note: Workflow Templates Circular Expandable Pill Redesign

**Date**: 2026-10-07  
**Objective**: Redesign the Workflow Templates selector in Board Settings (Statuses, Priorities, and Story Points) from wide pills into compact circular icon-only buttons that smoothly expand to the right on hover, and freeze in the open expanded state when selected until changed.

---

## 1. Files Modified
- [`src/components/kanban/board-attributes-tab.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/board-attributes-tab.tsx):
  - Refactored Status Workflow Templates (`allTemplates.map`):
    - Converted to `h-8 rounded-full p-1` circular pills (32px × 32px) showing only the category icon by default.
    - Added CSS transitions (`transition-all duration-300 ease-out overflow-hidden`) on the inner label wrapper (`max-w-0 opacity-0` -> `max-w-[260px] opacity-100` on hover or selection).
    - Preserved expanded state permanently for active preview templates (`isSelected`), displaying full name, count badge, and `Eye` indicator icon until deselected or switched.
  - Refactored Story Point Templates (`allPointTemplates.map`):
    - Applied identical circular expandable pill UX with amber theme accents.
- [`src/components/kanban/board-priorities-tab.tsx`](file:///c:/Users/Nopparat/Documents/Todo/src/components/kanban/board-priorities-tab.tsx):
  - Refactored Priority Templates (`allTemplates.map`):
    - Applied identical circular expandable pill UX with rose theme accents.

---

## 2. Important Behavior Changes
- **Space-Saving & No Horizontal Overflow**: In default state, all 6-8 template buttons collapse into compact 32px circular buttons, fitting comfortably in a single row without horizontal scrollbars on desktop and tablets.
- **Smooth Expand-on-Hover**: Hovering over an unselected template button smoothly expands horizontally to the right, revealing its title and count badge.
- **Sticky Active State**: The currently selected/previewing template stays frozen in its expanded open state, providing persistent visual context of the active workflow template.

---

## 3. Database / Schema Changes
- None (pure UI/UX interaction polish).

---

## 4. Verification Commands & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (10/10 tests).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Valid.
- `npm run build`: Passed (all 38 routes generated successfully).
