# Staging / Dev Environment Plan

**Status:** Planning only. No implementation has occurred.
**Author:** Agent (Senior Architecture Review)
**Date:** 2026-05-07
**Branch:** docs/staging-dev-environment-plan

---

## 1. Purpose

This document defines how a safe, isolated staging/dev environment will be created for NexArtWO. Its purpose is to permanently eliminate the pattern of testing against production and to establish a disciplined, reproducible promotion pipeline:

```
Local/Dev  →  Staging  →  Production
```

Without this pipeline, every database migration, RLS policy, or feature activation carries direct production risk. This plan resolves that gap before any further advancement of Investor Hub, Auth/RLS, or any new module.

---

## 2. Current Problem

| Problem | Detail |
|---|---|
| **GitHub Pages publishes `main`** | Any merge to `main` immediately goes public. There is no preview layer. |
| **Supabase is production-only** | The only configured Supabase project is the live one. All SQL runs against real data. |
| **Investor Hub is hidden for exactly this reason** | `INVESTOR_HUB_ENABLED = false` because no safe environment exists to validate the migration and UI. |
| **Auth/RLS is in `drafts/`** | 7 policy files exist but have never been applied. Applying directly to production is unacceptable. |
| **`supabase-financial-qa.yml` uses production secrets** | This workflow calls `supabase link` against `${{ secrets.SUPABASE_PROJECT_REF }}` and then runs `supabase db push`. This is a high-severity risk if triggered incorrectly. |
| **No migration staging** | Migrations `20260506_projects_financial_system.sql` and `202605070001_investor_entities.sql` exist. Testing new migrations safely requires a separate target. |
| **`investor-hub-pr-qa.yml` is the exception** | This workflow correctly uses an ephemeral Postgres service with no secrets and no remote connection. It is the model pattern to replicate for staging. |

---

## 2B. Real Incidents Already Seen

These incidents occurred during actual development and QA cycles. They are documented here as mandatory learning for any future staging/dev workflow design.

### Incident 1 — Supabase Financial QA `psql` Failure

| Field | Detail |
|---|---|
| **Workflow** | `supabase-financial-qa.yml` |
| **Step that failed** | Run Smoke Test via psql |
| **Symptom** | Workflow passed: Setup, Checkout, Supabase CLI, Link Project, Run DB Push, Install PostgreSQL Client — but failed at the `psql` smoke test step with a connection error. |
| **Probable cause** | Direct connection to `db.[project_ref].supabase.co` failed from a GitHub-hosted runner, likely due to IPv6 routing or network restriction on the runner. |
| **Mitigation applied** | Switched to the Supabase connection pooler (Supavisor, IPv4-compatible) endpoint instead of the direct DB host. |
| **Lesson learned** | Remote smoke tests must use runner-compatible connection endpoints. Direct DB hosts are not safe assumptions for GitHub-hosted runners. |
| **New rule** | Workflows that use `psql` against Supabase **must explicitly document** whether they use the direct DB host or the pooler, and justify the choice. |

### Incident 2 — Investor Hub PR QA UUID Mismatch

| Field | Detail |
|---|---|
| **Workflow** | `investor-hub-pr-qa.yml` |
| **Step that failed** | STEP 11 — Verify `project_financial_summaries` unchanged |
| **Symptom** | `invalid input syntax for type uuid` |
| **Cause** | The smoke test attempted to insert a hardcoded text string (`PROJ-2026-1000`) into a column that the migration defined as `UUID`. The schema expects a real UUID; the test invented a text ID. |
| **Mitigation applied** | Modified the test to first `SELECT id FROM projects LIMIT 1` after inserting the test project (using `RETURNING id`), then reuse that real UUID for subsequent inserts. |
| **Lesson learned** | Smoke tests must respect real schema types. Never invent IDs if the migration uses `UUID`. |
| **New rule** | Tests must generate or select real IDs from the database and reuse them, instead of hardcoding any identifier. Use `RETURNING id` on insert or `SELECT id` after insert. |

---

## 3. Required Environments

### A) Local / Dev

