# STOP_CONDITIONS — NexArtWO

The agent must stop if:

- SQL execution is needed.
- Schema change is needed.
- Supabase URL/config must change.
- Auth/RLS is involved.
- Investor Hub must be enabled.
- Financial formulas must change.
- Historical data might be affected.
- The task requires files not allowed in `CURRENT_TASK.md`.
- The function to change cannot be identified.
- A broad refactor seems necessary.
- Instructions conflict.
- The bug cannot be reproduced.
