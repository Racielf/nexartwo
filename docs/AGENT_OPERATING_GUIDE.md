# Agent Operating Guide

## Purpose
This document serves as the official operating manual for AI agents developing the NexArtWO application. It establishes the rules, workflows, and standards required to maintain a stable, reviewable, and secure development environment, breaking the cycle of trial-and-error by enforcing strict procedural discipline.

## Current System State
- **Production Environment:** GitHub Pages (main branch).
- **Database:** Live Supabase instance.
- **Phase 1 Financial:** Validated, deployed, and active.
- **Phase 2B Investor Hub:** Merged to main but globally hidden behind `INVESTOR_HUB_ENABLED = false`.
- **Hotfix:** Active hotfix protecting public UI from unconfigured Investor Hub components.

## Non-Negotiable Rules
1. **No new features** without explicit architectural approval.
2. **No touching production** directly under any circumstances.
3. **No `db push`** to the live Supabase environment without a coordinated release window.
4. **No applying migrations** in production via agent tools.
5. **No modifying Auth/RLS policies** without explicit security review.
6. **No changing financial formulas** from Phase 1.
7. **Maintain `INVESTOR_HUB_ENABLED = false`** until all UI and backend QA gates are explicitly cleared.
8. **No merging PRs** autonomously. All merges require manual human approval.
9. **No modifying `js/supabase.js` or data layer logic** when making visual changes.
10. **No inventing results** or hallucinating test successes. If a test cannot run, report it as BLOCKED.

## Required Workflow
1. **Review Context:** Read relevant documentation and feature flags before touching code.
2. **Branching:** Work MUST be done on a descriptive, isolated branch (e.g., `feat/`, `fix/`, `audit/`).
3. **Implementation:** Make the minimal required changes to fulfill the objective.
4. **QA/Validation:** Validate changes locally or via temporary isolated Actions (e.g., Postgres temp instances).
5. **PR Creation:** Open a Draft or Review-Ready PR detailing the changes, risks, and verification steps.
6. **Stop:** Await human review and merge.

## Branch and PR Rules
- **Branch Names:** Must use prefixes `feat/`, `fix/`, `hotfix/`, `docs/`, `audit/`.
- **PR Content:** Must include a Summary, Scope, Verification Steps, and a checklist of untouched critical systems (e.g., Phase 1 formulas).
- **PR Merging:** Only the human owner can merge.

## Protected Areas
- **Phase 1 Financial System:** `projects.html` financial logic, `js/projects.js` cost basis/loan calculations, `project_financial_summaries` view.
- **Investor Hub:** `renderInvestorHub`, `202605070001_investor_entities.sql`. Must remain dark-launched.
- **Auth/RLS:** `supabase/drafts/auth-rls/`.

## UI and Standards
- **UI Consistency:** Follow the `docs/UI_STYLE_GUIDE.md`. Use clear, business-friendly language. Avoid exposing technical jargon (schema, sprint, backend) in the public UI.
- **Modals:** Must be logically grouped (e.g., Core Info vs. Financial Setup) with clear labels and adequate padding.
- **Empty States:** Must be instructional, clearly stating what features are unlocked by taking action.
- **QA Standards:** Visual changes require visual verification (screenshots or human check). Database changes require ephemeral isolated testing before production rollout.

## Mandatory Delivery Format
When completing an audit or significant task, the agent MUST return a response in the exact "Senior Audit Delivery" format, detailing the branch, commit, created files, reviewed files, risk assessments (critical, medium, low), PR status, safety confirmations, and recommendations.

## Stop Conditions
- If the required environment is missing (e.g., no safe local DB), STOP and report BLOCKED.
- If a change conflicts with Phase 1 logic, STOP and ask for clarification.
- Once a PR is opened, STOP and await instructions.

## Senior Engineering Rule
Always prioritize stability, isolation, and explicit gates over velocity. A working, hidden feature is better than a broken, visible feature. Protect the data layer at all costs.

Do not recommend production activation as a next step unless **all** of the following prerequisites are already confirmed complete:
- The current stable phase (Phase 1) is visually verified, merged, and stable.
- A safe staging/dev environment is provisioned and confirmed.
- The relevant migration is validated in staging via smoke test.
- Manual UI check has passed in staging.
- Auth/RLS security review is complete.
- A rollback plan is documented.
- Explicit owner approval is on record.

> If any of these gates are incomplete, the correct recommendation is: prepare those gates first. Never skip stages to accelerate activation.
