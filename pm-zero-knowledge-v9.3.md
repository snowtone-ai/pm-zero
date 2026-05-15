# pm-zero-knowledge-v9.3.md

2026-05-15 final / Claude Code + Codex CLI / VSCode on Windows + PowerShell-only

---

## 0. Result

pm-zero v9.3 is the **Dual-Agent Task Ledger OS**.

v9.2 completed the CLI-native minimal agent OS: PowerShell-only execution, auto-execution, composable skills, external memory, and verification gates. v9.3 preserves that foundation and fixes the next bottleneck: handoff quality between planning and implementation.

> **Vision as North Star + tasks.md as Execution Ledger + repo-map.md as Hybrid Navigation Map**

Final decisions:

1. Adopt **B. Dual-Agent Task Ledger OS** as the v9.3 architecture.
2. Add a directory-structure guide file using the **hybrid read policy**: read the summary at session start; read details only when navigation is unclear.
3. Keep Claude Code at the currently configured version.
4. Keep Codex CLI on the latest available version through Phase 0 verification.
5. Use Claude Code as default planner/reviewer and Codex CLI as default implementer/verifier, while preserving full-loop capability in both.
6. Integrate approved current agentic-engineering trends: context engineering, task ledgers, bounded subagents, session controls, and contextual verification rubrics.

v9.3 one-line definition:

> Non-engineer uses Claude Code and Codex CLI from VSCode on Windows PowerShell. `docs/vision.md` defines product intent, `tasks.md` defines implementation, `docs/state.md` defines current location, and `docs/repo-map.md` gives agents a compact navigation map. Claude plans by default. Codex implements by default. Both can run the full loop. Global config owns personal behavior; project config owns project facts.

---

## 1. First Principles

### 1-1. Essential Elements

pm-zero v9.3 requires exactly 9 primitives.

| Element | Role | Entity |
|---|---|---|
| Intent | Product north star | `docs/vision.md` |
| Task | Implementation contract | `tasks.md` |
| State | Current progress and lock | `docs/state.md` |
| Decision | Why we chose this | `docs/decisions.md` |
| Navigation | Where things live | `docs/repo-map.md` |
| Guardrail | Safe execution boundaries | `AGENTS.md` / `OS-KERNEL.md` |
| Adapter | Claude/Codex CLI differences | `CLAUDE.md` / `.claude/` / `.codex/` |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates |
| Handoff | Human-readable report | `HANDOFF-JA.md` |

Everything else loads on demand.

### 1-2. Problems v9.3 Solves

| Problem | Root Cause | v9.3 Solution |
|---|---|---|
| Planning handoff creates new ad hoc task files | No fixed task ledger | Root-level `tasks.md` is the only task list |
| `vision.md` becomes overloaded | Product intent and implementation details mix | `vision.md` is product north star; `tasks.md` is execution ledger |
| Agents waste time rediscovering repo structure | Directory meaning lives implicitly in codebase | `docs/repo-map.md` gives a compact map |
| Always reading a repo map wastes tokens | Repo map can grow with project size | Hybrid read policy: summary first, details on demand |
| Global and project configs can conflict | Project files over-specify models/permissions | Thin project adapter policy |
| Parallel agents can collide | File ownership is not explicit | Scope Lock Rule with write scopes in `tasks.md` |
| Codex latest behavior is assumed | Codex changes fast | Phase 0 version and feature check |
| New agent trends remain abstract | Concepts are not operationalized | Context, task, verification, and subagent rules become files and gates |

---

## 2. Concept Skeletons and Final Selection

### Skeleton A: v9.2 + tasks.md only

Add `tasks.md` to v9.2 and leave the rest unchanged.

- Success rate: 82%
- Implementation ease: High
- Token efficiency: High
- Root fix: Medium
- Verdict: Rejected as final. Good minimal patch, but weak on global/project config boundaries and multi-agent execution.

### Skeleton B: Dual-Agent Task Ledger OS

Add `tasks.md`, redefine `vision.md`, add `docs/repo-map.md`, keep project adapters thin, and formalize Claude/Codex routing.

- Success rate: 94%
- Implementation ease: High
- Token efficiency: High
- Root fix: High
- Verdict: **Adopted.** Best balance of usability, reliability, token cost, and migration simplicity.

### Skeleton C: Worktree Swarm OS

Make parallel worktrees and multiple subagents the default execution model.

- Success rate: 78%
- Implementation ease: Low
- Token efficiency: Low to Medium
- Root fix: High for large systems only
- Token cost estimate vs Skeleton B:
  - 2 subagents: about 1.6x to 2.2x
  - 3 subagents: about 2.0x to 3.0x
  - 4 subagents: about 2.8x to 4.0x
- Verdict: Future candidate. Powerful for large projects, too operationally heavy as the default for non-engineer workflows.

