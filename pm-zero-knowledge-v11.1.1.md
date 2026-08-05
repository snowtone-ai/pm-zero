# pm-zero-knowledge-v11.1.1.md

2026-07-27 v11.1.1 (patch of 2026-07-23 v11.1, itself a revision of 2026-07-05 v11 final) / Claude Code only / VSCode on Windows + PowerShell-only / Claude Pro plan only

See `update.md` for version history, the change delta, and migration steps.

---

## 0. Result

pm-zero v11 is the **Budget-Bound Autonomous Solo-Dev OS**. v11.1 keeps that identity unchanged and
sharpens it against the platform as it actually stands (see `update.md`).

v10 established the Autonomous Solo-Dev OS: one Claude Code agent that self-orchestrates,
self-reviews, and self-evolves. v11 hardens it around two constraints that v10 stated but did
not fully enforce, and fixes one defect v10 shipped with:

1. **The budget is a hard wall.** The operator pays for Claude Pro ($20/mo) and nothing else.
   No API overage, no pay-as-you-go. Every design decision is re-derived from this constraint:
   Sonnet is the workhorse, Opus is optional garnish, and the Session Budget Protocol
   (Section 8) is a first-class discipline, not a tips list.
2. **Zero permission prompts, correctly implemented.** v10 *intended* allow-by-default but
   prompts still leaked through. v11 root-caused the leak (Section 7-1): the permission mode
   was set with a non-schema key in a non-loaded file, and the PowerShell tool had no allow
   rule at all. v11 fixes the schema (`permissions.defaultMode: "bypassPermissions"`) and moves
   the safety boundary to where it actually holds in bypass mode: a deterministic PreToolUse
   guard hook.
3. **Opus dependency removed from the critical path.** v10's merge gate required a fresh-Opus
   self-review. On a Pro plan Opus is rate-limited or unavailable, so that gate either stalls
   the pipeline or burns the budget. v11's reviewer is a **fresh-context Sonnet subagent** by
   default — the blind-spot removal comes from the fresh context, not the bigger model — with
   Opus reserved for the highest-risk classes when available and affordable.

v11 was designed using Claude Fable 5 during its temporary Pro-plan availability window
(through 2026-07-07). The runtime never uses Fable: the system assumes Opus-and-below, and
must run acceptably on Sonnet alone.

> **One autonomous Claude Code agent: self-orchestrates, self-reviews, self-evolves —
> inside a fixed $20/month budget, with zero permission prompts.**

v11 one-line definition:

> A non-engineer runs one Claude Code agent from VSCode on Windows PowerShell, on a Claude Pro
> plan with no overage. The agent self-orchestrates with subagents (Sonnet-first, Haiku for
> exploration), self-reviews with a fresh-context subagent, and self-evolves from
> `docs/issues.md`. Permission mode is bypassPermissions; the dangerous set is blocked by one
> deterministic guard hook that fires in every mode. `docs/vision.md` defines intent,
> `tasks.md` defines work, `docs/state.md` is the pointer, `docs/repo-map.md` is the map,
> `CLAUDE.md` owns always-on behavior. The file system is the memory because the conversation
> is disposable (auto-compact early — §8-5).

> **Fact vs. recommendation note (applies throughout):** Statements about Claude Code /
> Claude model behavior are sourced in Section 16. Threshold values and routing defaults are
> *recommendations* tuned for Pro-plan solo-dev frugality, not platform requirements.

---

## 0.1 Change Delta (v11 → v11.1)

Moved to `update.md` §2-0. The `D1`–`D5` labels are defined there.

---

## 0.2 Change Delta

Moved to `update.md` §2. The `P1`–`P7` and `A1`–`A6` labels used
throughout this document are defined there.

---

## 1. First Principles

### 1-1. The v11 Constraints

Reason from constraints, not habit:

1. *The budget is $20/month, hard.* → Token cost is the primary optimization target. **Sonnet 5**
   (intro $2/$10 per MTok API-equivalent through 2026-08-31, **then $3/$15 — five weeks away, so
   do not build the budget argument on the discount**) does 95%+ of the work; Haiku 4.5 ($1/$5)
   does the reading; **Opus 5** ($5/$25, unchanged from Opus 4.8) is used only when its marginal
   quality is worth its budget bite. Opus's list price is 2.5x Sonnet 5's intro rate and 1.67x its
   post-August rate; **how subscription rate-limit weight relates to API price is not documented**,
   so treat it as an *ordering* — Opus costs meaningfully more window per token than Sonnet, which
   costs more than Haiku — and not as a number. (v11.1 asserted "~5x" with no source; that was
   invented.) Fable 5 ($10/$50) is never used at runtime.
   **On this plan Opus 5 has a 200K context window**, because its 1M requires usage credits and
   credits are overage (P4).
2. *The operator must never be interrupted by a permission prompt.* → The permission mode is
   `bypassPermissions`. In bypass mode, allow/ask rules are moot — therefore the safety layer
   must be something that fires regardless of mode: a **PreToolUse hook**. Prompt instructions
   can be compacted away; deny rules may not be consulted in bypass mode; hooks always run.
3. *Auto-compaction fires early — at an absolute ~175K on every model, set with
   `CLAUDE_CODE_AUTO_COMPACT_WINDOW` rather than a percentage (Section 8-5).* → Anything not
   written to a file is lost.
   The file system, not the transcript, is the source of truth. `CLAUDE.md` reloads every
   turn and survives compaction; it must stay lean because it is a fixed per-turn tax.
4. *No human code review.* → Verification is deterministic gates plus a fresh-context
   subagent review. The reviewer's power comes from not inheriting the implementer's context.
5. *The agent will make mistakes.* → A recurring failure is a missing rule. The Self-Evolution
   loop (Section 9) turns failures into durable rules.
6. *Models come and go.* → Routing is a preference order that never blocks on a specific model.
   **v11.1 makes the Opus-optional case deterministic:** a native `fallbackModel` chain in
   `settings.json` (Section 7-2) substitutes **Sonnet 5** when a *routed* model — in practice an
   optional Opus review or architecture call — is *overloaded or unavailable*, so the pipeline never
   stalls waiting on Opus. The chain contains only Sonnet 5, not Haiku, so the default coding agent
   can never silently drop to a read-only model; a true Sonnet-5 outage has no lower fallback and
   surfaces as a stop/handoff (correct — you do not want to code through a workhorse outage). Honest
   limit: `fallbackModel` does **not** fire on the Pro-window *rate-limit* (it surfaces immediately
   by design); that case stays owned by the Session Budget Protocol (Section 8-1). Determinism where
   the platform allows it; discipline where it does not.
7. *A tool's self-reported savings are a claim about its counterfactual, not about your bill.*
   → **New in v11.1.1, and it is here because its absence cost v11.1 a wrong rule.** Before
   adopting any token-saving tool, measure the paired cost across a real task set: same tasks,
   same model, with and without. RTK's own counter reported 96.2 million tokens saved over
   trials in which the measured bill went *up* (P2). A counter that grades its own homework is
   not evidence. This applies to pm-zero's own recommendations too — verify the compaction
   firing point rather than trusting the setting (Section 8-5).

### 1-2. Essential Elements (unchanged from v10)

**7 file primitives:**

| Element | Role | Entity |
|---|---|---|
| Intent | Product north star | `docs/vision.md` |
| Task | Implementation contract | `tasks.md` |
| State | Current pointer and lock | `docs/state.md` |
| Decision | Permanent rationale | `docs/decisions.md` |
| Navigation | Where things live | `docs/repo-map.md` |
| Guardrail | Always-on behavior | `CLAUDE.md` |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates |

**3 cross-cutting disciplines** (v10 had 2; v11 promotes the budget to a discipline):

- **Context Continuity** — critical facts are checkpointed to files before compaction fires.
- **Self-Evolution** — recurring failures are root-caused and promoted into durable rules.
- **Budget Discipline** — every session is planned against the Pro-plan window
  (Section 8, Session Budget Protocol).

### 1-3. Problems v11 Solves (relative to v10)

| Problem | Root Cause | v11 Solution |
|---|---|---|
| Permission prompts still appeared | Invalid settings schema (top-level `permissionMode` key is not read; `~/.claude/settings.local.json` is not a loaded file) + PowerShell tool had no allow rule despite `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` routing shell calls to it | `permissions.defaultMode: "bypassPermissions"` in `~/.claude/settings.json`; `PowerShell` added to allow list |
| Bypass mode removes the deny safety-net | allow/deny rules are permission-layer constructs; bypass skips the layer | Global deterministic guard hook (`~/.claude/hooks/guard.mjs`) — PreToolUse hooks fire in every mode, for main agent and subagents |
| Merge gate depended on Opus | v10 required fresh-Opus review; Pro plan cannot guarantee Opus | Tiered review: fresh-context Sonnet default; Opus only for highest-risk classes when budget allows |
| Budget exhaustion mid-feature | No session-level budget planning | Session Budget Protocol: one task per session, plan→/handoff→execute split, Haiku-first exploration, background execution |
| Session context rebuilt manually across sessions | No handoff mechanism used | `/handoff` compacts the session into a pickup document for the next session |
| Parallel work risked write collisions | Manual disjoint-scope discipline only | Worktree isolation (`isolation: "worktree"`) for subagents on overlapping scopes |
| Platform features unused | v10 predated or ignored them | Auto-memory boundary defined, ToolSearch deferred tools (automatic), background tasks, Task tools as in-session mirror |

---

## 2. Architecture

### 2-1. Layer Structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-7

Autonomy Layer (runtime)
  +-- Permission mode: bypassPermissions (global) -- zero prompts
  +-- One deterministic guard hook (global, PreToolUse, all modes, all agents)
  +-- Deny rules retained as second layer for non-bypass modes
  +-- New MCP/tools work immediately; only the guard set is blocked

Budget Layer (runtime) -- NEW in v11
  +-- Session Budget Protocol (Section 8)
  +-- Sonnet-first routing; Opus optional; Fable never
  +-- Haiku-first exploration; /handoff session splits (RTK removed in v11.1.1 -- P2)

Orchestration Layer (runtime)
  +-- Main Claude Code agent (self-coordinator, Sonnet 5)
        +-- Explore subagents (Haiku 4.5, isolated context; background by default)
        +-- Worker subagents (Sonnet 5, disjoint scopes or worktree isolation; <=2, env-capped)
        +-- Reviewer subagent (fresh context; Sonnet 5 default, Opus 4.8 for top risk)
        +-- Background execution for long builds/tests (subagents background by default)
        +-- Nested subagent spawning left OFF by default (budget; not enabled)

