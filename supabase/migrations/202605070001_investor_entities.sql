-- ============================================================
-- NexArtWO — Migration 004: Investor Entities + Capital Contributions
-- Phase 2B — Investor Hub
-- ============================================================
-- SAFETY: This migration ONLY adds new tables.
-- It does NOT touch:
--   - projects
--   - project_expenses
--   - project_refunds
--   - project_disbursements
--   - project_financial_summaries (view — Fase 1)
--   - Any Fase 1 triggers or functions
-- ============================================================

-- NOTE: projects.id is TEXT (e.g. 'PROJ-2025-0001')
-- All FKs to projects use TEXT, not UUID.

-- ============================================================
-- 1. investor_companies
-- Must exist before investors (investors can reference it)
-- ============================================================
CREATE TABLE IF NOT EXISTS investor_companies (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT        NOT NULL CHECK (company_name <> ''),
  contact_person TEXT       NOT NULL DEFAULT '',
  email         TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  license_number TEXT       NOT NULL DEFAULT '',
  state         TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. investors
-- ============================================================
CREATE TABLE IF NOT EXISTS investors (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (name <> ''),
  type        TEXT        NOT NULL DEFAULT 'person'
                CHECK (type IN ('person', 'company')),
  company_id  UUID        REFERENCES investor_companies(id) ON DELETE RESTRICT,
  email       TEXT        NOT NULL DEFAULT '',
  phone       TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive')),
  notes       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. project_investors
-- Join table: one investor can be in many projects,
-- one project can have many investors
-- ============================================================
CREATE TABLE IF NOT EXISTS project_investors (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              TEXT        NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  investor_id             UUID        NOT NULL REFERENCES investors(id) ON DELETE RESTRICT,
  role                    TEXT        NOT NULL DEFAULT 'equity_partner'
                            CHECK (role IN ('lead_contractor','equity_partner','silent_partner','other')),
  ownership_percentage    NUMERIC(5,2)
                            CHECK (ownership_percentage IS NULL OR (ownership_percentage >= 0 AND ownership_percentage <= 100)),
  profit_split_percentage NUMERIC(5,2)
                            CHECK (profit_split_percentage IS NULL OR (profit_split_percentage >= 0 AND profit_split_percentage <= 100)),
  status                  TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','cancelled')),
  agreement_notes         TEXT        NOT NULL DEFAULT '',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevent accidental duplicate investor/project/role combination
  UNIQUE (project_id, investor_id, role)
);

-- ============================================================
-- 4. capital_contributions
-- RULE: amount ALWAYS > 0
-- RULE: No hard delete (trigger enforced)
-- RULE: No UPDATE on historical fields (trigger enforced)
-- RULE: Does NOT affect project_financial_summaries
-- ============================================================
CREATE TABLE IF NOT EXISTS capital_contributions (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         TEXT        NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  investor_id        UUID        NOT NULL REFERENCES investors(id) ON DELETE RESTRICT,
  amount             NUMERIC(12,2) NOT NULL CHECK (amount > 0),  -- RULE: Always positive, always > 0
  date               DATE        NOT NULL,
  method             TEXT        NOT NULL DEFAULT 'wire'
                       CHECK (method IN ('cash','wire','check','company_payment')),
  type               TEXT        NOT NULL DEFAULT 'initial'
                       CHECK (type IN ('initial','additional','closing','reimbursement')),
  status             TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','cancelled')),
  evidence_reference TEXT        NOT NULL DEFAULT '',
  notes              TEXT        NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. capital_calls
-- Basic manual record only in Phase 2B
-- ============================================================
CREATE TABLE IF NOT EXISTS capital_calls (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       TEXT        NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  requested_amount NUMERIC(12,2) NOT NULL CHECK (requested_amount > 0),
  reason           TEXT        NOT NULL CHECK (reason <> ''),
  due_date         DATE,
  status           TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','cancelled')),
  notes            TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 6. updated_at triggers (same pattern as Fase 1 if exists)
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_investor_companies_updated_at
BEFORE UPDATE ON investor_companies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_investors_updated_at
BEFORE UPDATE ON investors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_project_investors_updated_at
BEFORE UPDATE ON project_investors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_capital_contributions_updated_at
BEFORE UPDATE ON capital_contributions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_capital_calls_updated_at
BEFORE UPDATE ON capital_calls
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 7. Immutability triggers for capital_contributions
-- Pattern mirrors Fase 1 (prevent_financial_delete, prevent_expense_update)
-- ============================================================

-- 7.1 Block DELETE on capital_contributions
CREATE OR REPLACE FUNCTION prevent_contribution_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'RULE 2B-NO-DELETE: Cannot delete capital contributions. Set status to ''cancelled'' instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_delete_capital_contributions
BEFORE DELETE ON capital_contributions
FOR EACH ROW EXECUTE FUNCTION prevent_contribution_delete();

-- 7.2 Block UPDATE on historical fields of capital_contributions
-- Allowed to change: status, notes, evidence_reference, updated_at
-- NOT allowed to change: amount, date, investor_id, project_id
CREATE OR REPLACE FUNCTION prevent_contribution_update()
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

CREATE TRIGGER trg_no_update_capital_contributions
BEFORE UPDATE ON capital_contributions
FOR EACH ROW EXECUTE FUNCTION prevent_contribution_update();


-- ============================================================
-- 8. Row Level Security (same open pattern as Fase 1 for MVP)
-- ============================================================
ALTER TABLE investor_companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors             ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_investors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_calls         ENABLE ROW LEVEL SECURITY;

-- investor_companies
CREATE POLICY "Allow select investor_companies"  ON investor_companies FOR SELECT USING (true);
CREATE POLICY "Allow insert investor_companies"  ON investor_companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update investor_companies"  ON investor_companies FOR UPDATE USING (true) WITH CHECK (true);

-- investors
CREATE POLICY "Allow select investors"  ON investors FOR SELECT USING (true);
CREATE POLICY "Allow insert investors"  ON investors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update investors"  ON investors FOR UPDATE USING (true) WITH CHECK (true);

-- project_investors
CREATE POLICY "Allow select project_investors"  ON project_investors FOR SELECT USING (true);
CREATE POLICY "Allow insert project_investors"  ON project_investors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update project_investors"  ON project_investors FOR UPDATE USING (true) WITH CHECK (true);

-- capital_contributions (no DELETE policy — trigger blocks it)
CREATE POLICY "Allow select capital_contributions"  ON capital_contributions FOR SELECT USING (true);
CREATE POLICY "Allow insert capital_contributions"  ON capital_contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update capital_contributions"  ON capital_contributions FOR UPDATE USING (true) WITH CHECK (true);

-- capital_calls
CREATE POLICY "Allow select capital_calls"  ON capital_calls FOR SELECT USING (true);
CREATE POLICY "Allow insert capital_calls"  ON capital_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update capital_calls"  ON capital_calls FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- END OF MIGRATION 004
-- project_financial_summaries: NOT TOUCHED
-- project_expenses: NOT TOUCHED
-- project_refunds: NOT TOUCHED
-- project_disbursements: NOT TOUCHED
-- Fase 1 triggers: NOT TOUCHED
-- ============================================================
