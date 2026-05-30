# SAFE_REFACTOR_POLICY — NexArtWO

## Refactor rule

No broad refactor until the current behavior is mapped and protected.

## Safe refactor steps

1. Document current function.
2. Create/define manual tests.
3. Extract one small function.
4. Verify no behavior change.
5. Commit.
6. Continue only with next approved step.

## Not allowed

- Rewriting `app.js` or `projects.js` in one pass.
- Moving many functions at once.
- Changing DOM IDs/classes during logic refactor.
- Changing formulas during UI refactor.
