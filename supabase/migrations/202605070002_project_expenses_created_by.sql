-- ============================================================
-- NexArtWO — Schema Patch: project_expenses.created_by
-- Purpose: Prepare project_expenses for Auth/RLS draft 006.
-- Scope: Schema-only. No RLS policies applied.
-- Safety: Non-destructive, idempotent.
-- ============================================================

-- Required by supabase/drafts/auth-rls/006_rls_expenses_refunds.sql
-- Allows field_user scoped policies later:
--   field_user can only access expenses where created_by = auth.uid()

ALTER TABLE project_expenses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE project_expenses
  ALTER COLUMN created_by SET DEFAULT auth.uid();

COMMENT ON COLUMN project_expenses.created_by IS
  'Auth user who created the expense. Required for future Auth/RLS scoped access policies.';
