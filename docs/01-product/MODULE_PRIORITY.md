# Module Priority - NexArtWO

Status: Current ordering as of 2026-07-12.

## Immediate

1. Close and review the Property Hub read-only UI work.
2. Complete desktop, tablet, phone, and browser-console QA.
3. Resolve the branch-local Investor Hub flag before merge or deployment.
4. Keep existing Projects, Work Orders, financials, clients, and documents stable.

## Gated Next Work

5. Approve a non-production FlipEngine migration and rollback procedure.
6. Define Auth/RLS for the new FlipEngine tables.
7. Add the first approved data-backed read path.
8. Add one approved CRUD module, with Acquisition or Budget chosen explicitly.
9. Implement Receipts and Document Links after source-of-truth rules are approved.
10. Continue Loans, Payments, Contractors, Labor, Investors, and reporting in separate phases.

## Separate Backlogs

Change Orders, client integrity, mobile upload, Cash-In, P&L by Work Order, and Deal Analyzer remain valid NexArtWO work, but they do not replace the current FlipEngine task.

`memory/CURRENT_TASK.md` always controls the exact next implementation scope.