### Skeleton D: Vision-only OS

Put product intent and implementation tasks into `docs/vision.md`.

- Success rate: 60%
- Implementation ease: Medium
- Token efficiency: Medium
- Root fix: Low
- Verdict: Rejected. Long-term product intent and short-term execution compete for the same file.

### Final Selection

**Skeleton B adopted.** v9.3 is an evolutionary upgrade from v9.2, not a rewrite.

---

## 3. v9.3 Architecture

### 3-1. 7-Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-2

User Repository
  +-- Core Layer          : directives, kernel, memory, handoff
  +-- Execution Ledger Layer : vision / tasks / state / decisions / issues
  +-- Navigation Layer    : repo-map summary and details
  +-- Scripts Layer       : setup / verify / redaction helpers
  +-- Adapter Layer       : thin Claude Code / Codex CLI project adapters
  +-- Skills Layer        : composable, on-demand skills with CONTEXT.md
  +-- Aux Layer           : MCP / env / gitignore
```

### 3-2. File Structure (24 files)

#### Core Layer (5)

1. `AGENTS.md` -- Primary directive. All agents share this.
2. `CLAUDE.md` -- Claude Code adapter. Imports `@AGENTS.md` as thin layer.
3. `OS-KERNEL.md` -- Quality Gates / Verification / routing / security spec.
4. `MEMORY.md` -- External Memory operation spec.
5. `HANDOFF-JA.md` -- Japanese completion/error report template.

#### Execution Ledger Layer (5)

6. `docs/vision.md` -- Product north star.
7. `tasks.md` -- Implementation task ledger.
8. `docs/state.md` -- Current execution pointer: branch, active task, executor, coordinator, lock, verification mode, latest verification pointer.
9. `docs/decisions.md` -- Permanent decisions, reference URLs, review triggers.
10. `docs/issues.md` -- Failure log, escalation, review timeout.

#### Navigation Layer (1)

11. `docs/repo-map.md` -- Directory structure map with hybrid read policy.

#### Scripts Layer (3)

12. `scripts/setup.mjs` -- Windows PowerShell setup via Node.js.
13. `scripts/verify.mjs` -- Final verify unified entry point.
14. `scripts/lib/redact.mjs` -- Shared secret redaction.

#### Adapter Layer (5)

15. `.claude/settings.json` -- Thin project-level Claude Code settings.
16. `.claude/hooks/dispatcher.mjs` -- Unified Claude hook handler.
17. `.codex/config.toml` -- Thin project-level Codex config.
18. `.codex/hooks.json` -- Codex hook registry.
19. `.codex/hooks/dispatcher.mjs` -- Unified Codex hook handler.

#### Skills Layer (2)

20. `CONTEXT.md` -- Shared domain vocabulary for token reduction.
21. `.claude/skills/index.md` -- Skill registry and routing.

#### Aux Layer (3)

22. `.mcp.json` -- MCP server configuration.
23. `.env.example` -- Environment variable template.
24. `.gitignore` -- Git ignore rules.

### 3-3. Change from v9.2

| v9.2 | v9.3 |
|---|---|
| 22 files | 24 files |
| `docs/vision.md` carries spec details | `docs/vision.md` carries product north star |
| No fixed task ledger | `tasks.md` is the fixed task ledger |
| Repo structure discovered by search | `docs/repo-map.md` guides navigation |
| Strong project adapter config | Thin project adapters respect global config |
| Single Writer Rule only | Single Writer Rule + Scope Lock Rule |

---

## 4. File Responsibility Rules

### 4-1. Source of Truth Matrix

| Question | File |
|---|---|
| What product are we building? | `docs/vision.md` |
| What exact work remains? | `tasks.md` |
| What is active right now? | `docs/state.md` |
| Why did we choose this? | `docs/decisions.md` |
| What failed before? | `docs/issues.md` |
| Where is the relevant code? | `docs/repo-map.md` |
| What rules must agents follow? | `AGENTS.md` |
| How do we verify? | `OS-KERNEL.md` / `scripts/verify.mjs` |
| What should the user receive? | `HANDOFF-JA.md` |

### 4-2. `docs/vision.md`

Purpose: product north star.

Contains:

- Purpose
- Target users
- Success criteria
- Non-goals
- Product principles
- Primary user flows
- Failure cases
- Long-term goal
- Relationship to `tasks.md`

Does not own:

- Task checklist
- Current executor
- Write lock
- Temporary implementation notes

### 4-3. `tasks.md`

Purpose: implementation contract.

Contains:

- Task IDs
- Task status
- Owner
- Dependencies
- Write scope
- Acceptance criteria
- Verification method
- Evidence
- Blockers
- Review notes

`tasks.md` is fixed. The coordinator is the only writer. Planning happens through the coordinator. Implementation agents read from it and report desired status changes, evidence, and blockers back to the coordinator.

### 4-4. `docs/state.md`

Purpose: current location.

Contains:

- Branch
- Active task
- Current executor
- Write lock
- Latest verification pointer
- Verification mode
- Current blocker summary

`docs/state.md` points to `tasks.md`; it does not duplicate the task list or evidence history. If a task row and state pointer disagree, `tasks.md` wins for task facts and `docs/state.md` must be corrected as the navigation pointer.

### 4-5. `docs/repo-map.md`

Purpose: navigation map.

Contains:

- Summary section read at startup
- Directory responsibility map
- Important entry points
- Test locations
- Generated files
- Files agents usually edit
- Files agents treat as read-mostly
- Verification commands by area

`docs/repo-map.md` is not an architecture decision record. Permanent reasons live in `docs/decisions.md`.

---

## 5. Hybrid Repo Map Policy

### 5-1. Decision

Add `docs/repo-map.md`.

Read policy:

1. Session start: read only `## Summary`.
2. Before implementation: read relevant directory section when target files are unclear.
3. During debugging: read test, generated-file, or entry-point sections as needed.
4. After structural changes: update the affected section.

