-- ============================================================
-- NexArtWO — Migration: Investor KYC & Registration Fields
-- Phase 2B Enhancement — 4-Step Investor Registration Wizard
-- Date: 2026-06-06
-- ============================================================
-- SAFETY: Only ADD COLUMN IF NOT EXISTS to investors table.
-- No existing columns, indexes, triggers, views, or functions touched.
-- No Phase 1 tables (projects, expenses, refunds, disbursements,
--   project_financial_summaries) touched.
-- ============================================================

ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS first_name          TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name           TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address             TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city                TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS state_addr          TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS zip                 TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS entity_type         TEXT      NOT NULL DEFAULT 'individual'
                               CHECK (entity_type IN ('individual','llc','lp','trust','corporation')),
  ADD COLUMN IF NOT EXISTS investment_profile  TEXT      NOT NULL DEFAULT 'individual'
                               CHECK (investment_profile IN ('individual','corporate_entity','equity_partner','trust_family')),
  ADD COLUMN IF NOT EXISTS accredited_investor BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS capital_source      TEXT      NOT NULL DEFAULT ''
                               CHECK (capital_source IN ('','savings','property_sale','loan','inheritance')),
  ADD COLUMN IF NOT EXISTS tax_id              TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS signed_agreement    BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_contact_date  DATE,
  ADD COLUMN IF NOT EXISTS owner_notes         TEXT      NOT NULL DEFAULT '';

-- ============================================================
-- END OF MIGRATION
-- investors existing columns (name, type, company_id, email,
--   phone, status, notes, created_at, updated_at): NOT TOUCHED
-- investor_companies: NOT TOUCHED
-- project_investors: NOT TOUCHED
-- capital_contributions: NOT TOUCHED
-- capital_calls: NOT TOUCHED
-- All Phase 1 tables: NOT TOUCHED
-- ============================================================
