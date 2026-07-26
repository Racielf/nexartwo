# NEXT_ACTIONS - NexArtWO / FlipEngine

Updated: 2026-07-26.

## Finish Current Closeout

1. Review `js/projects.js` and FlipEngine docs 33-43 as one local change set.
2. ~~Start a persistent local or preview environment.~~ Done 2026-07-25 — headless Chromium against a local static server (no `chromium-cli` available; Playwright installed to a scratch directory outside the repo). See `docs/flipengine/43_PROPERTY_HUB_RESPONSIVE_QA_PASS.md`.
3. ~~Test normal and `fix_and_flip` projects on desktop, tablet, and phone.~~ Done for `fix_and_flip` project `Coindo` on all three widths. Other `fix_and_flip` records (`Fixflip`, `Test home bay`) and non-`fix_and_flip` projects were not separately re-tested this pass.
4. Check the browser console and Financials, Expenses, Disbursements, and Work Orders. — Console checked (clean) for the Property Hub panels; Financials/Expenses/Disbursements/Work Orders tabs were not separately opened this pass and remain open.
5. ~~Confirm the five new panels remain read-only and make no new table calls.~~ Done — confirmed read-only, no new network/console activity across all 5 panels x 3 viewports.
6. ~~Resolve `INVESTOR_HUB_ENABLED` for the intended merge/deploy target.~~ Done 2026-07-26 — set to `false`, matching `origin/main`/production. See `memory/DECISION_LOG.md`.
7. Obtain separate owner decisions for push, preview, and production. — Local commit done 2026-07-26; push/preview/production still pending.
8. ~~Decide whether `ISSUE-015` becomes its own CSS-only follow-up task.~~ Decided 2026-07-26: yes, schedule as follow-up. Not yet scheduled/assigned to a specific session.

## Prepare Next Task

Document one exact non-production governance package covering:

- target environment
- migration apply and rollback
- backup/restore
- Auth/RLS
- unavailable-table behavior
- Acquisition/Budget source of truth
- receipt/document accounting rules
- first approved read and CRUD module

## Do Not Bundle

Do not combine the UI release with SQL, migration apply, Auth/RLS, Investor Hub changes, financial formula changes, or unrelated known-issue work.