### 5-2. Why Hybrid Wins

| Option | Token Cost | Reliability | Verdict |
|---|---:|---:|---|
| Always read full repo map | High | High | Too expensive as projects grow |
| Read only when lost | Low | Medium | Agents waste time before realizing they are lost |
| Hybrid summary-first | Low to Medium | High | Adopted |

### 5-3. `docs/repo-map.md` Template

```markdown
# repo-map.md -- pm-zero v9.3 Repository Map

## Read Policy
- Session start: read Summary only.
- Before editing: read the section for the target area.
- When navigation is unclear: read Entry Points and Directory Map.
- After structural changes: update the affected section.

## Summary
- App type:
- Main runtime:
- Package manager:
- Primary source directory:
- Primary test directory:
- Main entry points:
- Verification command:

## Directory Map
| Path | Purpose | Edit Frequency | Notes |
|---|---|---|---|
| src/ | Application source | high | |
| tests/ | Tests | high | |
| docs/ | Project memory | medium | |
| scripts/ | Automation | medium | |

## Entry Points
| Area | File | Purpose |
|---|---|---|

## Common Workflows
| Workflow | Read First | Edit Usually | Verify |
|---|---|---|---|

## Generated / External Files
| Path | Rule |
|---|---|

## Update Rules
- Add new directories when they become implementation-relevant.
- Keep Summary under 20 lines.
- Keep each directory note concrete.
- Move rationale to docs/decisions.md.
```

### 5-4. AGENTS.md Rule

```markdown
## Repository Navigation
- Read docs/repo-map.md Summary at session start.
- Read detailed repo-map sections only when the target area is unclear.
- Update docs/repo-map.md after structural changes.
- Use rg before broad manual browsing.
```

---

## 6. Task Ledger Specification

### 6-1. `tasks.md` Template

```markdown
# tasks.md -- pm-zero v9.3 Execution Ledger

## Goal Binding
- Vision source: docs/vision.md
- Active goal:
- Codex /goal:
- Planning owner: Claude Code / Codex CLI / Human
- Implementation owner: Codex CLI / Claude Code / Human
- Review owner: Claude Code / Codex CLI / Human

## Task Status Vocabulary
- proposed: idea exists, not ready
- ready: owner, dependencies, write scope, acceptance, verification, and expected evidence are clear
- doing: one owner is actively working
- blocked: needs decision, dependency, credential, environment, or human action
- review: implementation complete, review pending
- done: accepted by reviewer
- verified: evidence recorded

## Parallelization Rules
- Coordinator owns tasks.md.
- Worker agents own only their assigned Write Scope.
- Parallel implementation requires disjoint Write Scopes or isolated worktrees.
- If two tasks need the same file, serialize them.
- Subagents return reports; coordinator updates tasks.md.

## Tasks
| ID | Status | Owner | Depends On | Write Scope | Acceptance | Verification | Evidence |
|---|---|---|---|---|---|---|---|
| T001 | ready | Codex | none | src/auth/**, tests/auth/** | Login error handling matches spec | pnpm test auth | pending |

## Execution Pointer
Current active task, executor, write lock, and latest verification live in `docs/state.md`.

## Blockers
| ID | Task | Blocker | Needed decision | Owner |
|---|---|---|---|---|

## Review Notes
| Task | Reviewer | Result | Follow-up |
|---|---|---|---|
```

### 6-2. Task Status Rules

| Status | Meaning | Next Move |
|---|---|---|
| proposed | Candidate task exists | Add missing scope/acceptance/verification |
| ready | Implementation can start | Coordinator marks `doing` and updates `docs/state.md` |
| doing | Work in progress | Execute within write scope |
| blocked | Needs decision or unavailable dependency | Record blocker and needed action |
| review | Implementation complete | Review by alternate model/vendor when needed |
| done | Review accepted | Run relevant verification |
| verified | Evidence recorded | Include in handoff |

