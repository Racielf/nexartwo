# GitHub Copilot Instructions — NexArtWO

This is a controlled SaaS/product repo. Do not suggest broad rewrites.

Read:
- `AGENTS.md`
- `memory/CURRENT_TASK.md`

Follow:
- one task only
- minimal diffs
- preserve existing behavior
- no protected files unless explicitly allowed
- no SQL execution
- no financial formula changes without spec

Protected:
- `js/supabase.js`
- `supabase/**`
- `sql/**`
- Auth/RLS
- Investor Hub
- financial formulas
