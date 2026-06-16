---
name: Retzlo Todo & Finance
description: Retro lofi indigo workspace serving tasks, diaries, and ledgers.
colors:
  background: "#090817"
  foreground: "#f5efe6"
  dusk-lavender: "#a9a2ff"
  dusk-rose: "#d59ab3"
  dusk-amber: "#e5bd72"
  dusk-cyan: "#89c7d6"
  ink-950: "#080817"
  ink-900: "#0e1025"
  ink-800: "#161936"
  ink-700: "#22264c"
  border: "rgba(245, 239, 230, 0.16)"
  panel: "rgba(29, 26, 55, 0.78)"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  lofi-panel:
    backgroundColor: "{colors.panel}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "16px"
  button-primary:
    backgroundColor: "{colors.dusk-lavender}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "transparent"
    borderColor: "{colors.border}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
---

## Overview
A quiet, cozy, and focused life/work modular platform designed around a retro lofi indigo aesthetic. Spacing and layouts emphasize structured gridlines, scanlines, and soft panel cards, offering a low-strain digital environment.

## Colors
- **Core Neutral Background**: `#090817` (Deep space ink)
- **Primary Text**: `#f5efe6` (Warm oatmeal)
- **Active Accents**:
  - `dusk-lavender` (`#a9a2ff`): Primary action indicators and toggles.
  - `dusk-rose` (`#d59ab3`): Highlights and secondary tags.
  - `dusk-amber` (`#e5bd72`): Warnings, highlights, and budgets.
  - `dusk-cyan` (`#89c7d6`): Info tags and alternative accounts.

## Typography
Uses the **Inter** typeface family.
- Display titles use bold weights with tight letter spacing (`-0.02em`) and clamped scaling.
- Body copy is spaced for reading comfort, utilizing a 65–75ch limit on prose layouts.

## Elevation
No heavy standard drop shadows. Instead:
- Panel surfaces are layered with a thin border (`rgba(245, 239, 230, 0.16)`).
- Visual depth is achieved with backdrop filters (`blur(18px)`) and subtle linear gradients (`linear-gradient(145deg, ...)`).
- Active elements leverage a glowing shadow (`0 0 40px rgba(169, 162, 255, 0.16)`).

## Components
- **Lofi Panels (`.lofi-panel`)**: Used for cards, dashboards, sidebar wrappers. They have an 18px backdrop blur and semi-transparent dark borders.
- **Buttons**:
  - Primary actions: Flat lavender fill with dark ink text.
  - Secondary/Ghost: Transparent background with white/10 border, changing to white/10 background fill on hover.
- **Input Fields**: Thin borders, transparent background, glowing border states on active focus.

## Do's and Don'ts
### Do's
- Use a maximum of `12px` to `16px` border radii on card panels; keep them crisp.
- Apply a subtle `@media (prefers-reduced-motion: reduce)` crossfade fallback for page layout transitions.
- Maintain readable contrast for all text (>= 4.5:1).

### Don'ts
- Do not use bright neon SaaS default components or generic sterile gray designs.
- Do not use side-stripe colored accent borders on cards.
- Do not round cards beyond `16px` or inputs beyond `8px` (no exaggerated pill shapes except for tags).
- Do not combine solid borders with wide fuzzy drop shadows on the same card element.
