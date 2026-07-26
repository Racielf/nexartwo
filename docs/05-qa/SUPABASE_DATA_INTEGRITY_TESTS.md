# SUPABASE_DATA_INTEGRITY_TESTS — NexArtWO

## Rule

Agents may write diagnostic SQL but must not execute it.

## Suggested checks

- Work Orders with missing client_id.
- Work Orders with invalid project_id.
- Financial records with invalid status.
- Approved records missing audit fields.
- Projects with inconsistent summary values.