Continuity Layer (runtime)
  +-- Checkpoint-before-compaction discipline (auto-compact early — §8-5)
  +-- Custom compaction instructions in CLAUDE.md
  +-- /handoff for session transitions
  +-- Auto-memory (MEMORY.md) for cross-project preferences ONLY
  +-- Self-Evolution loop (issues -> root cause -> durable rule)

User Repository (files -- unchanged 13-file default)
  +-- Core Layer       : CLAUDE.md + .claude/settings.json + HANDOFF-JA.md
  +-- Ledger Layer     : vision / tasks / state / decisions / issues
  +-- Navigation Layer : repo-map
  +-- Scripts Layer    : setup / verify
  +-- Aux Layer        : env example / gitignore
```

### 2-2. Default File Structure (13 files, unchanged from v10)

Core (3): `CLAUDE.md`, `.claude/settings.json`, `HANDOFF-JA.md`.
Ledger (5): `docs/vision.md`, `tasks.md`, `docs/state.md`, `docs/decisions.md`, `docs/issues.md`.
Navigation (1): `docs/repo-map.md`.
Scripts (2): `scripts/setup.mjs`, `scripts/verify.mjs`.
Aux (2): `.env.example`, `.gitignore`.

Optional extensions (add on concrete need, unchanged): `docs/lessons.md`,
`.claude/hooks/*.mjs`, `.claude/agents/*.md`, `.claude/commands/*.md`, `.mcp.json`,
`.claudeignore`, `CONTEXT.md`, `scripts/lib/*`.

**RTK was removed in v11.1.1 (P2).** v11 and v11.1 both carried it as strongly recommended and
globally hooked. Measured across 425 paired trials it cost +7.6% at low effort and saved nothing
at high effort, because `Read` and `Grep` never touch the Bash hook it installs. Delete the
`rtk hook claude` PreToolUse entry. The mechanism that actually reduces the same cost centre is
the Haiku Explore subagent, which pm-zero already had.

### 2-3. Global vs Project Split (sharpened in v11)

**Global owns behavior; project owns facts.** v11 moves more into global because the operator
is a single person on a single machine:

| Lives in global (`~/.claude/`) | Lives in project |
|---|---|
| `settings.json`: bypassPermissions, `allow: ["*"]` + deny baseline, guard hook (now incl. `Edit\|Write`), `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000` (§8-5), `fallbackModel` chain, subagent concurrency ceiling, spawn depth 1, `PreCompact` + `StopFailure` one-liners | `.claude/settings.json`: project-specific deny additions only (thin) |
| `hooks/guard.mjs`: the hard-limit enforcement | project-specific hooks only when a deterministic project job exists |
| `CLAUDE.md`: budget rules, routing, autonomy, git policy, language, self-evolution | `CLAUDE.md`: commands, source-of-truth pointers, project boundaries |
| `myself-info.md` equivalent facts (via pm-zero repo) | vision / tasks / state / decisions / issues / repo-map |

`C:\Users\chidj\project\pm-zero\myself-info.md` stays as the operator's environment sheet;
the PM Interview (Phase 1) reads it instead of re-asking environment questions.

---

## 3. Source of Truth (unchanged)

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

Responsibilities are unchanged from v10:

- `docs/vision.md` — purpose, users, success criteria, non-goals, flows, failure cases.
  No task checklists, no locks, no evidence.
- `tasks.md` — the only task list. Main agent is the only writer. Every ready task has
  owner, dependencies, write scope, acceptance, verification, expected evidence.
- `docs/state.md` — branch, active task, executor, write lock, latest verification pointer,
  blocker summary. If it disagrees with `tasks.md`, `tasks.md` wins.
- `docs/issues.md` — failure log; the fuel of Self-Evolution (Section 9).
- `docs/repo-map.md` — Summary-first navigation map (Section 4).

**Harness Task tools note (new):** Claude Code's in-session task tracker (TaskCreate /
TaskUpdate) may be used as an ephemeral mirror during a session, but `tasks.md` is the
system of record — it is git-tracked, survives sessions, and survives compaction.

**Auto-memory note (new):** Claude Code auto-memory (`MEMORY.md` + memory files) carries
*cross-project operator facts*: preferences, corrections, environment quirks. It must never
hold project facts — those belong in the ledger files, which are version-controlled and
portable. Memory is a convenience layer; the ledger is the system of record.

---

## 4. Navigation Policy (condensed, unchanged in substance)

1. Session start: read `docs/repo-map.md` `## Summary` only.
2. Before implementation: read the relevant directory section when target files are unclear.
3. During debugging: read entry-point / test / generated-file sections as needed.
4. After structural changes: update only the affected section.
5. Prefer `rg` over browsing; prefer an Explore subagent (Haiku) over reading many files in
   the main context — the subagent reads widely in its own window and returns a summary.

The `repo-map.md` template is unchanged from v10 (Read Policy / Summary under 20 lines /
Directory Map / Entry Points / Common Workflows / Generated files / Update Rules).

---

## 5. Task Ledger (condensed, unchanged in substance)

`tasks.md` template is unchanged from v10: Goal Binding, Status Vocabulary
(proposed / ready / doing / blocked / review / done / verified), Tasks table
(ID, Status, Owner, Depends On, Write Scope, Acceptance, Verification, Evidence),
Blockers table, Review Notes table.

### 5-1. Coordination and Parallelism

- Main agent owns `tasks.md` and `docs/state.md`. Subagents report; they do not write ledgers.
- Parallel work only on **disjoint write scopes**. Same file → serialize.
- **New in v11:** when scopes overlap or are uncertain, spawn the worker subagent with
  `isolation: "worktree"` — it gets its own git worktree, eliminating write collisions
  without manual lock bookkeeping. Unchanged worktrees are auto-cleaned.
- **Subagents inherit the main session's permission mode.** In current Claude Code the Task
  tool's `mode` parameter is deprecated and subagents inherit the parent's mode by default — so
  under v11's `bypassPermissions` they run prompt-free, and the guard hook still applies to them.
  (Under v10's leaky config an `ask` outcome silently denied subagent calls; that failure mode is
  gone.) A further reliability gain folded into v11.1: a subagent cut off by a rate limit or server
  error now returns whatever output it had **already produced** to the parent, rather than failing
  silently — so hitting the Pro window mid-subagent is less likely to discard work (a subagent killed
  before producing any text still returns empty). (Fact; see Section 16.)
- Budget-aware cap: **≤2 concurrent worker subagents by default on a Pro plan** (v10 said 3;
  v11 tightened it — every concurrent worker multiplies token burn against the same 5-hour window).
  This ≤2-*worker* number stays a prose default the main agent can reason about per task.
  **v11.1 adds a deterministic backstop beneath it:** `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` (global
  `env`, Section 7-2) caps **total concurrent subagents of every role** — explore, worker, and
  reviewer alike (platform default 20). pm-zero sets it to **3**: enough for the ≤2-worker default
  plus one concurrent background explore or review, and no more. Note the semantics precisely — this
  is a *total-concurrency* ceiling, not a worker-only cap, so with two workers running a background
  review will queue behind them (serialization that saves budget, which is on-brand). It is a static
  ceiling: raising it means editing `settings.json`, not a per-session whim. **Nested subagent spawning must now be
  turned off explicitly (v11.1.1, P1):** the platform default changed to **depth 3** on
  2026-07-24, so pm-zero sets `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`. The rationale is
  unchanged — agent trees fan token cost out geometrically against one shared window — but the
  *action* changed from "leave the default alone" to "override the default", and leaving it alone
  is now a budget bug. Keep worker parallelism disjoint-scoped and within the ceiling.

---

## 6. Orchestration and Model Routing

### 6-1. Self-Coordinating Main Agent

Unchanged: the main Claude Code agent decomposes, delegates, integrates, and owns the ledger.
No "you are the coordinator" prompt is needed.

### 6-2. Model Routing (Pro-plan, Sonnet-first — REVISED)

| Work | Model | Why |
|---|---|---|
| Everything by default: implementation, refactor, tests, debugging, planning | **Sonnet 5** (main context) | Handles 90%+ of coding, now near Opus 4.8 on agentic/coding benchmarks at ~40–60% of the cost; native 1M-token context; the Pro plan is sized for Sonnet, and Sonnet 5 is the Claude Code default since 2026-06-30 |
| Exploration, wide file reads, "how does X work" | **Haiku 4.5** (Explore subagent) | Cheapest; context is discarded after the summary returns |
| Standard self-review | **Sonnet 5, fresh subagent** | Blind-spot removal comes from fresh context, not model size — and the reviewer is now a stronger model than v11's Sonnet 4.6 reviewer at similar cost |
| Highest-risk review (auth, billing, DB schema, prod data, security) / architecture decisions | **Opus 5, only if available and budget allows** | Released 2026-07-24 at Opus 4.8's price and reported strongest-in-family at code review. **200K window on Pro** (1M needs credits), so a very large diff may not fit where a Sonnet 5 review would. The gate must not stall if Opus is absent — fall back to fresh Sonnet 5 at high effort |
| An **optional Opus** review/architecture call, when Opus is overloaded/unavailable | **Sonnet 5** | The pipeline never blocks on Opus — the native `fallbackModel` chain substitutes Sonnet 5 (Section 7-2). The default Sonnet-5 agent has no lower fallback: a Sonnet-5 outage is a stop/handoff, not a silent downgrade to a read-only model |

Fable 5 is design-time only (the original v11 design pass) and is never part of runtime routing.

Cost anchors (API list prices; **the mapping to subscription rate-limit weight is undocumented —
treat these as an ordering, not a ratio**): Haiku $1/$5, Sonnet 5 $2/$10 intro through 2026-08-31
then $3/$15, Opus 5 $5/$25 per MTok in/out (fast mode $10/$50).
Extended thinking is billed at output rates and is the single largest per-prompt cost driver —
keep `/effort` at medium for routine work; raise it instead of switching to Opus when a problem is
hard. Two effects, kept separate: Sonnet 5's *capability* gain over Sonnet 4.6 is **permanent** and
makes "raise effort before switching to Opus" structurally stronger; its intro *price* ($2/$10,
below Sonnet 4.6's old rate) is **temporary** and reverts to $3/$15 — the old Sonnet 4.6 rate — on
2026-08-31. Lean the budget argument on the capability, not on the discount.

### 6-3. The Reviewer Without a Human (REVISED — tiered)

"No human code review" still does not mean "no review". v11 tiers it by cost:

- **Tier 0 — deterministic gates (always, free-ish):** `scripts/verify.mjs`, tests, lint,
  typecheck, `git diff --check`, gitleaks when available. These run before any model review.
- **Tier 1 — fresh-context Sonnet review (default for review-class changes):** a fresh
  Sonnet 5 subagent with no implementation context reads the diff, acceptance criteria,
  and relevant tests; returns pass/fail with findings. The mechanism that made v10's Opus
  review work was the *fresh context* (no inherited blind spots) — v11 kept the mechanism and
  dropped the mandatory model upgrade. v11.1 inherits an even stronger default reviewer for free:
  Sonnet 5 sits close to Opus 4.8 on coding/agentic tasks, so the "fresh Sonnet is enough" claim
  is more defensible now than when the reviewer was Sonnet 4.6.
- **Tier 2 — Opus 5 review (highest-risk classes, budget permitting):** auth, billing,
  DB schema, RLS/permissions, deploy, security, production data, personal information.
  If Opus is unavailable or the window is nearly exhausted, run Tier 1 with high effort
  instead and record the substitution in `tasks.md` Review Notes.

Review-class changes (Tier 1 minimum): 300+ line diff, new external API, behavior changes
in critical workflows, and everything in the Tier 2 list.

Reviewer instructions (unchanged in spirit): report every finding with confidence and
severity; the main agent filters. Do not tell the reviewer "only report serious issues" —
modern models follow that literally and recall drops.

### 6-4. Subagent Routing Heuristics (token-budget-aware, tightened)

| Situation | Action | Rationale |
|---|---|---|
| Single-file fix, small edit, config change | Main context, Sonnet | Spawn cost exceeds benefit |
| Error debugging (first 2 attempts) | Main context, Sonnet | Direct context access is faster |
| Error debugging (3+ failures) | Web-search first (global rule), then Haiku research subagent if broad investigation is needed | Isolate wide reading from main context |
| Multi-file feature | Worker subagents on disjoint scopes (Sonnet); worktree isolation if scopes overlap | Parallel savings justify spawn cost |
| Codebase exploration | Explore subagent (Haiku) | Only the summary returns |
| Self-review (review classes) | Fresh subagent per Section 6-3 tiers | Fresh context is mandatory |
| Architecture / design decision | Main context; Opus only if available and it is a genuinely hard call | Needs conversation history |
| Ad-hoc work (no tasks.md entry) | Main context, Sonnet | Cheapest effective option |

Default bias: stay in main context with Sonnet. Every spawn costs at least one prompt
against the session budget.

### 6-5. Background Execution (updated in v11.1)

Long-running commands (full test suites, builds, installs) run with `run_in_background`
so the agent keeps working instead of blocking a turn waiting. The harness notifies on
completion. This is free token-wise and reclaims wall-clock time inside the 5-hour window.

**v11.1 note:** in current Claude Code, subagents themselves run in the **background by default** —
the main agent keeps working while an Explore or Worker subagent runs, and is notified on
completion, with the subagent's partial output preserved if it is cut off mid-run (Section 5-1).
The built-in `/code-review` likewise runs as a background subagent. Background is now the default
posture for **subagents**; pm-zero's Section 6-3 tiered review composes with it directly. This
changes nothing about the budget math (background reclaims wall-clock, not tokens) and removes the
need to remember a flag for *delegated subagent* work — but note the scope: long **shell commands**
(full test suites, builds, installs) still take `run_in_background` explicitly (Section 8-1, rule 6).

### 6-6. Execution Flow

```text
Human goal
  -> Main agent (Sonnet): decompose + plan          [big feature? plan -> /handoff -> fresh session]
  -> Subagents: explore (Haiku) / implement (Sonnet, disjoint scopes or worktrees)
  -> Verify: scripts/verify.mjs + tests (background for long runs)
  -> Self-review: Tier 1 fresh Sonnet (Tier 2 Opus for top-risk classes when affordable)
  -> Commit + push + PR
  -> Risk gate (Section 15): auto-merge if low/medium risk and green
  -> Handoff (Japanese)
  -> Self-Evolution promotion if anything failed along the way
```

---

## 7. Autonomy and Permissions (REBUILT)

Principle: **bypass the permission layer entirely; enforce the dangerous set with a hook.**
The operator has explicitly chosen comfort over risk (hobby use, no production stakes), so
v11 stops trying to make allow-lists exhaustive and instead makes blocking deterministic.

### 7-1. Post-mortem: why v10 still prompted

Three concrete defects, all fixed in v11:

1. **Wrong schema key, wrong file.** The mode was set as a top-level `"permissionMode"` key —
   the documented key is `permissions.defaultMode`. A second attempt lived in
   `~/.claude/settings.local.json`, which is a *project-level* filename; at user level it is
   not part of the loaded settings hierarchy (managed policy → CLI → project local → project
   → user `settings.json`). Net effect: no valid mode was ever configured, so the default
   prompting mode applied.
2. **The PowerShell tool had no allow rule.** `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` routes
   Windows shell work to a `PowerShell` tool with its own permission namespace —
   `Bash` allow rules do not cover it. Only a handful of specific `PowerShell(...)` patterns
   were allowed (in files that partially loaded), so most PowerShell calls prompted.
3. **Newer tools absent from the allow list.** Skill, ToolSearch, Task tools, NotebookEdit
   had no rules, so each first use could prompt.

### 7-2. The v11 Global Configuration (deployed, not aspirational)

`~/.claude/settings.json` (authoritative copy lives there; shape below):

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000",
    "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "3",
    "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "1"
  },
  "fallbackModel": ["claude-sonnet-5"],
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["*"],
    "deny": ["Bash(rm -rf /)", "Bash(rm -rf ~)", "Bash(sudo rm *)",
             "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git reset --hard*)",
             "PowerShell(git push --force*)", "PowerShell(git push -f*)",
             "PowerShell(git reset --hard*)",
             "Read(**/.env)", "Read(**/.env.*)",
             "Edit(**/.env)", "Edit(**/.env.*)",
             "Write(**/.env)", "Write(**/.env.*)"]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash|PowerShell|Read|Edit|Write",
        "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/guard.mjs" }] }
    ],
    "PreCompact": [
      { "matcher": "auto|manual",
        "hooks": [{ "type": "command",
                    "command": "git add tasks.md docs/state.md docs/issues.md 2>/dev/null; git commit --no-verify -m 'checkpoint: pre-compaction' 2>/dev/null; exit 0" }] }
    ],
    "StopFailure": [
      { "matcher": "rate_limit|overloaded",
        "hooks": [{ "type": "command",
                    "command": "git add tasks.md docs/state.md docs/issues.md 2>/dev/null; git commit --no-verify -m 'checkpoint: budget wall' 2>/dev/null; echo '- budget wall hit; session ended by rate limit' >> docs/issues.md; exit 0" }] }
    ]
  },
  "skipDangerousModePermissionPrompt": true
}
```

> **v11.1.1 changes to this block, each with its reason:**
>
> | Key | v11.1 | v11.1.1 | Why |
> |---|---|---|---|
> | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `15` | **deleted** | A percentage, applied to subagents too: `15` meant **30K on every 200K model** — Haiku, and Opus on Pro. That is compaction-thrash territory (P3) |
> | `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | *(unknown to v11.1)* | **188000** | The absolute knob v11 and v11.1 were both reaching for and never found. `188000 − 13000 ≈ 175K` on **every** model, whatever its native window (§8-5) |
> | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | *(unset — correct at the time)* | **1** | The default flipped to 3 on 2026-07-24 (P1) |
> | `permissions.allow` | 18 named tools, "moot under bypass" | **`["*"]`** | Not moot: workflow subagents run `acceptEdits` and prompt on anything missing, and the platform's tool list grows every release, so a hand-maintained enumeration is a leak that reappears on its own (P5) |
> | `deny` | `Read(.env*)` only | **+ `Edit` and `Write`** | The read path was guarded twice; the **write** path — the one that commits a secret — by nothing (P7) |
> | guard matcher | `Bash\|PowerShell\|Read` | **+ `Edit\|Write`** | Same hole |
> | RTK `PreToolUse` hook | present | **removed** | Measured +7.6% at low effort, ±0% at high (P2) |
> | `PreCompact` | absent | **present** | Makes "checkpoint before compaction" deterministic instead of remembered (A2) |
> | `StopFailure` | absent | **present** | Makes §8-1 rule 10 fire without the agent noticing a warning (A3) |
>
> **On `allow: ["*"]`.** It looks alarming and it is the honest position. Under
> `bypassPermissions` the main session already runs every tool without a prompt; the allow list
> only governs *workflow subagents*, spawned by the same agent for the same operator.
> Restricting them to a subset of what their parent may do buys no security — the parent can do
> it directly — while an incomplete list buys a mid-run prompt, the exact failure v11 exists to
> eliminate. The boundary that actually holds is `guard.mjs`, which fires for every agent at
> every depth in every mode. If you are not willing to rely on the guard hook, fix the guard
> hook; do not maintain a list the next release will invalidate.
>
> **On the two new hooks.** Both are inline one-liners on purpose: **v11.1.1 adds no file you
> have to maintain.** They stage only the three ledger files — never source, never `.env` — so
> they cannot commit a secret; they use `--no-verify` so a project's own git hooks cannot block
> them; and they end in `exit 0` unconditionally, so neither can ever fail a session. A
> `StopFailure` hook's output and exit code are ignored by the harness anyway: it cannot rescue
> the turn, only make sure the turn's work is on disk.

