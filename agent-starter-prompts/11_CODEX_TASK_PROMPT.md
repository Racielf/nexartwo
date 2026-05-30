# Prompt específico — Codex

Usa Codex solamente con tareas cerradas.

```txt
You are working on NexArtWO.

Read:
- AGENTS.md
- .codex/instructions.md
- memory/CURRENT_TASK.md

TASK:
[one specific task]

ALLOWED FILES:
- [file 1]
- [file 2]

FORBIDDEN FILES:
- js/supabase.js
- sql/
- supabase/
- Auth/RLS
- Investor Hub
- financial formulas
- historical financial records

ACCEPTANCE CRITERIA:
- [criterion 1]
- [criterion 2]

QA STEPS:
- [test 1]
- [test 2]

ROLLBACK PLAN:
- [how to undo]

Before editing, provide a short plan and wait for approval.
```
