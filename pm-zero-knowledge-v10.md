# pm-zero-knowledge-v10.md

2026-06-09 final / Claude Code only / VSCode on Windows + PowerShell-only

---

## 0. Result

pm-zero v10 is the **Autonomous Solo-Dev OS**.

v9.5 established the Agent OS: a CEO Agent orchestrating dynamic CodeX worker agents.
v10 removes the multi-vendor assumption entirely. The runtime is **Claude Code only**,
running from VSCode on Windows PowerShell, operated by a non-engineer. The single
Claude Code agent self-orchestrates through native subagents, runs **without human code
review**, survives aggressive context compaction, and **learns from its own failures so the
same mistake is not repeated**.

> **One autonomous Claude Code agent: self-orchestrates, self-reviews, self-evolves.**

Final decisions:

1. **Claude Code only.** All Codex / CodeX / multi-vendor orchestration is removed.
   Cross-vendor review becomes **cross-model / fresh-context self-review** inside Claude Code.
2. **No human code review.** Design → implement → self-review (different model, fresh
   subagent) → verify → commit → push → PR → merge runs fully automatically. The only
   human touchpoint is irreversible real-world action (real money, production credentials,
   publishing personal data), not code approval.
3. **Token consumption is the primary optimization target.** `CLAUDE.md` is lean and
   always-on; everything else loads on demand; subagents isolate research context.
4. **Compaction is assumed to fire at ~40–50% context.** Every fact the agent needs to
   keep must be durable in files *before* compaction. The conversation is treated as
   disposable; the file system is the memory.
5. **Autonomy is robust to new tools.** When MCP servers or other tools are added
   mid-session, safe operations are auto-approved without asking the human each time.
   Only a small, explicit set of dangerous/irreversible operations is blocked.
6. **Errors trigger escalation, not silence.** After repeated failure, the agent web-searches
   for a fix before pausing.
7. **Self-evolution replaces the XP system.** The cross-project `xp-rules.md` promotion path
   is abolished. Lessons are captured in-repo and promoted into durable rules.
8. Model routing stays inside the Claude family: Opus 4.8 for reasoning/review, Sonnet 4.6
   for implementation, Haiku 4.5 for exploration.
9. Quality is defined by 10 priorities: Correctness, Security, Reliability, Data Integrity,
   Observability, Maintainability, Performance, Scalability, Testability, Dependency Security.

v10 one-line definition:

> A non-engineer runs one Claude Code agent from VSCode on Windows PowerShell.
> The agent self-orchestrates with subagents, self-reviews with a different model,
> and self-evolves from `docs/issues.md`. `docs/vision.md` defines product intent,
> `tasks.md` defines executable work, `docs/state.md` is the current pointer, and
> `docs/repo-map.md` gives a compact navigation map. `CLAUDE.md` owns always-on behavior.
> Project files own project facts. The file system is the memory because the conversation
> is disposable.

> **Fact vs. recommendation note (applies throughout):** Statements about Claude Code /
> Claude model behavior are sourced in Section 18. Threshold values, parallelism caps, and
> routing defaults are *recommendations* tuned for solo-dev token frugality, not platform
> requirements; verify exact setting keys against current Claude Code docs before relying on them.

---

## 1. First Principles

### 1-1. Essential Elements

pm-zero v10 keeps **7 file primitives** and adds **2 cross-cutting disciplines**.

| Element | Role | Entity |
|---|---|---|
| Intent | Product north star | `docs/vision.md` |
| Task | Implementation contract | `tasks.md` |
| State | Current pointer and lock | `docs/state.md` |
| Decision | Permanent rationale | `docs/decisions.md` |
| Navigation | Where things live | `docs/repo-map.md` |
| Guardrail | Always-on behavior | `CLAUDE.md` |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates |

Two disciplines are not files; they are runtime behaviors that every other primitive depends on:

- **Context Continuity** — nothing the agent needs survives only in chat history. Critical
  facts are checkpointed to files before compaction fires (assumed at ~40–50%).
- **Self-Evolution** — recurring failures are root-caused and promoted into durable rules so
  the agent does not repeat them.

Everything else is optional and added only after a concrete need appears.

### 1-2. Why these are first principles, derived from the v10 constraints

Reason from the constraints, not from habit:

1. *The agent has no human reviewer.* → Verification and a different-model self-review must
   replace the human. The reviewer is a deterministic gate plus a fresh subagent, not a person.
2. *Context is compacted at ~40–50%.* → Anything not written to a file is lost. Therefore the
   file system, not the transcript, is the source of truth, and `CLAUDE.md` (which reloads every
   turn and survives compaction) must carry the always-on rules — and must stay small.
3. *Tokens are the budget.* → `CLAUDE.md` is a lookup table, not a brain dump. Detail loads on
   demand. Research happens in subagents whose context is discarded after they report a summary.
4. *Tools change mid-flight.* → Permission policy is allow-by-default for safe categories and
   deny-only for the dangerous set, so a newly added MCP server works without re-prompting.
5. *The agent will make mistakes.* → A failure that recurs is a missing rule. The loop that turns
   a failure into a rule is the self-improvement mechanism.

### 1-3. Problems v10 Solves

| Problem | Root Cause | v10 Solution |
|---|---|---|
| Context loss after compaction destroys progress | Critical facts lived only in chat | Checkpoint to ledger files after each logical unit; durable rules in `CLAUDE.md` |
| `CLAUDE.md` bloats and taxes every turn | Reusable detail pasted into always-on file | Keep `CLAUDE.md` a lean lookup table; load detail on demand with `@file` |
| Human becomes a bottleneck for review | Review was a human step | Cross-model self-review via fresh subagent; human only for irreversible real-world acts |
| Adding an MCP server interrupts with prompts | Per-call approval | Allow-by-default for safe categories; deny-only dangerous set; one permission hook |
| Same bug reappears across sessions | No durable learning | Self-Evolution loop promotes recurring failures into `CLAUDE.md` / `docs/lessons.md` |
| Agent stalls on a persistent error | No recovery path | After repeated failure, web-search a fix before pausing |
| Multi-vendor scaffolding adds dead files | v9.5 generated `.codex` / Codex RTK rules / `AGENTS.md` | Claude-Code-only: single `CLAUDE.md` directive; no Codex config; RTK integrated via Claude Code PreToolUse hook |
| Over-parallelization wastes tokens | No budget-aware cap | Parallelize only on disjoint write scopes within a token budget; modest default cap |
| Git history drifts or stays local | Commit/push deferred | Commit after each logical unit; push after every commit; PR opened automatically |

---

## 2. Architecture

### 2-1. Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-7

Autonomy Layer (runtime, not files)
  +-- Permission policy: allow-by-default safe ops, deny-only dangerous set
  +-- Auto-approval of newly added tools/MCP within the safe set
  +-- One PreToolUse hook guards the irreversible set

Orchestration Layer (runtime, not files)
  +-- Main Claude Code agent (self-coordinator)
        +-- Subagents in isolated context windows (Explore / Plan / Verify / custom)
        +-- Model-aware routing (Opus 4.8 / Sonnet 4.6 / Haiku 4.5)
        +-- Parallel execution only on disjoint write scopes

Continuity Layer (runtime, not files)
  +-- Checkpoint-before-compaction discipline
  +-- Custom compaction instructions in CLAUDE.md
  +-- Self-Evolution loop (issues -> root cause -> durable rule)