> **Windows path caveat (required):** write the `guard.mjs` command with forward
> slashes (`node C:/Users/.../guard.mjs`). Claude Code runs hook commands through a
> POSIX shell, which eats Windows backslashes as escapes, mangling the path into a
> "Cannot find module" (`cjs/loader`) failure so the guard silently never fires.

> **v11.1 additions (two keys, both deterministic routing/budget enforcement — with their exact
> semantics, not a marketing gloss):**
> `"fallbackModel": ["claude-sonnet-5"]` substitutes Sonnet 5 for the current turn whenever a
> *routed* model is *overloaded or unavailable*. Its real job here is the **optional-Opus paths**
> (Tier 2 review, architecture): if a call is routed to Opus 4.8 and Opus is overloaded, it falls to
> Sonnet 5 instead of stalling the merge gate. The chain deliberately contains **only Sonnet 5** —
> Haiku is *not* in it, so the default Sonnet-5 coding agent can never silently fall to a read-only
> model. A genuine Sonnet-5 outage has no lower fallback by design: it surfaces as a stop/handoff,
> which is correct. `fallbackModel` does **not** fire on the Pro-window *rate-limit* (that surfaces
> immediately, by design), so it complements rather than replaces the Session Budget Protocol.
> `"CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "3"` is a hard ceiling on **total concurrent subagents of
> every role** (explore + worker + reviewer), not a re-encoding of the ≤2-*worker* prose rule.
> 3 = the ≤2-worker default plus at most one concurrent background explore or review, so the harness
> never kills a legitimate concurrent review while still hard-stopping runaway fan-out. Raising it
> means editing this file (it is a static ceiling, not a per-session dial). The `model` key is no
> longer pinned to Fable (its Pro window closed 2026-07-07); Sonnet 5 is the Claude Code default, so
> pm-zero rides the default rather than pinning. Nested subagent spawning is left off — pm-zero does
> not set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`. These keys change *enforcement*, not policy.

Three defensive layers, in order of reliability:

| Layer | Fires in bypass mode? | Fires for subagents? | Survives compaction? |
|---|---|---|---|
| `guard.mjs` PreToolUse hook | **Yes — always** | Yes | Yes (not prompt-based) |
| `permissions.deny` rules | Not guaranteed | Yes (non-bypass) | Yes |
| `CLAUDE.md` hard-limit prose | Advisory only | Yes | Yes (reloads per turn) |

The allow list is retained even though bypass mode makes it moot — it is the correct
behavior if the operator ever switches modes, and it documents intent.

### 7-3. The Guard Hook (`~/.claude/hooks/guard.mjs`)

Deployed and test-verified (16 cases). Blocks, in Bash and PowerShell forms:

- `rm -rf /`, `rm -rf ~`, `Remove-Item -Recurse` on a drive root / `$HOME` / `~`
- `git push --force`, `git push -f`, `git push --force-with-lease`
- `git reset --hard`
- `sudo su`, `runas`
- reading `.env` / `.env.*` via Read tool or `cat`/`type`/`Get-Content`
- **writing** `.env` / `.env.*` via `Edit` or `Write` — **new in v11.1.1 (P7)**. v11.1 guarded
  the read path twice and the write path not at all, in any mode. A `.env` that the agent
  *creates* and then stages is the failure that actually leaks a secret, and it was unguarded.
  (`.env.example` is explicitly allowed in both directions — it is the template file)

Exit code 2 blocks the call and shows the reason to the agent; exit 0 allows. The hook
fails open on unparseable input and on Windows stdin pipe failures (Node.js bug #46601 —
stdin `end` may not fire; guard uses a 3-second timeout + error handler, both exit 0) so a
hook bug can never brick the session. Scoped deletes
(`rm -rf node_modules`, `Remove-Item -Recurse .\dist`) pass — the guard blocks the
catastrophic set, not everyday cleanup.

Agent-side rule (in global `CLAUDE.md`): if the guard blocks a command, do not retry or
work around it; find a safe alternative or surface it to the human.

### 7-4. New Tools and MCP Mid-Session

Under bypassPermissions, a newly connected MCP server's tools work immediately — no
per-tool approval, which fully satisfies the v10/v11 requirement. The guard hook does not
intercept MCP tools; for a genuinely dangerous MCP capability (payments, production deploy),
the human gate in Section 15 applies, enforced by the agent's own risk classification.
Record any MCP addition and its reason in `docs/decisions.md`.

### 7-5. Project-Level `.claude/settings.json` (template for generated projects)

Because global carries the baseline, the project file is thin — it exists so the template
is portable to machines without the global config:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "deny": [
      "Read(**/.env)", "Read(**/.env.*)",
      "Edit(**/.env)", "Edit(**/.env.*)",
      "Write(**/.env)", "Write(**/.env.*)",
      "Bash(git push --force*)", "Bash(git reset --hard*)", "Bash(rm -rf *)"
    ]
  },
  "env": { "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000" }
}
```

