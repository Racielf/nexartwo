# Staging Environment Setup Checklist

**Status:** Checklist only. No implementation has occurred. No actions taken by agent.
**Author:** Agent (Senior DevOps / Release Management Review)
**Date:** 2026-05-07
**Prerequisite:** `docs/STAGING_DEV_ENVIRONMENT_PLAN.md` (merged to main, commit `657e9f3`)

---

## 1. Purpose

This document converts the approved staging/dev environment plan into a concrete, owner-executable checklist. It provides exact manual steps for provisioning the staging infrastructure before any new workflow is written or any new migration is applied.

**This document does not implement anything.** It is a guide for the owner to complete manually. The agent will not proceed with workflow creation, migration application, or any staging-connected task until this checklist is marked complete by the owner.

---

## 2. Owner Decisions Locked

The following architectural decisions have been officially approved and are now locked for this implementation:

| Decision | Value |
|---|---|
| Supabase staging project name | `nexartwo-staging` |
| Supabase staging region | Same as production; prefer `us-east-1` if available |
| GitHub Environment — staging | `staging` (no mandatory approval; staging-scoped secrets only) |
| GitHub Environment — production | `production` (manual approval required; production-scoped secrets) |
| Staging secrets prefix | `STAGING_SUPABASE_*` — strictly separate from production |
| Preview UI strategy | Local environment + staging Supabase (Option C) |
| Investor Hub | Remains hidden (`INVESTOR_HUB_ENABLED = false`) |
| Auth/RLS | Remains in `supabase/drafts/auth-rls/` — not activated |
| `supabase-financial-qa.yml` hardening | Scheduled for a future PR — not yet modified |

---

## 3. Manual Step 1 — Create Supabase Staging Project

