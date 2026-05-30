# INVESTOR_HUB — Module Spec

## Status

LOCKED — do not activate without owner approval.

---

## Active implementation — verified 2026-05-29

**CANONICAL: `js/projects.js`** (functions prefixed `ih*`, lines ~1559–2170)

**Dead code (not loaded): `js/modules/`**
- `investor-hub-logic.js` — NOT in any script tag
- `investor-hub-modals.js` — NOT in any script tag
- `investor-manager.js` — NOT in any script tag

### Evidence

1. `index.html` script load order (lines 1408–1412):
   ```html
   <script src="js/env.js"></script>
   <script src="js/supabase.js"></script>
   <script src="js/projects.js?v=..."></script>
   <script src="js/app.js?v=..."></script>
   ```
   `js/modules/` files are absent.

2. `supabase.js:986` comment says explicitly:
   > "InvestorManager será importado via script tag en HTML"
   — that script tag was never added. `getInvestorManager()` always returns `null`.

3. `projects.js:906-907` — when user switches to Investor Hub tab:
   ```js
   if (tab === 'investorhub' && _currentProject) {
     renderInvestorHub(_currentProject.id);  // projects.js:1829
   ```

4. `app.js:359` — routing to `investorhub` page calls `initProjectsRoute(page)`,
   which loads the `projects.js` module.

### Call chain (active)

```
User clicks Investor Hub
  → app.js: navigateTo('investorhub')
  → app.js: initProjectsRoute('investorhub')
  → projects.js: initProjectsModule({ route: 'investorhub' })
  → projects.js: openInvestorHubEntry()
  → projects.js: renderInvestorHub(projectId)   ← LINE 1829
```

### What js/modules/ was intended for

The `js/modules/` files appear to be a Phase 2B refactor attempt that was never activated.
`investor-manager.js` contains an `InvestorManager` class for Supabase CRUD.
It was designed to be loaded via `<script>` tag, but that was never done.
These files can be treated as drafts/reference only until a future decision.

---

## Owner decision required

Before any Investor Hub work:
1. Confirm `js/projects.js` is the canonical implementation (already verified active).
2. Decide what to do with `js/modules/` — delete, keep as draft, or activate.
3. Do not add `investor-manager.js` script tag without a proper task and approved plan.

---

## Required sections before coding

- Objective
- User actions
- Data model
- UI behavior
- Mobile behavior
- Business rules
- Validation rules
- Affected files
- Protected files
- QA checklist
- Acceptance criteria
- Stop conditions

## Default stop conditions

Stop if implementation requires:

- SQL
- Supabase config changes
- financial formula changes
- Auth/RLS
- Investor Hub activation
- broad refactor
- files not listed in `CURRENT_TASK.md`