| Attribute | Detail |
|---|---|
| **Purpose** | Rapid iteration, offline-first testing, schema experimentation |
| **Database** | Supabase CLI local (`supabase start`) OR an ephemeral Postgres (as used in `investor-hub-pr-qa.yml`) |
| **Data** | Dummy/fixture data only. Never real customer data. |
| **Secrets** | None — or a dedicated local `.env` that is `.gitignored` |
| **Suitable for** | Writing new migrations, testing SQL logic, UI development without DB |

### B) Staging

| Attribute | Detail |
|---|---|
| **Purpose** | Full end-to-end testing of the app before production |
| **Database** | A **separate** Supabase project (e.g., `nexartwo-staging`) |
| **GitHub Environment** | A dedicated GitHub Environment named `staging` |
| **UI** | Branch preview (e.g., `staging` branch → separate GitHub Pages path or netlify preview) |
| **Secrets** | Entirely separate set of secrets (`STAGING_SUPABASE_*`) — **never shared with production** |
| **Data** | Controlled dummy data: representative but not real |
| **Suitable for** | Migration dry runs, RLS policy testing, feature flag activation tests, full UI QA before production rollout |

### C) Production

| Attribute | Detail |
|---|---|
| **Purpose** | Live application serving real business data |
| **Database** | Current Supabase project (real, untouchable except during approved release windows) |
| **GitHub Environment** | `production` — must require manual approval before any job runs |
| **UI** | `main` branch → GitHub Pages (current setup) |
| **Secrets** | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` — locked to production environment |
| **Suitable for** | Only merged, reviewed, QA-passed code |

---

## 4. Recommended Architecture

### 4.1 Supabase Projects

```
nexartwo           (current — PRODUCTION)
nexartwo-staging   (to be created — STAGING)
```

Both projects are completely independent. They share schema conventions but **never share data or credentials**.

### 4.2 GitHub Environments

```
staging     → uses STAGING_SUPABASE_* secrets
production  → uses SUPABASE_* secrets, requires manual approval
```

### 4.3 Secrets Naming Convention

| Secret Name | Environment | Purpose |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | production | Supabase CLI auth |
| `SUPABASE_PROJECT_REF` | production | Project identifier |
| `SUPABASE_DB_PASSWORD` | production | DB connection password |
| `STAGING_SUPABASE_ACCESS_TOKEN` | staging | Supabase CLI auth for staging |
| `STAGING_SUPABASE_PROJECT_REF` | staging | Staging project identifier |
| `STAGING_SUPABASE_DB_PASSWORD` | staging | Staging DB password |
| `STAGING_SUPABASE_URL` | staging | Supabase API URL for staging app |
| `STAGING_SUPABASE_ANON_KEY` | staging | Supabase anon key for staging app |

> ⚠️ **Critical:** Production secrets and staging secrets must NEVER be mixed, merged, or copied between environments.

---

## 5. GitHub Actions Plan

### 5.A Existing Safe Workflow — `investor-hub-pr-qa.yml`

- **Status:** Operational ✅
- **Security model:** Ephemeral Postgres 15 service container, zero secrets, no remote connection.
- **Scope:** Phase 1 + Phase 2B migration validation, smoke tests, isolation tests.
- **Recommendation:** This is the gold standard pattern. All new QA workflows should follow this model.

### 5.B Existing Sensitive Workflow — `supabase-financial-qa.yml`

- **Status:** Operational but HIGH RISK ⚠️
- **Security model:** Connects to live production Supabase via `${{ secrets.SUPABASE_PROJECT_REF }}`. Runs `supabase db push`.
- **Risk:** If triggered on a branch with an untested migration, it **pushes directly to production**.
- **Recommendation:** This workflow should be converted to use a `production` GitHub Environment with manual approval required. Until that conversion, it must only be triggered manually and with explicit owner consent.

### 5.C Future Workflow — `staging-db-qa.yml` *(not yet created)*

```yaml
# Conceptual structure only — DO NOT implement until staging environment exists
name: Staging DB QA
on:
  workflow_dispatch:
  push:
    branches: [staging]
jobs:
  staging-qa:
    environment: staging   # <-- blocks until staging environment is configured
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Link to Staging Supabase
        run: supabase link --project-ref ${{ secrets.STAGING_SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.STAGING_SUPABASE_ACCESS_TOKEN }}
      - name: Apply migrations to staging
        run: supabase db push --password ${{ secrets.STAGING_SUPABASE_DB_PASSWORD }}
      - name: Run smoke tests against staging DB
        run: psql ... -f qa/investor_hub_smoke_test.sql
