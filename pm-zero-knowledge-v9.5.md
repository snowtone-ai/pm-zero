# pm-zero-knowledge-v9.5.md

2026-05-23 final / Claude Code + Codex CLI / VSCode on Windows + PowerShell-only

---

## 0. Result

pm-zero v9.5 is the **Agent OS**.

v9.4 established the Lean Task Ledger OS by removing default files and keeping root context lean.
v9.5 keeps that architecture and evolves toward an Agent OS model:
the main agent acts as a CEO / Coordinator by default, orchestrating
dynamic agent generation, model-aware allocation, and parallel execution.

> **CEO Agent orchestrates Dynamic Agents + Lean Task Ledger + Agent OS**

Final decisions:

1. Adopt **Agent OS** as the v9.5 architecture.
2. CEO Agent is the default coordinator for every generated repository.
3. CEO Agent dynamically generates worker agents and worktrees based on task decomposition.
4. Model-aware agent allocation assigns high-performance models to critical reasoning
   and low-cost models to implementation.
5. Token consumption is minimized by default; maximum 3 concurrent agents including CEO.
6. CodeX is the default orchestration and implementation engine; Claude is reserved for
   critical review.
7. Write Scope isolation remains the core parallelization control.
8. Engineering Role and Thinking Protocol are added to `AGENTS.md`.
9. Coding priorities (Security, Reliability, Monitoring, Maintainability, Scalability,
   UX polish) are standard quality expectations.

v9.5 one-line definition:

> Non-engineer uses Claude Code and Codex CLI from VSCode on Windows PowerShell.
> CEO Agent orchestrates dynamic worker agents across worktrees.
> `docs/vision.md` defines product intent, `tasks.md` defines executable work,
> `docs/state.md` defines the current pointer, and `docs/repo-map.md` gives agents a
> compact navigation map. Global config owns behavior. Project files own project facts.

---

## 1. First Principles

### 1-1. Essential Elements

pm-zero v9.5 requires exactly 7 primitives.

| Element | Role | Entity |
|---|---|---|
| Intent | Product north star | `docs/vision.md` |
| Task | Implementation contract | `tasks.md` |
| State | Current pointer and lock | `docs/state.md` |
| Decision | Permanent rationale | `docs/decisions.md` |
| Navigation | Where things live | `docs/repo-map.md` |
| Guardrail | Shared execution rules | `AGENTS.md` |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates |

Everything else is optional and added only after a concrete need appears.

### 1-2. Problems v9.5 Solves

| Problem | Root Cause | v9.5 Solution |
|---|---|---|
| Generated repo has too many files | Earlier versions pre-created adapters, hooks, MCP, and skill files | Generate only required project memory and verification files |
| Project instructions become noisy | Reusable expertise is loaded in every session | Keep root context lean; use global/user skills or project docs on demand |
| Hook code exists without a deterministic job | Hooks were scaffolded before rules needed automation | Add hooks only when they enforce a known check |
| Project config duplicates global config | Project files over-specify personal defaults | Global owns behavior; project config is optional |
| Agents reopen irrelevant files | Navigation context is not layered | Read repo-map summary first; details only when needed |
| Generated/build/vendor files waste context | Ignore rules are incomplete | Keep `.gitignore` focused on generated, build, cache, dependency, and secret files |
| Coordinator role must be explicitly prompted each session | No default orchestrator exists | CEO Agent is the default coordinator from repository generation |
| Agent allocation is static | Fixed routing ignores task complexity and model cost | CEO Agent dynamically generates agents with model-aware allocation |
| Token waste from over-parallelization | No concurrency limit | Maximum 3 concurrent agents including CEO |

---

## 2. Architecture

### 2-1. 6-Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-7

Agent OS Layer
  +-- CEO Agent (default coordinator)
        +-- Dynamic Agent Generation
        +-- Parallel Execution (worktrees)
        +-- Model-Aware Allocation

User Repository
  +-- Core Layer       : shared directive and handoff
  +-- Ledger Layer     : vision / tasks / state / decisions / issues
  +-- Navigation Layer : repo-map summary and details
  +-- Scripts Layer    : setup / verify
  +-- Aux Layer        : env example / gitignore
