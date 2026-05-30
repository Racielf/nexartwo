# JAVASCRIPT_GLOBALS_AND_STATE_CONTRACT — NexArtWO

## Purpose

Protect vanilla JavaScript state and global functions.

## Why this matters

In vanilla JS, one global function or variable can be used by multiple UI sections. Changing it without mapping call sites can break unrelated features.

## Before editing any JS

Document:

```md
Target file:
Target function:
Call sites:
DOM IDs/classes used:
State variables used:
Supabase calls:
Financial calculations involved:
Adjacent modules affected:
```

## Rules

- Do not rename global functions without call-site audit.
- Do not change shared state shape unless documented.
- Do not remove event listeners without replacement.
- Do not duplicate functions with similar names.
- Do not convert module patterns without approved refactor plan.
- Do not mix UI polish with state/data refactor.

## Required update

If a new global function is added, update `FUNCTION_INDEX.md`.

---

## Utility duplicate audit — 2026-05-29

### showToast() — SAFE CLEANUP APPROVED (pending owner GO)

**Script load order:** `projects.js` → `app.js`
**Last definition wins:** `app.js:5311`

| Definition | File | Line | Status at runtime |
|-----------|------|------|-------------------|
| `showToast(msg)` | projects.js | 98 | DEAD — overridden by app.js; `#toast` element does not exist in index.html |
| `showToast(message)` | app.js | 3862 | DEAD — overridden by app.js:5311 |
| `showToast(message, duration)` | app.js | 5311 | **ACTIVE** — single live version |

**Call sites:** ~55 in app.js, ~18 in projects.js — all invoke app.js:5311 at runtime.
**DOM used by active version:** creates `<div id="app-toast">` dynamically. No existing DOM required.
**DOM used by dead versions:** projects.js:98 uses `#toast` (not in index.html — silently fails). app.js:3862 uses `querySelector('.toast')`.

**Proposed change:**
- Remove `app.js:3862–3870` (9 lines)
- Remove `projects.js:98–104` (7 lines)
- Keep `app.js:5311` unchanged as canonical
- Zero call sites change

---

### showConfirmModal() / closeConfirmModal() — SAFE CLEANUP APPROVED (pending owner GO)

**Script load order:** `projects.js` → `app.js`
**Last definition wins:** `app.js:1000` and `app.js:1014`

| Definition | File | Line | Params | Status at runtime |
|-----------|------|------|--------|-------------------|
| `showConfirmModal(title, msg, onConfirm)` | projects.js | 128 | 3 | DEAD — overridden by app.js:1000 |
| `closeConfirmModal()` | projects.js | 138 | 0 | DEAD — overridden by app.js:1014 |
| `showConfirmModal(title, msg, onConfirm, btnText, btnClass)` | app.js | 1000 | 5 | **ACTIVE** |
| `closeConfirmModal()` | app.js | 1014 | 0 | **ACTIVE** |

**Call sites:** ~14 in app.js, ~20+ in projects.js — all invoke app.js versions at runtime.
**DOM used:** `#confirm-modal-overlay`, `#confirm-modal-title`, `#confirm-modal-msg`, `#confirm-modal-btn`, `.confirm-box`
**`ensureConfirmBoxSkeleton()`:** defined at projects.js:109. Called by both active versions. app.js guards with `typeof` check (always passes since projects.js loads first).
**Extra params (btnText, btnClass):** present in app.js:1000 signature but NOT used by any call site in either file — design capacity only.

**Two call patterns used by projects.js (both work with app.js:1000):**
1. Form injection: `showConfirmModal(title, '', null)` → modal opened, then `.confirm-box.innerHTML` overwritten with form HTML
2. Standard confirm: `showConfirmModal(title, msg, asyncFn)` → shows confirm text + calls async function on confirm

**Proposed change:**
- Remove `projects.js:128–141` (14 lines: showConfirmModal + closeConfirmModal)
- Keep `app.js:1000` and `app.js:1014` unchanged as canonical
- Zero call sites change

---

### escHtml / escapeHtml — NOT in scope for this task

Two names exist for the same concept. NOT a simple dead-code removal — renaming would break call sites.
Do not touch in ISSUE-002/003 cleanup. Defer to a separate documented task.
