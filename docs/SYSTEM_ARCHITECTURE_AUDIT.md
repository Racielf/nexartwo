# System Architecture Audit

## 1. Executive Summary
NexArtWO is a vanilla JavaScript/HTML application utilizing Supabase for backend storage and authentication. The system is divided into operational work order management and Phase 1 financial tracking, with an inactive Phase 2B (Investor Hub) dark-launched in the codebase. The application prioritizes client-side rendering with direct Supabase SDK interaction.

## 2. Current Deployed Architecture
- **Frontend:** Vanilla HTML/CSS/JS deployed via GitHub Pages from the `main` branch.
- **Backend:** Remote Supabase instance (PostgreSQL, GoTrue Auth, PostgREST).
- **CI/CD:** GitHub Actions for automated PR QA (ephemeral databases) and Financial Smoke Tests.
- **State:** LocalStorage acts as a fallback/cache mechanism.

## 3. Route Map
- `/index.html`: Main dashboard, work orders, service library, clients.
- `/projects.html`: Project portfolio, Phase 1 Financials, hidden Investor Hub.

## 4. HTML Entrypoints
- `index.html`: Loads `js/app.js`, `js/supabase.js`, initializes global state.
- `projects.html`: Loads `js/projects.js`, `js/supabase.js`, initializes project-specific state.

## 5. JavaScript Dependency Map
- `js/supabase.js`: Global database interaction, proxy methods, auth state.
- `js/app.js`: Core UI logic, work order modal handling, main navigation.
- `js/projects.js`: Project lifecycle, financial views, Investor Hub logic.

## 6. CSS/Design Dependency Map
- `css/styles.css`: Global design tokens, CSS variables, utility classes, responsive grid definitions.

## 7. Supabase Connection Map
- Initialized in `js/supabase.js` using global config variables.
- Direct client-side queries to tables: `projects`, `work_orders`, `services`, `clients`, `investors` (hidden), etc.

## 8. LocalStorage Usage Map
- Used for caching offline state and avoiding round-trips for static data.
- Keys: `nexartwo_projects`, `nexartwo_workorders`, etc.
- Risk: Divergence from Supabase truth if synchronization fails.

## 9. GitHub Actions/Workflows Map
- `.github/workflows/investor-hub-pr-qa.yml`: Ephemeral Postgres QA for isolated testing. Safe.
- `.github/workflows/supabase-financial-qa.yml`: Existing financial QA. Uses production secrets. Sensitive gate.

## 10. Supabase Migration Map
- `003_projects_financial_system.sql`: Phase 1 core logic.
- `202605070001_investor_entities.sql`: Phase 2B entities.

## 11. QA Files Map
- `qa/investor_hub_smoke_test.sql`: Validates Phase 2B without touching Phase 1.
- `qa/investor_hub_ui_preview.html`: Isolated UI preview.

## 12. Docs Map
- `docs/`: Holds spec documents, checklists, styling guides, and this audit.

## 13. Phase 1 Financial System Map
- **Tables/Views:** `project_expenses`, `project_refunds`, `project_disbursements`, `project_financial_summaries`.
- **UI:** Visible inside project detail view (`projects.html`).

## 14. Phase 2B Investor Hub Map
- **Tables:** `investors`, `investor_companies`, `project_investors`, `capital_contributions`, `capital_calls`.
- **UI:** Defined in `js/projects.js` but completely hidden via `INVESTOR_HUB_ENABLED = false`.

## 15. Feature Visibility Map
- **Visible:** Dashboard, Work Orders, Projects (Phase 1).
- **Hidden:** Investor Hub.
- **Pending/Disabled UI:** Subcontractors, CCB Compliance.

## 16. Public vs Internal/Admin Areas
- **Internal/Admin:** Financials, Expenses, Disbursements, Investor Hub.
- **Public/Client:** (Not explicitly mapped yet, primarily internal app).

## 17. Known Confusing UI Points
- `projects.html` empty state can be ambiguous. (Addressed in PR #4).
- Sidebar labels indicating "Sprint 2" or "Sprint 3". (Addressed in PR #4).
- Inside `projects.html`, Financial sub-tabs are only visible *after* a project is selected.

## 18. Known Risks
- Direct client-side Supabase calls can expose business logic if RLS is not perfectly configured.
- `INVESTOR_HUB_ENABLED` is a client-side boolean; a savvy user could manually enable it via console, though RLS should block unauthorized data access.

## 19. Critical Defects or Potential Defects
- Running Financial QA workflow on production DB could corrupt live data if not strictly partitioned.
- Missing error boundaries around Supabase calls could crash UI if network fails.

## 20. Recommended Next Steps
- Finalize and merge PR #4 to resolve UI confusion.
- Execute the production activation gate for Investor Hub (DB Migration + manual QA).
- Review and apply RLS policies from `supabase/drafts/auth-rls/` before opening the app to broader use.