Two corrections carried over from v11.1's version of this block:
`Bash(rm -rf:*)` was **malformed permission syntax** and matched nothing — a quiet embarrassment
in a document whose Section 7-1 exists to post-mortem a wrong permission key. And
`skipDangerousModePermissionPrompt` is **ignored when set in project settings**, so a
project-only install still shows the bypass-confirmation dialog once at first launch. That is a
one-time dialog, not a per-tool prompt, and it does not violate the zero-prompt goal — but set
the key globally if you want it gone.

Do not set model or personality at project level. Record non-obvious project permission
boundaries in `docs/decisions.md`.

---

## 8. Token Economy and Context Continuity (EXPANDED — the heart of v11)

**Why this section is the heart (v11.1 names the foundation).** pm-zero's oldest instinct — "the
file system is the memory because the conversation is disposable" — is not a workaround; it is the
current documented best practice. Anthropic's own guidance frames *context as a finite resource* with an
"attention budget" that degrades as it fills ("context rot"), and prescribes exactly three
techniques for long-horizon agent work: **compaction**, **structured note-taking**, and
**sub-agent architectures**. pm-zero *is* those three, hardened for a $20 wall — early auto-compaction
(compaction), the git-tracked ledger files (structured note-taking), and Haiku Explore / Sonnet
Worker subagents that return only distilled summaries (sub-agent architectures). In Karpathy's
Software 3.0 framing, the context window is working memory (fast, scarce, volatile) and the file
system is durable memory (slow, cheap, permanent); CLAUDE.md is the resident program reloaded every
turn. v11.1 adds **no new mechanism** here — it states plainly that pm-zero's budget discipline
*is* context engineering, and sources it (Section 16). "Find the smallest set of high-signal tokens
that yields the outcome" and "keep CLAUDE.md lean, read the rest on demand" are the same sentence.

### 8-1. The Session Budget Protocol (new)

The Pro plan gives a rolling ~5-hour usage window plus a weekly cap, shared across all
models. Opus consumes it several times faster than Sonnet; extended thinking consumes it
fastest of all. The protocol:

1. **One task per session.** Start each session with a single goal that maps to one
   `tasks.md` entry (or one ad-hoc fix). Finish it, hand off, stop.
2. **Plan/execute split for big features.** Plan in one session, run `/handoff` to compact
   the plan into a pickup document, execute in a fresh session. Fresh context reasons
   better and costs less than a bloated one.
3. **Haiku-first reading.** Never read many files in the main context. Explore subagents
   (Haiku) read; only summaries return.
4. **Delegate wide reading; do not try to compress it.** v11.1 said "RTK on, always — CLI
   output compressed 60–90%." That was measured at **+7.6% cost at low effort and ±0% at high**
   over 425 paired trials, and removed (P2). The reason it could never have worked is structural:
   `Read` and `Grep` bypass the Bash hook entirely, so the hook sees roughly a fifth of tool-result
   characters, capping any possible saving near 3% of input tokens. The lever that *does* work on
   the same cost centre is the one v11 already had — Haiku Explore subagents, whose context is
   discarded when the summary returns.
5. **Effort discipline.** `effortLevel: medium` globally. Raise per-task only for genuinely
   hard problems — raising effort on Sonnet is cheaper than switching to Opus.
6. **Background long commands.** `run_in_background` for builds/tests > ~1 minute.
7. **Batch human questions.** Ask everything in one turn (the PM Interview asks in rounds,
   not one-by-one). Every round-trip is a full prompt against the window.
8. **Proactive /compact at natural boundaries.** Compact right after a checkpoint commit,
   when the transcript is safe to lose — not mid-investigation.
9. **Prompt-cache awareness — directionally, not dogmatically.** v11.1 asserted a ~5-minute TTL
   and told the operator to work in continuous bursts. The API offers **both** a 5-minute default
   and a 1-hour extended TTL, and Claude Code's own idle cleanup keys off a **60-minute** gap.
   Which applies to your session is **unverified** (P6). Do not restructure your day around a
   five-minute timer. The safe form of the rule survives either number: *step away at
   checkpoints, not mid-task* — which was already the continuity discipline for its own reasons.
10. **Stop before the wall — now automatically.** The `StopFailure(rate_limit|overloaded)` hook
    (Section 7-2) commits the ledger and appends a line to `docs/issues.md` the moment the window
    ends the turn. v11.1 required the agent to *notice* a usage warning and react; that is a
    prose instruction competing with whatever else it was doing. Keep the discipline too — a
    checkpoint you chose beats one you were handed — but it is no longer the only line of
    defence. A half-finished thought in a dead session is still the most expensive token failure
    there is; it is just now recoverable.

### 8-2. Make the Transcript Disposable (unchanged core)

- After each logical unit: update `tasks.md` (status + evidence), update `docs/state.md`,
  commit. Compaction mid-task then loses nothing.
- Always-on rules live in `CLAUDE.md` (reloads every turn, survives compaction).
- Custom compaction instruction (in `CLAUDE.md`): *When compacting, always preserve: the
  active task ID, the list of modified files, and the verify command.*

### 8-3. Keep `CLAUDE.md` Lean (unchanged)

`CLAUDE.md` is a fixed per-turn token tax. Lookup table, not brain dump: pointers,
commands, hard rules. Detail loads on demand via `@path` or `rg`. Reference material
moves to `docs/`.

### 8-4. Memory Layers (new — explicit boundary)

| Layer | Contents | Persistence | System of record for |
|---|---|---|---|
| Transcript | Everything said this session | Until compaction (early; §8-5) | Nothing |
| Harness Task list | In-session task mirror | Session | Nothing |
| Auto-memory (`MEMORY.md` + files) | Operator preferences, corrections, environment quirks | Cross-session, cross-project | Operator facts only |
| **Ledger files (git)** | Vision, tasks, state, decisions, issues, repo-map | Forever, versioned | **Everything project** |

Rule: if a fact matters to the project, it goes in a ledger file. If it matters to how the
agent should treat the operator anywhere, it goes in memory. Never both.

### 8-5. Threshold Configuration (v11.1.1: the invariant is absolute — and so is the setting now)

**v11.1 got the principle right and the mechanism wrong, in the same section.** It wrote, in
bold, *"the invariant is an absolute size, not a percentage"* — and then configured
`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = 15`, a percentage. Two defects followed from that gap:

