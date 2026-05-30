# AGENT_OPERATING_SYSTEM — NexArtWO

## Why this exists

AI agents often create regressions because they infer too much context, edit too many files, and do not preserve project memory.

This system forces:

- clear task boundaries
- short plan before coding
- protected file rules
- memory updates
- QA gates
- stop conditions

## Standard loop

1. Read rules.
2. Read project state.
3. Read current task.
4. Read module spec.
5. Produce plan.
6. Wait for confirmation.
7. Edit minimally.
8. Validate.
9. Update memory.
10. Stop.

## No free exploration

Agents may inspect code, but they must not change code outside the active task.
