-- ============================================================
-- NexArtWO - Repair missing Investor Hub capital_calls table
-- ============================================================
-- SAFETY:
-- - Adds only the missing capital_calls table and its policies/triggers.
-- - Repairs partial Investor Hub tables from earlier local/prod drift.
-- - Does not touch projects, expenses, refunds, disbursements, P&L, or summaries.
-- - Idempotent: safe to run if these tables/columns already exist.
-- ============================================================

ALTER TABLE IF EXISTS public.investors
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.investor_companies(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE IF EXISTS public.project_investors
  ADD COLUMN IF NOT EXISTS ownership_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS profit_split_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS agreement_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE IF EXISTS public.capital_contributions
  ADD COLUMN IF NOT EXISTS investor_id UUID REFERENCES public.investors(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS method TEXT NOT NULL DEFAULT 'wire',
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS evidence_reference TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF to_regclass('public.capital_contributions') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'capital_contributions'
        AND column_name = 'project_investor_id'
    )
  THEN
    UPDATE public.capital_contributions cc
    SET investor_id = pi.investor_id
    FROM public.project_investors pi
    WHERE cc.investor_id IS NULL
      AND cc.project_investor_id = pi.id;
  END IF;

  IF to_regclass('public.capital_contributions') IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'capital_contributions'
        AND column_name = 'contribution_date'
    )
  THEN
    UPDATE public.capital_contributions
    SET date = contribution_date
    WHERE date IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.investors') IS NOT NULL THEN
    ALTER TABLE public.investors
      DROP CONSTRAINT IF EXISTS investors_type_check;

    ALTER TABLE public.investors
      ADD CONSTRAINT investors_type_check
      CHECK (type IN ('person','company'))
      NOT VALID;

    ALTER TABLE public.investors
      DROP CONSTRAINT IF EXISTS investors_status_check;

    ALTER TABLE public.investors
      ADD CONSTRAINT investors_status_check
      CHECK (status IN ('active','inactive'))
      NOT VALID;
  END IF;

  IF to_regclass('public.project_investors') IS NOT NULL THEN
    ALTER TABLE public.project_investors
      DROP CONSTRAINT IF EXISTS project_investors_role_check;

    ALTER TABLE public.project_investors
      ADD CONSTRAINT project_investors_role_check
      CHECK (role IN ('lead_contractor','equity_partner','silent_partner','private_lender','other'))
      NOT VALID;

    ALTER TABLE public.project_investors
      DROP CONSTRAINT IF EXISTS project_investors_status_check;

    ALTER TABLE public.project_investors
      ADD CONSTRAINT project_investors_status_check
      CHECK (status IN ('pending','confirmed','cancelled'))
      NOT VALID;

    ALTER TABLE public.project_investors
      DROP CONSTRAINT IF EXISTS project_investors_ownership_percentage_check;

    ALTER TABLE public.project_investors
      ADD CONSTRAINT project_investors_ownership_percentage_check
      CHECK (ownership_percentage IS NULL OR (ownership_percentage >= 0 AND ownership_percentage <= 100))
      NOT VALID;

    ALTER TABLE public.project_investors
      DROP CONSTRAINT IF EXISTS project_investors_profit_split_percentage_check;

    ALTER TABLE public.project_investors
      ADD CONSTRAINT project_investors_profit_split_percentage_check
      CHECK (profit_split_percentage IS NULL OR (profit_split_percentage >= 0 AND profit_split_percentage <= 100))
      NOT VALID;
  END IF;

  IF to_regclass('public.capital_contributions') IS NOT NULL THEN
    ALTER TABLE public.capital_contributions
      DROP CONSTRAINT IF EXISTS capital_contributions_amount_check;

    ALTER TABLE public.capital_contributions
      ADD CONSTRAINT capital_contributions_amount_check
      CHECK (amount > 0)
      NOT VALID;

    ALTER TABLE public.capital_contributions
      DROP CONSTRAINT IF EXISTS capital_contributions_method_check;

    ALTER TABLE public.capital_contributions
      ADD CONSTRAINT capital_contributions_method_check
      CHECK (method IN ('cash','wire','check','company_payment'))
      NOT VALID;

    ALTER TABLE public.capital_contributions
      DROP CONSTRAINT IF EXISTS capital_contributions_type_check;

    ALTER TABLE public.capital_contributions
      ADD CONSTRAINT capital_contributions_type_check
      CHECK (type IN ('initial','additional','closing','reimbursement'))
      NOT VALID;

    ALTER TABLE public.capital_contributions
      DROP CONSTRAINT IF EXISTS capital_contributions_status_check;

    ALTER TABLE public.capital_contributions
      ADD CONSTRAINT capital_contributions_status_check
      CHECK (status IN ('pending','confirmed','cancelled'))
      NOT VALID;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.prevent_contribution_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'RULE 2B-NO-DELETE: Cannot delete capital contributions. Set status to ''cancelled'' instead.';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.prevent_contribution_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.amount       IS DISTINCT FROM NEW.amount      OR
     OLD.date         IS DISTINCT FROM NEW.date        OR
     OLD.investor_id  IS DISTINCT FROM NEW.investor_id OR
     OLD.project_id   IS DISTINCT FROM NEW.project_id
  THEN
    RAISE EXCEPTION 'RULE 2B-IMMUTABLE: Cannot modify historical fields (amount, date, investor_id, project_id) on capital_contributions. Cancel and create a new record instead.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_delete_capital_contributions ON public.capital_contributions;
CREATE TRIGGER trg_no_delete_capital_contributions
BEFORE DELETE ON public.capital_contributions
FOR EACH ROW EXECUTE FUNCTION public.prevent_contribution_delete();

DROP TRIGGER IF EXISTS trg_no_update_capital_contributions ON public.capital_contributions;
CREATE TRIGGER trg_no_update_capital_contributions
BEFORE UPDATE ON public.capital_contributions
FOR EACH ROW EXECUTE FUNCTION public.prevent_contribution_update();

CREATE TABLE IF NOT EXISTS public.capital_calls (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       TEXT          NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  requested_amount NUMERIC(12,2) NOT NULL CHECK (requested_amount > 0),
  reason           TEXT          NOT NULL CHECK (reason <> ''),
  due_date         DATE,
  status           TEXT          NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled')),
  notes            TEXT          NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_capital_calls_updated_at ON public.capital_calls;
CREATE TRIGGER trg_capital_calls_updated_at
BEFORE UPDATE ON public.capital_calls
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.capital_calls ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'capital_calls'
      AND policyname = 'Allow select capital_calls'
  ) THEN
    CREATE POLICY "Allow select capital_calls"
      ON public.capital_calls FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'capital_calls'
      AND policyname = 'Allow insert capital_calls'
  ) THEN
    CREATE POLICY "Allow insert capital_calls"
      ON public.capital_calls FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'capital_calls'
      AND policyname = 'Allow update capital_calls'
  ) THEN
    CREATE POLICY "Allow update capital_calls"
      ON public.capital_calls FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.capital_calls TO anon;
GRANT SELECT, INSERT, UPDATE ON public.capital_calls TO authenticated;

ALTER TABLE public.capital_calls REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'capital_calls'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.capital_calls;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
