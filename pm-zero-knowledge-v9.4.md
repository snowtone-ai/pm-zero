# pm-zero-knowledge-v9.4.md

2026-05-16 final / Claude Code + Codex CLI / VSCode on Windows + PowerShell-only

---

## 0. Result

pm-zero v9.4 is the **Lean Task Ledger OS**.

v9.3 fixed planning and implementation handoff with `tasks.md` and `docs/repo-map.md`.
v9.4 keeps that architecture and removes default files, default hooks, default project
adapters, and reusable instructions that do not need to exist in every generated repo.

No new product feature is added in v9.4.

> **Lean root context + tasks.md as Execution Ledger + repo-map.md as Navigation Map**

Final decisions:

1. Adopt **Lean Task Ledger OS** as the v9.4 architecture.
2. Generate fewer project files by default.
3. Keep global settings as the owner of personal behavior, model choice, approval mode,
   sandbox mode, common secret denies, and reusable skills/plugins.
4. Add project config only when the project has a concrete project-specific need.
   Recommend minimal `.claude/settings.json` when Claude Code is used to enforce
   `.env` read denial at the tool layer.
5. Remove default hook, MCP, skill-registry, and adapter code from the generated repo,
   while keeping quality standards visible from generated `AGENTS.md`.
6. Preserve `tasks.md`, `docs/state.md`, and `docs/repo-map.md` because they prevent
   handoff loss and navigation rediscovery.
7. Apply large-codebase best practices from Anthropic: lean root context, layered
   navigation, on-demand expertise, scoped verification, generated-file ignores, and
   recurring config review.

v9.4 one-line definition:

> Non-engineer uses Claude Code and Codex CLI from VSCode on Windows PowerShell.
> `docs/vision.md` defines product intent, `tasks.md` defines executable work,
> `docs/state.md` defines the current pointer, and `docs/repo-map.md` gives agents a
> compact navigation map. Global config owns behavior. Project files own project facts.

---

## 1. First Principles

### 1-1. Essential Elements

pm-zero v9.4 requires exactly 7 primitives.

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

### 1-2. Problems v9.4 Solves

| Problem | Root Cause | v9.4 Solution |
|---|---|---|
| Generated repo has too many files | Earlier versions pre-created adapters, hooks, MCP, and skill files | Generate only required project memory and verification files |
| Project instructions become noisy | Reusable expertise is loaded in every session | Keep root context lean; use global/user skills or project docs on demand |
| Hook code exists without a deterministic job | Hooks were scaffolded before rules needed automation | Add hooks only when they enforce a known check |
| Project config duplicates global config | Project files over-specify personal defaults | Global owns behavior; project config is optional |
| Agents reopen irrelevant files | Navigation context is not layered | Read repo-map summary first; details only when needed |
| Generated/build/vendor files waste context | Ignore rules are incomplete | Keep `.gitignore` focused on generated, build, cache, dependency, and secret files |

---

## 2. Architecture

### 2-1. 5-Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-7

User Repository
  +-- Core Layer       : shared directive and handoff
  +-- Ledger Layer     : vision / tasks / state / decisions / issues
  +-- Navigation Layer : repo-map summary and details
  +-- Scripts Layer    : setup / verify
  +-- Aux Layer        : env example / gitignore
```

Removed from the default structure:

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

### 2-4. Change from v9.3

| v9.3 | v9.4 |
|---|---|
| 24 default files | 13 default files |
| Hooks scaffolded by default | Hooks optional |
| MCP config scaffolded by default | MCP optional |
| Project skill registry scaffolded by default | Skills optional/on demand |
| Separate kernel and memory docs | Rules consolidated into `AGENTS.md` and ledger docs |
| Project adapters generated by default | Project adapters generated only when needed |
| Thin project config | No project config unless required |

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
# repo-map.md -- pm-zero v9.4 Repository Map

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
# tasks.md -- pm-zero v9.4 Execution Ledger

## Goal Binding
- Vision source: docs/vision.md
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

## Blockers
| ID | Task | Blocker | Needed decision | Owner |
|---|---|---|---|---|

## Review Notes
| Task | Reviewer | Result | Follow-up |
|---|---|---|---|
```

### 5-2. Scope Lock Rule

- One coordinator owns `tasks.md` and `docs/state.md`.
- Workers edit only their assigned write scope.
- Parallel work requires disjoint write scopes or isolated worktrees.
- Tasks touching the same file are serialized.

---

## 6. Agent Routing

| Work | Default | Fallback |
|---|---|---|
| Requirement interview | Claude Code | Codex CLI |
| Product vision | Claude Code | Codex CLI |
| Task decomposition | Claude Code | Codex CLI |
| Implementation | Codex CLI | Claude Code |
| Parallel exploration | Codex subagents | Claude subagents |
| Review | Different vendor/model from implementer | Same vendor, separate thread |
| Handoff | Current executor | Reviewer |

Both Claude Code and Codex CLI must be able to perform the full workflow when needed.
Default routing improves quality and speed, but the system must not depend on a specific
tool being available for a specific phase.

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
# Project AGENTS.md -- pm-zero v9.4

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

## Quality Standards
- Refer to Quality Gates in pm-zero-knowledge-v9.4 Section 10.
- Keep files and functions small enough to review (target 300 lines / 50 lines).
- After 3 consecutive identical errors, record in docs/issues.md and pause.
- 300+ line diffs: split or explain in docs/decisions.md.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.

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

