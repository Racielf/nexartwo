-- ============================================================
-- NexArtWO - Repair missing Investor Hub capital_calls table
-- ============================================================
-- SAFETY:
-- - Adds only the missing capital_calls table and its policies/triggers.
-- - Does not touch projects, expenses, refunds, disbursements, P&L, or summaries.
-- - Idempotent: safe to run if capital_calls already exists.
-- ============================================================

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
