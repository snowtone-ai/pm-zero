# pm-zero

**Non-engineers can run AI coding work with less ambiguity, clearer handoffs, and stronger verification.**

pm-zero is an operating model for using Claude Code and Codex CLI together in VSCode on Windows PowerShell. It turns vague requests into a structured workflow: product intent, task ledger, current state, repository map, verification evidence, and Japanese handoff.

## 10-second value

pm-zero makes AI coding work easier to manage for people who are not engineers:

- It separates "what we want to build" from "what the agent must do next".
- It gives AI agents a fixed task ledger instead of scattered temporary plans.
- It records evidence, blockers, decisions, and handoff notes.
- It reduces agent confusion by adding a compact repository map.
- It defines when Claude Code should plan/review and when Codex CLI should implement/verify.

## What this demonstrates

This repository shows practical AI-agent system design:

- **Product thinking:** `docs/vision.md` is treated as the north star, not a task dump.
- **Execution control:** `tasks.md` is the single task ledger.
- **Operational safety:** `docs/state.md` tracks the current executor, lock, coordinator, and verification mode.
- **Agent navigation:** `docs/repo-map.md` helps agents find the right files without rereading the whole repository.
- **Quality discipline:** every completion claim must map to task evidence and verification.

## Main document

The current specification is:

- [pm-zero-knowledge-v9.3.md](./pm-zero-knowledge-v9.3.md)

v9.3 defines the **Dual-Agent Task Ledger OS**:

```text
Vision -> Tasks -> Implementation -> Verification -> Handoff
```

## Who should care

This project is relevant to:

- Teams evaluating AI coding workflows.
- Managers who need accountable AI-assisted delivery.
- Non-engineers who want to direct implementation work without losing control.
- Engineers designing reliable Claude Code / Codex CLI workflows.

## Current status

The v9.3 design is finalized and internally audited for:

- layer consistency
- task/state responsibility separation
- coordinator/worker write ownership
- Codex config single source of truth
- required task readiness fields
- Markdown structural consistency
