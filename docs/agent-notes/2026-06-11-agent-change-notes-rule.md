# Agent Change Notes Rule

Date: 2026-06-11

## Objective

Add an agent workflow rule requiring Markdown notes for every work session that creates, deletes, edits, renames, moves, or materially changes files.

## Files Changed

- Modified `AGENTS.md`
- Created `docs/agent-notes/2026-06-11-agent-change-notes-rule.md`

## Behavior Changes

- Future agents must write or update a Markdown note in `docs/agent-notes/` whenever they make project changes.
- Notes must include changed files, behavior changes, schema/database changes, verification, and known follow-ups.
- Notes must not include secrets or full environment variable values.

## Database Or Schema Changes

- None.

## Verification

- Not run. This change only updates repository instructions and documentation.

## Follow-Ups

- Future implementation work should create its own note file under `docs/agent-notes/`.
