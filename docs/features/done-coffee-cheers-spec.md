# Feature Spec: DONE Column "Coffee Cheers" ☕

## Concept Overview
Instead of traditional high-pressure competitive leaderboards (which cause toxic team dynamics, task inflation, and demotivation), Retzlo introduces **"Coffee Cheers" ☕** — a warm, peer-to-peer appreciation mechanic embedded directly into completed tasks.

---

## The UX & Interaction Design

### 1. Zero-Clutter Placement
- Active WIP columns (Backlog, In Progress, Review) remain 100% clean and distraction-free.
- The Coffee Cheers button appears **only on cards located in columns with status `DONE`**.
- Transforms the "Done" column from a stale, faded graveyard of dead cards into a cozy space of shared team celebration.

### 2. Core Interaction Rules
1. **The Coffee Button:**
   - Displayed as a cute retro coffee cup badge: `☕ {coffeeCount}` on the card footer or top-right corner.
   - Distinct retro aesthetic matching the warm Lo-Fi theme.
2. **Anti-Cheat by Design (Cannot Self-Farm):**
   - The card's assignee(s) **cannot** click the coffee button on their own card.
   - For assignees, the button is disabled with a friendly tooltip: *"You completed this task! Teammates can buy you a coffee to celebrate ☕"*
   - Teammates in the workspace can click the coffee button to "toast / cheer" the assignee (limited to 1 coffee per teammate per card).
3. **Delightful Micro-Interaction:**
   - On click, a subtle retro steam animation (`~ ♨ ~`) or rising coffee bean floats up.
   - Plays a satisfying tactile sound effect.
   - The counter updates instantly (Optimistic UI + Pusher WebSocket broadcast in ~50ms).
4. **Real-Time Notification:**
   - The assignee receives a real-time notification:
     `💬 @[Teammate] bought you a coffee ☕ for finishing "[Task Title]"!`
5. **Profile / Member Hall of Fame:**
   - Each member accumulates **"Total Coffees Received ☕"** displayed on their profile card in the Project Members directory.
   - Represents genuine peer gratitude and team helpfulness, not raw task count.

---

## Business & SaaS Value
- **Strengthens the Brand Personality:** Cozy, focused, nostalgic, and supportive (aligns perfectly with `PRODUCT.md`).
- **Eliminates Goodhart's Law Flaws:** Avoids people rushing easy tasks or gaming points.
- **Natural Viral & Retention Hook:** People love receiving unexpected appreciation from their peers.