```

### 5.D Future Workflow — `ui-smoke-qa.yml` *(not yet created)*

```
# Conceptual structure only
- Opens index.html and projects.html via a headless browser (Playwright or Puppeteer)
- Verifies page loads without JS errors
- Verifies Investor Hub tab is NOT visible (display:none)
- Takes screenshots as artifacts
- Fails if INVESTOR_HUB_ENABLED is true in a non-approved build
```

---

## 6. Secrets Policy

1. **Never print secrets** in workflow logs (`echo $SECRET` is forbidden).
2. **Never copy production secrets to staging** or vice versa.
3. **Always use explicit, environment-scoped secret names** (prefix with `STAGING_` for staging secrets).
4. **Never store secrets in files** committed to the repository (`.env` files must be in `.gitignore`).
5. **Never request secrets in plain text** in conversation, issue comments, or PR descriptions.
6. **GitHub Environments must enforce scope:** The `staging` environment may only access `STAGING_*` secrets. The `production` environment may only access non-prefixed production secrets.
7. **Production environment must require manual approval** by the repository owner before any job executes.

---

## 7. Migration Policy

| Step | Rule |
|---|---|
| **New migration written** | Must first be validated in ephemeral Postgres (via `investor-hub-pr-qa.yml` pattern) |
| **Ephemeral test passes** | Migration may proceed to staging |
| **Staging test passes** | Migration may be proposed for production, with owner approval |
| **No staging available** | Status is **BLOCKED**. No migration proceeds to production. |
| **Production `db push`** | Never executed from normal development tasks. Requires explicit coordinated release window and owner approval. |
| **Smoke test requirement** | Every migration must have an associated SQL smoke test or verification query before staging promotion. |
| **Rollback plan** | Every production migration must have a documented rollback script before execution. |

Currently applicable:
- `20260506_projects_financial_system.sql` — Applied to production ✅
- `202605070001_investor_entities.sql` — Applied only in ephemeral Postgres (QA PASS). **Staging pending.**

---

## 7B. Smoke Test Policy

Applies to all SQL smoke tests used in any workflow (ephemeral, staging, or production QA).

- Use `ON_ERROR_STOP=1` in all `psql` invocations so any SQL error immediately fails the workflow step.
- Use `BEGIN` / `ROLLBACK` blocks when tests should not leave residual data. Verify explicitly that no residual data remains after the rollback.
- **Never hardcode UUIDs** in test SQL. The schema generates real UUIDs; hardcoded values will cause type mismatch errors.
- **Never insert text strings into UUID columns.** If a column is typed `UUID`, only a valid UUID value is acceptable.
- Always obtain inserted IDs using `RETURNING id` on insert, or `SELECT id FROM table LIMIT 1` after insert, and bind that real ID to subsequent test statements.
- Confirm Phase 1 views (`project_financial_summaries`) are **unchanged** before and after any Phase 2 smoke test that inserts financial-adjacent data.
- Do not run destructive or semi-destructive smoke tests against production databases.
- If no safe test environment exists (no ephemeral Postgres, no staging), the correct status is **BLOCKED**. Do not proceed.
- Connection to remote Supabase via `psql` must use the pooler endpoint, not the direct DB host, when running inside GitHub-hosted runners.

---

## 8. Investor Hub Staging Gate

Investor Hub (`INVESTOR_HUB_ENABLED = false`) may only advance when **all** of the following are complete, in order:

| Gate | Status |
|---|---|
| 1. Phase 1 Visual Cleanup merged and stable | ✅ Complete (PR #4 merged) |
| 2. Staging environment provisioned | 🔴 Not yet created |
| 3. `202605070001_investor_entities.sql` applied to staging DB | 🔴 Blocked by Gate 2 |
| 4. `investor_hub_smoke_test.sql` PASS in staging | 🔴 Blocked by Gate 3 |
| 5. Manual UI check of Investor Hub in staging | 🔴 Blocked by Gate 3 |
| 6. Auth/RLS policies reviewed and applied to staging | 🔴 Blocked by Gate 2 |
| 7. Rollback plan documented for production migration | 🔴 Not yet written |
| 8. Owner explicit approval for production activation | 🔴 Pending all above |
| 9. `INVESTOR_HUB_ENABLED = true` in production | 🔴 FINAL step only |

> ⚠️ No gate may be skipped. Completing documentation or CI tests does not substitute for staging environment validation.

---

## 9. Auth/RLS Gate

The Auth/RLS policies in `supabase/drafts/auth-rls/` represent a critical security layer:

| File | Scope |
|---|---|
| `004a_user_roles_bootstrap.sql` | User roles table creation |
| `004b_user_roles_policies.sql` | Role-level policies |
| `005_rls_projects.sql` | Row-level security for `projects` |
| `006_rls_expenses_refunds.sql` | RLS for expenses and refunds |
| `007_rls_disbursements.sql` | RLS for disbursements |
| `008_rls_financial_summaries.sql` | RLS for financial summaries view |
| `009_project_status_summary_view.sql` | Status summary view |
| `permission_smoke_test.sql` | Test suite for permissions |

**Rules:**
- Auth/RLS must **NOT** be applied directly to production without staging validation.
- Staging must run `permission_smoke_test.sql` and confirm both viewer and admin access patterns work.
- **Feature flags are NOT a security boundary.** `INVESTOR_HUB_ENABLED = false` hides UI only. A user who manually calls `DB.projectInvestors.getByProject()` via browser console can still read data if RLS is not configured. RLS is the real protection layer.
- Auth/RLS must be applied and validated in staging before Investor Hub can be considered for production activation.

---

## 10. GitHub Pages / Preview Plan

### Option A — `staging` Branch Preview
Use a dedicated `staging` branch deployed to a secondary GitHub Pages path or a separate Pages site. Changes merge to `staging` first, then to `main`.
- **Pro:** Uses existing GitHub Pages infrastructure.
- **Con:** Requires managing a separate Pages site or branch.

### Option B — Branch-Based Preview (Netlify/Vercel)
Use Netlify or Vercel deploy previews for PRs and the staging branch.
- **Pro:** Automatic preview URLs per PR, zero configuration of GitHub Pages.
- **Con:** Requires a third-party service account.

### Option C — Local + Antigravity Tool for Visual QA *(Recommended)*
Use the local environment (current machine) to run visual QA against staging Supabase.
- The `qa/investor_hub_ui_preview.html` file already demonstrates this pattern.
- Point the app config to `STAGING_SUPABASE_URL` and `STAGING_SUPABASE_ANON_KEY` in a local `.env` (gitignored).
- The agent takes screenshots via browser tools for verification.

**Recommendation: Option C (local + staging Supabase) for now.**
It requires no new infrastructure beyond creating the staging Supabase project. It is the fastest, safest path to visual QA without modifying GitHub Pages or requiring third-party services.

---

## 11. Step-by-Step Implementation Plan

> ⚠️ This is a planning document. None of the steps below have been executed.

| Step | Action | Owner | Status |
|---|---|---|---|
| 1 | Create a new Supabase project named `nexartwo-staging` | Owner | 🔴 Not started |
| 2 | Configure GitHub Environment `staging` in repo settings | Owner | 🔴 Not started |
| 3 | Add `STAGING_SUPABASE_*` secrets to the `staging` GitHub Environment | Owner | 🔴 Not started |
| 4 | Create `staging-db-qa.yml` workflow (based on `investor-hub-pr-qa.yml` pattern but targeting staging Supabase) | Agent | 🔴 Blocked by Steps 1–3 |
| 5 | Apply Phase 1 migrations (`20260506_projects_financial_system.sql`) to staging DB | Agent via workflow | 🔴 Blocked by Steps 1–4 |
| 6 | Run Phase 1 financial smoke test against staging DB | Agent via workflow | 🔴 Blocked by Step 5 |
| 7 | Apply Investor Hub migration (`202605070001_investor_entities.sql`) to staging DB | Agent via workflow | 🔴 Blocked by Step 6 |
| 8 | Run `investor_hub_smoke_test.sql` against staging DB | Agent via workflow | 🔴 Blocked by Step 7 |
| 9 | Perform manual UI check of Investor Hub tab in staging | Owner | 🔴 Blocked by Step 8 |
| 10 | Review and apply Auth/RLS policies to staging; run `permission_smoke_test.sql` | Agent + Owner | 🔴 Blocked by Steps 1–3 |
| 11 | Document all staging results | Agent | 🔴 Blocked by Steps 5–10 |
| 12 | Only if all above pass: prepare Investor Hub production activation plan | Agent + Owner | 🔴 Final gate |

---

## 12. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Using production secrets by mistake in a workflow | 🔴 Critical | Scope secrets strictly to GitHub Environments. Use `STAGING_` prefix. |
| Accidental `db push` to production | 🔴 Critical | Require manual approval on the `production` GitHub Environment. Convert `supabase-financial-qa.yml` to use environment gate. |
| Staging DB becomes outdated vs production schema | 🟡 Medium | Rebuild staging from migrations on each major release cycle. |
| RLS policies incomplete, leaving data exposed | 🔴 Critical | Do not open app to more users until `permission_smoke_test.sql` passes in staging. |
| `INVESTOR_HUB_ENABLED` bypassed via browser console | 🟡 Medium | RLS is the real protection. Apply RLS before increasing user base. |
| LocalStorage desync from Supabase | 🟡 Medium | Ensure cache invalidation logic is tested when toggling between local/staging/production. |
| GitHub Pages publishing `main` before staging QA | 🟡 Medium | Follow branch discipline: only merge to `main` what has been validated in staging. |
| Agent executing implementation steps without approval | 🟡 Medium | This document is read-only planning. Implementation requires explicit per-step owner approval. |
| Smoke tests using incorrect ID types (text vs UUID) | 🟠 High | Always obtain real IDs from the DB using `RETURNING id` or `SELECT id` after insert. Never hardcode identifiers. |
| `psql` workflow using incompatible Supabase host | 🟠 High | Use Supabase pooler (Supavisor, IPv4) endpoint for GitHub-hosted runners. Document connection choice in the workflow file. |

---

## 13. Decisions Required From Owner

The following decisions are required before implementation can begin:

| Decision | Question |
|---|---|
| **Staging DB** | Confirm: Should we create a separate Supabase project named `nexartwo-staging`? |
| **Staging project name** | If yes: What exact name/region should it use? |
| **GitHub Environments** | Confirm: Set up GitHub Environments `staging` and `production` in the repo? |
| **Production gate** | Confirm: Should the `production` environment require manual approval before any job executes? |
| **`supabase-financial-qa.yml` conversion** | Should this workflow be updated to require `production` environment approval before running? |
| **Pages preview strategy** | Which option for staging UI preview: Option A (staging branch), B (Netlify/Vercel), or C (local + staging Supabase)? |
| **Auth/RLS timeline** | After staging is ready, when should Auth/RLS review be scheduled? |
| **Who approves production gates?** | Rodolfo / Owner (confirm). |

---

## 14. Final Recommendation

The current state of NexArtWO is stable and safe. The next actions, in strict order, are:

1. **Do not advance Investor Hub yet.** It requires staging validation first. `INVESTOR_HUB_ENABLED` stays `false`.
2. **Do not activate Auth/RLS yet.** It requires staging application and `permission_smoke_test.sql` validation.
3. **Create staging environment first.** The owner must answer the decisions in Section 13 and provision the Supabase staging project.
4. **Execute staging QA.** Apply Phase 1 and Phase 2B migrations, run smoke tests, perform manual UI check.
5. **Review Auth/RLS in staging.** Apply policies, run permission smoke tests, confirm data access model.
6. **Prepare Investor Hub activation plan.** Only after all staging gates pass and rollback plan is ready.
7. **Production activation.** With explicit owner approval, coordinated release window, and rollback plan confirmed.

> **Confirmed by real incidents:** The two incidents documented in Section 2B (psql connection failure and UUID type mismatch) demonstrate exactly why staging discipline and rigorous smoke-test standards must precede any further feature work. Both failures were caught in safe ephemeral environments — which is why that pattern is mandatory. The same discipline must be replicated at the staging layer before Investor Hub or Auth/RLS advance.

> Nothing in this document authorizes any of these steps. Each step requires explicit human approval before the agent may proceed.