## Model Routing
- Default planning: Claude Code.
- Default implementation: Codex CLI.
- Either agent can perform the full workflow when needed.
- Critical changes: review by a model or vendor different from the implementer.
- Auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff, new external API: cross-vendor review required.
```

### 9-2. `CLAUDE.md`

```markdown
# Claude Code Adapter -- pm-zero v9.4

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

## Version Policy
- Keep the user's currently configured Claude Code version.
- Verify local version during Phase 0 when relevant.
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

v9.4 applies these large-codebase practices from Anthropic's Claude Code guidance:

- Keep root context lean and limited to critical pointers and gotchas.
- Layer context so directory-specific detail is read only when relevant.
- Use skills/on-demand expertise instead of loading reusable expertise into every session.
- Use deterministic hooks for automation, not prompt reminders.
- Scope test and lint commands by area to avoid irrelevant output.
- Ignore generated files, build artifacts, dependency folders, and third-party code.
- Use repo maps when directory structure alone is not enough.
- Review configuration every 3 to 6 months and after major model/tool releases.

---

## 15. v9.3 -> v9.4 Migration

### Preserved

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

### Removed from Default Generation

| Removed default | Replacement |
|---|---|
| `OS-KERNEL.md` | Quality Gates in `AGENTS.md` / this spec |
| `MEMORY.md` | Ledger docs |
| `CONTEXT.md` | Optional when vocabulary repeats |
| Full `.claude/settings.json` | Minimal `.env` deny is recommended; hooks remain optional |
| `.claude/hooks/dispatcher.mjs` | Optional deterministic hooks |
| `.codex/config.toml` | Global settings unless project-specific config is needed |
| `.codex/hooks.json` | Optional deterministic hooks |
| `.codex/hooks/dispatcher.mjs` | Optional after hooks exist |
| `.claude/skills/index.md` | Global/user skills or optional project skills |
| `.mcp.json` | Optional MCP only |
| `scripts/lib/redact.mjs` | Inline or add only after shared code exists |

### Changed

| Item | v9.3 | v9.4 |
|---|---|---|
| Default file count | 24 | 13 |
| Architecture | Dual-Agent Task Ledger OS | Lean Task Ledger OS |
| Project adapters | Generated thin adapters | Optional adapters |
| Hooks | Scaffolded | Add only for deterministic jobs |
| MCP | Scaffolded empty config | Omitted unless used |
| Global settings | Personal behavior plus some mirrored project config | Main behavior plane; project config optional |
| Code generation | Shared dispatcher/lib scaffolds | Generate code only when called by a file |

---

## 16. Logical Destroyer Final Verification

### 16-1. Self-critique: Fewer files may hide important rules

Mitigation: essential rules remain in `AGENTS.md`, `tasks.md`, `docs/state.md`,
`docs/decisions.md`, and `docs/repo-map.md`. Optional files are created when the rules
outgrow those locations.

### 16-2. Self-critique: Removing project config may weaken safety

Mitigation: global settings own baseline behavior. Minimal `.claude/settings.json` is
recommended to enforce `.env` read denial at the tool layer. Project-specific secret
boundaries can still be added and recorded in `docs/decisions.md`.

### 16-3. Self-critique: Optional hooks may reduce automation

Mitigation: hooks are added only when a deterministic command exists. This avoids inert
dispatcher code and keeps automation auditable.

### 16-4. Self-critique: Removing project skill registry may reduce expertise

Mitigation: skills remain available globally or on demand. Project-local skill files are
added only when project-specific workflows repeat.

### 16-5. Self-critique: `tasks.md` and `state.md` can overlap

Mitigation: `tasks.md` owns task facts and evidence. `docs/state.md` owns only the current
pointer and lock.

### 16-6. Final Judgment

v9.4 production confirmed:

```text
Lean Task Ledger OS adopted.
Default generated repository shrinks from 24 files to 13 files.
No new product features added.
tasks.md remains the fixed execution ledger.
docs/repo-map.md remains the hybrid summary-first navigation map.
docs/vision.md remains product north star.
docs/state.md remains current pointer.
Global config owns behavior and reusable rules.
Project config is absent unless a project-specific need exists.
Minimal .claude/settings.json is recommended for .env read denial.
Quality standards are visible from generated AGENTS.md.
Hooks, MCP, skills, Codex project config, and shared script libs are optional.
Single Writer and Scope Lock remain the concurrency model.
Verification evidence maps to task IDs when task-based work is underway.
Handoff remains Japanese.
```

---

## 17. v9.4 Production Summary

v9.4 evolves from **Dual-Agent Task Ledger OS** to **Lean Task Ledger OS**.

Quality is guaranteed by:

1. Product intent exists in `docs/vision.md`.
2. Execution tasks exist in `tasks.md`.
3. Current location exists in `docs/state.md`.
4. Repository navigation exists in `docs/repo-map.md`.
5. Decision rationale exists in `docs/decisions.md`.
6. Failure history exists in `docs/issues.md`.
7. Claude/Codex routing is explicit.
8. Global/project config boundaries are explicit.
9. Minimal `.claude/settings.json` is recommended for `.env` read denial.
10. Quality standards are visible from generated `AGENTS.md`.
11. Scope Lock protects parallel work.
12. Verification evidence maps to task IDs when applicable.
13. Handoff is complete in Japanese.
14. Extension files are added only after a concrete need appears.

Work that does not satisfy these criteria is not considered complete under pm-zero v9.4.
