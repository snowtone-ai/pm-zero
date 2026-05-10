# pm-zero-knowledge-v9.2.md

2026-05-10 final / Claude Code + Codex CLI / VSCode on Windows + PowerShell-only

---

## 0. Result

pm-zero v9.2 is the **CLI-Native Minimal Agent OS**.

v9.1 unified files and established the Minimal OS pattern. v9.2 completes the migration to CLI-only execution, eliminates all permission interruptions, and integrates composable skill architecture.

> **CLI-Native OS + Composable Skills + Full Auto-Execution**

- v9.1 legacy: 25-file Minimal OS, dispatcher, skill index, Quality Gates, Lazy Read Rule, Single Writer Rule, Promotion Gate preserved.
- v9.2 new: CLI-only execution, full auto-permission, PowerShell-only execution with clear Windows path rules, composable skills (mattpocock/skills pattern), CONTEXT.md domain layer, positive-only instruction language.
- Removed: Claude/ChatGPT app references, question count limits, negative prohibition language.

v9.2 one-line definition:

> Non-engineer uses Claude Code and Codex CLI from VSCode on Windows PowerShell. Both CLIs auto-execute safe operations. The shell policy is PowerShell-only with Windows paths. Single Writer Rule prevents conflicts. Composable skills keep context minimal. Top-engineer quality through verification gates, not file volume.

---

## 1. First Principles

### 1-1. Essential Elements

pm-zero requires exactly 7 primitives.

| Element | Role | Entity |
|---|---|---|
| Intent | What to build | `docs/vision.md` |
| State | Current progress | `docs/state.md` |
| Decision | Why we chose this | `docs/decisions.md` |
| Guardrail | Safe execution boundaries | `AGENTS.md` / `OS-KERNEL.md` |
| Adapter | Claude/Codex CLI differences | `.claude/` / `.codex/` |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates |
| Handoff | Human-readable report | `HANDOFF-JA.md` |

Everything else loads on demand.

### 1-2. Problems v9.2 Solves

| Problem | Root Cause | v9.2 Solution |
|---|---|---|
| Permission prompts interrupt flow | Restrictive default permissions | Full auto-execution via bypassPermissions + comprehensive allow list |
| Windows/PowerShell confusion | Mixed shell assumptions | PowerShell-only operation from VSCode on Windows |
| App/CLI mode confusion | Mixed execution targets | CLI-only execution |
| Negative instructions confuse LLMs | Prohibition-heavy language | Positive-only directives |
| Skills are flat and rigid | Monolithic index.md | Composable skill architecture with CONTEXT.md |
| Question phase too constrained | Hard limit 15-25 questions | Unlimited questions until information is sufficient |
| Stale version-specific info | Hardcoded values | Phase 0 live verification |

---

## 2. Three Concept Skeletons and Selection

### Skeleton A: v9.1 + Permission Patch

Keep v9.1 structure, only update settings.json for auto-execution.

- Success rate: 70%
- Implementation ease: High
- Token efficiency: Same as v9.1
- Root fix: Low
- Verdict: Rejected. Leaves shell routing undefined, app references, and negative language intact.

### Skeleton B: CLI-Native Rewrite

Rewrite all 25 files from scratch for a CLI-only PowerShell environment.

- Success rate: 80%
- Implementation ease: Medium
- Token efficiency: High
- Root fix: High
- Verdict: Partial adoption. Clean start risks losing proven v9.1 patterns.

### Skeleton C: CLI-Native Evolution + Composable Skills

Evolve v9.1 architecture. Replace environment layer, integrate composable skills, convert to positive language, keep proven core.

- Success rate: 93%
- Implementation ease: High
- Token efficiency: High
- Root fix: High
- Verdict: Adopted. Preserves working patterns while solving all v9.2 targets.

### Final Selection

**Skeleton C adopted. Evolutionary migration preserving v9.1 core with CLI-native + composable skills overlay.**

---

## 3. v9.2 Architecture

### 3-1. 4-Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-2

User Repository
  +-- Core Layer        : OS philosophy, directives, handoff
  +-- Scripts Layer     : setup / verify
  +-- Adapter Layer     : Claude Code / Codex CLI difference absorption
  +-- Memory Layer      : state, decisions, failure logs
  +-- Skills Layer      : composable, on-demand skills with CONTEXT.md
  +-- Aux Layer         : env / mcp / gitignore