### 6-3. Task Quality Bar

Each ready task includes:

- Owner
- Write scope
- Dependencies
- Acceptance
- Verification
- Expected evidence

The task is not ready until all six exist.

---

## 7. Claude / Codex Routing

### 7-1. Default Routing

| Work | Default | Fallback |
|---|---|---|
| Requirement interview | Claude Code | Codex CLI plan mode |
| Product vision | Claude Code | Codex CLI |
| Task decomposition | Claude Code | Codex CLI |
| Implementation | Codex CLI | Claude Code |
| Parallel exploration | Codex subagents | Claude subagents |
| Review | Different vendor/model from implementer | Same vendor, separate thread |
| Handoff | Current executor | Reviewer |

### 7-2. Full Loop Capability

Both Claude Code and Codex CLI must be able to perform:

1. Phase 0 verification
2. Interview
3. Vision update
4. Task creation
5. Implementation
6. Verification
7. Review
8. Handoff

Default role assignment improves quality and speed, but the system does not depend on either tool being available for a specific phase.

### 7-3. Claude Code Policy

- Keep the currently configured Claude Code version.
- Use Claude Code by default for planning, design, review, and prose quality judgment.
- Put common instructions in `AGENTS.md`.
- Keep `CLAUDE.md` as a thin adapter.
- Let global Claude settings own model and personal behavior.

### 7-4. Codex CLI Policy

- Keep Codex CLI current.
- Check local and latest version in Phase 0.
- Use Codex by default for implementation, verification, and bounded subagent work.
- Use project `.codex/config.toml` only for project-specific features and limits.
- Let global Codex config own model, approval policy, sandbox, personality, and personal defaults.

Phase 0 command set:

```powershell
claude --version
codex --version
npm view @openai/codex version
codex features list
```

Optional update command:

```powershell
codex update
```

---

## 8. Codex `/goal` Policy

### 8-1. Decision

Use Codex `/goal` as an optional long-running task anchor. `tasks.md` remains the source of truth.

### 8-2. Use `/goal` When

- Implementation is expected to take 30+ minutes.
- The work spans 3+ task groups.
- Subagents are used.
- Multiple implement-review-fix loops are likely.

### 8-3. Use `tasks.md` Alone When

- The change is a single documentation edit.
- The change is a narrow bug fix.
- The work should finish within one short session.
- Experimental goal behavior adds more management than value.

### 8-4. Config Source of Truth

Use the `.codex/config.toml` shape in Section 10-3. This section defines when `/goal` is worth using; it does not duplicate project config.

### 8-5. Interactive Use

```text
/goal Implement ready tasks from tasks.md, keep tests green, and preserve tasks.md as the execution ledger.
/goal
/goal pause
/goal resume
/goal clear
```

---

## 9. Scope Lock Rule

### 9-1. Rule

One coordinator owns repository-level state files:

- `tasks.md`
- `docs/state.md`
- `docs/decisions.md` when recording final decisions

Worker agents own only their assigned write scope.

### 9-2. Parallel Work Modes

| Mode | Use |
|---|---|
| Single writer | Normal implementation and shared-file changes |
| Parallel explorers | Investigation, research, tests, triage |
| Parallel workers | Disjoint write scopes |
| Parallel verifiers | Lint, unit tests, browser smoke, security checks |

### 9-3. Worker Prompt Template

```text
Use subagents for the assigned tasks only.
Coordinator owns tasks.md and docs/state.md.

Worker A:
- Task: T002
- Write Scope: src/components/**, tests/components/**
- Edit only files inside this scope.
- Return changed files, tests run, evidence, and blockers.

Worker B:
- Task: T003
- Write Scope: src/api/**, tests/api/**
- Edit only files inside this scope.
- Return changed files, tests run, evidence, and blockers.
```

### 9-4. Parallelization Fit

| Task Type | Fit | Reason |
|---|---|---|
| Codebase research | High | Read-heavy and easy to merge |
| Test addition | High | Scope usually separable |
| UI and API in parallel | Medium | Requires contract agreement first |
| DB schema and API | Low | Strong sequencing |
| Same-file refactor | Low | Coordinator should serialize |

---

## 10. Thin Project Adapter Policy

### 10-1. Principle

Global owns behavior. Project owns facts.

Global config owns:

- Model selection
- Approval policy
- Sandbox mode
- Personality
- Notifications
- User-level skills/plugins
- Personal defaults

Project files own:

- Product vision
- Tasks
- State
- Decisions
- Issues
- Repo map
- Verification commands
- Project-specific hooks
- Project-specific secret read boundaries

