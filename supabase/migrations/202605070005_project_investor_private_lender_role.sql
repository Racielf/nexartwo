-- ============================================================
-- NexArtWO - Investor Hub private_lender role
-- ============================================================
-- Keeps the database constraint aligned with the Owner/Admin UI.
-- Investor Hub can attach a private lender as a project investor
-- without touching expenses, disbursements, P&L, or summaries.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.project_investors') IS NOT NULL THEN
    ALTER TABLE public.project_investors
      DROP CONSTRAINT IF EXISTS project_investors_role_check;

    ALTER TABLE public.project_investors
      ADD CONSTRAINT project_investors_role_check
      CHECK (role IN ('lead_contractor','equity_partner','silent_partner','private_lender','other'));
  END IF;
END $$;