```

### 3-2. File Structure (22 files)

#### Core Layer (5)

1. `AGENTS.md` -- Primary directive. All agents share this.
2. `CLAUDE.md` -- Claude Code adapter. Imports `@AGENTS.md` as thin layer.
3. `OS-KERNEL.md` -- Quality Gates / Verification / routing / security spec.
4. `MEMORY.md` -- External Memory operation spec.
5. `HANDOFF-JA.md` -- Japanese completion/error report template.

#### Scripts Layer (2)

6. `scripts/setup.mjs` -- Windows PowerShell setup (Node.js).
7. `scripts/verify.mjs` -- Final verify unified entry point.

#### Adapter Layer (5)

8. `.claude/settings.json` -- Full auto-execution permissions.
9. `.claude/hooks/dispatcher.mjs` -- Unified hook handler.
10. `.codex/config.toml` -- Codex CLI config.
11. `.codex/hooks.json` -- Codex hook registry.
12. `.codex/hooks/dispatcher.mjs` -- Codex unified hook handler.

#### Memory Layer (4)

13. `docs/vision.md` -- Spec, success criteria, failure cases.
14. `docs/state.md` -- Current state, Write Lock, verification state.
15. `docs/decisions.md` -- Permanent decisions, Reference URLs, review triggers.
16. `docs/issues.md` -- Failure log, Escalation, review timeout.

#### Skills Layer (3)

17. `CONTEXT.md` -- Shared domain vocabulary for token reduction.
18. `.claude/skills/index.md` -- Skill registry and routing.
19. `scripts/lib/redact.mjs` -- Shared secret redaction.

#### Aux Layer (3)

20. `.mcp.json` -- MCP server configuration.
21. `.env.example` -- Environment variable template.
22. `.gitignore` -- Git ignore rules.

### 3-3. Reduction from v9.1 (25 -> 22)

| Removed | Reason |
|---|---|
| `templates/agents/*.md` (4 files) | Absorbed into composable skills and CONTEXT.md |
| `templates/rules/karpathy.md` | Absorbed into OS-KERNEL.md quality philosophy |
| Added: `CONTEXT.md` | mattpocock/skills pattern: shared domain vocab reduces tokens ~75% |

---

## 4. Operational Rules

### 4-1. Single Writer Rule

Only one AI holds write permission on the same repository and branch at a time.

```text
OK:
Claude Code plans -> Codex CLI implements -> Claude Code reviews

NG:
Claude Code and Codex CLI edit the same branch simultaneously
```

`docs/state.md` always records:

```markdown
Current executor: Claude Code / Codex CLI / none
Write lock: Claude Code / Codex CLI / none
```

### 4-2. AGENTS.md First

- Codex reads `AGENTS.md` as primary directive.
- Claude Code reads `CLAUDE.md`, which imports `@AGENTS.md`.
- Write each rule once, in `AGENTS.md`. `CLAUDE.md` contains only Claude-specific additions.

### 4-3. Lazy Read Rule

22 files deploy together. Runtime reads only what is needed.

- Always read: `AGENTS.md`, `docs/state.md`, `docs/decisions.md`
- On demand: `OS-KERNEL.md`, `MEMORY.md`, `HANDOFF-JA.md`, `CONTEXT.md`
- On skill invocation: `.claude/skills/index.md`
- On verify: `scripts/verify.mjs`

### 4-4. Phase 0 Mandatory

Latest specs, pricing, limits, CLI options, MCP names, external APIs are verified live. Phase 0 checks official sources before every project.

Verification targets:

1. Claude Code official docs
2. Codex CLI official docs
3. Framework official docs in use
4. External API official docs
5. MCP / npm package existence
6. Windows PowerShell constraints
7. Windows host + PowerShell constraints

### 4-5. Full Auto-Execution Principle

All safe operations execute automatically. The AI asks for human input only for:
- Decisions requiring domain expertise
- Ambiguous requirements that need clarification
- Operations listed in section 11 "Human approval required"

The AI executes everything else immediately: file read/write, git operations, package management, build, test, lint, verification.

### 4-6. Positive Instruction Principle

All directives use affirmative language.

| Old (v9.1) | New (v9.2) |
|---|---|
| secretを読まない・出力しない | safe values only in output |
| force push禁止 | use standard push only |
| 空catch禁止 | handle every error explicitly |
| 過剰抽象化を避ける | keep abstractions concrete and justified |

---

## 5. PM Agent Execution Protocol

### Phase 0: Fact Verification

- Verify current CLI specs
- Verify current tech stack specs
- Confirm MCP/API/package names exist
- Use only features confirmed in official docs

### Phase 0.5: Self-Audit

Destructively verify:

- Every feature referenced exists in official docs
- Hook/config definitions match their script implementations
- Claude / Codex differences are correctly separated
- Version-specific claims are marked for Phase 0 live check

### Phase 0.6: Reference-First Research

Ground UI / API / DB / workflow in real-world examples.

Before implementation:

1. Find 3 existing examples
2. Document adopted elements and avoided elements
3. Record in `docs/decisions.md`
4. After implementation, compare with screenshot / test / log

### Phase 1: PM Interview

Ask all questions needed to fully understand the project. Continue until all required information is gathered, then report completion of the question phase.

Coverage:

1. Purpose
2. Target users
3. Success criteria
4. Primary flows
5. Constraints
6. Failure cases
7. Priorities

When 3+ HIGH assumptions accumulate, ask immediately.

### Phase 2: File Generation

- Generate all 22 files together.
- Each file stays lean; long procedures go into on-demand references.

### Phase 3: Implementation CLI Selection

- Design is ambiguous: Claude Code Thinking
- Implementation is clear: Codex CLI
- Review: Use a model different from the implementer
- 3 consecutive failures: Escalate to alternate model

### Phase 4: Implementation

- Read `docs/state.md`
- Confirm Write Lock
- Small diffs
- Add tests for new features
- Record permanent decisions in `docs/decisions.md`

### Phase 5: Verification

Choose from quick / standard / final.

### Phase 6: Handoff

Report in Japanese following `HANDOFF-JA.md`.

### Phase 7: Promotion Gate

After completion, classify lessons:

| Classification | Destination |
|---|---|
| Project-specific | Stay in project, not promoted |
| Pattern Issue | xp-rules candidate |
| OS Design Issue | v9.x candidate |
| Vendor Adapter Issue | adapter/routing candidate |

Promotion requires evidence in `docs/issues.md` / `docs/decisions.md` / git diff / review log / verify log.

---

## 6. Standard File Specs

### 6-1. AGENTS.md

```markdown
# Project AGENTS.md -- pm-zero v9.2

## Language
- Completion reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately.

## Source of Truth
- Spec: docs/vision.md
- Current state: docs/state.md
- Decisions: docs/decisions.md
- Failures: docs/issues.md
- Quality: OS-KERNEL.md
- Domain vocabulary: CONTEXT.md
- Report: HANDOFF-JA.md

## Execution Rules
- One AI holds write lock at a time.
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
- Use standard push only (standard git push, with branch tracking).
- Handle every error explicitly.
- Keep safe values only in output.
- Use .env.example as template; read actual .env through application runtime only.
- Authentication, billing, production deploy final approval, and personal data handling: human tasks.
- All other operations: AI auto-executes.

## Model Routing
- Ambiguous design: Claude Code Thinking
- Clear implementation: Codex CLI / Claude Code
- Lightweight fixes: lightweight model
- Critical changes: review by a model different from the implementer
- Auth, billing, DB, permissions, deploy, security, 300+ line diff: cross-vendor review required.
```

### 6-2. CLAUDE.md

```markdown
# Claude Code Adapter -- pm-zero v9.2

@AGENTS.md

## Claude-specific
- Claude Code reads CLAUDE.md. Common rules: AGENTS.md is the single source.
- Prioritize: planning, design, review, prose quality judgment.
- Maintain separate branch from Codex CLI at all times.
- Skill commands: read .claude/skills/index.md for the relevant section.
- Auto-execute all file, git, build, test, lint operations immediately.

## Shell Policy
- Primary: PowerShell for all project operations (git, pnpm, node, build, test, lint).
- Use the same PowerShell environment for Windows path access and system-level tasks.
- Default to PowerShell when either shell can accomplish the task.
- Project paths use Windows paths with backslash (\\) in PowerShell.

## Optimized for
- Claude Code CLI v2.1.101
- Opus 4.6 model
- VSCode on Windows
- PowerShell terminal
- bypassPermissions mode
```

### 6-3. CONTEXT.md (New in v9.2)

```markdown
# CONTEXT.md -- Project Domain Vocabulary

## Purpose
Shared domain language consumed by all skills and agents.
Reduces token usage by establishing common terms once.

## Project Terms
- [Term]: [Definition]

## Architecture Terms
- [Term]: [Definition]

## User-Facing Terms
- [Term]: [Definition]

## Update Rules
- Add terms when a new domain concept appears 3+ times in conversation.
- Keep definitions under 20 words each.
- Review and prune after each major feature completion.
```

### 6-4. OS-KERNEL.md

Required content:

```markdown
# OS-KERNEL.md

## Quality Gates
1. Spec / Reference Gate
2. Code Gate
3. Architecture Gate
4. Test Gate
5. Error Gate
6. Security Gate
7. Observability Gate
8. Handoff Gate

## Verification Modes
- quick
- standard
- final

## Cross-vendor Review Triggers
- Authentication
- Billing
- DB schema
- RLS / permissions
- Deploy
- Security
- 300+ line diff
- New external API
- 3 consecutive errors
- Production data, personal info, public URL impact

## Shell Policy
- Primary shell: PowerShell for all project operations.
- Shell: PowerShell on the Windows host.
- Default to PowerShell when either shell can accomplish the task.
- Node.js scripts (.mjs) run from PowerShell via the `node` command.

## PowerShell Rules (project operations)
- Use PowerShell cmdlets or Windows CLI tools consistently.
- Path separator: backslash (\) for Windows paths.
- Environment variables: $env:KEY = "val".
- Redirect stderr: 2>$null.
- Create directories: New-Item -ItemType Directory -Force.
- Chain commands: cmd1; if ($LASTEXITCODE -eq 0) { cmd2 }.
- Node.js scripts run with `node scripts/name.mjs`.

## PowerShell Rules (Windows-side operations)
- Use Verb-Noun cmdlet naming (Get-ChildItem, New-Item).
- Path separator: backslash (\) for Windows paths.
- Environment variables: $env:KEY = "val".
- Redirect stderr: 2>$null.
- Create directories: New-Item -ItemType Directory -Force.
- Chain commands: cmd1; if ($LASTEXITCODE -eq 0) { cmd2 }.
- Use single-quoted here-strings (@'...'@) for multiline arguments.
```

### 6-5. MEMORY.md

```markdown
# MEMORY.md

## External Memory
State lives in files, independent of LLM memory.

## Files
- docs/vision.md: spec, success criteria, failure cases
- docs/state.md: current state, Write Lock, verification state
- docs/decisions.md: permanent decisions, Reference URLs, future review conditions
- docs/issues.md: failure log, Escalation, review timeout

## Rules
- Only mark work complete when state.md confirms it.
- Only assume a decision when decisions.md records it.
- Check issues.md before repeating a known-failed approach.
- After 3 consecutive failures, record in Escalation.
```

### 6-6. docs/state.md

```markdown
# state.md

## Current
- Branch:
- Current executor: Claude Code / Codex CLI / none
- Write lock: Claude Code / Codex CLI / none
- Last verified:
- Verification mode:

## Done
- [x]

## Doing
- [ ]

## Next
- [ ]

## Blocked
- [ ]
```

### 6-7. docs/decisions.md

```markdown
# decisions.md

## D-xxx: [Decision Name]
- Date:
- Target: UI / API / DB / architecture / workflow
- Decision:
- Adoption reason:
- Reference examples:
  - [URL] -- adopted element
  - [URL] -- adopted element
  - [URL] -- avoided element
- Rejected alternatives:
- Future review condition:

## Future Changes
- [future change candidates]
```

### 6-8. docs/issues.md

```markdown
# issues.md

## Error Log

### I-xxx: [Error Name]
- Datetime:
- Category: dependency / type / lint / runtime / UI / API / auth / security / observability / flaky
- Location:
- Content:
- Attempts:
  1.
  2.
  3.
- Result:
- Prevention:

## Escalation

### E-xxx: [Task Name]
- 3x failed content:
- Root cause hypothesis:
- Next model:
- Handoff summary:
```

### 6-9. HANDOFF-JA.md

```markdown
# HANDOFF-JA.md

## Completion Report Template

### What was done
- [content]

### Changed files
- [path]

### Verification
- Mode: quick / standard / final
- Commands:
  - [command]
- Results:
  - [result]

### Design decisions
- docs/decisions.md: [item]

### Current state
- docs/state.md updated: yes / no
- git status: clean / dirty

### Human actions needed
- [Only operations AI cannot perform]

### Remaining tasks
- None / [content]

---

## Error Report Template

### What is happening
- [one line]

### Category
- [dependency / type / lint / runtime / UI / API / auth / security / observability]

### Attempt history
1. [attempt] -> [result]
2. [attempt] -> [result]
3. [attempt] -> [result]

### Human actions needed
- [Only operations AI cannot perform]
```

---

## 7. Adapter Layer

### 7-1. .claude/settings.json (Full Auto-Execution, PowerShell-only)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "MultiEdit",
      "Glob",
      "Grep",
      "WebFetch",
      "WebSearch",
      "PowerShell(pnpm *)",
      "PowerShell(npm *)",
      "PowerShell(npx *)",
      "PowerShell(node *)",
      "PowerShell(git *)",
      "PowerShell(gh *)",
      "PowerShell(mkdir *)",
      "PowerShell(cp *)",
      "PowerShell(mv *)",
      "PowerShell(cat *)",
      "PowerShell(ls *)",
      "PowerShell(pwd)",
      "PowerShell(which *)",
      "PowerShell(echo *)",
      "PowerShell(touch *)",
      "PowerShell(chmod *)",
      "PowerShell(head *)",
      "PowerShell(tail *)",
      "PowerShell(wc *)",
      "PowerShell(sort *)",
      "PowerShell(uniq *)",
      "PowerShell(find *)",
      "PowerShell(grep *)",
      "PowerShell(rg *)",
      "PowerShell(fd *)",
      "PowerShell(fdfind *)",
      "PowerShell(sed *)",
      "PowerShell(awk *)",
      "PowerShell(curl *)",
      "PowerShell(wget *)",
      "PowerShell(tar *)",
      "PowerShell(zip *)",
      "PowerShell(unzip *)",
      "PowerShell(diff *)",
      "PowerShell(rtk *)",
      "PowerShell(Get-ChildItem *)",
      "PowerShell(New-Item *)",
      "PowerShell(Copy-Item *)",
      "PowerShell(Move-Item *)",
      "PowerShell(Get-Content *)",
      "PowerShell(Set-Location *)",
      "PowerShell(Test-Path *)",
      "PowerShell(Invoke-WebRequest *)",
      "PowerShell(node *)",
      "PowerShell(pnpm *)",
      "PowerShell(npm *)",
      "PowerShell(git *)",
      "PowerShell(gh *)",
      "mcp__context7__resolve-library-id",
      "mcp__context7__query-docs",
      "mcp__brave-search__brave_web_search"
    ],
    "deny": [
      "PowerShell(Remove-Item -Recurse -Force /)",
      "PowerShell(sudo *)",
      "PowerShell(git push --force *)",
      "PowerShell(git push -f *)",
      "PowerShell(git reset --hard *)",
      "PowerShell(git clean -fd *)",
      "PowerShell(Remove-Item -Recurse -Force /)",
      "PowerShell(git push --force *)",
      "PowerShell(git push -f *)",
      "PowerShell(git reset --hard *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)"
    ]
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/dispatcher.mjs --event=SessionStart" }]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/dispatcher.mjs --event=PostToolUseFailure" }]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/dispatcher.mjs --event=UserPromptSubmit" }]
      }
    ]
  }
}
```

### 7-2. .codex/config.toml

```toml
model = "o3"
model_reasoning_effort = "high"
approval_policy = "full-auto"
sandbox_mode = "workspace-write"

[features]
codex_hooks = true

[profiles.standard]
model_reasoning_effort = "medium"

[profiles.light]
model_reasoning_effort = "low"
```

### 7-3. .codex/hooks.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [{ "type": "command", "command": "node .codex/hooks/dispatcher.mjs --event=SessionStart" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "PowerShell",
        "hooks": [{ "type": "command", "command": "node .codex/hooks/dispatcher.mjs --event=PreToolUse" }]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "node .codex/hooks/dispatcher.mjs --event=PostToolUseFailure" }]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "node .codex/hooks/dispatcher.mjs --event=Stop" }]
      }
    ]
  }
}
```

### 7-4. dispatcher.mjs Common Spec

Claude / Codex both use a single dispatcher. Individual hook scripts stay consolidated.

Required handlers:

| Handler | Role |
|---|---|
| SessionStart | Lightweight injection of `docs/state.md` / `docs/decisions.md` |
| PostToolUseFailure | Redact secrets, append to `docs/issues.md` |
| UserPromptSubmit | Claude only. Warn against re-executing completed work |
| PreToolUse | Command boundary enforcement |
| Stop | Lightweight incomplete-state warning only |

Design principles:

- Stop hook stays lightweight (status check only, full verify runs separately)
- All payloads pass through redaction before storage
- Hook failures log warnings; they never block the main process
- Raw payloads are transformed before storage

Required redaction:

`scripts/lib/redact.mjs` is the single source. Both dispatchers import from it.

```javascript
// scripts/lib/redact.mjs
const REDACT_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{20,}/g,
  /gh[psuor]_[a-zA-Z0-9_]{20,}/g,
  /Bearer\s+[a-zA-Z0-9._-]+/gi,
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
  /(password|token|secret|key|authorization)["':=\s]+["']?[^"'\s,}]{8,}/gi,
];

export function redact(text) { ... }
export function warnHookFailure(scope, error) { ... }
```

---

## 8. Composable Skill Architecture (New in v9.2)

Integrated from mattpocock/skills design pattern.

### 8-1. Design Philosophy

- Each skill is a self-contained, independently loadable unit.
- Skills share domain vocabulary through `CONTEXT.md` (reduces tokens ~75%).
- Skills are model-agnostic: work with both Claude Code and Codex CLI.
- Per-project setup phase configures context consumed by all skills.

### 8-2. Skill Registry

`.claude/skills/index.md` serves as the registry.

```markdown
# pm-zero v9.2 Skill Index

## Skill Loading
Read only the section needed. Each skill is self-contained.

## S1 /resume
Read state / decisions / issues. Identify restart point. Report current status.

## S2 /escape
Organize 3x-failed task into Escalation format. Prepare handoff for alternate model.

## S3 /audit
Verify pm-zero knowledge / repo rules / official docs are current. Report staleness.

## S4 /reference
Find 3 real-world examples. Record in docs/decisions.md with adopted/avoided elements.

## S5 /ev
Classify post-completion lessons into: Project-specific / Pattern / OS Design / Vendor Adapter.

## S6 /env-guide
Decompose API key / OAuth / deploy setup into human-executable steps only.

## S7 /console-debug
Classify browser console / pageerror / network errors. Propose fix per category.

## S8 /verify
Select verification mode (quick / standard / final) and execute.

## S9 /context-update
Review CONTEXT.md. Add new domain terms appearing 3+ times. Prune obsolete terms.

## S10 /setup
Run scripts/setup.mjs. Verify directory structure. Report readiness.
```

### 8-3. Adding Custom Skills

New skills follow this template:

```markdown
## Sxx /skill-name
[One-line purpose]
[Step-by-step procedure]
[Output format]
```

Add to `.claude/skills/index.md` and record the addition in `docs/decisions.md`.

---

## 9. Quality Gates

All completion reports pass these gates proportional to change scope.

### Q1. Spec / Reference Gate

- `docs/vision.md` contains purpose, users, success criteria.
- UI/API/DB/critical workflows have 3 real examples in `docs/decisions.md`.
- 3+ HIGH assumptions confirmed before implementation.

### Q2. Code Gate

- Target 300 lines per file.
- Target 50 lines per function.
- Meaningful naming throughout.
- Every error handled explicitly.
- Match existing code style.

### Q3. Architecture Gate

- UI / domain / data responsibilities stay separated.
- Dependencies flow in one direction.
- 300+ line diffs: split, or document reason in `docs/decisions.md`.
- Keep abstractions concrete and justified.

### Q4. Test Gate

- New features include tests.
- Bug fixes include reproduction test or reproduction steps.
- Include at least 1 negative path.
- UI changes: screenshot or browser smoke.

### Q5. Error Gate

- Failure cases documented in spec.
- User-facing error messages prepared.
- 3 consecutive identical errors: Escalation.

### Q6. Security Gate

- Safe values only in output.
- Environment secrets accessed through application runtime only.
- Auth, billing, DB, permissions, deploy, external API: cross-vendor review.

### Q7. Observability Gate

For production targets:

- Structured logging (error / warn / info differentiated).
- Secret redaction applied.
- API / DB / auth / external API failures are traceable.
- MVP deferrals documented in `docs/decisions.md`.

### Q8. Handoff Gate

- Report in Japanese.
- Verification steps explicitly listed.
- Unverified items explicitly listed.
- AI completes all possible work before requesting human action.

---

## 10. Verification Modes

### quick

Use for: doc edits, small copy changes, low-risk config changes.

Execute:

- Confirm target files
- State impact scope
- Run targeted tests only if needed

### standard

Use for: normal implementation, component additions, API changes.

Execute:

- lint
- typecheck
- build
- related tests

### final

Use for: pre-merge, pre-push, pre-deploy, large-scope changes.

Execute:

- `pnpm verify`
- e2e tests
- browser smoke
- console error check
- screenshot capture
- git status
- `docs/state.md` vs git reality reconciliation

### scripts/verify.mjs Required Steps

1. Package manager detection
2. Adapter integrity check
3. lint
4. typecheck
5. build
6. unit tests
7. e2e tests
8. Production server startup
9. Browser smoke
10. Screenshot capture
11. Log capture
12. Exit code classification

Cross-platform rules:

- Scripts use Node.js (`node scripts/verify.mjs`), which runs on both Windows and Windows.
- `spawn` detects shell: PowerShell on Windows, cmd.exe/PowerShell on Windows.
- Use `pnpm` directly (available in both environments via PATH).
- On Windows: `pnpm` resolves natively. On Windows: `pnpm.cmd` resolves via npm shims.
- `spawn` fallback: if direct spawn fails on Windows, retry with `cmd.exe /d /s /c`.
- Verify server uses dedicated port.
- Respect user's running dev server.

---

## 11. Permission Design

### AI auto-executes

- pnpm install / lint / typecheck / test / build
- Playwright / screenshot / console check
- git status / diff / add / commit / push / pull / fetch / checkout
- gh pr create / gh pr view / gh pr diff / gh pr merge
- File create / read / edit / delete (within project)
- curl / wget for API verification
- All shell utilities (find, grep, sed, awk, etc.)

### Human approval required

- Production deploy final approval
- API key issuance
- OAuth authorization
- Billing changes
- Personal data / production data handling decisions

### Execution boundaries

- Use standard push with branch tracking
- Use standard reset (soft/mixed) only
- Safe file cleanup only (targeted rm, within project scope)
- Environment secrets: read through application runtime, template via .env.example

---

## 12. scripts/setup.mjs

```javascript
#!/usr/bin/env node
import fs from 'node:fs/promises';

const dirs = [
  'docs',
  'scripts/lib',
  '.claude/hooks',
  '.claude/skills',
  '.codex/hooks',
  'screenshots',
  'logs'
];

for (const dir of dirs) {
  await fs.mkdir(dir, { recursive: true });
  console.log(`created: ${dir}`);
}

console.log('pm-zero v9.2 directory structure ready.');
```

---

## 13. MCP Policy

`.mcp.json` initial value:

```json
{ "mcpServers": {} }
```

Rules:

- Add MCP servers only after confirming existence in official docs or npm.
- Record addition reason in `docs/decisions.md`.
- Playwright verification uses repo-internal tests as primary; MCP is optional.

---

## 14. Subagent Policy

Standard agents: 4 only.

| Agent | Use |
|---|---|
| planner | Break PM requirements into small tasks |
| architect-reviewer | Design and dependency direction review |
| refactor-reviewer | Naming, responsibility, split review |
| playwright-verifier | Browser verification |

Other roles (implementer, test-writer, docs-writer) absorb into the normal implementation loop. Separate agents for these increase context and file count without proportional benefit.

---

## 15. Shell Routing and Rules

### 15-1. Shell Selection Matrix

| Operation | Shell | Reason |
|---|---|---|
| git, pnpm, npm, node (project) | PowerShell (Windows) | Project files live in Windows filesystem |
| Build, test, lint | PowerShell (Windows) | node_modules in Windows, native performance |
| File search (rg, fd, find) | PowerShell (Windows) | Windows filesystem access |
| Windows app interaction | PowerShell | Windows-host process access |
| Windows path operations | PowerShell | Native backslash path handling |
| System-level Windows tasks | PowerShell | Windows API access |
| Ambiguous / either works | PowerShell (Windows) | Default to primary shell |

### 15-2. PowerShell Rules (Windows host)

| Task | Command |
|---|---|
| Chain commands | `; if ($LASTEXITCODE -eq 0) { ... }` |
| Suppress stderr | `2>$null` |
| Remove recursively | `Remove-Item -Recurse -Force <target>` (within project scope only) |
| Create directories | `New-Item -ItemType Directory -Force` |
| Set env variable | `$env:KEY = "val"` |
| Multiline string | here-string `@'...'@` |
| Find files | `Get-ChildItem -Recurse` or `rg --files` |
| Search content | `rg` |
| Run with RTK | `rtk <command>` for noisy commands |

### 15-3. Windows Path Rules

| Task | Command |
|---|---|
| Chain commands | `; if ($LASTEXITCODE -eq 0) { ... }` |
| Suppress stderr | `2>$null` |
| Remove recursively | `Remove-Item -Recurse -Force <target>` (within project scope only) |
| Create directories | `New-Item -ItemType Directory -Force` |
| Set env variable | `$env:KEY = "val"` |
| Multiline string | here-string `@'...'@` (closing tag at column 0) |
| Call exe with spaces | `& "C:\Program Files\app\app.exe" arg1` |
| Project path | `C:\Users\chidj\project\<repo>` |

### 15-4. PowerShell Awareness

- Claude Code runs from the Windows PowerShell environment.
- Codex CLI runs from the Windows PowerShell environment.
- Node.js scripts (.mjs) run from PowerShell with `node scripts/...`.
- `rtk` targets (git, pnpm, etc.) work from PowerShell. Use direct commands in PowerShell.

---

## 16. Positive Directives

All operational rules expressed as what to do, not what to avoid.

| Directive |
|---|
| Use standard git push with branch tracking |
| Handle every error with explicit recovery or escalation |
| Keep safe values only in output; secrets stay in runtime |
| Read .env.example for variable names; application reads actual values |
| Keep one AI as writer at a time |
| Write each rule once in AGENTS.md |
| Consolidate hooks into dispatcher.mjs |
| Consolidate skills into index.md |
| Stop hook performs status check only |
| Redact all payloads before storage |
| Ground UI/API/DB designs in 3 real examples |
| Run tests before completion reports |
| Update docs/state.md before completion reports |
| Include observability in production-target features |
| Complete all AI-possible work before requesting human action |
| Promote lessons only with evidence from docs/issues.md, decisions.md, git diff, or logs |
| Use PowerShell for project operations and Windows-host operations |

---

## 17. v9.1 -> v9.2 Migration

### Preserved

- `AGENTS.md` (updated to v9.2 spec)
- `CLAUDE.md` (updated to v9.2 spec)
- `OS-KERNEL.md` (shell rules updated for PowerShell-only routing)
- `MEMORY.md`
- `HANDOFF-JA.md`
- `docs/vision.md`
- `docs/state.md`
- `docs/decisions.md`
- `docs/issues.md`
- `.env.example`
- `.gitignore`
- `scripts/verify.mjs` (cross-platform adaptation)
- `scripts/lib/redact.mjs`
- `.mcp.json`

### Added

| File | Purpose |
|---|---|
| `CONTEXT.md` | Shared domain vocabulary (mattpocock/skills pattern) |

### Removed

| File | Reason |
|---|---|
| `templates/agents/planner.md` | Absorbed into composable skills |
| `templates/agents/architect-reviewer.md` | Absorbed into composable skills |
| `templates/agents/refactor-reviewer.md` | Absorbed into composable skills |
| `templates/agents/playwright-verifier.md` | Absorbed into composable skills |
| `templates/rules/karpathy.md` | Absorbed into OS-KERNEL.md |

### Changed

| Item | v9.1 | v9.2 |
|---|---|---|
| Shell target | Mixed shell assumptions | PowerShell-only execution with explicit Windows path rules |
| Permission model | Selective allow | Full auto-execute (bypassPermissions) |
| Execution target | Apps + CLI | CLI only |
| Instruction language | Mixed positive/negative | Positive only |
| Question phase | 3-5 per turn, 15-25 total | Unlimited until sufficient |
| Skill architecture | Flat index | Composable (mattpocock/skills pattern) |
| File count | 25 | 22 |
| Codex approval_policy | untrusted | full-auto |
| Claude Code model | not specified | Opus 4.6 (v2.1.101) |

---

## 18. Logical Destroyer Final Verification

### 18-1. Self-critique: Over-permissive risk

Full auto-execution means accidental file overwrites are possible.

Mitigation: Single Writer Rule + git version control + dedicated project directories. User explicitly accepts this risk for personal development projects.

### 18-2. Self-critique: Positive-only language gaps

Some boundaries need clarity even in positive form.

Mitigation: Section 11 "Permission Design" and Section 16 "Positive Directives" establish clear boundaries through affirmative statements of what the AI does, not prohibitions.

### 18-3. Self-critique: CONTEXT.md overhead

Adding CONTEXT.md is a new file to maintain.

Mitigation: CONTEXT.md is on-demand read (Lazy Read Rule). Token savings from shared vocabulary (~75% reduction in repeated explanations) outweigh the maintenance cost. Skill /context-update handles maintenance.

### 18-4. Self-critique: Template removal risk

Removing templates/agents/*.md loses structured agent definitions.

Mitigation: Agent roles are documented in Section 14 (Subagent Policy). Composable skills in index.md provide equivalent functionality with less file overhead.

### 18-5. Self-critique: PowerShell-only complexity

Two shells add cognitive overhead and potential syntax confusion.

Mitigation: Shell Selection Matrix (Section 15-1) provides deterministic routing. Primary rule is simple: use PowerShell for project work and Windows-host access. Node.js scripts (.mjs) are shell-agnostic, so setup/verify work from either shell. Codex CLI uses the same Windows PowerShell environment, eliminating shell ambiguity.

### 18-6. Self-critique: settings.json deny list uses both PowerShell and PowerShell patterns

Maintaining deny rules for two shells doubles the boundary surface.

Mitigation: The deny list targets a small, fixed set of destructive operations (force push, hard reset, root deletion). These rarely change. The allow list is broad by design (full auto-execution). The deny list is the safety net, and its small size makes PowerShell-only coverage manageable.

### 18-7. Final Judgment

v9.2 production confirmed:

```text
22 files deploy together.
Only needed files load at runtime.
One AI writes at a time.
All CLI differences stay in Adapter Layer.
All persistent state stays in docs/*.md.
All completion claims require Verification + Handoff.
All lessons pass Promotion Gate before becoming OS rules.
All operations auto-execute within defined boundaries.
All instructions use positive, affirmative language.
Shared domain vocabulary reduces token consumption.
Shell policy is deterministic: PowerShell only.
Scripts (.mjs) are shell-agnostic via Node.js.
```

---

## 19. v9.2 Production Summary

v9.2 evolves from "thin Kernel OS" to **"PowerShell-only CLI-Native Auto-Executing OS with Composable Skills"**.

Quality is guaranteed by:

1. Spec exists
2. State exists
3. Decision rationale exists
4. Real-world examples exist
5. Single writer enforced
6. Verification evidence exists
7. Observability exists
8. Japanese handoff is complete
9. Lessons pass promotion review
10. All safe operations auto-execute
11. Instructions are positive and clear
12. Shell policy is deterministic (PowerShell only)

Work that does not satisfy these criteria is not considered complete under pm-zero v9.2.
