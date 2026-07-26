# TASK BRIEF — ISSUE-013 Phase 2C

> Historical preserved brief. This is not the active task and grants no implementation authority. Use `memory/CURRENT_TASK.md` for current scope.

## Task

ISSUE-013 Phase 2C — Add Investor Wizard UI

## Objective

Implement a project-scoped Add Investor Wizard MVP inside the active Investor Hub flow.

This wizard belongs to the Project Capital Workspace, not the Global Investor Directory.

## Current decision

Phase 2C is a 3-step MVP:

1. Identity
2. Project Role / Capital Commitment
3. Review & Save

The official UX reference is:

- `design/investor/02-add-investor-wizard.html`

The active implementation path is:

- `js/projects.js`

## Allowed files

For audit:

- `js/projects.js`
- `js/supabase.js` read-only
- `design/investor/02-add-investor-wizard.html` read-only
- `memory/CURRENT_TASK.md` read-only
- `memory/AGENT_HANDOFF.md` read-only

For implementation:

- `js/projects.js` only

## Forbidden files / areas

Do not touch:

- `supabase/`
- `sql/`
- Auth/RLS
- `js/supabase.js`
- `js/app.js`
- `js/modules/`
- `index.html`
- `css/`
- Work Orders
- financial formulas
- Project financial summaries
- capital contributions
- capital calls
- Global Investor Directory routing

## Required behavior

### Keep existing investor attach flow

The wizard must preserve the current ability to select an existing investor and attach them to the current project.

Existing investor flow:

1. Select existing investor
2. Fill project role / capital fields
3. Save & Attach to Project
4. Do not create a duplicate investor

### New person investor flow

Create an investor row using:

- `type: 'person'`
- `name`
- `first_name`
- `last_name`
- `email`
- `phone`
- `address`
- `city`
- `state_addr`
- `zip`
- `notes`

Then attach to current project.

### New company investor flow

Create company row using:

- `company_name`
- `contact_person`
- `email`
- `phone`
- `address`
- `address2`
- `city`
- `state`
- `zip`
- `website`
- `contact_role`
- `ein_tax_id`
- `license_number`
- `notes`

Then create investor row using:

- `type: 'company'`
- `name: company_name`
- `company_id`
- `email`
- `phone`

Then attach to current project.

### Project relationship fields

Attach using:

- `role`
- `ownership_percentage`
- `profit_split_percentage`
- `capital_commitment`
- `agreement_notes`

The initial project investor status must remain:

- `pending`

## Roles allowed

Use only existing role values:

- `equity_partner`
- `private_lender`
- `lead_contractor`
- `silent_partner`
- `other`

Do not introduce new role values in Phase 2C.

## Save Investor Only

Do not activate Save Investor Only in Phase 2C.

Reason:

The Global Investor Directory is not active yet. Creating unattached investors would make records harder to manage.

Allowed options:

- Hide the button, or
- Disable it with note: "Available after Global Investor Directory."

Primary action must be:

- Save & Attach to Project

## Required functions

Keep public entry point:

- `openAddInvestorModal()`
- `saveAddInvestor()`

Allowed helper functions inside `js/projects.js`:

- `ihWizStep(n)`
- `ihWizReview()`
- `ihWizSave()`
- `ihSetInvestorType(type)`
- `ihCollectAddInvestorWizardData()`
- `ihValidateAddInvestorWizardStep(step)`

Update wrapper:

```js
async function ihAttachInvestor(projectId, investorId, role, opts) {
  if (ihCanUseLive()) {
    var live = await DB.projectInvestors.attach(projectId, investorId, role, opts);
    if (live) return live;
  }
  return null;
}
```

## Out of scope for Phase 2C

Do not implement:

- Global Investor Directory
- Investor Profile
- Work Order Client/Investor recipient
- Save Investor Only active flow
- Advanced KYC fields:
  - `accredited_investor`
  - `tax_id`
  - `signed_agreement`
  - `investment_profile`
  - `capital_source`
  - `first_contact_date`
  - `owner_notes`
- Capital contribution creation
- Capital call creation
- Entity/company search workflow

These belong to later phases.

## Required validation after implementation

Run:

```bash
git diff -- js/projects.js
node --check js/projects.js
git status --short
```

Expected:

- Only `js/projects.js` modified.
- `node --check js/projects.js` passes.
- No commit.
- No push.

## QA checklist

Manual QA after implementation:

1. App opens.
2. Projects opens.
3. Open a project.
4. Open Investor Hub tab.
5. Click Add Investor.
6. Wizard opens in a wide, scrollable modal.
7. Cancel closes modal without saving.
8. Existing investor attach still works.
9. New person investor + attach works.
10. New company investor + attach works.
11. Project investor status starts as pending.
12. Capital commitment saves to `project_investors`.
13. Ownership and profit split save or default to 0.
14. Investor appears in Capital Stack after save.
15. Confirm investor still works.
16. Void investor link still works.
17. Add Contribution still opens.
18. Add Capital Call still opens.
19. Work Orders unchanged.
20. Project financials unchanged.
21. Console has no new JS/Supabase errors.
