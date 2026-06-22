# Calendar Reward-Style Sticker Design

## Objective

Bring the visual language of the Reward page into the project Calendar while preserving fast scanning, current calendar behavior, and the retro lofi indigo design system.

## Visual Direction

- Replace the plain Calendar heading with a compact Reward-style hero panel.
- Show three small summary metrics: items this month, focus days, and completed items.
- Use existing RetroD sticker assets as restrained accents in the hero, Today cell, Upcoming header, and empty state.
- Keep stickers out of ordinary day cells so dense months remain readable.
- Retain the current indigo surfaces, amber highlights, lavender cards, rose notes, and cyan completed state.

## Layout

- Header: use a compact single-row composition, approximately 88-104px tall on desktop. Place title and supporting copy on the left, metrics next, and one sticker at the far right.
- The sticker must remain aligned to the right edge instead of floating below the content. Avoid large empty vertical space.
- Toolbar: date navigation on the left; view mode and filter dropdown on the right.
- Main area: month grid remains the primary surface; Upcoming remains a fixed-width supporting rail.
- Mobile/tablet: hero content wraps into compact rows, the sticker remains right-aligned when space allows, metrics wrap without overlapping text, and the Upcoming rail moves below the calendar.

## Components And Behavior

- Reuse the existing `ProjectCalendar` state, filtering, date-range, card modal, and note modal behavior.
- Add small presentation helpers for calendar metrics and sticker rendering within the calendar feature.
- Derive metrics from the already-loaded filtered calendar entries; do not add API or database work.
- Keep the current Calendar filter dropdown and view controls functional.
- Respect existing scroll containment and avoid increasing the minimum width of day columns.

## Accessibility And Motion

- Sticker images use empty alternative text when decorative.
- Buttons keep existing accessible labels and keyboard behavior.
- Add only subtle entrance/hover motion and respect `prefers-reduced-motion`.
- Do not rely on color alone to distinguish cards, notes, and completed entries.

## Scope

Included: Calendar header, toolbar hierarchy, calendar cell polish, Upcoming rail, empty state, responsive presentation, and restrained animation.

Excluded: calendar data-model changes, drag-and-drop scheduling, new filters, new sticker generation, and changes to Reward UI.

## Verification

- Run `npm run lint`, `npm run build`, and `npx prisma validate`.
- Verify desktop and mobile layouts visually.
- Verify previous/Today/next navigation, view selection, filter dropdown, card opening, note opening, and scroll behavior.
