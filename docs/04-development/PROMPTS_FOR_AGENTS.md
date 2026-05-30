# PROMPTS_FOR_AGENTS — NexArtWO

## Safe implementation prompt

```md
Read AGENTS.md and memory/CURRENT_TASK.md.

Task:
[one task]

Allowed files:
[list]

Forbidden files:
[list]

Before coding, give:
1. plan
2. files to modify
3. validation steps
4. rollback plan

Wait for my GO.
```

## Bug diagnosis prompt

```md
Diagnose only. Do not edit.

Error:
[paste]

Relevant files:
[list]

Return:
- likely cause
- exact files/functions to inspect
- minimal fix plan
- risk
```

## Repair prompt

```md
Fix only the approved bug.
Do not refactor.
Do not touch protected files.
Return diff summary and QA steps.
```