1. **Scope.** The percentage applies to **subagents as well as the main conversation**, and it is
   a single global value multiplied by each model's own window. `15` meant 150K on Sonnet 5's 1M
   window — and **30K on every 200K-window model in the same session.** On a Pro plan that is
   Haiku 4.5 (every Explore subagent) *and* Opus (whose 1M requires usage credits this budget
   forbids). A 30K trigger sits below the post-compaction floor plus base context, so it
   re-compacts almost immediately: the summarisation call costs more than the context it saves.
   v11.1's own reviewer and explorer subagents were running in a thrash regime its own text
   warned about.
2. **Fragility.** The percentage is multiplied by whatever window the harness resolves, and that
   resolution has been wrong repeatedly — a family of issues where a 1M-context model resolved as
   200K and fired at ~195K regardless of the configured value, fixed at least twice and
   re-reported after each fix (Section 16).

Claude Code ships the knob v11 and v11.1 were both reaching for: **`CLAUDE_CODE_AUTO_COMPACT_WINDOW`**,
which sets the effective context capacity **in tokens** that the compaction maths runs against.
Set it, let the default threshold formula (`effective window − 13,000`) do the rest, and the
result is identical on every model regardless of its native window.

```jsonc
// ~/.claude/settings.json  →  env
"CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000"   // 188,000 − 13,000 ≈ 175,000
// and NO CLAUDE_AUTOCOMPACT_PCT_OVERRIDE at all
```

**Why 175K.** v11 targeted ~100–150K, a figure inherited from 50% of Sonnet 4.6's 200K window
rather than derived from what compaction costs. Two forces set the real optimum. Compact **too
often** and you pay a summarisation call — one model read of your whole context plus a ~31K
summary at output rates — and then re-pay that summary in every subsequent turn's prefix.
Compact **too rarely** and you pay the cached prefix, at roughly a tenth of the input rate,
**on every single turn**, against an ever-larger context. The second cost is the one v11.1
under-weighted: a big context is a recurring tax, not a one-off. Cost modelling across short,
standard, long and read-heavy session profiles puts the optimum in a **flat basin from 150K to
200K**, with a cliff below ~80K where compaction thrash dominates. Anthropic's own server-side
compaction API independently defaults its trigger to **150,000 input tokens**. 175K sits in the
middle of the band; anything in it is within a few percent of optimal, and the choice of *band*
is what matters.

Two first-principles reasons the absolute must stay small even though the window is huge.
First, *context rot*: recall and long-range reasoning degrade as the window fills, independent of
its maximum. Second, and decisive here, *tokens are the budget*: a fuller window is a larger
per-turn charge against one shared 5-hour window. A 1M window is **headroom that makes an
unplanned mid-task compaction rarer**, not licence to carry a bloated context.

**The rule that outlives the number:**

> **Verify the firing point; do not trust the configuration.** A configured value is a claim
> about a number the harness computes; the transcript records the number itself. Grep
> `compact_boundary` in the session JSONL (`~/.claude/projects/*/*.jsonl`) and read `preTokens`.
> **Check a subagent transcript as well as the main one** — that is exactly where the
> percentage-based setting was silently wrong for two releases. If `preTokens` is not near 175K
> in both, the setting is not doing what you think.

This is constraint 7 (Section 1-1) applied to pm-zero's own advice rather than to somebody
else's tool. `/handoff` is still preferred over letting a degraded session limp on.

---

## 9. Self-Evolution Loop (unchanged in substance)

```text
Failure occurs
  -> Log in docs/issues.md (symptom, context, attempted fix)
  -> Retry with a corrected approach
  -> 3 identical failures: WEB-SEARCH for a known fix
        -> Record finding + source URL in docs/issues.md
        -> Apply the fix
  -> Still unresolved: STOP, summarize in HANDOFF-JA.md, surface to human
  -> Root-cause any resolved recurring failure
  -> Promote a durable rule:
        - Scoped to part of the codebase -> .claude/rules/<zone>.md with a paths: glob
                                       (NEW in v11.1.1 -- the default destination, see below)
        - Truly always-applicable   -> one line in CLAUDE.md (project or global)  [now the exception]
        - Reference-level lesson    -> docs/lessons.md
        - Operator-level lesson     -> auto-memory (cross-project lessons about the
                                       operator's environment go to memory, not CLAUDE.md)
        - OS design issue           -> v11.x candidate (note in docs/decisions.md)
```

`docs/issues.md` template unchanged (Active Issues / Resolved with root cause / Promoted
Rules). Auto-memory complements but never replaces the git-tracked loop.

**Path-scoped rules (A4) — why the destination changed.** Claude Code loads `.claude/rules/*.md`
files with a `paths:` frontmatter glob **only when Claude reads a matching file**:

```markdown
---
paths:
  - "src/auth/**"
  - "src/**/session*.ts"
---
# Auth zone rules
- Never log a token, session id, or password hash — not even at debug level.
- Every auth change is Tier 2 review (Section 6-3). No exceptions, no "it's only a rename".
```

Under v11.1 every promoted rule became a permanent per-turn tax on every session, so the system
had a hard ceiling on how much it could learn before `CLAUDE.md` became the problem itself. Zone
rules remove that ceiling: a hundred zone rules cost nothing on a turn that touches none of their
paths. For a system whose entire premise is that failures become durable rules, this is the
difference between learning that compounds and learning that eventually eats the budget.

**One honest seam.** The trigger is `Read`, not `Edit`. An edit that follows a `rg` hit without
opening the file will not load the rule, and a reviewer reading a `git diff` reads no matching
file at all. So keep one line in `CLAUDE.md` — *"before editing a file under a governed path,
read its `.claude/rules/` file"* — and hand the relevant rule files to review subagents by path
rather than trusting them to arrive. Start with `rules/tests.md` and add a zone only when it has
earned one.

---

## 10. PM Agent Execution Protocol

### Phase 0: Toolchain Verification

```powershell
claude --version; node --version; pnpm --version; git --version; rg --version
```

Verify only what the task needs. (RTK is no longer part of the toolchain — P2.)

**Record the Claude Code version in `docs/state.md`, and if the *minor* version has moved since
the last recorded value, re-verify the Section 16 platform facts before trusting them (A5).**
This one line is the actual lesson of P1: "nested spawning is off by default" was **true on
2026-07-23 and false on 2026-07-24**. v11.1 was not wrong; it was unwatched. A claim about a
platform default has a shelf life, and a system that re-derives itself from platform facts needs
a trigger to re-derive them.

### Phase 0.5: Self-Audit (updated checklist)

- `~/.claude/settings.json` has `permissions.defaultMode: "bypassPermissions"` and the guard
  PreToolUse hook. No top-level `permissionMode` key anywhere. No RTK hook (P2).
- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` is **explicitly 1** — the platform default is 3 (P1).
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` is set and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` is **absent**
  (P3). Confirm empirically: grep `compact_boundary` `preTokens` in the session JSONL after the
  first compaction, **on a subagent transcript as well as the main one** (Section 8-5).
- `permissions.allow` is `["*"]`, or an enumeration re-checked against the current tools
  reference this release (P5).
- The guard matcher includes `Edit|Write`, and `deny` covers `Edit`/`Write` on `.env*` (P7).
  Spot-check by asking the agent to write `.env`; it must be blocked.
- `PreCompact` and `StopFailure(rate_limit|overloaded)` hooks are present (A2, A3).
- `guard.mjs` exists and blocks the hard-limit set (spot-check one case if in doubt).
- No Codex / `AGENTS.md` artifacts.
- `tasks.md` / `state.md` / `vision.md` responsibilities not mixed.
- Project `CLAUDE.md` lean; detail on-demand.
- Generated/build/vendor files ignored.
- Model routing references no unavailable model as a hard dependency.

### Phase 1: PM Interview

Read `myself-info.md` first (GitHub account, OS, editor, project root, hardware) — never
re-ask what it answers. Then gather: purpose, target users, success criteria, primary flows,
constraints, failure cases, priorities. Ask in batched rounds. When 3+ HIGH assumptions
accumulate, ask immediately.

### Phase 2: Vision and Task Generation

1. Update `docs/vision.md`.
2. Generate/update `tasks.md`; every ready task fully specified.
3. Initialize `docs/state.md` with branch and next active task.

### Phase 3: Implementation

- Read `CLAUDE.md`, `docs/state.md`, `docs/decisions.md`, repo-map Summary. Nothing else.
- Delegate wide reading to Haiku subagents. Respect write scopes; small diffs; tests for
  new behavior. Checkpoint + commit after each logical unit.
- Long builds/tests in background.

**Set a goal for the task (A1).** `/goal` sets a completion condition and Claude keeps working
across turns until a small fast model judges the condition met, instead of returning control
after each turn:

```text
/goal all tests in test/auth pass and pnpm lint is clean, or stop after 20 turns
```

This is the cheapest available answer to "don't stop halfway": it is platform-native, the
evaluator runs on Haiku so its cost is negligible against main-turn spend, it survives
`--resume`, and it replaces a `CLAUDE.md` sentence that compaction can eat with a session-scoped
mechanism that fires after **every** turn. Write the condition as something Claude's own output
can demonstrate — the evaluator reads the conversation, it does not run commands — and always
include the turn clause, because a goal with no bound is a goal that can spend the window.

**Its one honest limit, stated because it decides whether you need v11.2.** The evaluator
"does not call tools, so it can only judge what Claude has already surfaced in the
conversation." It trusts the transcript. If the agent reports that tests passed, the evaluator
has no way to disagree. `/goal` gets you *continuation*; it does not get you *evidence*. Closing
that gap requires a deterministic `Stop` hook that reads an exit code — which is a program you
must write, test and maintain, and is therefore v11.2's job, not this file's.

### Phase 4: Verification

quick / standard / final per Section 13. Record task ID, command, result, evidence.

### Phase 5: Self-Review

Tiered per Section 6-3. Record reviewer model, tier, and result in `tasks.md` Review Notes.
If Tier 2 was substituted by Tier 1 (Opus unavailable), record that too.

### Phase 6: Git and Handoff

Full git workflow (Section 15) automatically. Report in Japanese via `HANDOFF-JA.md`.

### Phase 7: Self-Evolution Promotion

Per Section 9. Additionally: if the session approached the budget wall, note what consumed
the budget in `docs/issues.md` — budget overruns are failures too and get root-caused.

---

## 11. Standard File Specs

### 11-1. Project `CLAUDE.md` Template (v11)

```markdown
# CLAUDE.md -- pm-zero v11.1 (Claude Code only, Windows PowerShell, Pro plan)

## Language
- Reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately (batched).

