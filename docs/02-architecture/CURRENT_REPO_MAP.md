# CURRENT_REPO_MAP — NexArtWO

## App structure (verified 2026-05-29)

```txt
index.html              Dashboard / Work Orders / Clients / Documents / Field Mode
projects.html           Projects, Project Financials, and Investor Hub UI

js/app.js               Main app logic — dashboard, WO, clients, documents, email, PDF, field mode (~266 KB)
js/projects.js          Projects, financials, and Investor Hub logic (~115 KB)
js/supabase.js          Supabase client, data layer, InvestorManager loader (~39 KB)
js/env.js               Auto-generated at build: Supabase URL + anon key (DO NOT EDIT)
js/modules/
  investor-hub-logic.js   Investor Hub render/data functions — PARALLEL to projects.js (~18 KB)
  investor-hub-modals.js  Investor Hub modals (Add Investor, Capital, Analysis) (~25 KB)
  investor-manager.js     InvestorManager class — Supabase CRUD for investors/capital/calls (~18 KB)

css/styles.css          Global styles

sql/                    SQL scripts (not executed automatically)
supabase/
  migrations/           Production migrations (PROTECTED — do not modify without approval)
  drafts/auth-rls/      Auth/RLS drafts (LOCKED)
  functions/            Edge functions (send-email)

docs/                   All documentation
memory/                 Agent memory / project state
templates/              Agent task templates
skills/                 Agent skill definitions
agent-starter-prompts/  Session start prompts for each AI tool
scripts/                Build scripts (build-vercel.js, generate-env.js)
dist/                   Build output (mirrors js/ + index.html — do not edit directly)
qa/                     QA SQL scripts

manifest.json           PWA manifest
vercel.json             Vercel deployment config
package.json            Node build dependencies
```

## WARNING — Dual Investor Hub implementation

`projects.js` contains a full Investor Hub implementation (functions prefixed `ih*`).
`js/modules/investor-hub-logic.js` and `investor-hub-modals.js` contain a SECOND implementation.
These have overlapping function names. Do not modify either without reading both first.
See `memory/KNOWN_ISSUES.md` for details.

## Rule

Agents must not guess file ownership. If unsure, update this map during documentation phase before coding.
