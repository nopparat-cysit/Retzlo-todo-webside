# 2026-06-20 Agent Guide Rules

## Objective

Update the project agent guide with workflow safeguards for design-system changes, generated files, and verification timeouts.

## Files Modified

- `AGENTS.md`

## Behavior Changes

- Added a rule to avoid committing generated files, logs, local caches, and temporary dev-server output.
- Added a rule that timed-out verification must be recorded as timeout/blocker, not as passing.
- Added a rule to document expected downstream impact when shared design-system components or tokens change.

## Database Changes

- None.

## Verification

- Documentation-only change; no runtime verification required.

## Follow-Ups

- Apply these rules to future feature and UI-system work sessions.
