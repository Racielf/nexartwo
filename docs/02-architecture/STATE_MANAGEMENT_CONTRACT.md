# STATE_MANAGEMENT_CONTRACT — NexArtWO

## Purpose

Define how state changes should be handled in vanilla JS.

## Rules

- Keep state explicit.
- Avoid hidden mutations.
- Avoid changing global objects in unrelated functions.
- Avoid introducing duplicate sources of truth.
- After changing state shape, update docs and affected render functions.

## State audit template

```md
State variable:
Defined in:
Read by:
Written by:
Persisted to:
Risk:
```
