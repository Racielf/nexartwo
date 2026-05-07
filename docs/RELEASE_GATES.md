# Release Gates

## 1. Purpose
This document defines the mandatory checkpoints (gates) that every change must pass before being merged or deployed to production. The goal is to enforce strict separation of visual, logic, and database changes, ensuring stability and preventing regressions.

## 2. Branch Policy
- All work must occur on a dedicated branch prefixed with `feat/`, `fix/`, `hotfix/`, `docs/`, or `audit/`.
- `main` is strictly protected. No direct commits.

## 3. PR Policy
- PRs must clearly state their scope, type, and verification steps.
- PRs mixing unrelated changes (e.g., UI tweaks mixed with SQL migrations) will be rejected.
- If a PR body states a gate is missing or blocked, the PR MUST NOT be merged.

## 4. Merge Policy
- Merges to `main` require explicit human owner approval.
- Merges must pass all applicable automated checks (GitHub Actions).
- No agent is permitted to merge autonomously.

## 5. Environment Policy
- Staging/Dev environments must be used to test DB changes before production.
- If a safe test environment is unavailable, the task is strictly BLOCKED. Do not test against production.

## 6. Visual-Only Gate
- Must NOT touch SQL, Supabase migrations, or data layer (`js/supabase.js`).
- Must be verified visually (screenshot or manual check).

## 7. Documentation-Only Gate
- Must NOT modify HTML, CSS, JS, or SQL.
- Purely descriptive changes.

## 8. Hotfix Gate
- Must be small, targeted, and direct.
- No refactoring allowed during a hotfix.
- Immediate priority, requires expedited human review.

## 9. Feature Gate
- New features must be protected by a Feature Flag unless explicitly requested otherwise.
- Must not activate in production without explicit approval.

## 10. Database Migration Gate
- Never execute `db push` without explicit human approval.
- Migrations must be idempotent and thoroughly smoke-tested in an isolated ephemeral environment (GitHub Actions).

## 11. Production Activation Gate
- Requires confirmation that migrations are applied.
- Requires manual UI check.
- Requires feature flag toggle to `true`.

## 12. Post-Merge Verification Gate
- After merging, monitor deployment (e.g., GitHub Pages).
- Confirm public app behaves as expected via manual check or URL reading.

## 13. Rollback Rules
- If a merged PR breaks production, immediately revert the commit or issue a disabling hotfix.
- Do not attempt complex mid-air fixes on a broken `main` branch.

## 14. Stop Conditions
- Missing safe environment = STOP & REPORT BLOCKED.
- Ambiguous requirements affecting Phase 1 financials = STOP & ASK.

## 15. No-Merge Rules
- NEVER merge a PR if the body explicitly states a required gate is incomplete.
- NEVER merge PRs autonomously.
