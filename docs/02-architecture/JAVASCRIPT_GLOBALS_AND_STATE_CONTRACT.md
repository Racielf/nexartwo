# JAVASCRIPT_GLOBALS_AND_STATE_CONTRACT — NexArtWO

## Purpose

Protect vanilla JavaScript state and global functions.

## Why this matters

In vanilla JS, one global function or variable can be used by multiple UI sections. Changing it without mapping call sites can break unrelated features.

## Before editing any JS

Document:

```md
Target file:
Target function:
Call sites:
DOM IDs/classes used:
State variables used:
Supabase calls:
Financial calculations involved:
Adjacent modules affected:
```

## Rules

- Do not rename global functions without call-site audit.
- Do not change shared state shape unless documented.
- Do not remove event listeners without replacement.
- Do not duplicate functions with similar names.
- Do not convert module patterns without approved refactor plan.
- Do not mix UI polish with state/data refactor.

## Required update

If a new global function is added, update `FUNCTION_INDEX.md`.
