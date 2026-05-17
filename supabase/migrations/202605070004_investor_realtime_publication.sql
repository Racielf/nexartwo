-- ============================================================
-- NexArtWO - Investor Hub Realtime Publication
-- Phase 2B - Owner/Admin live development
-- ============================================================
-- Enables Supabase Realtime for Investor Hub tables after the
-- investor entity tables exist. This does not change project P&L,
-- expenses, refunds, disbursements, or financial summaries.
-- ============================================================

ALTER TABLE IF EXISTS public.investor_companies REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.investors REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.project_investors REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.capital_contributions REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.capital_calls REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'investor_companies'
    ) AND to_regclass('public.investor_companies') IS NOT NULL THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.investor_companies;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'investors'
    ) AND to_regclass('public.investors') IS NOT NULL THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.investors;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_investors'
    ) AND to_regclass('public.project_investors') IS NOT NULL THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.project_investors;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'capital_contributions'
    ) AND to_regclass('public.capital_contributions') IS NOT NULL THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.capital_contributions;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'capital_calls'
    ) AND to_regclass('public.capital_calls') IS NOT NULL THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.capital_calls;
    END IF;
  END IF;
END $$;
