# 2026-09-26: DONE Column "Coffee Cheers" Concept & Anti-Abuse Gamification Spec

## Objective
Document the product design and technical specification for the **"Coffee Cheers" ☕** feature in the DONE column, established during product design discussion with the user.

## Background & Problem
Traditional competitive leaderboards in productivity apps create toxic competition (Goodhart's Law: people split tasks into trivial items to game the score, and heavy task workers are unfairly penalized). Furthermore, standard Kanban Done columns often look faded, muted, and lifeless.

## Solution Concept
- Add a subtle, aesthetic **Coffee Icon Button (`☕`)** exclusively on cards in columns with status `DONE`.
- **Anti-Cheat Rule:** The card assignee cannot click their own card to give themselves coffee. Only other team members can click it (1 coffee per member per card).
- **Gamification & Social Appreciation:**
  - Clicking sends a warm coffee toast with real-time Pusher notification to the assignee.
  - The assignee accumulates "Coffees Received" in their profile.
  - Keeps active WIP columns 100% clean and clutter-free while bringing celebration to completed work.

## Files Created
- `docs/features/done-coffee-cheers-spec.md`
- `docs/agent-notes/2026-09-26-done-coffee-cheers-concept.md`

## Next Steps
- Implement when ready to build the Gamification 2.0 pass.