## Source of Truth (read on demand)
- Intent: docs/vision.md | Tasks: tasks.md | State: docs/state.md
- Decisions: docs/decisions.md | Failures: docs/issues.md | Map: docs/repo-map.md
- Report: HANDOFF-JA.md

## Startup Read
- This file, docs/state.md, docs/decisions.md, docs/repo-map.md Summary. Nothing else.

## Budget (Pro plan, hard wall)
- One task per session. Plan -> /handoff -> execute for big features.
- Haiku subagents for wide reading; Sonnet 5 for everything else; Opus 5 only for
  top-risk review/architecture when available. Never block on Opus.
- Opus 5 has a 200K window on this plan (1M would need usage credits = overage).
- Long builds/tests in background. Batch questions. Compact at checkpoints.
- Before adopting any token-saving tool, measure the paired bill. A tool's own
  counter is a claim about its counterfactual, not about your usage.

## Continuity (auto-compact at ~175K — §8-5)
- Checkpoint to tasks.md + docs/state.md and commit after each logical unit.
- When compacting, always preserve: active task ID, modified files list, verify command.
- Keep this file lean; @path or rg for detail; subagents for wide reading.

## Autonomy
- bypassPermissions is active; never ask permission for tool calls.
- The global guard hook blocks the dangerous set; if blocked, do not work around it.
- Human gate only for irreversible real-world acts (real money, prod credentials,
  publishing personal data).

## Task Ledger
- tasks.md is the only execution ledger; main agent is the only writer.
- Every ready task: owner, dependencies, write scope, acceptance, verification, evidence.

## Parallelism
- Disjoint write scopes or worktree isolation. Same file -> serialize.
- Default: <=2 concurrent worker subagents (soft). A global env ceiling caps *total* concurrent
  subagents (all roles); raise either only if budget clearly allows.

## Self-Review (no human reviewer)
- Tier 0: verify script + tests + lint (always).
- Tier 1: fresh-context Sonnet subagent (review classes: 300+ line diff, new external
  API, critical-workflow changes, and all Tier 2 classes).
- Tier 2: fresh Opus subagent when available and budget allows (auth, billing, DB schema,
  RLS/permissions, deploy, security, production data, personal information).
  Otherwise Tier 1 at high effort; record the substitution.

## Self-Evolution
- Log failures in docs/issues.md. On 3 repeats, web-search a fix and record the source URL.
- Promote a lesson scoped to part of the codebase into .claude/rules/<zone>.md with a
  paths: glob. Only a truly universal rule goes in this file -- everything here is
  paid for on every turn, forever.
- Zone rules load when you READ a matching file. Before editing a governed path,
  read its rule file; editing alone does not load it.
- Reference lessons -> docs/lessons.md; operator-level lessons -> auto-memory.

## Engineering Role
- Principal-level full-stack engineer. Readable, testable, minimal, correct code.
- No placeholder code or TODOs. Every committed function works.

## Thinking Protocol
- Decompose into atomic subtasks; challenge assumptions; prefer the simplest correct solution.
- Compare 3 implementation skeletons (correctness, simplicity, testability, cost); choose one.
- Verify the real call shape of an external API/library before using it.
- Short progress checks, not one long reasoning dump.

## Long Tasks
- Use /goal with a verifiable condition and a turn clause, e.g.
  /goal all tests in test/auth pass and pnpm lint is clean, or stop after 20 turns
- The goal evaluator reads the conversation; it cannot run commands. Surface real
  command output in the transcript or it has nothing to judge.

## Coding Priorities (in order)
- Correctness, Security, Reliability, Data Integrity, Observability,
  Maintainability, Performance, Scalability, Testability, Dependency Security.

## Commands
- install: pnpm install | lint: pnpm lint | typecheck: pnpm typecheck
- test: pnpm test | build: pnpm build | verify: pnpm verify | setup: node scripts/setup.mjs
- Use only commands that exist in this repository.

## Shell
- PowerShell for all operations. Windows backslash paths in the shell; FORWARD
  slashes in hook command paths inside settings.json.
- Do not read many files in the main context. Delegate wide reading to a Haiku
  Explore subagent; only its summary returns.

## Git (full auto)
- Never commit to main. Branch per task: <type>/<short-description>.
- Commit after each logical unit; push after every commit; auto-PR to main.
- Stage only Write-Scope files. Never stage .env* or secrets. gitleaks pre-push if available.
- Merge: final verify green + fresh-context self-review passed.
  Low/medium risk: squash-merge + delete branch.
  High-risk classes: stop before irreversible real-world side effects; Japanese summary.

## Execution Boundaries
- Handle every error explicitly. Safe values only in output.
- .env.example is the template; runtime reads actual env values.
- Irreversible real-world acts are human-gated. Everything else is AI-executed without asking.
```

### 11-2. Other Templates

`docs/vision.md`, `docs/state.md`, `HANDOFF-JA.md`, and the README rules are unchanged
from v10 (see v10 §12-2 through §12-5; the v10 file is retained in this repo as the
historical reference). One HANDOFF-JA addition: the 自己レビュー section records
`レビューティア: Tier 1 (Sonnet) / Tier 2 (Opus) / Tier 2→1 代替`.

---

## 12. Quality Gates (13 gates, unchanged in substance)

Q1 Correctness — acceptance met; no placeholders; real repo examples before editing.
Q2 Spec — vision carries intent; 3+ HIGH assumptions confirmed first.
Q3 Task Ledger — active work maps to a task ID; ready tasks fully specified.
Q4 Maintainability — ~300 lines/file, ~50 lines/function targets; 300+ line diffs split
   or justified in decisions.md.
Q5 Architecture/Scalability — one-direction dependencies; no avoidable bottlenecks.
Q6 Performance — hot paths lean; deferrals documented.
Q7 Test/Testability — new features tested; bug fixes get reproduction tests; 1+ negative path.
Q8 Reliability — every error handled; 3-failure web-search rule; escalation recorded.
Q9 Security — safe output values; guard hook active; Tier 1/2 review for mandatory classes.
Q10 Data Integrity — reversible migrations or documented rollback; destructive ops logged.
Q11 Observability — structured logs; secret redaction; failures traceable.
Q12 Dependency Security — deps justified and pinned; lockfile committed; vuln scan when available.
Q13 Handoff — Japanese; task IDs; verification evidence; unverified items explicit.

The only v11 change: Q9's model-review requirement follows the Section 6-3 tiers instead of
mandating Opus.

---

## 13. Verification Modes (unchanged)

- **quick** — docs, copy, low-risk config: confirm changed files, task ID, `git diff --check`,
  targeted tests only if needed.
- **standard** — normal implementation: lint, typecheck, build, related tests; update evidence.
- **final** — pre-merge/push/deploy: `pnpm verify`, e2e when available, browser smoke for UI,
  reconcile ledgers against git reality, run the Section 6-3 self-review.

---

## 14. MCP Policy (unchanged in substance)

No `.mcp.json` by default. Add MCP only for a concrete need, from official docs or a trusted
registry, with the reason in `docs/decisions.md`. Under bypassPermissions, connected servers
work immediately without prompts; dangerous capabilities are gated by the agent's risk
classification (Section 15), not by per-tool prompts.

---

## 15. Git and GitHub Workflow (unchanged except the review gate)

- **Branches:** never commit to `main`; `<type>/<short-description>`; branch at task start.
- **Commits:** after each logical unit (= continuity checkpoint); `<type>: <description>`;
  stage only Write-Scope files; never stage `.env*`/secrets; no placeholder code.
- **Push:** after every commit (`git push -u origin <branch>` first, then `git push`).
- **Pre-push security:** confirm `.gitignore` covers secrets; `gitleaks git --no-banner`
  when available. A pushed secret is public within seconds.
- **PR:** auto-open on branch completion; conventional title; body carries what/why +
  review result + verification evidence.
- **Merge:** gate on final verify green **and** fresh-context self-review passed
  (Section 6-3 tiers). Low/medium risk: squash-merge + delete branch. High-risk classes:
  implement and review fully, but stop before any irreversible real-world side effect and
  surface a Japanese summary. Force-push and history rewrites are blocked by the guard hook.

---

## 16. Platform Facts and Sources

v11 relies on these Claude Code behaviors (verify against current docs on major releases):

- Settings hierarchy: managed policy → CLI args → project `.claude/settings.local.json` →
  project `.claude/settings.json` → user `~/.claude/settings.json`. The permission mode key
  is `permissions.defaultMode`; values include `default`, `acceptEdits`, `plan`, `dontAsk`,
  `bypassPermissions`.
- PreToolUse hooks run for every matching tool call in every permission mode, including for
  subagents; exit code 2 blocks the call and returns stderr to the model. Multiple hooks
  across user/project levels coexist.
- With `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`, Windows shell work uses a `PowerShell` tool with
  its own permission-rule namespace, separate from `Bash(...)` rules.
- Subagents cannot display interactive permission prompts; an `ask` outcome is a denial.
  **[v11.1]** The Task tool's `mode` parameter is deprecated; subagents now **inherit the parent
  session's permission mode by default**, so under `bypassPermissions` they run prompt-free.
- **[v11.1]** A subagent cut off by a rate limit or server error now returns any output it had
  **already produced** to the parent instead of failing silently (a cutoff before any output still
  returns empty); subagents also run in the **background by default**, and the built-in
  `/code-review` runs as a background subagent.
- **[v11.1.1]** `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (1–100) shifts the trigger **as a percentage**
  and **applies to subagents as well as the main conversation**, so one global value yields a
  different absolute threshold per model in the same session. **`CLAUDE_CODE_AUTO_COMPACT_WINDOW`
  sets the context capacity in tokens** used for the calculation; it is the absolute knob, and
  pm-zero sets it to `188000` with no percentage (Section 8-5). *(Inference, from a deobfuscation
  in issue #31806 rather than from docs: the threshold is `min(window × pct/100, window − 13000)`,
  so the percentage can only lower, never raise.)* A recurring bug class — 1M-context models
  resolving their window as 200K and firing at ~195K regardless of configuration, issues #31806 /
  #36381 / #52519 / #53358 / #53801 — has been fixed at least twice and re-reported after each
  fix. Auto-compact thrash is now detected: three consecutive compacts that refill the context
  stop with an actionable error. **Verify the firing point in the transcript.**
- `CLAUDE.md` reloads every turn and survives compaction; it is a fixed per-turn token cost.
- Custom compaction instructions in `CLAUDE.md` shape what summaries preserve.
- The Agent tool supports `isolation: "worktree"` (temporary git worktree per subagent) and
  `run_in_background`; Bash/PowerShell support `run_in_background`.