**Who:** Owner (Rodolfo / Racielf)
**Where:** [https://supabase.com/dashboard](https://supabase.com/dashboard)
**Agent action:** None — this is owner-only.

### Instructions

1. Log in to the Supabase dashboard.
2. Click **New Project**.
3. Configure:
   - **Name:** `nexartwo-staging`
   - **Organization:** Same org as the production project.
   - **Region:** Select the same region as your production project. If `us-east-1 (N. Virginia)` is available, prefer it.
   - **Database Password:** Generate a strong, unique password. **Do not reuse the production password.**
4. Wait for the project to finish provisioning (usually 1–2 minutes).
5. Once provisioned, collect and save these four values **outside the repository** (e.g., a password manager or secure note):

| Value | Where to find it |
|---|---|
| Project Reference (`project_ref`) | Dashboard → Project Settings → General → Reference ID |
| Database Password | The password you set during creation |
| Project URL | Dashboard → Project Settings → API → Project URL |
| Anon Key | Dashboard → Project Settings → API → `anon` `public` key |

> ⚠️ **Critical:** Do NOT paste any of these values into chat, PR comments, issues, commit messages, or any file in the repository. They go directly into GitHub Secrets in Step 2.

---

## 4. Manual Step 2 — Create GitHub Environment: `staging`

**Who:** Owner
**Where:** GitHub → `Racielf/nexartwo` → Settings → Environments
**Agent action:** None.

### Instructions

1. Navigate to **Settings → Environments** in the repository.
2. Click **New environment**.
3. Name it exactly: `staging`
4. Leave deployment branch restrictions open (or restrict to any non-`main` branch as desired).
5. Do **not** enable required reviewers for `staging` — it should run without blocking approval.
6. Under **Environment secrets**, add the following five secrets using the values collected in Step 1:

| Secret Name | Value Source |
|---|---|
| `STAGING_SUPABASE_ACCESS_TOKEN` | Your Supabase account's personal access token (from [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)) — create a new one if needed |
| `STAGING_SUPABASE_PROJECT_REF` | The `project_ref` from the `nexartwo-staging` project |
| `STAGING_SUPABASE_DB_PASSWORD` | The database password from the `nexartwo-staging` project |
| `STAGING_SUPABASE_URL` | The Project URL from the `nexartwo-staging` project |
| `STAGING_SUPABASE_ANON_KEY` | The `anon` public key from the `nexartwo-staging` project |

> ⚠️ **Rules:**
> - Do NOT copy `SUPABASE_PROJECT_REF` (production) as `STAGING_SUPABASE_PROJECT_REF`. They must point to different projects.
> - Do NOT copy `SUPABASE_DB_PASSWORD` (production) as `STAGING_SUPABASE_DB_PASSWORD`.
> - All `STAGING_*` values must exclusively reference `nexartwo-staging`, never `nexartwo` (production).

---

## 5. Manual Step 3 — Create GitHub Environment: `production`

**Who:** Owner
**Where:** GitHub → `Racielf/nexartwo` → Settings → Environments
**Agent action:** None.

### Instructions

1. Under **Settings → Environments**, click **New environment**.
2. Name it exactly: `production`
3. Enable **Required reviewers**: add yourself (Racielf / Rodolfo) as a required reviewer. This means any workflow targeting the `production` environment will pause and wait for your manual approval before executing.
4. Optionally restrict deployment branches to `main` only (recommended).
5. Under **Environment secrets**, confirm the production secrets are present. If they currently exist as **repository-level** secrets, they can remain there for now (existing workflows will continue to work). When `supabase-financial-qa.yml` is hardened in a future PR, secrets will be migrated to this environment.

| Secret Name | Status |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Should already exist as a repo secret |
| `SUPABASE_PROJECT_REF` | Should already exist as a repo secret |
| `SUPABASE_DB_PASSWORD` | Should already exist as a repo secret |

> ⚠️ Do NOT move or rename production secrets until the `supabase-financial-qa.yml` hardening PR has been reviewed and approved. Moving them prematurely will break the existing workflow.

---

## 6. Manual Step 4 — Confirm Current Secrets Location

**Who:** Owner
**Where:** GitHub → `Racielf/nexartwo` → Settings → Secrets and variables → Actions
**Agent action:** None.

Before any workflow is modified, confirm the current state:

- [ ] `SUPABASE_ACCESS_TOKEN` exists at repository level
- [ ] `SUPABASE_PROJECT_REF` exists at repository level
- [ ] `SUPABASE_DB_PASSWORD` exists at repository level
- [ ] None of the above point to `nexartwo-staging`
- [ ] `STAGING_SUPABASE_*` secrets have been created in the `staging` environment (after Step 2)

**Do not change anything yet.** The existing `supabase-financial-qa.yml` and `investor-hub-pr-qa.yml` workflows must remain functional. Workflow hardening is a separate, future PR.

---

## 7. Future Workflow Plan

The following workflows are planned but **not yet implemented**. They will be created in separate, dedicated PRs after the owner completes Steps 1–4 above.

### A) `staging-db-qa.yml` *(future — not yet created)*

- Uses GitHub Environment: `staging`
- Uses `STAGING_SUPABASE_*` secrets exclusively
- Applies migrations to `nexartwo-staging` only
- Runs Phase 1 financial smoke test against staging DB
- Runs Investor Hub smoke test against staging DB
- Never references production secrets
- Uses Supabase pooler (Supavisor, IPv4) for `psql` connections — **not** the direct DB host

### B) `supabase-financial-qa.yml` Hardening *(future — modification of existing)*

- Will be updated to use GitHub Environment: `production`
- Will require manual approval before any job runs
- Will be restricted to trigger only on `main` or `workflow_dispatch`
- Will document explicitly whether it uses pooler or direct DB host for `psql`
- **Will not be modified until staging environment is fully provisioned and verified**

### C) `ui-smoke-qa.yml` *(future — not yet created)*

- Will open `index.html` and `projects.html` via headless browser
- Will verify no JavaScript errors on page load
- Will confirm Investor Hub tab is NOT visible (`display:none`) when `INVESTOR_HUB_ENABLED = false`
- Will upload screenshots as workflow artifacts

---

## 8. Verification Checklist

The owner must complete and confirm each item below before the agent proceeds with any workflow implementation.

### Supabase Staging Project

- [ ] `nexartwo-staging` project created in Supabase dashboard
- [ ] Staging project is in the same region as production (or `us-east-1`)
- [ ] Staging `project_ref` saved securely outside the repository
- [ ] Staging database password saved securely outside the repository
- [ ] Staging project URL saved securely outside the repository
- [ ] Staging anon key saved securely outside the repository
- [ ] Confirmed staging is a **separate project** from production — different `project_ref`

### GitHub Environment: `staging`

- [ ] Environment `staging` created in repository Settings
- [ ] `STAGING_SUPABASE_ACCESS_TOKEN` added to environment secrets
- [ ] `STAGING_SUPABASE_PROJECT_REF` added — confirmed it is the staging `project_ref`, NOT production
- [ ] `STAGING_SUPABASE_DB_PASSWORD` added — confirmed it is the staging password, NOT production
- [ ] `STAGING_SUPABASE_URL` added — confirmed it is the staging URL
- [ ] `STAGING_SUPABASE_ANON_KEY` added — confirmed it is the staging anon key

### GitHub Environment: `production`

- [ ] Environment `production` created in repository Settings
- [ ] Required reviewer configured (Racielf / Rodolfo)
- [ ] Deployment branch restriction set to `main` (optional but recommended)
- [ ] Confirmed existing production secrets (`SUPABASE_*`) still exist at repository level and workflows are not broken

### Safety Confirmations

- [ ] No staging secret points to the production Supabase project
- [ ] No production secret was copied into the staging environment
- [ ] No workflow files were modified during this setup
- [ ] Investor Hub tab is still hidden in the public app (`display:none`)
- [ ] `INVESTOR_HUB_ENABLED` is still `false` in `js/projects.js`
- [ ] Auth/RLS policies remain in `supabase/drafts/auth-rls/` only — not applied anywhere

---

## 9. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `STAGING_SUPABASE_PROJECT_REF` accidentally points to production | 🔴 Critical | Manually verify both `project_ref` values are different before adding secrets. Check the Supabase dashboard for both projects side-by-side. |
| `production` GitHub Environment misconfigured (no approval required) | 🔴 Critical | After creating the `production` environment, test by triggering a workflow — it must pause and show an approval prompt. |
| Old workflows still using repository-level secrets after environment migration | 🟠 High | Do NOT migrate production secrets out of repository level until `supabase-financial-qa.yml` is updated in a dedicated PR. |
| `db push` runs against production before environment protection is active | 🔴 Critical | Do not run `supabase-financial-qa.yml` after this setup until the hardening PR converts it to use the `production` environment. |
| Secrets pasted into chat, PR comments, or commit messages | 🔴 Critical | All secrets go directly into GitHub Secrets UI only. Never paste values anywhere else. |
| Wrong Supabase region selected for staging | 🟡 Medium | Cross-check region in Supabase dashboard before proceeding. High latency between staging and production regions will not cause data issues but may affect performance tests. |
| Staging schema drift from production over time | 🟡 Medium | Rebuild the staging database from migrations (not a data copy) on each major release cycle. Use the same migration files in order. |
| `STAGING_SUPABASE_ACCESS_TOKEN` reused for production operations | 🔴 Critical | Use a dedicated Supabase personal access token for staging if possible. At minimum, confirm the token has project-scoped access only. |

---

## 10. Stop Conditions

**Stop all agent activity immediately if any of the following occurs:**

- A `STAGING_*` secret is confirmed to point to the production Supabase project. → Correct the secret before proceeding.
- The `production` GitHub Environment does not require manual approval. → Fix the environment configuration first.
- Someone attempts to run `supabase db push` (or `supabase-financial-qa.yml`) before environment protection is confirmed active.
- Someone attempts to set `INVESTOR_HUB_ENABLED = true` before all staging and RLS gates are complete.
- Secrets are posted in any human-readable location (chat, issues, PRs, files).
- It cannot be confirmed that staging and production are separate Supabase projects.

---

## 11. Final Recommendation

**No workflow will be implemented until the owner confirms the checklist in Section 8 is complete.**

The correct sequence going forward is:

1. **Owner completes Steps 1–4 manually** (creates Supabase staging project, GitHub environments, and secrets).
2. **Owner marks all items in the Section 8 checklist as complete** and confirms to the agent.
3. **Agent creates `staging-db-qa.yml`** in a dedicated PR (`feat/staging-db-qa-workflow`).
4. **Owner reviews and approves** that PR.
5. **Agent runs the staging workflow** to apply Phase 1 + Phase 2B migrations to `nexartwo-staging` and verify with smoke tests.
6. **Only after staging QA passes:** schedule Auth/RLS review and Investor Hub activation planning.

> Until the owner confirms Step 2 (checklist complete), the agent's status on staging-related tasks is: **BLOCKED — awaiting owner setup**.
