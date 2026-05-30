# ERROR_RECOVERY — NexArtWO

## Purpose

Use this when a change breaks the app or creates unexpected behavior.

## Protocol

1. Stop coding.
2. Record exact error.
3. Identify last modified files.
4. Determine if error is related to current task.
5. Revert or patch the smallest area.
6. Do not refactor.
7. Do not change SQL.
8. Do not touch protected areas.
9. Run manual validation.
10. Document in `memory/BUG_FIX_LOG.md`.

## Error categories

- Build/load error
- Runtime JavaScript error
- DOM selector missing
- Event listener broken
- Supabase read/write error
- Financial calculation error
- Mobile UI regression
- Document/report generation issue

## Emergency rule

If unsure, revert last change and ask.
