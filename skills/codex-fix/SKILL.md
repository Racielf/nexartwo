---
name: codex-fix
description: "activate when the user reports code errors, bugs, syntax failures, logical failures, broken modules, failed builds, console errors, warnings, frontend issues, backend issues, react, next.js, javascript, typescript, python, api, database, supabase, rls, or code that does not behave as expected. use this skill to diagnose the root cause, inspect nearby context, verify whether the current code already works before changing it, detect false positives, avoid anti-patterns, propose the smallest safe correction, and avoid breaking existing behavior."
---

# Codex Fix

## Objective

Diagnose code errors and unexpected behavior with a conservative, surgical approach. Identify the root cause, inspect the full affected block, and propose the smallest safe correction that preserves existing architecture and behavior.

The priority is not to rewrite code. The priority is to confirm the problem, fix only what is necessary, and avoid regressions.

## Mandatory principles

1. Use the principle of minimum intervention.
2. Do not modify working code unless there is a clear technical reason.
3. Inspect the full affected block before judging an isolated line.
4. Preserve existing style, naming, architecture, and module boundaries.
5. Do not introduce external libraries when native logic can solve the problem.
6. Do not perform broad refactors when a local fix is enough.
7. Do not remove code without explaining why it is safe.
8. Validate the impact of every proposed change.
9. Prefer diffs that show only the changed lines.
10. If context is missing, state what is missing and provide the safest hypothesis.
11. Check whether the report is a false positive before changing code.
12. Avoid fixes that silence symptoms without correcting the cause.

## Workflow

### 1. Identify the problem

Determine:

- affected file, component, function, module, or route
- probable line or logic block
- error type: syntax, type, runtime, async, import, state, API, database, permission, render, build, environment, or false positive
- severity: low, medium, high, or critical

### 2. Inspect the context

Review nearby lines to understand:

- what the code is trying to do
- which values may be null, undefined, empty, stale, or asynchronous
- which function or component calls this block
- whether the input contract is being violated
- whether the failure may come from configuration, permissions, environment, or external data

### 3. Verify the current behavior before changing

Before proposing a modification, evaluate:

- whether the code works in valid cases
- whether the error occurs always or only under specific conditions
- whether the reported line is the real cause or only where the failure surfaces
- whether the issue is a false positive
- whether a data, config, permission, or environment issue is more likely than a code issue

If the code already works, do not change it. Explain the verification and request the missing log or input only if necessary.

### 4. Propose the smallest safe fix

Prefer local changes such as:

- null or undefined guards
- input validation
- corrected imports or exports
- corrected async/await handling
- corrected hook dependencies
- corrected TypeScript types
- corrected route or API call
- corrected database query handling
- explicit error handling
- preserving the original return contract

Avoid:

- rewriting full modules
- changing framework or architecture
- adding dependencies
- renaming files, functions, or variables without need
- optimizing unrelated code
- hiding real errors with empty try/catch blocks
- using `any` in TypeScript as a shortcut unless clearly temporary and explained
- suppressing lint, TypeScript, React, or security warnings without justification

### 5. Validate the fix

Always include a validation path:

- build command
- lint command
- test command
- manual reproduction steps
- expected valid case
- edge case
- regression check

### 6. Output format

Use this exact structure when responding to a code-fix request:

```markdown
## Diagnostic

**Problem:**
[clear description]

**Root cause:**
[technical cause]

**Affected block:**
[file, line, function, or component if available]

**Impact:**
[what breaks or behaves incorrectly]

## Pre-change verification

[explain whether the current code works, partially works, or requires more context]

## Minimum recommended change

```diff
- previous code
+ corrected code
```

## Why this is safe

[brief explanation]

## Suggested validation

[build, lint, tests, or manual checks]

## Risk

[low / medium / high]
```

## Reference files

The core workflow in this file is self-contained. The optional references listed below are not installed in this repository as of 2026-07-12. Do not attempt to load them unless they are added and reviewed later.

When present, use additional references only when relevant. Do not load or repeat them unnecessarily.

- `references/errores_comunes.md`: common bug patterns and conservative fixes.
- `references/errores_comunes_avanzados.md`: advanced cases for Supabase RLS, Next.js, React Server Components, TypeScript generics, circular dependencies, race conditions, memory leaks, security, browser compatibility, and deprecations.
- `references/anti_patterns.md`: unsafe fixes to avoid, especially during refactors, broad rewrites, dependency changes, and quick patches.
- `references/false_positives.md`: cases that look like bugs but may be intentional or already working.
- `references/plantilla_analisis.md`: reusable diagnostic response templates.
- `references/guia_validacion.md`: validation checklist by stack and issue type.

## Decision rule

Before changing code, decide:

1. Is the error confirmed?
2. Is the failing block identified?
3. Is the proposed change local?
4. Does the change preserve the existing contract?
5. Can the change be validated?

If any answer is unclear, prefer diagnosis and validation over modification.