User Repository (files)
  +-- Core Layer       : CLAUDE.md + .claude/settings.json + HANDOFF-JA.md
  +-- Ledger Layer     : vision / tasks / state / decisions / issues
  +-- Navigation Layer : repo-map
  +-- Scripts Layer    : setup / verify
  +-- Aux Layer        : env example / gitignore
```

The Autonomy, Orchestration, and Continuity layers are runtime behaviors the agent follows.
They are not file layers.

Removed from the default structure in v10 (relative to v9.5):

- `AGENTS.md` — Claude Code reads `CLAUDE.md` natively; a second always-loaded directive is
  duplicated token cost. `CLAUDE.md` is now the single primary directive.
- All `.codex/*` files and the CodeX project-config safety note.
- RTK Codex permission rule (`prefix_rule(pattern=["rtk"], decision="allow")` in
  `~/.codex/rules/default.rules`) and the Codex-specific RTK command syntax (`rtk proxy powershell`,
  etc.). RTK the tool (Rust Token Killer) itself is preserved and integrated natively; see Section 2-3.
- The `xp-rules.md` cross-project promotion path.

### 2-2. Default File Structure (13 files)

#### Core Layer (3)

1. `CLAUDE.md` — **Primary directive, always-on, lean.** Source-of-truth pointers, startup
   reads, critical guardrails, model routing, autonomy summary, custom compaction instructions,
   condensed Engineering Role / Thinking Protocol / Coding Priorities.
2. `.claude/settings.json` — Permissions (allow safe, deny secrets + dangerous), default
   permission mode, auto-compact env vars, registered hooks. **Baseline in v10**, not optional.
3. `HANDOFF-JA.md` — Japanese completion/error report template.

#### Ledger Layer (5)

4. `docs/vision.md` — Product north star.
5. `tasks.md` — Implementation task ledger.
6. `docs/state.md` — Current pointer: branch, active task, executor, lock, verification.
7. `docs/decisions.md` — Permanent decisions and reference URLs.
8. `docs/issues.md` — Failure log, web-search findings, and escalation history. Feeds Self-Evolution.

#### Navigation Layer (1)

9. `docs/repo-map.md` — Compact repository map with hybrid read policy.

#### Scripts Layer (2)

10. `scripts/setup.mjs` — Minimal PowerShell/Node setup helper.
11. `scripts/verify.mjs` — Unified verification entry point.

#### Aux Layer (2)

12. `.env.example` — Environment variable template.
13. `.gitignore` — Ignore generated, build, cache, dependency, and secret files.

### 2-3. Optional Extension Files

Add only when a concrete need appears:

| Optional file | Add when |
|---|---|
| RTK (`rtk init -g`) | **Strongly recommended.** Already locally installed. Run `rtk init -g` once to activate the Claude Code PreToolUse hook globally (applies to all projects). Compresses CLI output (test runs, git ops, builds) by 60–90% before it enters the context window. |
| `docs/lessons.md` | Promoted lessons outgrow `CLAUDE.md` and become reference-level, not always-on |
| `.claude/hooks/*.mjs` | A hook needs shared command handling beyond a single inline command |
| `.claude/agents/*.md` | A reusable custom subagent definition (e.g. `security-reviewer`) is worth persisting |
| `.claude/commands/*.md` | A repeated multi-step workflow is worth a slash command |
| `.mcp.json` | The project uses an MCP server confirmed from official docs |
| `.claudeignore` | Large generated/vendor trees inflate context and must be excluded from auto-context |
| `CONTEXT.md` | Domain vocabulary repeats enough to reduce token use |
| `scripts/lib/*` | Two or more scripts share non-trivial code |

### 2-4. Change from v9.5

| v9.5 | v10 |
|---|---|
| Agent OS (CEO orchestrates CodeX) | Autonomous Solo-Dev OS (one Claude Code agent) |
| Claude Code + Codex CLI | Claude Code only |
| Cross-vendor review | Cross-model / fresh-context self-review |
| Human review implied for critical work | No human code review; human only for irreversible real-world acts |
| `AGENTS.md` primary + thin `CLAUDE.md` adapter | `CLAUDE.md` is the single primary directive |
| `.codex` config + RTK Codex permission rule | Removed (Codex-specific integration only; RTK tool itself is preserved) |
| Max 3 concurrent agents (hard) | Budget-aware soft cap on disjoint write scopes |
| Token saving as a goal | Token frugality as the primary design constraint |
| Compaction not designed for | Compaction assumed at ~40–50%; file-based durability |
| XP promotion to `xp-rules.md` | Self-Evolution loop in-repo; XP abolished |
| 6 coding priorities | 10 quality priorities |
| Errors paused after 3 repeats | Web-search a fix before pausing |

---

## 3. Source of Truth

| Question | File |
|---|---|
| What product are we building? | `docs/vision.md` |
| What exact work remains? | `tasks.md` |
| What is active right now? | `docs/state.md` |
| Why did we choose this? | `docs/decisions.md` |
| What failed before, and what fixed it? | `docs/issues.md` |
| Where is the relevant code? | `docs/repo-map.md` |
| What rules must the agent always follow? | `CLAUDE.md` |
| How do we verify? | `scripts/verify.mjs` / Quality Gates |
| What should the user receive? | `HANDOFF-JA.md` |

### 3-1. `docs/vision.md`

Product north star. Contains: purpose, target users, success criteria, non-goals, product
principles, primary user flows, failure cases, long-term goal, relationship to `tasks.md`.
Does not contain task checklists, write locks, temporary notes, or verification evidence.

### 3-2. `tasks.md`

Implementation contract. Each ready task includes owner, dependencies, write scope, acceptance
criteria, verification method, and expected evidence. `tasks.md` is the only task list. The main
agent is the only writer; subagents report desired status changes, evidence, and blockers.

### 3-3. `docs/state.md`

Current pointer. Contains only: branch, active task, current executor (main agent or named
subagent), write lock, latest verification pointer, verification mode, current blocker summary.
If `tasks.md` and `docs/state.md` disagree, `tasks.md` wins for task facts and `docs/state.md` is
corrected.

### 3-4. `docs/issues.md`

Failure log and the engine of Self-Evolution. Each entry records the failure, the root cause,
any web-search finding that resolved it, and whether a durable rule was promoted. See Section 9.

### 3-5. `docs/repo-map.md`

Navigation map. Contains a summary read at startup, a directory responsibility map, important
entry points, test locations, generated/external file rules, and scoped verification commands.
It is not an architecture decision record; permanent reasons live in `docs/decisions.md`.

---

## 4. Navigation Policy

### 4-1. Hybrid Repo Map

Read policy, tuned for token frugality:

1. Session start: read only `## Summary`.
2. Before implementation: read the relevant directory section when target files are unclear.
3. During debugging: read entry point, test, generated-file, or workflow sections as needed.
4. After structural changes: update only the affected section.

Prefer `rg` over broad manual browsing. Prefer a research **subagent** over reading many files
in the main context — the subagent reads widely in its own window and returns only a summary,
keeping the main context small (this directly serves the 40–50% compaction budget).

### 4-2. `docs/repo-map.md` Template

```markdown
# repo-map.md -- pm-zero v10 Repository Map

## Read Policy
- Session start: read Summary only.
- Before editing: read the section for the target area when target files are unclear.
- When navigation is unclear: read Entry Points and Directory Map.
- After structural changes: update only the affected section.
- Prefer a research subagent over reading many files in the main context.

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
# tasks.md -- pm-zero v10 Execution Ledger

## Goal Binding
- Active goal:
- Owner: Claude Code (main agent)

## Status Vocabulary
- proposed: idea exists, not ready
- ready: owner, dependencies, write scope, acceptance, verification, and expected evidence are clear
- doing: actively being worked
- blocked: needs decision, dependency, credential, environment, or irreversible human action
- review: implementation complete, self-review pending
- done: accepted by self-review
- verified: evidence recorded

## Tasks
| ID | Status | Owner | Depends On | Write Scope | Acceptance | Verification | Evidence |
|---|---|---|---|---|---|---|---|
| T001 | ready | main | none | src/auth/**, tests/auth/** | Login error handling matches spec | pnpm test auth | pending |

## Blockers
| ID | Task | Blocker | Needed decision | Owner |
|---|---|---|---|---|

## Review Notes
| Task | Reviewer (model) | Result | Follow-up |
|---|---|---|---|
```

### 5-2. Coordination and Parallelism

- The main agent owns `tasks.md` and `docs/state.md`.
- Parallel work is delegated to subagents **only when write scopes are disjoint**, or each runs
  in an isolated worktree. Same file → serialize. Separate scope → parallelize.
- **Subagents cannot show interactive permission prompts.** A subagent that hits an `ask` rule is
  treated as denied. Therefore parallel worker subagents must run under allow-by-default
  permissions (Section 7) or be restricted to read-only tools. (Fact; see Section 18.)
- Parallelism is capped by token budget, not a fixed number. **Recommended default: ≤3
  concurrent worker subagents**, raised only when scopes are disjoint and the budget allows.
  Claude Code's Dynamic Workflows can scale far higher, but solo-dev token frugality keeps it modest.

---

## 6. Autonomous Orchestration and Model Routing

### 6-1. Self-Coordinating Main Agent

The main Claude Code agent is the coordinator by default. No "you are the coordinator" prompt is
needed. It decomposes tasks, decides what to parallelize, delegates to subagents, integrates
results, and owns the ledger.

### 6-2. Subagents for Context Isolation

Subagents are the primary token-saving and parallelism tool. Each runs in its own context window
and reports back a summary, so heavy reading never pollutes the main context.

- Use the built-in **Explore** subagent for code search and discovery.
- Use **Plan** for decomposition where useful.
- Use **Verify** and custom reviewers for the self-review step.
- Define custom subagents (e.g. `security-reviewer`, `test-writer`) in `.claude/agents/` only
  when reused.

Delegate research explicitly: "use a subagent to investigate how auth refresh works and report
back" keeps the main conversation lean for implementation.

### 6-3. Model-Aware Routing (Claude family only)

| Work | Model | Why |
|---|---|---|
| Orchestration, architecture, critical reasoning | Opus 4.8 | Strongest long-horizon agentic reasoning |
| Self-review (security, auth, data, large diffs, final validation) | Opus 4.8, fresh context | Reviewer must be at least as strong as the implementer; ~4x less likely than 4.7 to miss flaws in code |
| Day-to-day implementation, refactor, tests | Sonnet 4.6 | Handles 90%+ of coding tasks at lower cost |
| Exploration, file reads, simple edits, classification | Haiku 4.5 | Fast and cheap; smart switching routes simple tasks here |

Notes:
- A `fallbackModel` chain can keep work moving when a model is overloaded (Claude Code v2.1.166+).
- Routing is a default for quality and cost. Any phase can run on any available model when needed;
  the system never depends on one specific model being available.

### 6-4. The Reviewer Without a Human

"No human code review" does not mean "no review." It means review is automated:

- The reviewer is a **fresh subagent on Opus 4.8** with no implementation context, so it does not
  inherit the implementer's blind spots. This replaces v9.5's cross-vendor review.
- The reviewer reads the diff, the acceptance criteria, and the relevant tests, and returns a
  pass/fail with specific findings.
- Mandatory self-review classes: auth, billing, DB schema, RLS/permissions, deploy, security,
  300+ line diff, new external API, anything touching production data or personal information.

### 6-5. Execution Flow

```text
Human goal
  -> Main agent: decompose + plan
  -> Subagents: explore (Haiku) / implement (Sonnet) on disjoint scopes
  -> Verify: scripts/verify.mjs + tests
  -> Self-review: fresh Opus subagent
  -> Commit + push + PR
  -> Risk gate (Section 17): auto-merge if low/medium risk and green
  -> Handoff (Japanese)
```

### 6-6. Subagent Routing Heuristics (token-budget-aware)

The main agent decides subagent allocation automatically, guided by these heuristics.
No user instruction is needed. The heuristics apply whether or not the task is registered
in tasks.md — ad-hoc error fixes, quick patches, and exploratory work route by the same rules.

| Situation | Action | Rationale |
|---|---|---|
| Single-file fix, small edit, config change | Main context, Sonnet | Spawn cost exceeds benefit |
| Error debugging (first 2 attempts) | Main context, Sonnet | Direct context access is faster |
| Error debugging (3+ failures) | Subagent research (Haiku), then main fix (Sonnet) | Isolate broad investigation from main context |
| Multi-file feature implementation | Subagents on disjoint scopes (Sonnet) | Parallel savings justify spawn cost |
| Codebase exploration ("how does X work") | Subagent (Haiku) | Context isolation; only summary returns to main |
| Self-review (mandatory classes per §6-4) | Fresh subagent (Opus) | Required; fresh context prevents blind spots |
| Architecture / design decision | Main context, Opus | Needs full conversation history |
| Ad-hoc work (no tasks.md entry) | Main context, Sonnet; subagent only for multi-file research | Default to cheapest effective option |

Default bias: stay in main context with Sonnet unless a specific row above justifies
a subagent or a different model. Every subagent spawn costs at least one prompt against the
session budget; do not spawn when the task is faster to do directly.

Thinking token discipline: Opus extended thinking is billed at output-token rates (~5× input
cost under API billing; heavy consumption under subscription plans). Reserve Opus for self-review,
architecture, and complex failures after 2+ unsuccessful attempts. For routine implementation,
keep thinking budget low (/effort or MAX_THINKING_TOKENS where available).

---

## 7. Autonomy and Permissions

This is the layer that lets the agent run unattended and absorb new tools without interrupting
the human. The principle: **allow-by-default for safe operations, deny-only for the dangerous set.**

### 7-1. Permission Strategy

- Run in an autonomous permission mode (Claude Code **auto mode**, a classifier that approves safe
  actions and recovers from blocked ones, or `dontAsk` with explicit allow rules). Auto mode is
  the safer replacement for blanket permission-skipping. (Fact; see Section 18.)
- **Allow by default:** read, edit, run tests, build, lint, `git` (non-destructive), `rg`,
  Node scripts, and MCP tool calls in the safe set.
- **Deny always:** reading `.env*` and credential files; force-pushing to `main`; history rewrites
  on shared branches; `rm -rf` on non-scoped paths; destructive DB operations (drop/truncate);
  publishing personal data or public URLs.
- **One PreToolUse hook** enforces the dangerous set deterministically, because a prompt
  instruction can be summarized away by compaction but a hook cannot. The hook returns exit code 2
  to block, 0 to allow.

### 7-2. New Tools and MCP Mid-Session

When an MCP server or new tool is added during a session, it must work without re-prompting:

- Safe-category tool calls from any newly connected server are auto-approved by the
  allow-by-default policy.
- Permission deny rules (e.g. `Read(.env)`) still apply to the new tool. The Bash guard hook
  (`guard.mjs`) only fires for Bash tool calls — it does not intercept MCP tools. For genuinely
  dangerous MCP capabilities, add tool-specific deny rules to `settings.json` or restrict the
  server's permissions when configuring `.mcp.json`.
- Only genuinely dangerous new capabilities (e.g. a payments API, a production deploy tool) fall
  to the human gate in Section 17. Everything else proceeds.

This satisfies the v10 requirement: the human is not asked tool-by-tool when a connector appears.

### 7-3. Recommended `.claude/settings.json`

> Schema keys evolve; verify against current Claude Code docs. This shape expresses intent.

```json
{
  "permissions": {
    "defaultMode": "dontAsk",
    "allow": [
      "Read",
      "Edit",
      "Bash(rtk:*)",
      "Bash(git status:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(pnpm:*)",
      "Bash(node scripts/*)",
      "Bash(rg:*)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)",
      "Bash(git push --force:*)",
      "Bash(rm -rf:*)"
    ]
  },
  "env": {
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/guard.mjs" }
        ]
      }
    ]
  }
}
```

The `guard.mjs` hook blocks the dangerous set (force-push to `main`, destructive DB ops,
unscoped `rm -rf`, secret reads) regardless of what the conversation says.

Note: `rtk init -g` adds RTK's own PreToolUse hook entry to Claude Code's **global (user-level)**
settings, not to this project-level file. Multiple PreToolUse hooks across user and project levels
coexist in Claude Code; guard.mjs (project) and RTK's rewrite hook (global) fire independently.
RTK's hook rewrites Bash calls (e.g. `git status` → `rtk git status`) transparently; the
explicit `Bash(rtk:*)` allow rule above ensures those rewritten calls are auto-approved in any
permission mode, including subagents that cannot surface interactive prompts.

---

## 8. Context Continuity and Token Budget

The defining v10 constraint: **assume auto-compaction fires at ~40–50% of the context window.**
At low utilization the model reasons best (context rot is worst near the limit), so compacting
early trades raw context for output quality. The cost is more frequent summarization; the
mitigation is that file-based durability lets each summary be short and lossless.

### 8-1. Make the Transcript Disposable

- After each logical unit of work, checkpoint to files: update `tasks.md` status + evidence,
  update `docs/state.md` pointer, and commit. A compaction that fires mid-task then loses nothing,
  because the durable state is on disk.
- Put always-on rules in `CLAUDE.md`. It reloads every turn and survives compaction; chat history
  does not.
- Add a custom compaction instruction in `CLAUDE.md` so summaries keep what matters:
  `When compacting, always preserve: the active task ID, the list of modified files, and the verify command.`
  (Fact: custom compaction instructions are supported; see Section 18.)

### 8-2. Keep `CLAUDE.md` Lean

`CLAUDE.md` is a fixed per-turn token cost: a 5,000-token `CLAUDE.md` costs 5,000 tokens on every
turn, whether the session is 2 messages or 200. (Fact; see Section 18.) Therefore:

- Treat `CLAUDE.md` as a **lookup table**, not a brain dump. Pointers, commands, hard rules only.
- Move detail to on-demand files referenced by `@path` or read only when needed.
- Target a small `CLAUDE.md`; if a section is reference material, move it to `docs/`.

### 8-3. Token Discipline During a Session

- **Use RTK (Rust Token Killer) as the CLI output filter.** Already locally installed. Run
  `rtk init -g` once globally to install the Claude Code PreToolUse hook; every Bash call
  (e.g. `git status`, `cargo test`, `pnpm install`) is then transparently rewritten to
  `rtk git status` etc., compressing noisy output before it enters the context window.
  Real-world savings: 60–90% reduction on common dev commands (cargo test: 98%, git status:
  76%, npm install: ~99%). This is the single highest-impact token reduction action for
  CLI-heavy sessions. (Source: see Section 18.)
- Prefer subagents for research — their context is discarded after they report a summary.
- Use `/btw` for quick lookups that should not enter conversation history.
- Run `/compact` proactively before the threshold, while the model still reasons well, rather than
  letting auto-compact fire while degraded.
- Use `@file` references instead of pasting file contents into chat.
- Maintain a `.claudeignore` for large generated/vendor trees.
- One task per session where practical; reset context between planning and execution.
- Opus extended thinking is the largest per-prompt cost driver. Use Opus only for self-review,
  architecture, and complex debugging; lower /effort or MAX_THINKING_TOKENS for routine work.

### 8-4. Configuring the Threshold

`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` accepts 1–100 and shifts when auto-compaction fires; the
platform default is roughly 80–85%. (Fact; see Section 18.) To honor the 40–50% design target,
set it near 50. **Caution (sourced):** values that are too low (e.g. 10) trigger compaction so
often that tokens are wasted on repeated summarization; ~40–70 is the practical band. v10 designs
*around* early compaction so the chosen value is safe — but the operator should confirm the
behavior matches expectations, since the percentage may apply to the original (not reduced) window.

---

## 9. Self-Evolution Loop (replaces the XP system)

The XP system and `xp-rules.md` cross-project promotion are abolished. Learning is now in-repo,
version-controlled, and deterministic.

### 9-1. The Loop

```text
Failure occurs
  -> Log in docs/issues.md (symptom, context, attempted fix)
  -> Retry with a corrected approach
  -> If it persists (3 identical failures): WEB-SEARCH for a known fix
        -> Record the finding and source URL in docs/issues.md
        -> Apply the fix
  -> If still unresolved: STOP, summarize in HANDOFF-JA.md, surface to human
  -> Root-cause any resolved recurring failure
  -> Promote a durable rule:
        - Always-applicable rule  -> one line in CLAUDE.md
        - Reference-level lesson   -> docs/lessons.md (created on need)
```

Next session, `CLAUDE.md` reloads with the promoted rule, so the same mistake is not repeated.
This is the concrete mechanism behind "self-evolving system."

### 9-2. Web Search as a Recovery Step

When errors persist, searching the web for a known fix (error string, library issue, breaking
change) is an explicit, allowed step — not a last resort to be avoided. Always record the source
URL and date in `docs/issues.md` so the finding is auditable and reusable.

### 9-3. Relationship to Claude Code Auto-Memory

Claude Code's auto-memory can carry context across sessions and complements this loop. But
auto-memory is a platform feature whose contents are not version-controlled or portable. v10
anchors learning on the **file-based, git-tracked** loop above; auto-memory is a convenience layer
on top, never the system of record.

### 9-4. `docs/issues.md` Template

```markdown
# issues.md -- Failure Log and Self-Evolution

## Active Issues
| ID | Symptom | Context | Attempts | Status |
|---|---|---|---|---|

## Resolved (with root cause)
| ID | Root cause | Fix | Source URL | Promoted to |
|---|---|---|---|---|

## Promoted Rules
- (One line per durable rule moved into CLAUDE.md or docs/lessons.md)
```

---

## 10. Global and Project Settings

### 10-1. Principle

Global owns behavior. Project owns facts.

Global config owns: model preferences, default permission mode, personality, notifications,
reusable user-level skills/agents/commands, common secret read-deny rules, personal defaults.

Project files own: product vision, tasks, state, decisions, issues, repo map, verification
commands, project-specific permission boundaries, and project-specific hooks/MCP only when used.

### 10-2. Simplification Check

Before adding or keeping a rule:

1. Personal behavior → keep it global.
2. Applies to two or more projects → keep it global.
3. Project-specific → move it into the project or delete it.
4. Compensates for an old model/tool limitation → delete after verifying it is no longer needed.
5. Rarely changes and is a checklist → keep it in project docs, not always-on prompts.
6. Review global config every 3–6 months and after major model/tool releases.

### 10-3. Project Config Rule

Generate `.claude/settings.json` by default (it carries permissions, the deny-set, the auto-compact
override, and the guard hook — all essential to v10 autonomy). Do not set model or personality at
the project level; those are global. Record any non-obvious project permission boundary in
`docs/decisions.md`. Prefer one deterministic hook over prompt instructions when automation is needed.

---

## 11. PM Agent Execution Protocol

### Phase 0: Toolchain Verification

Verify only what the task needs:

```powershell
claude --version
node --version
pnpm --version
git --version
rg --version
rtk --version
```

### Phase 0.5: Self-Audit

Check:

- Every referenced Claude Code feature exists in current docs.
- No Codex/`AGENTS.md` artifacts remain. RTK (Rust Token Killer) is present and integrated
  via Claude Code PreToolUse hook (`rtk init -g`); the Codex permission rule is absent.
- Hooks are absent unless they enforce a deterministic job (the deny-set guard is justified).
- MCP is absent unless a real server is needed.
- `tasks.md`, `state.md`, and `vision.md` responsibilities are not mixed.
- `CLAUDE.md` is lean; detail is on-demand.
- Generated/build/vendor files are ignored.

### Phase 1: PM Interview

Gather purpose, target users, success criteria, primary flows, constraints, failure cases,
priorities. When 3+ HIGH assumptions accumulate, ask immediately.

### Phase 2: Vision and Task Generation

1. Update `docs/vision.md`.
2. Generate or update `tasks.md`; confirm every ready task has owner, dependencies, write scope,
   acceptance, verification, and evidence.
3. Initialize `docs/state.md` with branch and next active task.

### Phase 3: Implementation

- Read `CLAUDE.md`, `docs/state.md`, `docs/decisions.md`, and `docs/repo-map.md` Summary.
- Read detailed repo-map sections only when target files are unclear.
- Delegate wide reading to subagents.
- Respect write scope; keep diffs small; add tests for new behavior.
- Checkpoint to files and commit after each logical unit (continuity discipline).
- Record permanent decisions in `docs/decisions.md`.

### Phase 4: Verification

Choose quick / standard / final (Section 14). Record task ID, command, result, evidence, and
unverified items.

### Phase 5: Self-Review

Spawn a fresh Opus 4.8 subagent to review. Mandatory for: auth, billing, DB schema,
RLS/permissions, deploy, security, 300+ line diff, new external API, production data, personal
information, public URL impact. Record reviewer model and result in `tasks.md` Review Notes.

### Phase 6: Git and Handoff

Run the full git workflow (Section 17) automatically. Report in Japanese using `HANDOFF-JA.md`.

### Phase 7: Self-Evolution Promotion

Promote evidence-backed lessons via the Section 9 loop:

| Classification | Destination |
|---|---|
| One-off, project-specific | Stays in `docs/issues.md` |
| Always-applicable rule | One line in `CLAUDE.md` |
| Reference-level lesson | `docs/lessons.md` |
| OS design issue | v10.x candidate (note in `docs/decisions.md`) |

(No cross-project `xp-rules.md` promotion — the XP system is abolished.)

---

## 12. Standard File Specs

### 12-1. `CLAUDE.md`

```markdown
# CLAUDE.md -- pm-zero v10 (Claude Code only, Windows PowerShell)

## Language
- Reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately.

## Source of Truth (read on demand)
- Intent: docs/vision.md | Tasks: tasks.md | State: docs/state.md
- Decisions: docs/decisions.md | Failures: docs/issues.md | Map: docs/repo-map.md
- Report: HANDOFF-JA.md

## Startup Read
- Read this file, docs/state.md, docs/decisions.md, docs/repo-map.md Summary. Nothing else by default.

## Continuity (compaction assumed at ~40-50%)
- Checkpoint to tasks.md + docs/state.md and commit after each logical unit.
- When compacting, always preserve: active task ID, modified files list, verify command.
- Keep this file lean; load detail on demand with @path or rg. Use subagents for wide reading.

## Autonomy
- Allow-by-default for safe ops; deny secrets and the dangerous set (see .claude/settings.json).
- Newly added MCP/tools: auto-approve safe calls; do not ask the human per tool.
- Human gate only for irreversible real-world acts (real money, prod credentials, publishing personal data).

## Task Ledger
- tasks.md is the only execution ledger; main agent is the only writer.
- Every ready task: owner, dependencies, write scope, acceptance, verification, evidence.

## Parallelism
- Parallelize only on disjoint write scopes (or isolated worktrees). Same file -> serialize.
- Subagents cannot prompt for permission; run them under allow-by-default or read-only.
- Default cap: <=3 concurrent worker subagents; raise only if scopes are disjoint and budget allows.

## Model Routing
- Opus 4.8: orchestration, architecture, critical reasoning, self-review.
- Sonnet 4.6: day-to-day implementation, refactor, tests.
- Haiku 4.5: exploration, file reads, simple edits.

## Subagent Routing (token-budget-aware)
- Default: work in main context with Sonnet. Spawn subagents only when benefit > spawn cost.
- Spawn for: research/exploration (context isolation), parallel disjoint-scope work, mandatory self-review.
- Do NOT spawn for: single-file fixes, small edits, first-attempt error debugging, tasks faster to do directly.
- Ad-hoc work (no tasks.md entry): Sonnet in main context. Subagent only for multi-file research or after 2 failed attempts.
- Opus = self-review, architecture, complex failures only. Lower /effort for routine work.

## Self-Review (no human reviewer)
- Spawn a fresh Opus subagent (no implementation context) to review.
- Mandatory for: auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line diff,
  new external API, production data, personal information.

## Self-Evolution
- Log failures in docs/issues.md. On 3 repeats, web-search a fix and record the source URL.
- Promote always-applicable lessons into this file; reference-level lessons into docs/lessons.md.

## Engineering Role
- Act as a principal-level full-stack engineer. Readable, testable, minimal, correct code.
- No placeholder code or TODOs. Every committed function works.

## Thinking Protocol
- Decompose into atomic subtasks; challenge assumptions from first principles; prefer the simplest correct solution.
- Compare 3 implementation skeletons (correctness, simplicity, testability, cost); choose one explicitly.
- Chain-of-Verification: draft, plan failure-revealing checks, verify independently, revise on verified facts only.
- Verify the real call shape of an external API/library before using it; run a minimal test when uncertain.
- Short progress checks, not one long reasoning dump.

## Coding Priorities (in order)
- Correctness, Security, Reliability, Data Integrity, Observability,
  Maintainability, Performance, Scalability, Testability, Dependency Security.

## Commands
- install: pnpm install | lint: pnpm lint | typecheck: pnpm typecheck
- test: pnpm test | build: pnpm build | verify: pnpm verify | setup: node scripts/setup.mjs
- Use only commands that exist in this repository.

## Shell
- PowerShell for all operations. Windows paths with backslash. Node scripts via node scripts/name.mjs.
- RTK (Rust Token Killer) is active as a transparent PreToolUse hook (installed via `rtk init -g`).
  All Bash calls are automatically compressed before entering the context window (60-90% savings).
  No manual `rtk` prefixing needed. Run `rtk gain` to check token savings stats.

## Git (full auto -- see Section 17)
- Never commit to main. Branch per task: <type>/<short-description>.
- Commit after each logical unit; push after every commit; open PR to main automatically.
- Stage only files in the task's Write Scope. Never stage .env* or secrets.
- Pre-push: confirm .gitignore covers secrets; run gitleaks if available.
- Merge: gate on final verify green + fresh-Opus self-review passed.
  Low/medium risk: squash-merge to main and delete branch.
  High-risk classes (auth, billing, DB schema, RLS/permissions, deploy, security,
  300+ line diff, new external API, production data, personal information):
  stop before any irreversible real-world side effect and surface a Japanese summary.

## Execution Boundaries
- Handle every error explicitly. Safe values only in output.
- .env.example is the template; runtime reads actual env values.
- Irreversible real-world acts (real money, prod credentials, publishing personal data) are human-gated.
- All other operations are AI-executed without asking.
```

### 12-2. `docs/vision.md`

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
- This file defines product intent. tasks.md defines implementation tasks.
- Store task progress and evidence in tasks.md. Store only the current pointer in docs/state.md.
```

### 12-3. `docs/state.md`

```markdown
# state.md

## Current
- Branch:
- Active task:
- Current executor: main agent / subagent <name> / none
- Write lock: <scope> / none
- Latest verification pointer:
- Verification mode:

## Current Blocker
- None / [content]

## Next
- See tasks.md
```

### 12-4. `HANDOFF-JA.md`

```markdown
# 完了・エラー報告 (HANDOFF-JA)

## 概要
- 実施内容:
- 結果: 完了 / 部分完了 / 要対応

## 変更ファイル
-

## 完了タスク
- タスクID:
- tasks.md 更新: 済 / 未
- 残ready / blocked タスク:

## 検証エビデンス
- タスクID:
- コマンド:
- 結果:
- エビデンス保存先:
- 未検証項目:

## 自己レビュー
- レビューモデル:
- 結果: 合格 / 指摘あり
- 指摘と対応:

## 自己進化 (該当時)
- docs/issues.md 記録: 済 / 未
- Web検索による解決: あり (出典URL) / なし
- CLAUDE.md / docs/lessons.md へ昇格したルール:

## 人間対応が必要な事項 (不可逆な現実操作のみ)
- 実費の発生 / 本番クレデンシャル / 個人情報の公開 など:

## 残存リスク
-
```

### 12-5. `README.md`

```markdown
# <Project Name>

![<Tech>](https://img.shields.io/badge/<Label>-<Message>-<Color>?logo=<slug>)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> <一行: 何をして、どの課題を解決するか>

<2-3文の背景。何で、どう動き、どこで動くか。>

---

## 主な機能
- <機能1>
- <機能2>

## 技術スタック
| カテゴリ | 技術 |
|---|---|
| フロントエンド | <名称のみ> |
| バックエンド | <名称のみ> |
| インフラ | <名称のみ> |

## 設計の工夫
- <自明でない設計判断とその理由>

## セットアップ
<前提条件>

```bash
<install と run コマンド>
```

## ライセンス
MIT
```

README rules: badges at top (shields.io static, one per major technology); tagline one line
starting with `>`, no marketing; description 2–3 factual sentences, no parenthetical tech
explanations; tech stack table is names only; 設計の工夫 covers non-obvious decisions only;
Japanese prose, English code identifiers.

---

## 13. Quality Gates

Gates map to the 10 priorities: Correctness, Security, Reliability, Data Integrity, Observability,
Maintainability, Performance, Scalability, Testability, Dependency Security.

**Q1. Correctness Gate** — Acceptance criteria are met. Every committed function works; no
placeholders or TODOs. UI/API/DB/critical workflows use real repository examples before editing.

**Q2. Spec Gate** — `docs/vision.md` carries product intent; 3+ HIGH assumptions confirmed before
implementation.

**Q3. Task Ledger Gate** — `tasks.md` exists; active work maps to a task ID; ready tasks include
owner, dependencies, write scope, acceptance, verification, evidence; completed work updates status
and evidence.

**Q4. Code & Maintainability Gate** — Files/functions small enough to review (target 300
lines/file, 50 lines/function); meaningful names; existing style matched; abstractions only when
duplication or complexity justifies them; 300+ line diffs split or explained in `docs/decisions.md`.

**Q5. Architecture & Scalability Gate** — UI/domain/data responsibilities separated; dependencies
flow one direction; designs do not embed avoidable scaling bottlenecks.

**Q6. Performance Gate** — Hot paths avoid unnecessary computation; latency-sensitive operations
do not block the main thread or user-facing flow; database queries use appropriate indexing;
algorithmic complexity is justified for the data size. MVP deferrals documented in `docs/decisions.md`.

**Q7. Test & Testability Gate** — New features include tests; bug fixes include reproduction tests;
at least one negative path when behavior changes; UI changes include a screenshot or browser smoke
when possible; code is structured to be testable (seams, injectable dependencies).

**Q8. Reliability & Error Gate** — Failure cases documented; user-facing errors prepared when
behavior changes; every error handled explicitly. On 3 consecutive identical failures, web-search a
fix (record the source), then record escalation in `docs/issues.md` and pause if unresolved.

**Q9. Security Gate** — Safe values only in output; secrets never read unless explicitly required
and safe; the deny-set hook is active; mandatory self-review classes (Section 6-4) reviewed by a
fresh Opus subagent.

**Q10. Data Integrity Gate** — Migrations are reversible or have a documented rollback; destructive
operations (drop/truncate/bulk-delete) require an explicit, logged decision; constraints and
validation protect invariants.

**Q11. Observability Gate** — Structured logging distinguishes error/warn/info; secret redaction
applied; API/DB/auth/external-API failures are traceable; MVP deferrals documented in
`docs/decisions.md`.

**Q12. Dependency Security Gate** — New dependencies are justified and pinned; lockfile committed;
known-vulnerability scan run when available; no install from unverified sources. (Context: supply-
chain incidents via compromised package publication are a live threat in 2026; see Section 18.)

**Q13. Handoff Gate** — Report in Japanese; completed task IDs listed; verification steps and
unverified items explicit; the agent completes all possible work before requesting human action.

---

## 14. Verification Modes

### quick
For docs, small copy, low-risk config. Confirm changed files; check task ID; run
`git diff --check`; targeted tests only when needed.

### standard
For normal implementation, component additions, API changes. Run lint, typecheck, build, related
tests; update task evidence.

### final
For pre-merge, pre-push, pre-deploy, large-scope changes. Run `pnpm verify`; e2e tests when
available; browser smoke and console-error check for UI; `git status`; reconcile `tasks.md` and
`docs/state.md` against git reality; run the fresh-Opus self-review.

---

## 15. MCP Policy

Do not generate `.mcp.json` by default. Add MCP only when a concrete tool/data source is required,
the server exists in official docs or a trusted registry, and the reason is recorded in
`docs/decisions.md`.

Once added, an MCP server's safe tool calls are auto-approved under the allow-by-default policy
(Section 7), including servers connected mid-session — the human is not asked per tool. The deny-set
hook still applies, so an MCP server cannot perform a dangerous operation without hitting the guard.

---

## 16. Shell Routing

PowerShell only. The v9.5 RTK command-routing layer (explicit `rtk read`, `rtk proxy powershell`
prefixes from `AGENTS.md`) is removed. RTK the tool is active as a transparent PreToolUse hook;
commands are rewritten automatically and no manual `rtk` prefixing is needed.

| Operation | Shell | Reason |
|---|---|---|
| git, pnpm, npm, node | PowerShell | Project files live in the Windows filesystem |
| Build, test, lint | PowerShell | Native Windows toolchain |
| File search | PowerShell + `rg` | Fast local search |
| Windows app interaction | PowerShell | Windows host access |
| Ambiguous operation | PowerShell | Deterministic default |

Project paths use Windows backslash form in PowerShell. Node scripts run as `node scripts/name.mjs`.

---

## 17. Git and GitHub Workflow (full AI auto-execution, solo-dev optimized)

These rules model the habits of strong individual engineers and run **fully automatically** with no
human review of the code itself.

### 17-1. Branches
- Never commit directly to `main`. Always work on a dedicated branch.
- Naming: `<type>/<short-description>` — e.g. `feat/add-auth`, `fix/null-check`,
  `docs/update-readme`, `security/harden-gitignore`.
- Create the branch at the start of the task, not after implementation.

### 17-2. Commits
- Commit after each logically complete unit of work (this is also the continuity checkpoint).
- Format: `<type>: <short description>` — types: `feat` / `fix` / `docs` / `refactor` / `security`
  / `chore` / `test` / `perf`.
- Stage only files within the task's Write Scope. Never stage `.env*`, secrets, or credentials.
- Every committed function works. No placeholder code.

### 17-3. Push
- Push after every commit. First push: `git push -u origin <branch>`; subsequent: `git push`.

### 17-4. Pre-push Security Check
- Confirm `.gitignore` covers secret/credential patterns before the first push on any branch.
- Run `gitleaks git --no-banner` if available. If secrets are staged, untrack them and update
  `.gitignore` before pushing. (A secret pushed to GitHub is effectively public within seconds due
  to automated scanners.)

### 17-5. Pull Requests
- Open a PR to `main` when the branch is complete — automatically, without being asked.
- PR title: conventional-commit format matching the branch type. PR body: what changed and why,
  plus the self-review result and verification evidence.

### 17-6. Merge (solo-dev, no human review)
- Gate merge on: `final` verification green **and** fresh-Opus self-review passed.
- **Low/medium-risk** changes: the agent squash-merges to `main` and deletes the branch.
- **High-risk classes** (auth, billing, DB schema, RLS/permissions, deploy, security, 300+ line
  diff, new external API, production data, personal information): the agent still implements and
  self-reviews fully, but **stops before any irreversible real-world side effect** and surfaces a
  Japanese summary. This is the only human touchpoint, and it is about real-world irreversibility,
  not code approval.

### 17-7. Why these rules
- **Uncommitted drift:** changes accumulate, then context compacts and the file→purpose mapping is
  lost. Fix: commit after each logical unit. (Doubly important under 40–50% compaction.)
- **Silent local accumulation:** commits never pushed; remote out of sync; no visibility. Fix: push
  after every commit.
- **Branch naming** makes purpose legible in the PR list. **Auto-PR** gives a durable audit trail.
  **Pre-push secret scan** catches the most common leak vector before it becomes an incident.

---

## 18. Reference Integration and Sources

v10 applies these current Claude Code practices:

- Keep root context (`CLAUDE.md`) lean; it reloads every turn and is never evicted, so it is a
  per-turn token cost — make it a lookup table.
- Filter CLI output before it enters the context window: RTK (Rust Token Killer) intercepts
  Bash calls via a PreToolUse hook and compresses output by 60–90%; run `rtk init -g` once
  since RTK is already locally installed.
- Layer context: read directory detail only when relevant; prefer subagents (separate context
  windows that report summaries) for wide reading.
- Put durable rules in `CLAUDE.md` because early conversation instructions can be lost after
  compaction; add custom compaction instructions to preserve critical facts.
- Compact proactively before the threshold; auto-compaction fires while the model is degraded.
- Use deterministic hooks for enforcement, not prompt reminders.
- Use auto mode / explicit permission rules for unattended runs; subagents cannot show interactive
  permission prompts, so run them under allow-by-default or read-only.
- Route models by task: Opus for reasoning/review, Sonnet for implementation, Haiku for exploration.
- Treat dependency supply-chain as a live security surface; pin and scan.
- Review configuration every 3–6 months and after major model/tool releases.

Sources consulted (as of 2026-06-09; details may change — verify against official docs):

- Claude Code — How Claude Code works (context, auto-compaction, CLAUDE.md): https://code.claude.com/docs/en/how-claude-code-works
- Claude Code — Best practices (subagents, /btw, custom compaction): https://code.claude.com/docs/en/best-practices
- Claude Code auto mode (classifier-based permission skipping; Anthropic, Mar 2026): https://www.mbgsec.com/archive/2026-03-29-claude-code-auto-mode-a-safer-way-to-skip-permissions/
- Auto-compact env vars (`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW`): https://docs.bswen.com/blog/2026-03-21-claude-code-auto-compact-settings/
- Context buffer mechanics / 1M context GA: https://claudefa.st/blog/guide/mechanics/context-buffer-management
- Hooks, subagents, permission modes (2026): https://dev.to/vibehackers/claude-code-hooks-subagents-power-features-the-complete-guide-2026-c71
- Claude Code features & settings reference (subagents cannot prompt; read-only pattern): https://hidekazu-konishi.com/entry/claude_code_features_settings_reference_2026.html
- Token optimization (lean CLAUDE.md, @file, one task per chat): https://www.kdnuggets.com/7-practical-ways-to-reduce-claude-code-token-usage
- Claude model lineup (Opus 4.8 / Sonnet 4.6 / Haiku 4.5; routing): https://claudefa.st/blog/models
- Claude API models overview (Opus 4.8 current flagship): https://platform.claude.com/docs/en/about-claude/models/overview
- fallbackModel chain (Claude Code v2.1.166, Jun 2026): https://blakecrosley.com/guides/claude-code
- RTK (Rust Token Killer) — CLI proxy, 60–90% token savings, PreToolUse hook integration: https://github.com/rtk-ai/rtk
- RTK real-world measurements (89% avg, 2,900+ commands): https://www.rtk-ai.app/

---

## 19. v9.5 -> v10 Migration

### Preserved
- Windows + VSCode + PowerShell environment.
- Full auto-execution principle; positive directives; Japanese handoff.
- 7 file primitives and the ledger model (vision/tasks/state/decisions/issues + repo-map).
- Hybrid summary-first repo map; Single Writer / Scope Lock; Quality Gates; verification modes.
- `.env` read denial as a baseline permission.
- **RTK (Rust Token Killer)** — the CLI output filter is preserved; integration method changes
  from Codex permission rule to Claude Code native PreToolUse hook (see Changed below).

### Removed
| Removed | Reason |
|---|---|
| Codex CLI / CodeX orchestration | Claude Code only |
| `AGENTS.md` | `CLAUDE.md` is the single primary directive (token frugality) |
| `.codex/*` config and safety note | No Codex runtime |
| RTK Codex permission rule (`prefix_rule` in `~/.codex/rules/`) | No Codex runtime (RTK tool itself is preserved; see Preserved and Changed) |
| `xp-rules.md` cross-project promotion (XP system) | Self-Evolution loop replaces it |
| Hard "max 3 concurrent agents" | Budget-aware soft cap on disjoint scopes |

### Added
| Addition | Purpose |
|---|---|
| Context Continuity discipline | Survive compaction assumed at ~40–50% |
| `.claude/settings.json` as baseline | Carries permissions, deny-set, auto-compact override, guard hook |
| Allow-by-default permission model | Auto-approve safe ops and new MCP/tools without prompting |
| Cross-model self-review | Replace human and cross-vendor review with a fresh Opus subagent |
| Self-Evolution loop + web-search recovery | Learn from failures; do not repeat mistakes |
| 10 quality priorities + Q6/Q10/Q12 gates | Performance, Data Integrity, and Dependency Security made explicit |
| Solo-dev full-auto git incl. risk-gated merge | Strong-engineer git habits with no human code review |

### Changed
| Item | v9.5 | v10 |
|---|---|---|
| Architecture | Agent OS | Autonomous Solo-Dev OS |
| Runtime | Claude + Codex | Claude Code only |
| Review | Cross-vendor / human | Cross-model self-review, no human code review |
| Primary directive | `AGENTS.md` | `CLAUDE.md` |
| Compaction | Not designed for | Assumed at ~40–50%, file-based durability |
| Learning | XP promotion | In-repo Self-Evolution |
| Coding priorities | 6 | 10 |
| RTK integration | Codex `prefix_rule` in `~/.codex/rules/` | Claude Code PreToolUse hook via `rtk init -g` |

---

## 20. Logical Destroyer Final Verification

Independent, cold audit of v10 (Chain-of-Verification applied).

**20-1. "No human review" could ship unsafe code.**
Mitigation: review is not removed, it is automated — a fresh Opus 4.8 subagent with no
implementation context reviews mandatory-risk classes, plus deterministic gates (verify, tests,
deny-set hook). Irreversible real-world side effects (money, prod credentials, personal-data
publication) remain human-gated. The claim "no human review" applies to code approval, not to
irreversible real-world acts. Consistent.

**20-2. Compacting at 40–50% wastes tokens via frequent summarization.**
Mitigation: file-based durability keeps each summary short and lossless, and a lean `CLAUDE.md`
keeps the post-compaction baseline small. Sourced caution: very low thresholds (≈10) are wasteful;
~50 sits in the practical 40–70 band. The operator verifies actual behavior. Acceptable tradeoff,
chosen deliberately for output quality.

**20-3. Allow-by-default could let a malicious MCP server act dangerously.**
Mitigation: the deny-set PreToolUse hook applies to every tool including newly connected MCP
servers, and runs deterministically regardless of conversation state. Dangerous capabilities still
hit the human gate. The autonomy gain does not bypass the guard. Consistent.

**20-4. Subagents cannot prompt for permission — parallel work could silently stall.**
Mitigation: this is explicitly accounted for — worker subagents run under allow-by-default or are
restricted to read-only; an `ask` rule would deny rather than hang. Stated in Sections 5-2 and 7.
Consistent with the platform fact.

**20-5. `CLAUDE.md` carries Engineering Role + Thinking Protocol + routing — does that contradict
"keep it lean"?**
Tension acknowledged. Mitigation: those sections are terse, bulleted, always-applicable rules
(the legitimate use of an always-on file). Rationale and detail (this document, `docs/decisions.md`)
are not in `CLAUDE.md`. Reference-level lessons go to `docs/lessons.md`. The lean principle is about
excluding *detail and history*, not excluding *rules*. Consistent.

**20-6. Self-Evolution could bloat `CLAUDE.md` over time.**
Mitigation: only always-applicable one-line rules are promoted to `CLAUDE.md`; everything else goes
to `docs/lessons.md` or stays in `docs/issues.md`. Periodic global/config review (Section 10-2)
prunes stale rules. Consistent.

**20-7. Removing `AGENTS.md` — any loss?**
v10 is Claude-Code-only, which reads `CLAUDE.md` natively. A second always-loaded directive would
be duplicate token cost with no second consumer. No loss; a token win. Consistent.

**20-8. RTK is now a core token optimization dependency — what if it is unavailable?**
Mitigation: RTK is a transparent CLI proxy. If `rtk` is not installed or the PreToolUse hook is
absent, Bash calls execute unmodified (`git status` stays `git status`). The agent still works;
it simply consumes more tokens from unfiltered CLI output. There is no correctness risk, only a
cost/context-efficiency regression. The `rtk --version` check in Phase 0 surfaces the absence
early. If the hook is misconfigured, the symptom is verbose output — detectable via `rtk gain`
showing zero savings. Acceptable degradation.

**20-9. Routing heuristics could prevent the agent from using the best tool for a novel situation.**
Mitigation: the heuristics set a default bias (Sonnet, main context), not a hard constraint.
The agent can deviate when justified — the rules say "unless a specific row justifies" a different
choice. Novel situations fall to the agent's judgment, which is the strongest available model's
core capability. The heuristics prevent the common-case waste (spawning Opus for a typo fix),
not the rare-case adaptation. Consistent.

**20-10. Final Judgment.**

```text
Claude Code only. PowerShell only. No Codex, no AGENTS.md.
RTK (Rust Token Killer) active via transparent Claude Code PreToolUse hook (60-90% CLI output savings).
One autonomous agent self-orchestrates with subagents and model-aware routing
  (Opus 4.8 reasoning/review, Sonnet 4.6 implementation, Haiku 4.5 exploration).
No human code review: fresh-Opus self-review + deterministic gates replace it.
Human gate only for irreversible real-world acts.
Token frugality is the primary constraint: lean CLAUDE.md, on-demand detail, subagent isolation.
Compaction assumed at ~40-50%: checkpoint to files; conversation is disposable.
Allow-by-default permissions absorb new MCP/tools without prompting; one deny-set hook guards the dangerous set.
Self-Evolution loop (issues -> web-search -> root cause -> durable rule) replaces the XP system.
Default repository: 13 files. tasks.md is the fixed execution ledger.
Quality is defined by 10 priorities and 13 gates.
Solo-dev full-auto git with risk-gated auto-merge.
Handoff is Japanese.
```

---

## 21. v10 Production Summary

v10 evolves from **Agent OS** to **Autonomous Solo-Dev OS**.

Quality is guaranteed by:

1. Product intent in `docs/vision.md`.
2. Execution tasks in `tasks.md`.
3. Current pointer in `docs/state.md`.
4. Navigation in `docs/repo-map.md`.
5. Decision rationale in `docs/decisions.md`.
6. Failure history and self-evolution in `docs/issues.md`.
7. One Claude Code agent self-orchestrating with subagents.
8. Model-aware routing within the Claude family.
9. Token frugality as the primary design constraint; lean always-on `CLAUDE.md`.
10. Context continuity: durable files survive compaction assumed at ~40–50%.
11. Allow-by-default autonomy that absorbs new tools without prompting; one deny-set guard hook.
12. Cross-model self-review replacing human and cross-vendor review.
13. Self-Evolution loop with web-search recovery, replacing the XP system.
14. 10 quality priorities and 13 quality gates, with Data Integrity, Performance, and Dependency Security explicit.
15. Solo-dev full-auto git with risk-gated auto-merge; human gate only for irreversible real-world acts.
16. Verification evidence mapped to task IDs.
17. Handoff complete in Japanese.
18. Extension files added only after a concrete need appears.

Work that does not satisfy these criteria is not complete under pm-zero v10.
