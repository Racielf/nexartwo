# REGRESSION_PREVENTION — NexArtWO

## Main risk

NexArtWO uses vanilla JS with large shared files. A small change can affect unrelated behavior.

## Prevention checklist

Before editing:

- Identify exact function.
- Search function call sites.
- Identify DOM IDs/classes used.
- Identify shared state variables.
- Confirm allowed files.
- Confirm adjacent modules that may be affected.

After editing:

- Test the changed flow.
- Test one adjacent flow.
- Check browser console.
- Verify mobile if UI changed.
- Update memory.

## Prohibited

- Editing multiple modules at once.
- Renaming globals without full audit.
- Removing fallback behavior.
- "Cleaning up" unrelated code.
- Reformatting entire large files.
