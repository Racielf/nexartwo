# PROJECT_STATE — NexArtWO

## Current phase

Phase 0 — Project Control / Agent Stabilization.

## Current objective

Install rules, memory, QA gates, and architecture maps before continuing development.

## Current product direction

NexArtWO is the main operations platform.

Fixflip-style functionality should become a future module called Deal Analyzer, not a separate main app.

## Current risk

The project has useful prototype code but is vulnerable to AI-induced regressions because:

- Large vanilla JS files can hide dependencies.
- Financial logic is sensitive.
- Supabase is live/sensitive.
- Investor Hub and Auth/RLS are future locked areas.
- Agents may over-edit without strict task boundaries.

## Protected areas

- Supabase config
- SQL/migrations
- Auth/RLS
- Investor Hub
- Financial formulas
- Historical financial records
- Large JS files without function-level plan

## Next safest action

Commit this Project Control Pack as documentation only.

## Current active task

See `memory/CURRENT_TASK.md`.
