# 2026-07-07 Landing Page Product-First Polish

## Objective

Improve the marketing landing page so the first viewport communicates the actual Retzlo work product and user workflow more clearly.

## Files Modified

- public/brand/retzlo-command-portal-hero.png created

- `src/app/(marketing)/page.tsx`
- `src/app/globals.css`

## Behavior Changes

- Replaced the cluttered hero floating widget cluster with a single Interactive Focus Console preview.\n- Replaced the console preview with a larger Retro Command Portal hero object for a more cinematic brand visual.\n- Replaced the CSS-built portal with generated cinematic bitmap hero artwork referenced from `public/brand/retzlo-command-portal-hero.png`.\n- Replaced the static bitmap hero layer with a code-driven interactive Retzlo portal scene using mouse tilt, live workspace lanes, play/pause state, and animated visualizer bars.\n- Inset and resized the interactive portal to prevent desktop viewport overflow.
- Replaced the portal with a cinematic mascot command scene: mascot-led product cockpit, hologram kanban board, reward orbit, and play-state animation.
- Polished the mascot scene with a clipped projection board, light beams from the mascot toward the board, larger mascot staging, and a circular animated reward orbit.
- Added continuous motion to the hero scene: board float, mascot bob, beam pulse, animated reward ring, glowing cards, and bouncing visualizer bars.

- Updated the hero copy to position Retzlo as calm project workspaces.
- Added the existing product mockup image to the desktop hero as primary product proof, then removed it after visual review feedback.\n- Removed the desktop hero mockup block and restored the hero container to a single-column text layout.
- Updated primary CTA wording from workspace entry language to planning-oriented language.
- Changed navigation labels toward product/workflow/focus.
- Replaced the technical stack marquee copy with a user workflow strip.

## Database/Schema Changes

- None.

## Verification

- `npm run lint` passed.
- `npx prisma validate` passed.
- `npm run build` passed.
- `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` returned HTTP 200 and confirmed the Permissions-Policy header remains present.\n- After removing the hero mockup, `npm run lint`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.\n- After adding the Interactive Focus Console preview, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.\n- After replacing the console preview with the Retro Command Portal, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.\n- After replacing the CSS portal with generated bitmap hero artwork, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.\n- After replacing the static bitmap hero layer with the interactive portal scene, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.\n- After fixing the portal overflow, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.
- After replacing the portal with the cinematic mascot command scene, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.
- After polishing the mascot projection scene, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.
- After adding continuous hero motion, `npm run lint`, `npx prisma validate`, `npm run build`, and `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` passed again.
- In-app browser screenshot verification was attempted, but browser bootstrap failed in the sandbox with an ACL helper error.

## Known Follow-Ups

- Visually review the landing page in browser after build to tune mobile spacing and remaining hero balance.