```

The Agent OS Layer is not a file layer. It describes the runtime orchestration
model that the CEO Agent follows when executing tasks.

Removed from the default structure (since v9.4):

- Project hook dispatchers
- Default MCP config
- Project skill registry
- `OS-KERNEL.md`
- `MEMORY.md`
- `CONTEXT.md`
- Default full `.claude/settings.json`
- Default `.codex/config.toml`

Those are optional extension files, not baseline files.

### 2-2. Default File Structure (13 files)

#### Core Layer (3)

1. `AGENTS.md` -- Primary directive for all agents.
2. `CLAUDE.md` -- Thin Claude Code adapter that imports `@AGENTS.md`.
3. `HANDOFF-JA.md` -- Japanese completion/error report template.

#### Ledger Layer (5)

4. `docs/vision.md` -- Product north star.
5. `tasks.md` -- Implementation task ledger.
6. `docs/state.md` -- Current pointer: branch, active task, executor, lock, verification.
7. `docs/decisions.md` -- Permanent decisions and reference URLs.
8. `docs/issues.md` -- Failure log and escalation history.

#### Navigation Layer (1)

9. `docs/repo-map.md` -- Compact repository map with hybrid read policy.

#### Scripts Layer (2)

10. `scripts/setup.mjs` -- Minimal PowerShell/Node setup helper.
11. `scripts/verify.mjs` -- Unified verification entry point.

#### Aux Layer (2)

12. `.env.example` -- Environment variable template.
13. `.gitignore` -- Ignore generated files, build outputs, caches, dependencies, and secrets.

### 2-3. Optional Extension Files

Add these only when needed:

| Optional file | Add when |
|---|---|
| `.claude/settings.json` | Recommended. At minimum, deny `.env` reads. Add project-specific hooks only when needed |
| `.claude/hooks/dispatcher.mjs` | A hook has a concrete event and command to enforce |
| `.codex/config.toml` | Project must enable or constrain a Codex feature differently from global config |
| `.codex/hooks.json` | Codex project hooks are actually used |
| `.codex/hooks/dispatcher.mjs` | Codex hooks need shared command handling |
| `.mcp.json` | The project uses an MCP server confirmed from official docs |
| `CONTEXT.md` | Domain vocabulary repeats enough to reduce token use |
| `.claude/skills/index.md` | The project has multiple project-local skills |
| `scripts/lib/*` | Two or more scripts share non-trivial code |
| `OS-KERNEL.md` | Quality rules outgrow `AGENTS.md` |
| `MEMORY.md` | External memory rules outgrow the ledger docs |

Recommended minimal `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  }
}
```

### 2-4. Change from v9.4

| v9.4 | v9.5 |
|---|---|
| Lean Task Ledger OS | Agent OS |
| Coordinator role prompted per session | CEO Agent is default coordinator |
| Static agent routing | Dynamic agent generation by CEO |
| No model allocation policy | Model-aware agent allocation |
| No concurrency limit | Maximum 3 concurrent agents including CEO |
| No default token saving policy | Token consumption minimized by default |
| No engineering role in AGENTS.md | Engineering Role and Thinking Protocol added |
| No coding priority list | Security, Reliability, Monitoring, Maintainability, Scalability, UX polish |

---

## 3. Source of Truth

| Question | File |
|---|---|
| What product are we building? | `docs/vision.md` |
| What exact work remains? | `tasks.md` |
| What is active right now? | `docs/state.md` |
| Why did we choose this? | `docs/decisions.md` |
| What failed before? | `docs/issues.md` |
| Where is the relevant code? | `docs/repo-map.md` |
| What rules must agents follow? | `AGENTS.md` |
| How do we verify? | `scripts/verify.mjs` / Quality Gates |
| What should the user receive? | `HANDOFF-JA.md` |

### 3-1. `docs/vision.md`

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

Does not contain task checklists, write locks, temporary notes, or verification evidence.

### 3-2. `tasks.md`

Purpose: implementation contract.

Each ready task includes:

- Owner
- Dependencies
- Write scope
- Acceptance criteria
- Verification method
- Expected evidence

`tasks.md` is the only task list. The coordinator is the only writer.
Workers report desired status changes, evidence, and blockers to the coordinator.

### 3-3. `docs/state.md`

Purpose: current pointer.

Contains only:

- Branch
- Active task
- Current executor
- Write lock
- Coordinator
- Latest verification pointer
- Verification mode
- Current blocker summary

If `tasks.md` and `docs/state.md` disagree, `tasks.md` wins for task facts and
`docs/state.md` is corrected.

### 3-4. `docs/repo-map.md`

Purpose: navigation map.

Contains:

- Summary section read at startup
- Directory responsibility map
- Important entry points
- Test locations
- Generated/external file rules
- Common workflows and scoped verification commands

It is not an architecture decision record. Permanent reasons live in `docs/decisions.md`.

---

## 4. Navigation Policy

### 4-1. Hybrid Repo Map

Read policy:

1. Session start: read only `## Summary`.
2. Before implementation: read the relevant directory section when target files are unclear.
3. During debugging: read entry point, test, generated-file, or workflow sections as needed.
4. After structural changes: update only the affected section.

This follows the large-codebase pattern of lean root context plus layered local context.

### 4-2. `docs/repo-map.md` Template

```markdown
# repo-map.md -- pm-zero v9.5 Repository Map

## Read Policy
- Session start: read Summary only.
- Before editing: read the section for the target area when target files are unclear.
- When navigation is unclear: read Entry Points and Directory Map.
- After structural changes: update only the affected section.

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
- Keep Summary under 20 lines.
- Keep each directory note concrete.
- Move rationale to docs/decisions.md.
```

---

## 5. Task Ledger

### 5-1. `tasks.md` Template

```markdown
# tasks.md -- pm-zero v9.5 Execution Ledger

## Goal Binding
- Active goal:
- Planning owner: Claude Code / Codex CLI / Human
- Implementation owner: Codex CLI / Claude Code / Human
- Review owner: Claude Code / Codex CLI / Human

## Status Vocabulary
- proposed: idea exists, not ready
- ready: owner, dependencies, write scope, acceptance, verification, and expected evidence are clear
- doing: one owner is actively working
- blocked: needs decision, dependency, credential, environment, or human action
- review: implementation complete, review pending
- done: accepted by reviewer
- verified: evidence recorded

## Tasks
| ID | Status | Owner | Depends On | Write Scope | Acceptance | Verification | Evidence |
|---|---|---|---|---|---|---|---|
| T001 | ready | Codex | none | src/auth/**, tests/auth/** | Login error handling matches spec | pnpm test auth | pending |

## Blockers
| ID | Task | Blocker | Needed decision | Owner |
|---|---|---|---|---|

## Review Notes
| Task | Reviewer | Result | Follow-up |
|---|---|---|---|
```

### 5-2. Agent Coordination

- CEO Agent owns `tasks.md` and `docs/state.md` as coordinator.
- CEO Agent decides whether to parallelize based on Write Scope separation.
- Worker agents may edit only their assigned Write Scope.
- Parallel implementation requires disjoint Write Scopes or isolated worktrees.
- Same file -> serialize. Separate scope -> parallelize.
- Maximum 3 concurrent agents including CEO.

---

## 6. Agent Routing and CEO Orchestration

### 6-1. Default CEO Agent

The main agent acts as **CEO Agent** by default from repository generation.
No explicit "you are the CEO" prompt is required. The CEO Agent is the
standard coordinator in pm-zero v9.5.

The CEO Agent is the repository-wide orchestrator responsible for:

- Task decomposition and parallelization decisions
- Determining the number and roles of worker agents
- Worktree creation for parallel execution
- Execution order and merge order
- Agent-to-task assignment
- Model selection per worker agent

### 6-2. Dynamic Agent Generation

The CEO Agent dynamically generates worker agents based on:

- Task complexity
- Write Scope separation
- Parallelization efficiency
- Token efficiency

Example worker agents:

- Builder-A, Builder-B (implementation)
- Reviewer (cross-check)

Agent count is not fixed. It is determined per task.

### 6-3. Dynamic Worktree Generation

When the CEO Agent determines that parallel execution is beneficial,
it automatically generates worktrees:

```bash
git worktree add ...
```

Worktrees are created based on task decomposition results.

### 6-4. Model-Aware Agent Allocation

The CEO Agent assigns models to each worker agent.

High-performance models are used for:

- Coordination
- Architecture
- Orchestration
- Critical reasoning

Low-cost models are used for:

- Implementation
- Repetitive tasks
- Boilerplate
- Test generation

### 6-5. Token Saving Policy

- The CEO Agent minimizes token consumption by default.
- Maximum 3 concurrent agents including CEO.
- When the CEO Agent attempts to invoke Claude Code as a Reviewer but
  the user does not have a paid Claude plan, fall back to CodeX without stopping.

### 6-6. CodeX-Centric Parallel Agent Structure

Default parallel structure:

```text
CodeX CEO
├─ CodeX Builder A
├─ CodeX Builder B
└─ Optional Claude Reviewer
```

CodeX handles orchestration, implementation, and parallel execution.
Claude is reserved for final and critical review.

### 6-7. Agent Routing Table

| Work | Default | Fallback |
|---|---|---|
| Orchestration | CodeX CEO | Claude Code |
| Requirement interview | Claude Code | Codex CLI |
| Product vision | Claude Code | Codex CLI |
| Task decomposition | CEO Agent | Codex CLI |
| Implementation | Codex CLI | Claude Code |
| Parallel exploration | Codex subagents | Claude subagents |
| Review | Different vendor/model from implementer | Same vendor, separate thread |
| Architecture review | Claude | CodeX |
| Security review | Claude | CodeX |
| Critical final validation | Claude | CodeX |
| Handoff | Current executor | Reviewer |

Both Claude Code and Codex CLI must be able to perform the full workflow when needed.
Default routing improves quality and speed, but the system must not depend on a specific
tool being available for a specific phase.

### 6-8. Agent OS Execution Flow

```text
Human
↓
CEO Agent
↓
Dynamic Agent Generation
↓
Parallel Execution
↓
Review
↓
Integration
```

---

## 7. Global and Project Settings

### 7-1. Principle

Global owns behavior. Project owns facts.

Global config owns:

- Model selection
- Approval policy
- Sandbox mode
- Personality
- Notifications
- Common secret read-deny rules
- User-level skills/plugins
- Reusable hooks
- Personal defaults
- RTK permission rule

Project files own:

- Product vision
- Tasks
- State
- Decisions
- Issues
- Repo map
- Verification commands
- Project-specific secret read boundaries
- Project-specific hook or MCP config only when actually used

### 7-2. Global Settings Simplification Check

Apply this check before adding or keeping global rules:

1. If the rule is personal behavior, keep it global.
2. If the rule applies to two or more projects, keep it global.
3. If the rule is project-specific, move it into the project or delete it.
4. If the rule compensates for an old model/tool limitation, delete it after verification.
5. If the rule is a checklist that rarely changes, keep it in project docs, not global prompts.
6. Review global config every 3 to 6 months and after major model/tool releases.

### 7-3. Project Config Rule

Do not generate project `.codex` config by default. Recommend minimal
`.claude/settings.json` for `.env` read denial when Claude Code is used.

If a project config is required:

- Keep it project-specific.
- Do not set model or personality.
- Record the reason in `docs/decisions.md`.
- Prefer one deterministic hook over prompt instructions when automation is needed.
- Prefer one shared dispatcher only after two or more hooks exist.

### 7-4. Codex Project Config Shape When Required

If `.codex/config.toml` exists, include `approval_policy` and `sandbox_mode` explicitly
because Codex CLI may fall back to defaults when a project config omits them.

```toml
#:schema https://developers.openai.com/codex/config-schema.json

approval_policy = "never"
sandbox_mode = "danger-full-access"
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

Remove any feature flag not used by the project.

### 7-5. RTK Codex Permission Rule

Use one broad user-level rule instead of per-command RTK rules:

```text
prefix_rule(pattern=["rtk"], decision="allow")
```

Location:

```text
~/.codex/rules/default.rules
```

Do not add individual RTK command patterns. One broad rule prevents rule-file bloat and
eliminates repeated approval prompts.

---

## 8. PM Agent Execution Protocol

### Phase 0: Toolchain Verification

Verify only what the task needs:

```powershell
claude --version
codex --version
node --version
pnpm --version
git --version
rg --version
```

For Codex feature-dependent work, also check:

```powershell
npm view @openai/codex version
codex features list
```

### Phase 0.5: Self-Audit

Check:

- Every referenced CLI feature exists.
- Project adapters are absent unless justified.
- Hooks are absent unless they enforce a deterministic job.
- MCP is absent unless a real server is needed.
- `tasks.md`, `state.md`, and `vision.md` responsibilities are not mixed.
- Generated/build/vendor files are ignored.

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
3. Confirm every ready task has owner, dependencies, write scope, acceptance,
   verification, and evidence.
4. Initialize `docs/state.md` with branch, coordinator, and next active task.

### Phase 3: Implementation

- Read `AGENTS.md`.
- Read `docs/state.md`.
- Read `docs/repo-map.md` Summary.
- Read detailed repo-map sections only when target files are unclear.
- Claim work through the coordinator.
- Respect write scope.
- Keep diffs small.
- Add tests for new behavior.
- Record permanent decisions in `docs/decisions.md`.

### Phase 4: Verification

Choose quick / standard / final.

Record:

- Task ID
- Command
- Result
- Evidence
- Unverified items

### Phase 5: Review

Use a different model/vendor for:

- Auth
- Billing
- DB schema
- RLS / permissions
- Deploy
- Security
- 300+ line diff
- New external API
- 3 consecutive errors
- Production data / personal information / public URL impact

### Phase 6: Handoff

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

### Phase 7: Promotion Gate

Promote only evidence-backed lessons:

| Classification | Destination |
|---|---|
| Project-specific | Stay in project |
| Pattern issue | `xp-rules.md` candidate |
| OS design issue | v9.x candidate |
| Vendor adapter issue | adapter/routing candidate |

---

## 9. Standard File Specs

### 9-1. `AGENTS.md`

```markdown
# Project AGENTS.md -- pm-zero v9.5

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
- Report: HANDOFF-JA.md

## Startup Read
- Read this file.
- Read docs/state.md.
- Read docs/decisions.md.
- Read docs/repo-map.md Summary.

## Repository Navigation
- Read detailed repo-map sections only when target files are unclear.
- Update docs/repo-map.md after structural changes.
- Use rg before broad manual browsing.

## Task Ledger Rule
- tasks.md is the only execution ledger.
- Every ready task includes owner, dependencies, write scope, acceptance, verification, and evidence.
- CEO Agent updates tasks.md and docs/state.md as coordinator.

## Agent Coordination
- CEO Agent owns tasks.md and docs/state.md as coordinator.
- CEO Agent decides whether to parallelize based on Write Scope separation.
- Worker agents may edit only their assigned Write Scope.
- Parallel implementation requires disjoint Write Scopes or isolated worktrees.
- Same file -> serialize. Separate scope -> parallelize.
- Maximum 3 concurrent agents including CEO.

## Quality Standards
- Refer to Quality Gates in pm-zero-knowledge-v9.5 Section 10.
- Keep files and functions small enough to review (target 300 lines / 50 lines).
- After 3 consecutive identical errors, record in docs/issues.md and pause.
- 300+ line diffs: split or explain in docs/decisions.md.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.

## Engineering Role
- Act as a principal-level full-stack engineer.
- Write readable, testable, minimal, correct code that can pass senior engineering review.
- Do not write placeholder code or TODOs. Every committed function must work.

## Thinking Protocol
- Before code changes, decompose the task into atomic subtasks.
- Challenge assumptions from first principles and prefer the simplest correct solution.
- Compare three conceptual implementation skeletons for correctness, simplicity, testability, and cost; choose one explicitly in working notes or reports.
- Use Chain-of-Verification: draft internally, plan failure-revealing checks, verify independently, then revise using only verified facts.
- Do not output long reasoning in one shot. Provide short progress checks.
- Before using an external API or library function, verify the actual call shape or run a minimal test when uncertain.

## Coding Priorities
- Security
- Reliability
- Monitoring
- Maintainability
- Scalability
- UX polish

## Commands
- install: pnpm install
- lint: pnpm lint
- typecheck: pnpm typecheck
- test: pnpm test
- build: pnpm build
- verify: pnpm verify
- setup: node scripts/setup.mjs

Use only commands that exist in this repository.

## Execution Boundaries
- Use PowerShell.
- Use standard push with branch tracking.
- Handle every error explicitly.
- Keep safe values only in output.
- Use .env.example as template; runtime reads actual env values.
- Authentication, billing, production deploy final approval, and personal data handling are human tasks.
- All other operations are AI-executed.

## Git Workflow

### Branches
- Never commit directly to `main`. Always work on a dedicated branch.
- Naming: `<type>/<short-description>` — e.g. `feat/add-auth`, `fix/null-check`, `docs/update-readme`, `security/harden-gitignore`.
- Create the branch at the start of the task, not after implementation.

### Commits
- Commit after each logically complete unit of work. Do not accumulate changes and commit at session end.
- Format: `<type>: <short description>` — types: `feat` / `fix` / `docs` / `refactor` / `security` / `chore` / `test`.
- Stage only files within the task's Write Scope. Never stage `.env*`, secrets, or credential files.
- Every committed function must work. No placeholder code.

### Push
- Push after every commit. Do not leave commits local-only.
- First push: `git push -u origin <branch>`. Subsequent: `git push`.

### Pull Requests
- Open a PR to `main` when the branch is complete. Do not wait for the user to ask.
- PR title: conventional commit format matching the branch type.
- PR body: what changed and why.

### Pre-push Security Check
- Confirm `.gitignore` covers secret and credential patterns before the first push on any branch.
- Run `gitleaks git --no-banner` if gitleaks is available.
- If secrets are staged, untrack them and update `.gitignore` before pushing.

## Model Routing
- Default planning: Claude Code.
- Default implementation: Codex CLI.
- Either agent can perform the full workflow when needed.
- Critical changes: review by a model or vendor different from the implementer.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.
```

### 9-2. `CLAUDE.md`

```markdown
# Claude Code Adapter -- pm-zero v9.5

@AGENTS.md

## Claude-specific
- Claude Code reads CLAUDE.md. Common rules live in AGENTS.md.
- Prioritize planning, design, review, and prose quality judgment.
- Write implementation tasks to tasks.md.
- Use docs/repo-map.md Summary for navigation; read detailed sections only when needed.
- Auto-execute file, git, build, test, and lint operations according to global settings and project boundaries.

## Shell Policy
- Primary: PowerShell for all project operations.
- Project paths use Windows paths with backslash in PowerShell.
- Node.js scripts run with node scripts/name.mjs.
```

### 9-3. `docs/vision.md`

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
- Store only the current pointer in docs/state.md.
```

### 9-4. `docs/state.md`

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

### 9-5. `HANDOFF-JA.md` Additions

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

## 10. Quality Gates

### Q1. Spec / Reference Gate

- `docs/vision.md` contains product intent.
- 3+ HIGH assumptions confirmed before implementation.
- UI/API/DB/critical workflows use real repository examples before editing.

### Q2. Task Ledger Gate

- `tasks.md` exists.
- Active work maps to a task ID when task-based work is underway.
- Ready tasks include owner, dependencies, write scope, acceptance, verification, and evidence.
- Completed work updates task status and evidence.

### Q3. Repo Map Gate

- `docs/repo-map.md` exists.
- Summary stays under 20 lines.
- Structural changes update the relevant section.
- Generated/build/vendor files are listed or ignored.

### Q4. Code Gate

- Keep files and functions small enough to review.
- Target 300 lines per file and 50 lines per function.
- Meaningful naming throughout.
- Every error handled explicitly.
- Existing code style matched.
- Avoid abstractions until duplication or complexity justifies them.

### Q5. Architecture Gate

- UI / domain / data responsibilities stay separated.
- Dependencies flow in one direction.
- 300+ line diffs are split or explained in `docs/decisions.md`.
- Abstractions stay concrete and justified.

### Q6. Test Gate

- New features include tests.
- Bug fixes include reproduction tests or reproduction steps.
- Include at least one negative path when behavior changes.
- UI changes include screenshot or browser smoke when possible.

### Q7. Error Gate

- Failure cases are documented.
- User-facing errors are prepared when behavior changes.
- After 3 consecutive identical errors, record escalation in `docs/issues.md` and pause.

### Q8. Security Gate

- Safe values only in output.
- Secrets are not read unless explicitly required and safe.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, and new external API require cross-vendor review.

### Q9. Production Observability Gate

For production targets:

- Structured logging distinguishes error / warn / info.
- Secret redaction is applied.
- API / DB / auth / external API failures are traceable.
- MVP deferrals are documented in `docs/decisions.md`.

### Q10. Handoff Gate

- Report in Japanese.
- Completed task IDs listed when applicable.
- Verification steps explicitly listed.
- Unverified items explicitly listed.
- AI completes all possible work before requesting human action.

---

## 11. Verification Modes

### quick

Use for docs, small copy changes, and low-risk config changes.

Execute:

- Confirm changed files.
- Check task ID if applicable.
- Run `git diff --check`.
- Run targeted tests only when needed.

### standard

Use for normal implementation, component additions, and API changes.

Execute:

- lint
- typecheck
- build
- related tests
- task evidence update

### final

Use for pre-merge, pre-push, pre-deploy, and large-scope changes.

Execute:

- `pnpm verify` when available
- e2e tests when available
- browser smoke for UI changes
- console error check for UI changes
- git status
- `tasks.md` vs git reality reconciliation
- `docs/state.md` vs git reality reconciliation

---

## 12. MCP Policy

Do not generate `.mcp.json` by default.

Add MCP only when:

- A concrete tool or data source is required.
- The server exists in official docs or a trusted registry.
- The reason is recorded in `docs/decisions.md`.

OpenAI API / Codex / ChatGPT Apps SDK questions use official OpenAI developer docs first.

---

## 13. Shell Routing and RTK Rules

### 13-1. Shell Selection

| Operation | Shell | Reason |
|---|---|---|
| git, pnpm, npm, node | PowerShell | Project files live in Windows filesystem |
| Build, test, lint | PowerShell | Native Windows toolchain |
| File search | PowerShell + `rg` | Fast local search |
| Windows app interaction | PowerShell | Windows host access |
| Ambiguous operation | PowerShell | Deterministic default |

### 13-2. RTK Rules

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

Do not call PowerShell cmdlets directly as `rtk <Cmdlet>`.

---

## 14. Reference Integration

v9.5 applies these large-codebase practices from Anthropic's Claude Code guidance:

- Keep root context lean and limited to critical pointers and gotchas.
- Layer context so directory-specific detail is read only when relevant.
- Use skills/on-demand expertise instead of loading reusable expertise into every session.
- Use deterministic hooks for automation, not prompt reminders.
- Scope test and lint commands by area to avoid irrelevant output.
- Ignore generated files, build artifacts, dependency folders, and third-party code.
- Use repo maps when directory structure alone is not enough.
- Review configuration every 3 to 6 months and after major model/tool releases.

---

## 15. Git and GitHub Workflow Rationale

The Git Workflow rules in `AGENTS.md` encode practices that prevent two failure modes observed in real projects:

**Failure 1 — Uncommitted drift**: Changes accumulate across a session without being committed. When context compresses or the session ends, the mapping between files changed and their purpose is lost. Fix: commit after each logical unit, not at session end.

**Failure 2 — Silent local accumulation**: Changes are committed locally but never pushed. The remote is out of sync, and the user has no visibility. Fix: push immediately after every commit.

### Branch naming rationale

`<type>/<short-description>` makes the purpose of a branch legible in the GitHub PR list without opening it. This is the standard used by most open-source projects and engineering teams.

### PR creation rationale

AI agents should open PRs without being asked. The user cannot merge a branch that has no PR. PRs also serve as the permanent audit trail for what changed and why — more durable than commit messages alone.

### Pre-push security check rationale

A secret pushed to GitHub is effectively public within seconds due to automated scanners. Checking `.gitignore` coverage and running gitleaks before the first push catches the most common leak vector (accidentally staged credential files) before it becomes an incident.

---

## 15. v9.4 -> v9.5 Migration

### Preserved from v9.4

- Windows + VSCode + PowerShell environment
- Full auto-execution principle
- Positive directives
- Japanese handoff
- `docs/vision.md` as product north star
- `tasks.md` as execution ledger
- `docs/state.md` as current pointer
- `docs/repo-map.md` as navigation map
- Single Writer / Scope Lock rule
- Thin Claude adapter through `CLAUDE.md`
- RTK explicit command rules
- Single broad RTK Codex permission rule
- Codex project config safety note when project config exists
- Quality standards visible from generated `AGENTS.md`
- `.env` read denial as recommended minimal `.claude/settings.json`
- 13 default files (unchanged from v9.4)
- Hooks, MCP, skills, Codex project config, and shared script libs remain optional

### Added in v9.5

| Addition | Purpose |
|---|---|
| CEO Agent as default coordinator | Eliminates per-session coordinator prompting |
| Dynamic agent generation | CEO creates worker agents based on task complexity |
| Dynamic worktree generation | CEO creates worktrees for parallel execution |
| Model-aware agent allocation | High-performance models for reasoning, low-cost for implementation |
| Token saving policy | Maximum 3 concurrent agents; minimize token consumption |
| CodeX-centric parallel structure | CodeX for orchestration/implementation, Claude for critical review |
| Engineering Role in AGENTS.md | Principal-level engineering standards |
| Thinking Protocol in AGENTS.md | First-principles decomposition and Chain-of-Verification |
| Coding Priorities in AGENTS.md | Security, Reliability, Monitoring, Maintainability, Scalability, UX polish |

### Changed

| Item | v9.4 | v9.5 |
|---|---|---|
| Architecture | Lean Task Ledger OS | Agent OS |
| Coordinator | Prompted per session | CEO Agent is default |
| Agent generation | Static routing | Dynamic by CEO Agent |
| Model allocation | Not specified | Model-aware per worker |
| Concurrency limit | Not specified | Maximum 3 agents including CEO |
| Token policy | Not specified | Minimize by default |
| AGENTS.md | Execution rules only | Engineering Role, Thinking Protocol, Coding Priorities added |

---

## 16. Logical Destroyer Final Verification

### 16-1. Self-critique: CEO Agent as default may impose unwanted overhead

Mitigation: the CEO Agent is a role, not a separate process. When only one agent is
needed, the CEO Agent acts as the sole executor. Dynamic generation activates only when
parallelization is beneficial.

### 16-2. Self-critique: Dynamic agent generation may cause uncontrolled resource use

Mitigation: maximum 3 concurrent agents including CEO. Token consumption is minimized
by default. The CEO Agent evaluates parallelization efficiency before generating workers.

### 16-3. Self-critique: Model-aware allocation may break when models are unavailable

Mitigation: fallback routing ensures any agent can use any available model. When Claude
is unavailable, CodeX is used instead without stopping execution.

### 16-4. Self-critique: CodeX-centric design may reduce review quality

Mitigation: Claude is reserved specifically for critical review (architecture, security,
final validation). CodeX handles implementation where speed and cost matter more than
deep reasoning. Cross-vendor review requirements remain unchanged.

### 16-5. Self-critique: `tasks.md` and `state.md` can overlap

Mitigation: `tasks.md` owns task facts and evidence. `docs/state.md` owns only the current
pointer and lock. CEO Agent is the single writer for both.

### 16-6. Self-critique: Engineering Role and Thinking Protocol may conflict with existing Quality Gates

Mitigation: Engineering Role defines behavioral expectations for agents. Thinking Protocol
defines how agents reason. Quality Gates define acceptance criteria. These are complementary
layers with no overlap.

### 16-7. Final Judgment

v9.5 production confirmed:

```text
Agent OS adopted.
CEO Agent is the default coordinator from repository generation.
Dynamic agent generation based on task complexity and Write Scope.
Model-aware allocation assigns models per worker agent.
Maximum 3 concurrent agents including CEO.
Token consumption minimized by default.
CodeX handles orchestration and implementation.
Claude reserved for critical review.
Default generated repository remains 13 files.
tasks.md remains the fixed execution ledger.
docs/repo-map.md remains the hybrid summary-first navigation map.
docs/vision.md remains product north star.
docs/state.md remains current pointer.
Global config owns behavior and reusable rules.
Engineering Role, Thinking Protocol, and Coding Priorities added to AGENTS.md.
Single Writer and Scope Lock remain the concurrency model.
Write Scope isolation is the core parallelization control.
Verification evidence maps to task IDs when task-based work is underway.
Handoff remains Japanese.
```

---

## 17. v9.5 Production Summary

v9.5 evolves from **Lean Task Ledger OS** to **Agent OS**.

Quality is guaranteed by:

1. Product intent exists in `docs/vision.md`.
2. Execution tasks exist in `tasks.md`.
3. Current location exists in `docs/state.md`.
4. Repository navigation exists in `docs/repo-map.md`.
5. Decision rationale exists in `docs/decisions.md`.
6. Failure history exists in `docs/issues.md`.
7. CEO Agent is the default coordinator with dynamic orchestration.
8. Model-aware agent allocation is explicit.
9. Token consumption is minimized; maximum 3 concurrent agents.
10. CodeX handles orchestration and implementation; Claude handles critical review.
11. Global/project config boundaries are explicit.
12. Minimal `.claude/settings.json` is recommended for `.env` read denial.
13. Quality standards, Engineering Role, Thinking Protocol, and Coding Priorities are visible from generated `AGENTS.md`.
14. Write Scope isolation is the core parallelization control.
15. Scope Lock protects parallel work.
16. Verification evidence maps to task IDs when applicable.
17. Handoff is complete in Japanese.
18. Extension files are added only after a concrete need appears.

Work that does not satisfy these criteria is not considered complete under pm-zero v9.5.
