-- ============================================================
-- NexArtWO — Migration Phase 2A.2: Minimal Schema Alignment
-- Applied: 2026-06-06
-- Staging:    nexartwo-staging   (switwhrtgcooemaqlmbw) ✅
-- Production: NexArtWO           (udaeifoibydcokefcmbg) ✅
-- ============================================================
-- SCOPE:
--   A. project_investors: fix status default + add capital_commitment
--   B. investor_companies: add address/company contact fields
-- ============================================================
-- SAFETY GUARANTEES:
--   - Does NOT touch: investors, projects, project_expenses,
--     project_refunds, project_disbursements, project_financial_summaries
--   - Does NOT change existing column names
--   - Does NOT touch financial formulas or views
--   - Does NOT touch Phase 1 triggers
--   - All new columns: ADD COLUMN IF NOT EXISTS (idempotent)
--   - All new columns: safe DEFAULT — no existing row is rejected
--   - Existing data rows: not modified
-- ============================================================
-- CANONICAL NAMES adopted (per owner decision 2026-06-06):
--   investors.address       (not address_line1)
--   investors.state_addr    (not state — avoids conflict with investor_companies.state)
--   investors.capital_source (not source_of_capital)
--   investors.tax_id        = personal SSN/ITIN
--   investor_companies.ein_tax_id = company EIN (distinct from investors.tax_id)
-- ============================================================

-- ============================================================
-- SECTION A: project_investors
-- ============================================================

-- A1: Fix status default
-- Production had DEFAULT 'active' (wrong). Correct value is 'pending'.
-- Only affects NEW rows inserted after this migration. Existing rows unchanged.
ALTER TABLE public.project_investors
  ALTER COLUMN status SET DEFAULT 'pending';

-- A2: Enforce NOT NULL on status
-- Staging already had this. Production was nullable.
-- Safe: pre-flight confirmed 0 NULL values in status column.
ALTER TABLE public.project_investors
  ALTER COLUMN status SET NOT NULL;

-- A3: Enforce correct CHECK constraint on status
-- NOT VALID = existing rows not scanned, only new inserts validated.
-- Pre-flight confirmed 0 rows with status = 'active'.
ALTER TABLE public.project_investors
  DROP CONSTRAINT IF EXISTS project_investors_status_check;

ALTER TABLE public.project_investors
  ADD CONSTRAINT project_investors_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled'))
  NOT VALID;

-- A4: Add capital_commitment
-- Represents total capital the investor committed to this project.
-- Does NOT affect expenses, P&L, ROI, or any financial formula.
-- Capital isolation rule: this is a funding view field only.
ALTER TABLE public.project_investors
  ADD COLUMN IF NOT EXISTS capital_commitment NUMERIC(12,2) NOT NULL DEFAULT 0;

-- ============================================================
-- SECTION B: investor_companies — Add missing address/contact fields
-- ============================================================

-- All new columns: NOT NULL DEFAULT '' — consistent with existing
-- investor_companies column pattern (migration 004).
-- No existing company row is rejected or modified.

ALTER TABLE public.investor_companies
  ADD COLUMN IF NOT EXISTS address      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address2     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city         TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS zip          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_role TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ein_tax_id   TEXT NOT NULL DEFAULT '';

-- ============================================================
-- SECTION C: updated_at trigger guard for investor_companies
-- Staging has trigger from migration 004. Production may not.
-- CREATE OR REPLACE is safe. DO block skips if trigger exists.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_investor_companies_updated_at'
      AND tgrelid = 'public.investor_companies'::regclass
  ) THEN
    CREATE TRIGGER trg_investor_companies_updated_at
    BEFORE UPDATE ON public.investor_companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ============================================================
-- Reload PostgREST schema cache
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- END OF MIGRATION Phase 2A.2
-- investors:                   NOT TOUCHED
-- projects:                    NOT TOUCHED
-- project_expenses:            NOT TOUCHED
-- project_refunds:             NOT TOUCHED
-- project_disbursements:       NOT TOUCHED
-- project_financial_summaries: NOT TOUCHED
-- Phase 1 triggers:            NOT TOUCHED
-- Financial formulas:          NOT TOUCHED
-- ============================================================