### 10-2. Claude Project Settings Minimal Shape

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  },
  "hooks": {
    "PostToolUseFailure": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/dispatcher.mjs --event=PostToolUseFailure"
          }
        ]
      }
    ]
  }
}
```

### 10-3. Codex Project Config Minimal Shape

```toml
#:schema https://developers.openai.com/codex/config-schema.json

check_for_update_on_startup = true
project_doc_fallback_filenames = ["AGENTS.md"]

[features]
hooks = true
multi_agent = true
goals = true

[agents]
max_threads = 4
max_depth = 1
job_max_runtime_seconds = 1800
```

### 10-4. Project Config Review Rule

If a project file sets model, sandbox, approval, or permission mode, record the reason in `docs/decisions.md`.

---

## 11. PM Agent Execution Protocol

### Phase 0: Fact and Toolchain Verification

Verify:

1. Claude Code local version
2. Codex CLI local version
3. Codex latest available version
4. Codex feature flags
5. Official docs for CLI features used
6. Framework docs for project stack
7. Package existence
8. Windows PowerShell constraints

### Phase 0.5: Self-Audit

Check:

- Every referenced CLI feature exists.
- Hook/config definitions match script implementations.
- Claude/Codex differences are separated.
- Project adapters do not override global behavior without a recorded reason.
- `tasks.md`, `state.md`, and `vision.md` responsibilities are not mixed.

### Phase 0.6: Reference + Repository Grounding

Before implementation:

1. Read `docs/repo-map.md` Summary.
2. Read detailed repo-map section for the target area.
3. Find 3 real examples for UI/API/DB/critical workflow work.
4. Record adopted and avoided elements in `docs/decisions.md`.
5. Compare implementation with evidence after completion.

### Phase 1: PM Interview

Gather:

- Purpose
- Target users
- Success criteria
- Primary flows
- Constraints
- Failure cases
- Priorities

When 3+ HIGH assumptions accumulate, ask immediately.

### Phase 2: Vision and Task Generation

1. Update `docs/vision.md` for product intent.
2. Generate or update `tasks.md`.
3. Confirm every ready task has owner, dependencies, write scope, acceptance, verification, and evidence.
4. Initialize `docs/state.md` with branch, coordinator, and the next active task pointer.

### Phase 3: Execution Routing

Default:

```text
Claude Code plans -> tasks.md -> Codex CLI implements -> alternate model reviews
```

Fallback:

```text
Codex CLI plans -> tasks.md -> Claude Code implements -> alternate model reviews
```

### Phase 4: Implementation

- Read `AGENTS.md`.
- Read `docs/state.md`.
- Read `docs/repo-map.md` Summary.
- Read the relevant repo-map section.
- Claim through the coordinator. The coordinator marks the task `doing` in `tasks.md` and updates `docs/state.md`. If you are the coordinator, perform both updates before editing.
- Respect write scope.
- Implement small diffs.
- Add tests for new behavior.
- Record permanent decisions in `docs/decisions.md`.

### Phase 5: Verification

Choose quick / standard / final.

Record:

- Task ID
- Command
- Result
- Evidence
- Unverified items

### Phase 6: Review

Use different model/vendor for:

- Auth
- Billing
- DB schema
- RLS / permissions
- Deploy
- Security
- 300+ line diff
- New external API
- 3 consecutive errors
- Production data / personal info / public URL impact

### Phase 7: Handoff

Report in Japanese using `HANDOFF-JA.md`.

Include:

- Changed files
- Completed task IDs
- Verification mode
- Commands and results
- Evidence
- Remaining tasks
- Human actions needed
- Residual risk

### Phase 8: Promotion Gate

Classify lessons:

| Classification | Destination |
|---|---|
| Project-specific | Stay in project |
| Pattern issue | `xp-rules.md` candidate |
| OS design issue | v9.x candidate |
| Vendor adapter issue | adapter/routing candidate |

Promotion requires evidence from `docs/issues.md`, `docs/decisions.md`, git diff, review log, or verification log.

---

## 12. Standard File Specs

### 12-1. AGENTS.md

```markdown
# Project AGENTS.md -- pm-zero v9.3

## Language
- Completion reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately.

## Source of Truth
- Product intent: docs/vision.md
- Execution tasks: tasks.md
- Current state: docs/state.md
- Decisions: docs/decisions.md
- Failures: docs/issues.md
- Repository map: docs/repo-map.md
- Quality: OS-KERNEL.md
- Domain vocabulary: CONTEXT.md
- Report: HANDOFF-JA.md

## Startup Read
- Read this file.
- Read docs/state.md.
- Read docs/decisions.md.
- Read docs/repo-map.md Summary.

## Repository Navigation
- Read detailed repo-map sections only when the target area is unclear.
- Update docs/repo-map.md after structural changes.
- Use rg before broad manual browsing.

