# PROTECTED_AREAS — NexArtWO

## Critical

- `js/supabase.js`
- `supabase/**`
- `sql/**`
- Auth/RLS
- Investor Hub
- financial formulas
- historical financial records

## High risk

- `js/app.js`
- `js/projects.js`
- project financial UI
- work order/project relationship
- client data integrity

## Rule

If a task touches protected areas, stop and ask for approval.
