# Retzlo Office Module

## Purpose

Office is a project-scoped visual workspace for Retzlo. It should not become the main logic layer of the product.

The core product logic remains in Work, Chat, Tasks, Runs, Reports, Knowledge, Decisions, Approvals, and Routines. Office is a visual layer that helps the user see the same underlying work state as a room, agents, desks, queues, and status movement.

In short:

- Office is a view, not the source of truth.
- Office reads project/work/task state from existing domain data.
- Office should not own business rules that belong to Work, Chat, Tasks, or Reports.
- Office should stay lightweight until the underlying agent/task system is real.

## Current Flow

1. User opens `/office`.
2. The route requires an authenticated session.
3. The page loads projects owned by or shared with the signed-in user.
4. The first screen is the Office project selector.
5. User selects a project and enters `/office?projectId=...`.
6. Office shows a visual room scoped to that project.
7. User can switch projects from the Office room.
8. User can create a new Office project from the Office selector.

## Current Scope

Office currently provides:

- A dedicated `/office` dashboard route.
- A project selector owned by the Office module.
- A lightweight visual office scene using React, Tailwind, and CSS animation.
- A project-scoped Office room view.
- Local Office project creation that posts to `/api/projects` as a `WORK` project.
- No Phaser, Three.js, Pixi, Kaboom, or other heavy game engine.
- No import of project-module UI into Office.

## Design Principle From The Product Direction

The provided product direction says Office should not be a "pixel office with chat" as the main product. It should be an Office View over the same data used by the operational system.

The core system should be:

- Agent
- Workspace / Project
- Thread
- Task
- Run
- Handoff
- Routine
- Report
- Decision
- Approval / Notification
- Knowledge / Memory

Office should visualize those things later, but not replace them.

## Recommended Additions

### 1. Database-unavailable state

Office currently depends on `prisma.project.findMany()` when loading `/office`. If the database is unavailable, the page should show a calm fallback instead of a hard server error.

Recommended behavior:

- Show "Office is waiting for the database."
- Keep the user in the Office shell.
- Offer a retry action or link back to Module Hub.
- Log the database error server-side only.

### 2. Explicit Office data contract

Keep a small typed contract for the data Office is allowed to consume.

Recommended shape:

```ts
interface OfficeProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  updatedAt: string;
  boardId: string | null;
  counts: {
    boards: number;
    members: number;
    notes: number;
  };
}
```

Future Office data should add to this contract deliberately instead of reaching into unrelated module internals.

### 3. Task status to character-state mapping

When the task/run layer exists, Office should map status to visual state.

Recommended mapping:

| Domain Status | Office Visual State |
| --- | --- |
| `QUEUED` | Agent waiting at desk |
| `WORKING` | Agent working |
| `WAITING` | Agent waiting / coffee area |
| `REVIEW` | Agent walking to review |
| `NEEDS_YOU` | Agent shows attention marker |
| `DONE` | Agent returns to desk |
| `FAILED` | Agent shows blocked/error state |

Office should not invent its own statuses.

### 4. Needs You entry point

Office should eventually surface a small "Needs You" area for:

- Approvals
- Decisions
- Missing information
- Blocked tasks
- Failed routines

This should link to the real approval/decision/task screen, not resolve the workflow only inside Office.

### 5. Since You Were Away summary

Office is a good place for a project-scoped summary:

- Tasks completed
- Reports created
- Routines that ran
- Decisions needed
- Failed or blocked work

This should be generated from real report/task/run data once those modules exist.

### 6. Command bar integration

Office should support a fast command layer later:

- Create project
- Switch project
- Open task
- Ask core agent
- Create task
- Open report

This should use a shared command system when available, not an Office-only shortcut system.

### 7. Keep Pixel Office as Phase 6

The visual office should stay simple until the underlying logic exists.

Do not build first:

- Full pixel map
- Free-roaming agents
- Agent-to-agent chat with no task trail
- 20 agent characters
- Complex real-time animation engine

Build first:

- Project selector
- Office room shell
- Data contract
- Status visualization hooks
- Database fallback
- Links to real workflows

## Non-Goals

Office should not:

- Replace Work/Kanban as the task source of truth.
- Replace Chat as the conversation source of truth.
- Store private agent memory.
- Create independent task statuses.
- Import Project module UI directly.
- Become a heavy game runtime before the operational system exists.
- Let agents perform important actions without approval when approval is required.

## Suggested Phases

### Phase 1: Office Selector And Room

- `/office` project selector.
- `/office?projectId=...` room view.
- Create Office project.
- Database fallback.
- Basic project counts and quick links.

### Phase 2: Work State Visualization

- Read task/card/run status from real data.
- Map status to desk/agent visual state.
- Add Needs You summary.
- Add Since You Were Away summary.

### Phase 3: Agent And Thread Awareness

- Show active agent/thread context.
- Link from agent visual state to thread/task detail.
- Show task ownership and handoff trail.

### Phase 4: Routines And Reports

- Show routine runs.
- Show latest reports.
- Show failed routines and pending approvals.

### Phase 5: Knowledge And Decisions

- Show locked decisions.
- Show project knowledge references.
- Show what Office can and cannot access for the selected project.

### Phase 6: Pixel Office Polish

- Richer map.
- Character animation.
- Real-time status movement.
- Optional ambience.

## What Should Be Added Next

The next practical additions for the current codebase are:

1. Add database-unavailable fallback to `/office`.
2. Extract Office project loading into a small helper so it is testable.
3. Add focused tests for the database fallback and selected project behavior.
4. Add a small "Needs You" placeholder section backed by empty state only.
5. Keep Office creation local to Office and do not import Project module UI.

These additions match the product direction without pulling the app into a heavy AI office implementation too early.
