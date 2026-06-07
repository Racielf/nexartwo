# Design Task — Investor Hub UX Reference Screens

## Purpose

Static HTML UX reference screens for the NexArtWO Investor Hub redesign.
Used to review UX/UI before implementing in js/projects.js and js/supabase.js.
These files do not connect to Supabase or any app logic.

## Shared resources

- `investor-common.css` — design tokens, layout, all reusable components
- Lucide icons via CDN (`https://unpkg.com/lucide@latest`)
- NexArtWO visual identity: cream background (#f5f6fa), orange/gold accent (#d97706), Inter font

## Deliverables

| # | File | Screen | Status |
|---|---|---|---|
| — | `investor-common.css` | Shared design system | ✅ Complete |
| 01 | `01-investor-directory.html` | Global Investor Directory | ✅ Complete |
| 02 | `02-add-investor-wizard.html` | Add Investor Wizard (Person + Company) | ✅ Complete |
| 03 | `03-investor-profile.html` | Investor Profile / Detail View | ✅ Complete |
| 04 | `04-project-capital-workspace.html` | Project Capital Workspace (project-scoped) | ✅ Complete |

All five deliverables complete as of 2026-06-06.

---

## Screen descriptions

### 01 — Global Investor Directory
- Entry point from sidebar "Investor Hub" nav-item
- Lists ALL investors across all projects
- Search, filter by type (Person / Company) and status (All / Active / Inactive)
- Stat cards: Total Investors, Active, Confirmed Capital, Open Calls
- Investor cards with quick actions
- No project header — global scope

### 02 — Add Investor Wizard
- 3-step wizard: Type selection → Details → Review & Save
- Step 1: Choose Person or Company
- Step 2 (Person): Name, Email, Phone
- Step 2 (Company): Company name, Contact person, Email, Phone, License #, State, Notes
- Step 3: Review all fields before saving
- Triggered from Global Directory "Add Investor" button

### 03 — Investor Profile / Detail View
- Full investor record view for a single investor
- Shows contact info, linked projects, capital summary per project
- Edit Investor button (name/email/phone — not project role)
- Activity timeline
- "Projects linked" section showing project name, role, contribution total per project
- Entry point: click investor name in Directory

### 04 — Project Capital Workspace
- Entry point: Project detail → "Investor Hub" tab
- Project-scoped: shows capital for ONE project only
- Header clearly states "Project Capital Workspace" and "Project: [Name]"
- Project tabs visible (Overview / Financials / Expenses / Disbursements / Work Orders / Investor Hub)
- Edit button in top bar reads "Edit Project" — never edits an investor
- Stat cards: Active Investors, Confirmed Capital, Pending Capital, Open Capital Calls
- Capital Stack: investor cards with role, ownership%, profit split%, amounts
- Owner Ledger: contributions table with confirm/void actions
- Capital Calls table with open/confirm/void actions
- Show voided toggle (hidden by default)
- Private Owner Notes textarea
- Capital Isolation Rule panel — lists every formula capital does NOT affect

---

## Capital isolation rule (enforced in design)

Capital contributions and capital calls are a **funding view only**.
They do NOT affect:
- Expenses / cost basis
- ROI / net profit
- P&L summary
- Repair cost
- Sale revenue
- Work Order totals

---

## How to open

Open any `.html` file directly in a browser.
All CSS and Lucide icons load from the local CSS file and CDN.
No build step required.

```
design/investor/
├── investor-common.css
├── task.md
├── 01-investor-directory.html
├── 02-add-investor-wizard.html
├── 03-investor-profile.html
└── 04-project-capital-workspace.html
```

---

## Not implemented (by design)

- No JS app logic
- No Supabase connection
- No routing
- No production file modifications (js/projects.js, js/supabase.js, js/app.js, index.html, css/styles.css, supabase/, sql/)
