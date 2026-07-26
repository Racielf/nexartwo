# Skills Directory - NexArtWO

Status: Active directory guide. Recursive review completed 2026-07-12.

## Purpose

This folder contains repository-specific operating playbooks. A skill can narrow how an agent performs a task, but it cannot expand the task, override `AGENTS.md`, bypass `memory/CURRENT_TASK.md`, or authorize protected operations.

## Inspection Scope

The recursive review covered all 10 files currently installed under `skills/`:

- this directory guide
- the four files under `codex-fix/`, including its `references/` placeholder
- the five standalone manual `SKILL.md` playbooks

The five standalone playbooks are exact copies of the versions preserved in `Otros/NexArtWO_Project_Control_Pack_v2.zip`. The active `codex-fix` quick guide and reference placeholder are exact copies of `Otros/codex-fix-skill-pack.zip`; its main skill and README contain only the current accuracy notes documented below. Extracted archive copies were removed after byte-for-byte verification.

## Authority Order

1. `AGENTS.md`
2. `memory/CURRENT_TASK.md`
3. The relevant `SKILL.md`
4. Skill README, quick guide, or reference material

When rules differ, follow the higher and stricter authority. In particular, a skill review never authorizes SQL execution, schema changes, formula changes, Investor Hub changes, releases, or work outside the current task.

## Folder-By-Folder Review

| Folder | Actual contents | Classification | Use and boundary |
|---|---|---|---|
| `bug-repair/` | One concise `SKILL.md` | Manual checklist | A minimal single-bug loop. It overlaps `codex-fix`; use `codex-fix` as the canonical bug workflow and this file only as a short reminder. |
| `codex-fix/` | Formal `SKILL.md`, README, NexArtWO quick guide, and reference placeholder | Canonical repository bug skill | Mandatory under `AGENTS.md` for bugs and unexpected behavior. It requires confirmation, root-cause diagnosis, minimum intervention, and validation. It does not authorize broad refactors. |
| `financial-formula-review/` | One concise `SKILL.md` | Manual protected-area checklist | Requires the current formula, proposed formula, business meaning, examples, edge cases, QA, and owner approval. It never authorizes changing a formula. |
| `qa-auditor/` | One concise `SKILL.md` | Manual read-only checklist | Produces a QA checklist, findings, severity, proposed fixes, and stop conditions. Its own rule prohibits code changes. |
| `regression-auditor/` | One concise `SKILL.md` | Manual supplemental checklist | Maps adjacent flows, shared state, checks, and risk. It has no independent execution authority and should accompany implementation or QA work. |
| `supabase-script-review/` | One concise `SKILL.md` | Manual SQL review checklist | Reviews affected tables, mutation type, risk, rollback idea, and backup needs. It explicitly says agents do not execute SQL, consistent with the strict repository rule. |

## Codex-Fix Completeness

`skills/codex-fix/SKILL.md` is the only local skill file with YAML frontmatter (`name` and `description`) and the only skill explicitly required by `AGENTS.md`.

Its core workflow is self-contained. These optional expansion files are described but not installed:

- `agents/openai.yaml`
- `references/errores_comunes.md`
- `references/errores_comunes_avanzados.md`
- `references/anti_patterns.md`
- `references/false_positives.md`
- `references/plantilla_analisis.md`
- `references/guia_validacion.md`

`references/README.md` is only a placeholder. Do not assume any optional reference exists, and do not create it merely to make the folder larger.

## Selection Guide

- Confirmed or suspected bug: `codex-fix/SKILL.md`.
- Financial formula proposal: relevant financial specification plus `financial-formula-review/SKILL.md`; stop without an approved formula specification.
- Read-only QA: `qa-auditor/SKILL.md`, with `regression-auditor/SKILL.md` when adjacent behavior matters.
- SQL supplied for review: `supabase-script-review/SKILL.md`; review only, with no execution from the agent session.

The smaller playbooks intentionally remain concise. Converting them into additional formal skills would duplicate `codex-fix` and add maintenance without improving the current workflow.
