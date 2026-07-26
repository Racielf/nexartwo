# COST_CONTROL_FOR_AI_AGENTS — NexArtWO

## Rule

Planning is cheaper than repeated failed fixes.

## Use cheaper work for

- Documentation
- QA checklists
- Bug reports
- Scope writing
- Issue creation

## Use expensive agents for

- Architecture decisions
- Hard bug diagnosis
- Financial formula review
- Security/Auth/RLS planning
- Supabase migration planning

## Token-saving method

- Use `CURRENT_TASK.md`.
- Use `CURRENT_REPO_MAP.md`.
- Use function-level prompts.
- Do not ask for broad repository analysis repeatedly.
- Stop after one task.