- **[v11.1]** `fallbackModel` (settings.json, up to 3 models) is tried in order when the primary is
  *overloaded or unavailable*; `--fallback-model` also applies to interactive sessions. Auth,
  **rate-limit**, request-size, and transport errors surface immediately and do **not** trigger
  fallback. Added in Claude Code v2.1.166.
- **[v11.1]** Subagent concurrency and nesting are configurable via `env`:
  `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` caps all concurrently-running subagents of every role —
  explore, worker, reviewer alike (platform default 20; pm-zero sets 3);
  subagents no longer spawn nested subagents by default (raise `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`
  to allow it); `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` caps total spawns per session (platform
  default 200, reset by `/clear`). `--max-budget-usd` denies new spawns and halts running background
  subagents once a dollar cap is hit — a cost-capped/API-usage guardrail whose effect under a flat
  Pro subscription is **unverified (Inference, not Fact)**.
- `/handoff` compacts a session into a pickup document for a successor session.
- Auto-memory persists `MEMORY.md` + memory files across sessions (user-level).
- Deferred tools via ToolSearch keep unused tool schemas out of the upfront context.
- Prompt cache TTL is ~5 minutes; a longer pause makes the next turn re-read context uncached.
- **[v11.1] Model lineup and API-equivalent pricing (as of 2026-07-23):** **Sonnet 5** is the
  Claude Code default since 2026-06-30 (CLI 2.1.197), with a **native 1M-token context window** and
  intro pricing **$2/$10 through 2026-08-31, then $3/$15**; it lands near Opus 4.8 on agentic/coding
  at ~40–60% of the cost (vendor/benchmark claim — reported, not measured here). Opus 4.8 $5/$25,
  Haiku 4.5 $1/$5, Fable 5 $10/$50 (its temporary Pro window closed 2026-07-07; design-time only).
  Extended thinking bills at output rates. (v11 read: "Sonnet 4.6 $3/$15.")
- **[v11.1.1] RTK removed — the 60–90% claim is falsified.** JetBrains AI ran a paired A/B
  benchmark (Claude Code 2.1.201, `claude-sonnet-5` at low and high effort, SkillsBench 86 tasks,
  headless `bypassPermissions`, **425 billed trials, ~USD 320**): **+7.6% median cost per task at
  low effort (p=0.004)**, +13.8% turns, +14.3% cache reads; **±0.1% at high effort (p=0.99)**;
  quality statistically tied at both levels. Ceiling analysis computed before spending: `Read` and
  `Grep` bypass the Bash hook entirely, ~half of shell calls are uncovered commands, and the
  remaining ~33% of Bash calls carry just under 20% of tool-result characters — so even perfect
  compression caps near **3% of input tokens**. RTK's own `rtk gain` counter reported 96.2M tokens
  saved over the same trials in which the bill rose, because it counts full raw output as its
  counterfactual against a harness that already truncates.
  (blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/)
- **[v11.1.1] Model lineup on 2026-07-27.** **Opus 5** released 2026-07-24: $5/$25 (unchanged
  from Opus 4.8), fast mode $10/$50, 128K max output, thinking on by default, "the strongest model
  on Claude Pro" and the new default on Max. **1M context availability by plan:** automatic on
  Max/Team/Enterprise; **on Pro, Opus 1M requires usage credits** — so on a credit-free Pro plan
  **Opus 5 is a 200K model**. Sonnet 4.6's 1M requires credits on every plan including Max;
  Sonnet 5's does not. **No published ratio exists between subscription rate-limit weight and API
  price** — v11.1's "~5x" was unsourced; treat model cost as an ordering only.
- **[v11.1.1] Subagent nesting default changed.** v2.1.217 made subagents not spawn nested
  subagents by default; the 2026-07-24 release changed it to **depth 3 by default**, disabled by
  setting `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`. v11.1's statement was correct when written.
- **[v11.1.1] `.claude/rules/*.md`** — path-scoped instructions with a `paths:` frontmatter glob,
  discovered recursively, **loaded only when Claude reads a matching file**. `InstructionsLoaded`
  fires for `CLAUDE.md` and for these.
- **[v11.1.1] `/goal <condition>`** (v2.1.139+) keeps Claude working across turns until a small
  fast model judges the condition met; it is a wrapper around a session-scoped prompt-based `Stop`
  hook. **The evaluator "does not call tools, so it can only judge what Claude has already
  surfaced in the conversation."** Condition ≤4,000 chars; bound it with a clause like
  `or stop after 20 turns`; restored on `--resume`; works under `-p`.
- **[v11.1.1] Dynamic-workflow subagents** always run in `acceptEdits` and inherit the tool allow
  list **regardless of session permission mode**; shell commands, web fetches and MCP tools outside
  the allow list can still prompt mid-run. The allow list is therefore **not** moot under
  `bypassPermissions`. The `ultracode` keyword that starts a workflow is an opt-in **only from a
  human-typed prompt** — not from `-p`, a scheduled task, or a hook's output.