## Task Ledger Rule
- Planning output goes to tasks.md.
- Implementation starts from tasks marked ready.
- Each ready task includes owner, dependencies, write scope, acceptance, verification, and evidence.
- Coordinator updates tasks.md.
- Worker agents report results to the coordinator.

## Scope Lock Rule
- One coordinator owns tasks.md and docs/state.md.
- Workers edit only their assigned write scope.
- Parallel work requires disjoint write scopes or isolated worktrees.
- Tasks touching the same file are serialized.

## Execution Rules
- Read docs/state.md and docs/decisions.md before implementation.
- Ground UI/API/DB/critical workflows with 3 real examples in docs/decisions.md before implementation.
- Target 300 lines per file, 50 lines per function.
- Add tests for every new feature.
- After 3 consecutive errors, record in docs/issues.md Escalation and pause.
- Declare verification mode (quick / standard / final) before completion.
- Final report follows HANDOFF-JA.md.

## Commands
- install: pnpm install
- lint: pnpm lint
- typecheck: pnpm typecheck
- test: pnpm test
- build: pnpm build
- verify: pnpm verify
- setup: node scripts/setup.mjs

## Execution Boundaries
- Use standard push with branch tracking.
- Handle every error explicitly.
- Keep safe values only in output.
- Use .env.example as template; application runtime reads actual env values.
- Authentication, billing, production deploy final approval, and personal data handling are human tasks.
- All other operations are AI-executed.

## Model Routing
- Default planning: Claude Code.
- Default implementation: Codex CLI.
- Either agent can perform the full workflow when needed.
- Lightweight fixes: lightweight model.
- Critical changes: review by a model or vendor different from the implementer.
- Auth, billing, DB, permissions, deploy, security, 300+ line diff: cross-vendor review required.
```

### 12-2. CLAUDE.md

```markdown
# Claude Code Adapter -- pm-zero v9.3

@AGENTS.md

## Claude-specific
- Claude Code reads CLAUDE.md. Common rules live in AGENTS.md.
- Prioritize planning, design, review, and prose quality judgment.
- Write implementation tasks to tasks.md.
- Use docs/repo-map.md Summary for navigation; read detailed sections when needed.
- Skill commands: read .claude/skills/index.md for the relevant section.
- Auto-execute file, git, build, test, lint operations according to global settings and project boundaries.

## Shell Policy
- Primary: PowerShell for all project operations.
- Project paths use Windows paths with backslash in PowerShell.
- Node.js scripts run with node scripts/name.mjs.

## Version Policy
- Keep the user's currently configured Claude Code version.
- Verify local version during Phase 0.
```

### 12-3. tasks.md

Use the template in Section 6.

### 12-4. docs/repo-map.md

Use the template in Section 5.

### 12-5. docs/vision.md

```markdown
# vision.md -- Product North Star

## Purpose

## Target Users

## Success Criteria

## Non-goals

## Product Principles

## Primary User Flows

## Failure Cases

## Long-term Goal

## Relationship to tasks.md
- This file defines product intent.
- tasks.md defines implementation tasks.
- Store task progress and evidence in tasks.md.
- Store only the current execution pointer in docs/state.md.
```

### 12-6. docs/state.md

```markdown
# state.md

## Current
- Branch:
- Active task:
- Current executor: Claude Code / Codex CLI / none
- Write lock: Claude Code / Codex CLI / none
- Coordinator:
- Latest verification pointer:
- Verification mode:

## Current Blocker
- None / [content]

## Next
- See tasks.md
```

### 12-7. HANDOFF-JA.md Additions

```markdown
### Task Ledger
- Active tasks completed:
- tasks.md updated: yes / no
- Remaining ready tasks:
- Blocked tasks:

### Verification Evidence
- Task ID:
- Command:
- Result:
- Evidence location:
```

---

## 13. Composable Skill Architecture

v9.3 preserves v9.2 composable skills and adds task-ledger operations.

### 13-1. Skill Registry Additions

```markdown
## S11 /task-slice
Break a product request into tasks.md rows with owner, dependencies, write scope, acceptance, verification, and evidence.

## S12 /task-verify
Check tasks.md for readiness. Report tasks missing owner, dependencies, write scope, acceptance, verification, or evidence.

