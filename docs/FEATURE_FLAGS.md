# Feature Flags

This document tracks all active and planned feature flags in the application. Feature flags are the primary mechanism for dark-launching code and protecting production from unverified changes.

| Flag Name | Default | File | Purpose | Current State | Owner |
|-----------|---------|------|---------|---------------|-------|
| `INVESTOR_HUB_ENABLED` | `false` | `js/projects.js` | hide/show Investor Hub tab and UI components | hidden/dark-launched | R.C Art Construction |

## Flag Details

### `INVESTOR_HUB_ENABLED`
**Purpose:** Prevents unauthorized or unconfigured access to the Phase 2B Investor Hub in production.
**Current State:** `false` (Hidden)

**Activation Gate:**
Do not activate without explicit approval. The following must be completed:
1. Migration `202605070001_investor_entities.sql` confirmed applied in production or approved target environment.
2. Investor Hub smoke test `PASS`.
3. Manual UI check `PASS`.
4. Owner approval.
5. Rollback plan ready.

**Deactivation Process:**
Set `INVESTOR_HUB_ENABLED = false` in `js/projects.js` and ensure the UI tab retains `display:none` in `projects.html`.

**Cleanup Note:**
The flag and associated conditionally hidden UI elements should only be cleaned up (removed) after the Investor Hub feature is fully stable, tested, and integrated into the primary workflow.