- **[v11.1.1] `Stop` hooks** are overridden by Claude Code after **8 consecutive blocks**
  (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`, default 8). `stop_hook_active` is true from the *second*
  `Stop` onward, so a hook that exits early on it can only ever force one continuation. Relevant
  only if you add a `Stop` hook; v11.1.1 does not.

Carried-over sources from v10 §18 remain valid for the unchanged sections.

### 16-1. External corroboration (v11.1 — consistent with pm-zero's existing design)

These are not platform mechanics but published sources whose guidance converges with pm-zero's
design. They are cited as convergent evidence, not as endorsements of this specific rule-set and not
as new requirements. Attributed phrasings are paraphrases from primary posts and secondary reporting;
treat any named-person quote as reported, not verbatim, and confirm from the primary source if it
matters.

- Anthropic, *Effective context engineering for AI agents* (engineering blog, 2025-09-29): context
  is a finite "attention budget"; "context rot" degrades recall as the window fills; the three
  long-horizon techniques are **compaction, structured note-taking, and sub-agent architectures**;
  aim for the smallest set of high-signal tokens; Claude Code drops CLAUDE.md in up front and
  retrieves the rest **just-in-time** via glob/grep. → consistent with Sections 4, 6-4, 8.
- Anthropic, *Effective harnesses for long-running agents* (engineering blog): reliability is
  governed by the harness around the model, not the model alone. → consistent with the
  guard-hook-as-harness stance (Section 7) and the prose→harness moves in v11.1.
- A. Karpathy, *Software 3.0* (2025–2026 public talks; exact venue not pinned here): the context
  window is the new working memory/RAM and the model is the interpreter; the widely-reported
  distinction that "vibe coding" raises the floor while disciplined "agentic engineering" raises the
  ceiling. → consistent with file-as-memory (Section 8) and pm-zero's framing as agentic
  engineering, not vibe coding.
- B. Cherny (Head of Claude Code), public 2026 talks and an AI-adoption write-up on Anthropic's
  site: treat agent work as an OS — preserve mistakes as durable lessons, build verification into
  the loop, move recurring work into routines; when the agent repeats a mistake, write the lesson
  into CLAUDE.md or a skill. → consistent with Self-Evolution (Section 9) and tiered self-review
  (Section 6-3). pm-zero deliberately omits the cron `/loop` routines on budget grounds
  (Section 18-12).

**Fact vs. inference for this update:** platform mechanics (Sonnet 5 as default, 1M context,
`fallbackModel`, the subagent env caps, background-by-default, partial-work recovery) are **Fact**,
verifiable in the Claude Code changelog — re-verify on major releases. Comparative capability claims
("Sonnet 5 ≈ Opus 4.8") are **reported** vendor/benchmark statements, not measured here. The effect
of `--max-budget-usd` under a flat Pro subscription is **Inference** pending a live test.

---

## 17. Migration

Moved to `update.md` §4-1.

---

## 18. Logical Destroyer Final Verification

Independent cold audit of v11 (Chain-of-Verification applied).

**18-1. bypassPermissions removes all permission-layer protection — reckless?**
The operator explicitly chose comfort over risk for hobby use, and v11 does not rely on the
permission layer for safety: the guard hook fires deterministically in every mode, for every
agent, and was test-verified against 16 cases. The residual risk (a dangerous command not in
the guard's pattern set) existed in v10 too — v10's deny list was no broader. v11 is strictly
safer than v10-as-actually-configured, because v10's mode key was invalid and its deny rules
were the only layer. Consistent with the operator's stated priorities.

**18-2. A Sonnet reviewer is weaker than an Opus reviewer — does review quality drop?**
The v10 rationale for Opus was "reviewer at least as strong as implementer". In v11 the
implementer IS Sonnet, so a fresh-context Sonnet reviewer satisfies that rationale. The
blind-spot mechanism (fresh context, no implementation history) is preserved. For the classes
where marginal reviewer strength genuinely matters (auth, money, prod data), Tier 2 still
prescribes Opus when obtainable. The alternative — a mandatory gate on a model the plan may
not provide — fails worse: it stalls or silently skips review. Acceptable tradeoff, explicit.

**18-3. The guard hook is a single point of failure. What if node is missing or the file is deleted?**
Hook execution failure does not grant permission silently in a dangerous direction: if the
hook errors, the deny rules (non-bypass modes) and the CLAUDE.md hard limits remain, and the
worst case equals v10's actual protection level. The hook fails open on unparseable input
and on Windows stdin pipe failures (3-second timeout + error handler; both exit 0), by
design, so neither a harness format change nor a Windows pipe quirk can brick the session. Phase 0.5 audits
the hook's existence. Acceptable.

**18-4. ≤2 concurrent workers — does v11 under-parallelize?**
On a Pro plan, two Sonnet workers plus the main agent already triple the burn rate against
one shared window. Parallelism saves wall-clock, not tokens; the budget constraint binds on
tokens. Two layers coexist without contradiction (v11.1): the ≤2-*worker* count stays a soft default
the main agent may raise per task when scopes are disjoint and the budget allows; the env value
`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=3` is a hard ceiling on *total* concurrent subagents of every
role, raised only by editing `settings.json`. A soft default beneath a hard ceiling — the ceiling
stops runaway fan-out, the default keeps normal operation frugal. Consistent.

**18-5. The 5-minute cache note could push the operator into rushed work.**
The guidance is "step away at checkpoints, not mid-task" — it shapes *when* to pause, not
whether to pause. Checkpoint-then-pause was already the continuity discipline; the cache
fact just adds a second reason. No new behavior demanded. Consistent.

**18-6. Auto-memory could drift into holding project facts.**
Section 8-4 draws the boundary and Section 9 routes lessons explicitly. Drift is detectable:
memory entries naming a specific project file/task are misfiled by definition and get moved
during the periodic config review. Mitigated.

**18-7. Fable 5 designed the system but will never run it — is anything Fable-dependent?**
Audit: no runtime rule references Fable. Routing is Sonnet/Haiku/optional-Opus with automatic
fallback. Fable's temporary Pro window closed 2026-07-07, so the settings.json `model` key is no
longer pinned to it (v11.1); Sonnet 5 is now the Claude Code default and pm-zero rides that default,
with `fallbackModel` substituting Sonnet 5 beneath any optional Opus routing. No structural dependency. Consistent.

**18-8. Is the zero-prompt goal actually achieved this time?**
The v10 leak had three identified causes; all three are fixed with schema-correct keys in
the correct file, verified by re-reading the deployed settings. `bypassPermissions` +
`skipDangerousModePermissionPrompt: true` leaves no prompting path in the permission layer.
Remaining interruptions are by design: AskUserQuestion (a deliberate agent question, not a
permission prompt) and the human gate for irreversible real-world acts. Achieved.

**18-9. Sonnet 5 ships a 1M-token context window — is the 50% autocompact still right?**
No — and v11.1 fixes it rather than defending it. Holding "50" on a 1M window would fire at ~500K,
five times the intended working set, silently abandoning the "tokens are the budget" law. The
invariant was never the percentage; it was the **absolute working-context size (~100–150K)**. So
v11.1 moves the number to preserve the invariant: ~15 on a 1M window, ~50 on a ~200K window, set to
hold the absolute (verify with `/context`; Section 8-5). Two reasons the absolute stays small even
with a huge window: *context rot* (recall degrades as the window fills, independent of its maximum)
and *the token budget* (a fuller window is a larger per-turn charge and a costlier uncached re-read).
The percentage moved so the discipline would not. Fixed, not rationalized. Consistent.

**18-10. Sonnet 5 nearly matches Opus 4.8 — is Tier 2 Opus review now pointless?**
Nearly is not identically, and the Tier 2 classes (auth, billing, DB schema, RLS, deploy, security,
personal data) are exactly where a residual margin is worth paying for when Opus is available and
affordable. What changed is the *default*: the fresh-context reviewer is now Sonnet 5, stronger than
v11's Sonnet 4.6, so the Tier 1 default is more defensible and Tier 2 is an even narrower, better-
justified exception. The tier structure is unchanged; only the models moved up. Consistent.

**18-11. `fallbackModel` — does it fully deliver "never block on model availability"?**
Partially, and the doc says so plainly. `fallbackModel` fires on model *overload/unavailability* and
substitutes Sonnet 5 for the turn — in practice for the optional-Opus review/architecture paths, the
availability case, now deterministic. The chain deliberately excludes Haiku, so the default coding
agent never silently drops to a read-only model; a true Sonnet-5 outage has no lower fallback and
surfaces as a stop/handoff. It explicitly does **not** fire on the Pro-window *rate-limit* (which
surfaces immediately by design);
that case stays with the Session Budget Protocol (checkpoint, commit, `/handoff`). Two mechanisms
for two distinct failure modes, each named. No overclaim. Consistent.

**18-12. Nested agents, cron routines, spec-kit/`AGENTS.md` are the 2026 mainstream — is rejecting
them a failure to modernize?** No; it is the binding constraint doing its job. Deep agent trees multiply concurrent
token burn against one shared 5-hour window; cron `/loop` routines burn the window unattended; and
`AGENTS.md`/spec-kit are cross-tool conventions that break the "Claude Code only" invariant
(CLAUDE.md is pm-zero's equivalent, and the vision→tasks flow is already spec-driven: intent →
tasks → implement → verify). Each is a real capability that makes a *cost-capped solo operator*
worse off. Adopting a trend that violates the primary constraint is cargo-culting, not
modernization. First-principles reject, recorded — reversible the day the constraint changes (e.g.
a higher-tier plan). Consistent.

**18-14. v11.1.1: the six things v11.1 asserted that were not true — was the process at fault,
or just the facts?** Both, and separating them is the useful part. P1 (nesting default) and P4
(Opus 5) are pure platform drift: v11.1 was correct on the day it shipped and the ground moved
under it. Nothing was wrong with the reasoning; what was missing was a **re-verification
trigger**, now added as one line in Phase 0. P3 (the percentage), P5 (the allow list) and P7 (the
`.env` write path) are different — they were wrong on the day they were written, and each was
findable by reading the same documentation v11.1 already cited. P3 is the sharpest: v11.1 wrote
*"the invariant is an absolute size, not a percentage"* in bold and then configured a percentage,
which means the error survived a section explicitly devoted to it. And P2 (RTK) was wrong because
a vendor's self-reported number was accepted as a measurement — the failure that constraint 7 now
exists to prevent. **Two of six are the platform's fault. Four are the document's.** Consistent
with the correction, not with the original.

**18-15. `allow: ["*"]` looks like a step backwards from a curated list.**
It is a step towards honesty about where the boundary actually is. In bypass mode the main
session already runs every tool without a prompt, so the list only ever governed workflow
subagents — spawned by the same agent, for the same operator, able to do nothing their parent
could not do directly. Against that it bought exactly one thing: a mid-run prompt whenever the
list fell behind the platform's tool inventory, which it does every release. The enforcement that
holds is `guard.mjs`, unchanged and now covering writes as well as reads. If that hook is not
trustworthy enough to be the boundary, the correct response is to fix the hook, not to maintain a
list that creates a leak while looking like protection. Consistent.

**18-16. `/goal` trusts the transcript. Is v11.1.1 shipping a loop that can be lied to?**
Yes, and it says so where the recommendation is made rather than in a footnote. The evaluator
reads the conversation and cannot run commands, so an agent that reports passing tests is
believed. What `/goal` buys is *continuation* — the elimination of "stopped three minutes in to
ask a question" — which is a real and large win for one typed command and negligible Haiku spend.
What it does not buy is *evidence*. Closing that gap requires a deterministic `Stop` hook reading
an exit code, i.e. a program to write, test and maintain, which is precisely the line v11.1.1
does not cross. **The honest summary: v11.1.1 fixes stopping-too-early, not lying-about-done.**
An operator who needs the second one needs v11.2, and should not pretend otherwise.

**18-17. Final Judgment.**

```text
Claude Code only. PowerShell only. Claude Pro plan only -- the budget is a hard wall,
  and on this plan Opus 5 is a 200K model, because 1M would cost credits.
Zero permission prompts: bypassPermissions + allow ["*"], because the list was never
  moot (workflow subagents run acceptEdits) and a curated one leaks every release.
One deterministic guard hook enforces the dangerous set in every mode, for every agent,
  now covering Edit and Write -- the .env WRITE path was guarded by nothing.
Nested spawning pinned to depth 1: the default became 3 the day after v11.1 shipped,
  which is an argument for a re-verification trigger, not for blaming v11.1.
Sonnet 5 is the workhorse; Haiku 4.5 reads; Opus 5 is optional garnish; Fable 5 never runs.
  Model cost is an ordering, not a ratio -- the "~5x" in v11.1 was invented.
Behavioral rules that can live in the harness do: model fallback, subagent-concurrency and
  nesting caps, pre-compaction checkpoint, and the budget wall. The rest stay prose.
No human code review: deterministic gates + tiered fresh-context self-review.
Human gate only for irreversible real-world acts.
Compaction at an absolute ~175K via CLAUDE_CODE_AUTO_COMPACT_WINDOW -- because a percentage
  also applies to subagents, where 15 meant 30K, and 30K is thrash.
Session Budget Protocol: one task per session, Haiku-first reading, background execution,
  batched questions, checkpoint-then-compact. RTK is gone: measured +7.6%, not -60%.
Self-Evolution: failures become rules, attached to the paths they govern so that learning
  stops taxing every turn. Budget overruns are failures too.
/goal keeps a long task moving; it cannot check an exit code, and v11.1.1 does not pretend
  it can. That gap is the reason v11.2 exists.
Default repository: 13 files, plus .claude/rules/. tasks.md is the only ledger.
Handoff is Japanese. No program was added; nothing new can silently break.
```

---

## 19. v11.1.1 Production Summary

v11 evolves from **Autonomous Solo-Dev OS** to **Budget-Bound Autonomous Solo-Dev OS**.

Quality is guaranteed by:

1. Product intent in `docs/vision.md`; tasks in `tasks.md`; pointer in `docs/state.md`;
   navigation in `docs/repo-map.md`; rationale in `docs/decisions.md`; failures in
   `docs/issues.md`.
2. One Claude Code agent self-orchestrating: Sonnet-first, Haiku exploration,
   worktree-isolated parallel workers, background execution.
3. Zero permission prompts via correctly-configured bypassPermissions; the dangerous set
   blocked by one test-verified deterministic guard hook that fires in every mode.
4. Tiered self-review replacing human review: deterministic gates always; fresh-context
   Sonnet by default; Opus for the highest-risk classes when the budget allows.
5. Budget Discipline as a first-class runtime layer: the Session Budget Protocol keeps
   every session inside the Pro-plan window.
6. Context continuity via early compaction (absolute ~100-150K target): checkpoint-commit rhythm, custom compaction
   instructions, /handoff session splits, lean always-on CLAUDE.md.
7. Memory layering: auto-memory for operator facts, git ledgers for project facts.
8. Self-Evolution with web-search recovery; budget overruns root-caused like any failure.
9. 10 coding priorities, 13 quality gates, 3 verification modes.
10. Solo-dev full-auto git with risk-gated auto-merge; human gate only for irreversible
    real-world acts; Japanese handoff.

Work that does not satisfy these criteria is not complete under pm-zero v11.1.1.

**v11.1 coda.** Same ten guarantees. Three of them are now enforced by the harness rather than by
prose (model fallback via `fallbackModel`, total-subagent concurrency via `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`,
nesting left off), and all of them are re-derived from the platform as it stands on 2026-07-23:
Sonnet 5 is the default workhorse — 1M context, near-Opus capability at a fraction of the cost —
which makes the Sonnet-first, Opus-optional design *more* correct than when it was written, not
less. The budget wall did not move; the tools for living inside it got sharper.