## S13 /repo-map
Read docs/repo-map.md Summary. Open detailed sections only for the target area. Update repo-map after structural changes.
```

### 13-2. Skill Loading Rule

Read only the invoked skill section. Use `CONTEXT.md` for shared domain terms. Use `docs/repo-map.md` for repository navigation.

---

## 14. Quality Gates

v9.3 preserves v9.2 gates and adds task/navigation gates.

### Q1. Spec / Reference Gate

- `docs/vision.md` contains product intent.
- UI/API/DB/critical workflows have 3 real examples in `docs/decisions.md`.
- 3+ HIGH assumptions confirmed before implementation.

### Q2. Task Ledger Gate

- `tasks.md` exists.
- Active work maps to a task ID.
- Ready tasks include owner, dependencies, write scope, acceptance, verification, and evidence.
- Completed work updates task status and evidence.

### Q3. Repo Map Gate

- `docs/repo-map.md` exists.
- Summary stays under 20 lines.
- Structural changes update the relevant section.
- Agents use repo-map details before broad manual browsing.

### Q4. Code Gate

- Target 300 lines per file.
- Target 50 lines per function.
- Meaningful naming throughout.
- Every error handled explicitly.
- Existing code style matched.

### Q5. Architecture Gate

- UI / domain / data responsibilities stay separated.
- Dependencies flow in one direction.
- 300+ line diffs are split or explained in `docs/decisions.md`.
- Abstractions stay concrete and justified.

### Q6. Test Gate

- New features include tests.
- Bug fixes include reproduction tests or reproduction steps.
- Include at least 1 negative path.
- UI changes include screenshot or browser smoke.

### Q7. Error Gate

- Failure cases documented.
- User-facing errors prepared.
- 3 consecutive identical errors create Escalation.

### Q8. Security Gate

- Safe values only in output.
- Environment secrets accessed through application runtime only.
- Auth, billing, DB, permissions, deploy, external API require cross-vendor review.

### Q9. Observability Gate

For production targets:

- Structured logging distinguishes error / warn / info.
- Secret redaction applied.
- API / DB / auth / external API failures traceable.
- MVP deferrals documented in `docs/decisions.md`.

### Q10. Handoff Gate

- Report in Japanese.
- Completed task IDs listed.
- Verification steps explicitly listed.
- Unverified items explicitly listed.
- AI completes all possible work before requesting human action.

---

## 15. Verification Modes

### quick

Use for docs, small copy changes, low-risk config changes.

Execute:

- Confirm changed files.
- Check task ID if applicable.
- Run `git diff --check`.
- Run targeted tests only when needed.

### standard

Use for normal implementation, component additions, API changes.

Execute:

- lint
- typecheck
- build
- related tests
- task evidence update

### final

Use for pre-merge, pre-push, pre-deploy, large-scope changes.

Execute:

- `pnpm verify`
- e2e tests
- browser smoke
- console error check
- screenshot capture
- git status
- `tasks.md` vs git reality reconciliation
- `docs/state.md` vs git reality reconciliation

---

## 16. MCP Policy

`.mcp.json` initial value:

```json
{ "mcpServers": {} }
```

Rules:

- Add MCP servers after confirming existence in official docs or npm.
- Record addition reason in `docs/decisions.md`.
- OpenAI API / Codex / ChatGPT Apps SDK questions use official OpenAI developer docs first.
- Playwright verification uses repo-internal tests as primary; MCP is optional.

---

## 17. Shell Routing and RTK Rules

### 17-1. Shell Selection Matrix

| Operation | Shell | Reason |
|---|---|---|
| git, pnpm, npm, node | PowerShell | Project files live in Windows filesystem |
| Build, test, lint | PowerShell | Native Windows toolchain |
| File search | PowerShell + `rg` | Fast local search |
| Windows app interaction | PowerShell | Windows host access |
| Ambiguous operation | PowerShell | Deterministic default |

### 17-2. RTK Rules

Use explicit forms:

- `rtk read <file>`
- `rtk git ...`
- `rtk pytest`
- `rtk ruff ...`
- `rtk pnpm ...`
- `rtk npm ...`
- `rtk rg ...`
- `rtk proxy powershell -NoProfile -Command "<script>"`

PowerShell cmdlets go through:

```powershell
rtk proxy powershell -NoProfile -Command "Get-Content C:\path\to\file"
```

---

## 18. Current Trend Integration

The user approved current trend integration. v9.3 integrates the following trends at the system-design level.

### 18-1. Context Engineering

Operationalized as:

- `docs/vision.md` for product intent
- `CONTEXT.md` for domain vocabulary
- `docs/repo-map.md` for repository navigation
- `tasks.md` for executable work

### 18-2. Mise en Place for Agentic Coding

Before implementation:

- Repo map is read.
- Target files are identified.
- Task write scope is explicit.
- Verification method is known.

### 18-3. Spec-Driven Agent Workflow

Flow:

```text
Vision -> Tasks -> Implementation -> Verification -> Handoff
```

Each transition has a file artifact.

### 18-4. Agentic Rubrics

Tasks can include rubric checks in acceptance criteria:

```markdown
- Rubric:
  - Matches existing architecture:
  - Handles negative path:
  - Has test evidence:
  - Keeps user-facing behavior clear:
```

### 18-5. Bounded Subagents

Subagents are used for:

- exploration
- tests
- triage
- isolated implementation
- review

Subagents return reports. Coordinator updates repository-level files.

### 18-6. Session Controls and Compaction

Long-running sessions preserve:

- completed task IDs
- active assumptions
- blockers
- tool outcomes
- next task
- verification evidence

Persistent state lives in files, not chat history.

---

## 19. v9.2 -> v9.3 Migration

### Preserved

- CLI-only execution
- Windows + VSCode + PowerShell environment
- Full auto-execution principle
- Positive directives
- Quality Gates
- Verification Modes
- Handoff in Japanese
- Promotion Gate
- Composable Skills
- `CONTEXT.md`
- Phase 0 live verification
- Single Writer Rule as default

### Added

| File / Rule | Purpose |
|---|---|
| `tasks.md` | Fixed implementation task ledger |
| `docs/repo-map.md` | Hybrid repository navigation map |
| Task Ledger Rule | All plans flow into `tasks.md` |
| Scope Lock Rule | Safe bounded multi-agent work |
| Thin Project Adapter Policy | Project config respects global config |
| Codex Latest Policy | Codex version and features checked in Phase 0 |
| Repo Map Gate | Structural navigation stays explicit |
| Task Ledger Gate | Implementation evidence ties to task IDs |

### Changed

| Item | v9.2 | v9.3 |
|---|---|---|
| File count | 22 | 24 |
| Intent file | `docs/vision.md` as spec | `docs/vision.md` as product north star |
| Task handoff | Ad hoc task files possible | `tasks.md` fixed |
| Repo navigation | Search-first | repo-map summary-first |
| Writer rule | Single Writer | Single Writer + Scope Lock |
| Project adapters | Stronger local settings | Thin adapters |
| Codex version | Configured version | Latest checked in Phase 0 |

---

## 20. Logical Destroyer Final Verification

### 20-1. Self-critique: More files increase overhead

v9.3 adds `tasks.md` and `docs/repo-map.md`.

Mitigation: both files replace repeated rediscovery and ad hoc planning files. `repo-map.md` uses hybrid reading to keep token cost bounded.

### 20-2. Self-critique: `tasks.md` and `state.md` can overlap

Mitigation: `tasks.md` owns all task rows, status history, and evidence. `state.md` owns only the current execution pointer: branch, active task, current executor, write lock, coordinator, verification mode, and latest verification pointer.

### 20-3. Self-critique: `vision.md` can drift into a task list

Mitigation: `vision.md` template includes Relationship to `tasks.md`. Task Ledger Gate checks that implementation work maps to `tasks.md`.

### 20-4. Self-critique: `/goal` is experimental

Mitigation: `/goal` is optional. `tasks.md` remains the source of truth.

### 20-5. Self-critique: Multi-agent work can create conflicts

Mitigation: Single Writer remains default. Scope Lock enables parallelism only with explicit write scopes or isolated worktrees.

### 20-6. Self-critique: Thin adapters may reduce project-level control

Mitigation: global config is the user's intended main control plane. Project-level overrides are still allowed with `docs/decisions.md` rationale.

### 20-7. Self-critique: Codex latest policy can introduce breaking changes

Mitigation: Phase 0 checks version, features, and config schema before relying on new behavior.

### 20-8. Final Judgment

v9.3 production confirmed:

```text
B案 Dual-Agent Task Ledger OS adopted.
tasks.md is the fixed execution ledger.
docs/repo-map.md is added with hybrid summary-first reading.
docs/vision.md is product north star.
docs/state.md is current location.
Claude Code keeps current configured version.
Codex CLI is checked against latest in Phase 0.
Global config owns personal behavior.
Project config owns project facts.
Single Writer remains default.
Scope Lock enables bounded multi-agent execution.
Current agentic-engineering trends are integrated as concrete files and gates.
All completion claims require task evidence, verification, and Japanese handoff.
```

---

## 21. v9.3 Production Summary

v9.3 evolves from **PowerShell-only CLI-Native Auto-Executing OS with Composable Skills** to **Dual-Agent Task Ledger OS**.

Quality is guaranteed by:

1. Product intent exists in `docs/vision.md`.
2. Execution tasks exist in `tasks.md`.
3. Current location exists in `docs/state.md`.
4. Repository navigation exists in `docs/repo-map.md`.
5. Decision rationale exists in `docs/decisions.md`.
6. Failure history exists in `docs/issues.md`.
7. Claude/Codex routing is explicit.
8. Global/project config boundaries are explicit.
9. Scope Lock protects parallel work.
10. Real examples ground critical workflows.
11. Verification evidence maps to task IDs.
12. Handoff is complete in Japanese.
13. Lessons pass Promotion Gate before becoming OS rules.

Work that does not satisfy these criteria is not considered complete under pm-zero v9.3.
