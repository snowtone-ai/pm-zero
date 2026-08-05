# pm-zero-knowledge-v11.2.md

2026-07-27 v11.2 (rebuild of 2026-07-23 v11.1) / Claude Code only / VSCode on Windows + PowerShell-only / Claude Pro plan only

See `update.md` for version history, the change delta, and migration steps.

The organizing idea of v11.2 is **graph engineering**: the system is three explicit graphs —
**code**, **org**, **work** — and every rule in this document is either a node, an edge, or a
gate on an edge. §2 builds them; §10 runs them.

Fact vs. inference is marked throughout. Every new claim is sourced in **§17**. The autocompact
value in §9 is derived from a simulation whose code is reproduced in §9-3, not asserted.

---

## 0. Result

pm-zero v11.2 is the **Graph-Bound Autonomous Solo-Dev OS**.

v10 established the Autonomous Solo-Dev OS. v11 bound it to a $20/month wall and made safety
deterministic. v11.1 refreshed the facts and pushed routing into the harness. v11.2 asks the
question none of them asked:

> *What is the actual shape of the thing being managed?*

The answer is not a list and not a conversation. A repository is a graph (files import files,
functions call functions, tests cover code). A plan is a graph (tasks depend on tasks). An agent
organization is a graph (roles own zones, rules attach to paths). v10–v11.1 stored all three as
flat markdown and reconstructed the edges in the model's head, every turn, from text. That
reconstruction is where the token budget goes: on SWE-bench Verified, **reading repository files
via grep and cat is the largest single line item in a coding agent's token budget** — reported at
76.1% for a cold benchmark agent, with pm-zero's addressable share unmeasured (§9-1). Not thinking.
Not writing code. Re-deriving structure that was already known.

v11.2 makes the edges explicit, cheap, and durable.

> **One autonomous Claude Code agent, running three explicit graphs — code, org, work —
> inside a fixed $20/month budget, with zero permission prompts, and a coding phase that
> runs start-to-deploy without stopping because its exit condition is an exit code, not a
> promise.**

v11.2 one-line definition:

> A non-engineer runs one Claude Code agent from VSCode on Windows PowerShell, on a Claude Pro
> plan with no overage. The repository's structure lives in a **code graph** (`docs/graph/`,
> a static generated artifact — no database, no MCP, no service). Behavior lives in an **org
> graph** (`CLAUDE.md` + `.claude/rules/*.md` path-scoped + `.claude/agents/*.md`). Intent
> lives in a **work graph** (`tasks.md`, typed edges, evidence-gated). The Coding Loop (§10)
> is closed by a `Stop` hook that reads the gate's exit code, so the agent cannot stop while
> red and cannot lie its way to green. Permission mode is `bypassPermissions`; the dangerous
> set is blocked by one deterministic guard hook; the allow list is load-bearing again because
> workflow subagents can prompt. Auto-compaction targets an absolute **~175K** working
> context (§9), derived by simulation, corroborated by Anthropic's own 150K API default.

> **Fact vs. recommendation note (applies throughout):** Statements about Claude Code / Claude
> model behavior are sourced in §17 and marked **Fact** (vendor-documented or changelog),
> **Reported** (third-party measurement or vendor benchmark claim), or **Inference** (reverse
> engineering or reasoning). Threshold values and routing defaults are *recommendations* tuned
> for Pro-plan solo-dev frugality, not platform requirements.

---

## 0.1 Change Delta

Moved to `update.md` §3. The `S1`–`S2` and `C1`–`C7` labels used
throughout this document are defined there.

---

## 1. First Principles

### 1-1. The v11.2 Constraints

Reason from constraints, not from headlines:

1. **The budget is $20/month, hard.** → Token cost is the primary optimization target.
   Sonnet 5 ($2/$10 intro through 2026-08-31, then $3/$15) does 90%+ of the work; Haiku 4.5
   ($1/$5) reads; Opus 5 ($5/$25) is used where its *per-task* efficiency offsets its
   per-token weight. Fable 5 ($10/$50) is never used at runtime.
2. **Structure is cheaper to store than to re-derive.** → Any relationship the agent will need
   more than twice gets written to a file as an explicit edge. This is the graph principle, and
   it is a budget principle before it is an architecture principle. Repository reading is the
   largest single line item in a cold agent's budget; a generated map answers a useful slice of
   it in one parser call (§9-1 states the evidence and its limits).
3. **The operator must never be interrupted by a permission prompt.** → `bypassPermissions`
   plus a `PreToolUse` guard hook that fires in every mode. **New in v11.2:** plus a *complete*
   allow list, because workflow subagents run in `acceptEdits` and will prompt on anything
   outside it (C2).
4. **Auto-compaction fires early — at ~175K on a 1M window (§9).** → Anything not written to a
   file is lost. The file system, not the transcript, is the source of truth. `CLAUDE.md`
   reloads every turn and is a fixed per-turn tax; `.claude/rules/*.md` load only when their
   paths match, which is how a large rule set stays affordable.
5. **No human code review.** → Deterministic gates plus a fresh-context subagent review. The
   reviewer's power comes from not inheriting the implementer's context.
6. **The agent will make mistakes, and must not stop for them.** → A failing gate is not a
   reason to halt; it is the next edge in the work graph. §10 makes this a loop the harness
   enforces, bounded by iteration count, no-progress detection, and the budget wall.
7. **Models come and go.** → Routing is a preference order that never blocks on a specific
   model, made deterministic by a native `fallbackModel` chain (§7-3).
8. **Self-reported metrics are not measurements.** → A tool's own counter describes its
   counterfactual, not your bill. Before adopting any token-saving tool, measure the paired
   cost. This principle is new in v11.2 and it cost v11.1 a wrong rule (C3).

### 1-2. Essential Elements

**7 file primitives, now typed as graph elements** (all seven survive from v10; the *type* is new):

| Element | Role | Entity | Graph role |
|---|---|---|---|
| Intent | Product north star | `docs/vision.md` | Root node of G_work |
| Task | Implementation contract | `tasks.md` | G_work nodes + `Depends On` edges + evidence gates |
| State | Current pointer and lock | `docs/state.md` | The cursor into G_work |
| Decision | Permanent rationale | `docs/decisions.md` | Provenance edges (why an edge exists) |
| Navigation | Where things live | `docs/graph/` + `docs/repo-map.md` | **G_code** (generated) + its rendered Summary |
| Guardrail | Always-on behavior | `CLAUDE.md` + `.claude/rules/*.md` | **G_org**: global node + path-scoped edges |
| Verification | Evidence it works | `scripts/verify.mjs` / Quality Gates | Edge conditions — the only thing that closes a G_work edge |

**4 cross-cutting disciplines** (v11 had 3; v11.2 promotes structure):

- **Structural Fidelity** *(new)* — the graph must match reality or it is worse than nothing.
  Every structural change regenerates `docs/graph/`; a stale graph is a P1 issue, not a nit.
- **Context Continuity** — critical facts are checkpointed to files before compaction fires.
- **Self-Evolution** — recurring failures are root-caused and promoted into durable rules,
  and rules are attached to the *paths where they apply*, not dumped in a global file.
- **Budget Discipline** — every session is planned against the Pro-plan window (§9-4).

### 1-3. Problems v11.2 Solves (relative to v11.1)

| Problem | Root cause | v11.2 solution |
|---|---|---|
| Token budget dominated by re-reading the repo | Structure stored as prose, re-derived every turn | G_code: generated static graph + path-scoped rules (§2-2, §2-3) |
| Agent breaks unrelated tests while fixing one thing | No dependency awareness: it can only run *nearby* tests or *all* tests | Impact analysis over G_code surfaces the at-risk test set before the edit (§10-3) |
| Coding stops mid-run and waits for a human | Stopping is the default; nothing contests it | `Stop` hook + evidence gate: cannot stop while red (§10-2) |
| An agent declares victory on a failing build | Completion asserted in prose | Completion is an exit code; `TaskCompleted` hook rejects unevidenced closure (§10-2) |
| Nested subagents silently triple the burn | Platform default flipped to depth 3 | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`, explicit (§8-2) |
| Workflow subagents prompt mid-run | Allow list believed moot under bypass | Complete allow list + pre-workflow audit (§8-3) |
| A "token saver" that costs tokens | Adopted on the vendor's self-reported number | Measure-the-paired-bill rule (§1-1.8, §9-5) |
| Compaction thrash / bloated context | Percentage treated as the invariant | Absolute ~175K target, simulated, plus empirical verification of the real firing point (§9) |

---

## 2. Architecture — The Three Graphs

### 2-1. Why a graph, and which one

The 2026 discourse around "graph engineering" (Steinberger's July 18 post; the org-graph /
work-graph split popularized in the thread) is about **agent organizations**: nodes are agents,
edges are dependencies, and the claim is that loops let you defer architecture while graphs
force you to declare it. That framing is useful and pm-zero adopts it — but it is only two
thirds of the problem, and for a solo operator it is the *less* valuable two thirds.

The graph a solo developer actually pays for every single turn is the **code graph**. An org
graph with four agents saves you coordination overhead you did not have. A code graph saves you
acquisition cost (§9-1).

So v11.2 runs three graphs, in order of how much budget each one returns:

```text
G_code   — what exists and how it connects      (highest token leverage)
G_work   — what must happen and in what order   (correctness leverage)
G_org    — who does it and under which rules    (coordination leverage)
```

A precise statement of the design, so it cannot be cargo-culted:

> pm-zero does not add a graph. **pm-zero already was a graph and stored it as prose.**
> `tasks.md` always had a `Depends On` column — those are edges. `repo-map.md` always described
> module relationships — those are edges. `decisions.md` always explained why an edge exists.
> v11.2 types them, generates the ones that can be generated, and gates the ones that can be
> gated. Nothing is added that was not already implicitly there.

**What v11.2 refuses to do:** stand up a graph database. The vendor literature equates graph
engineering with buying one. The strongest published result in this space for *regression
control* — TDAD, 70% regression reduction on SWE-bench Verified — explicitly requires "only
`grep` and `pytest` at runtime, with no graph database, MCP server, or API calls." A static
generated artifact in git beats a service for a solo operator on Windows, and it is the version
that still works when the laptop reboots.

### 2-2. G_code — the repository as structure

**Location:** `docs/graph/` (generated, git-tracked). **Generator:** `scripts/graph.mjs`.
**Never hand-edited.**

**`scripts/graph.mjs` is shipped in this repo** — ~410 lines, **zero dependencies**, Node ≥18,
Windows-safe, no AST library, no language server, no graph database, no MCP. It is run against a
fixture repo in this repo's own test notes: builds, resolves relative imports, derives covering
tests transitively, detects staleness by content hash, parses zone-rule frontmatter, reports
uncovered files, and fails open with exit 3 on any internal error. **The design ancestor is
TDAD** — "a static test map and a 20-line instruction file," needing "only `grep` and `pytest`
at runtime." It is not DUALVIEW's architecture (see the honest note at the end of this section).

Four views, reduced to what a solo project needs:

| View | File | Nodes | Edges | Answers |
|---|---|---|---|---|
| Module coupling | `graph/modules.json` | directories / packages | imports | "what layer is this, what may it depend on" |
| Symbol call | `graph/calls.json` | functions, classes, exports | calls / references | "who uses this, what breaks if I change the signature" |
| Test coverage | `graph/tests.json` | test files ↔ source symbols | covers | "**which tests must pass after this edit**" |
| Ownership | `graph/zones.json` | path globs | owned-by (agent), governed-by (rule) | "who edits this and under which rule" |

**`graph/tests.json` is the important one.** It is the input to §10-3 impact analysis, and it is
where the measured 70% regression reduction comes from. The other three are navigation aids;
this one is a correctness mechanism.

**Support matrix (stated, because "use the project's AST toolchain" is not a plan a
non-engineer can execute):**

| Tier | Languages | Edges derived |
|---|---|---|
| 1 | `.ts .tsx .js .jsx .mjs .cjs .py` | relative imports, exported symbols, symbol references, test coverage |
| 2 | everything else in the code set (`.go .rs .rb .java .cs .php .svelte .vue`) | test coverage by filename convention only |

Tier 2 is the documented degraded mode. **Degraded is fine; absent is not.** The parser is
regex-based on purpose: no AST library means no per-language toolchain the operator must install,
version, and keep working. The cost is stated where it matters (§10-3a): it misses dynamic
imports, barrel re-exports, DI containers and string-keyed routing, which is *why* `--impacted`
is a floor and never a ceiling.

**CLI contract** — exit codes are load-bearing, since Q14 gates on them:

| Command | Does | Exit |
|---|---|---|
| `--init` | build and write `docs/graph/` | 0 ok · 3 internal error |
| `--refresh [--quiet]` | rebuild only if the content hash changed | 0 · 3 |
| `--check` | compare tree hash to `meta.json` | **0 fresh · 1 stale** |
| `--impacted <files…>` | print at-risk tests, dependents, and uncovered warnings | 0 always (advisory) |
| `--stat` | serialized size in chars and estimated tokens | 0 · 1 over budget |

**Generation policy (budget-critical):**

- **Single writer, at commit time.** `--refresh` is invoked by the main agent before a
  checkpoint commit — **not** from a `PostToolUse` hook. Two concurrent workers (§5-1 permits
  two) would otherwise trigger two concurrent full regenerations writing the same four files:
  torn writes, or last-writer-wins, either of which produces a graph that lies while `--check`
  passes on the hash it just wrote. A `docs/graph/.lock` file guards the accidental case and the
  loser skips rather than corrupting.
- **Worktree-isolated subagents do not regenerate.** They would build a graph of their worktree
  and commit it there, producing a generated-JSON merge conflict on a file the operator is
  forbidden to hand-edit. The main agent regenerates after the merge.
- Cost: **zero model tokens.** The graph is produced by a parser, never by a model.
- Budget cap: `docs/graph/` stays under **~40K estimated tokens** serialized — measured, not
  assumed, by `--stat`, which exits 1 over budget. The agent never reads it whole; it queries it.
- Staleness is detected by a hash of `(path, size)` pairs, which ignores mtime and therefore
  survives git checkouts and clock skew.

**`docs/repo-map.md` becomes a rendered view.** It keeps its v10 shape (Read Policy / Summary
under 20 lines / Directory Map / Entry Points / Common Workflows / Generated files) but
`scripts/graph.mjs` writes the Directory Map and Entry Points sections from `graph/modules.json`.
The Summary stays human-authored — it carries intent, which no parser can infer.

> **Honest limits, three of them.**
> **(a)** A static graph is stale between regenerations and blind to dynamic dispatch,
> reflection, DI containers and string-keyed routing. It is a *prior*, not a proof — which is
> why §10-3 treats the impacted set as a **floor**, never a ceiling, and the final gate is
> always the full `pnpm verify`.
> **(b)** A *subtly* wrong graph — one that silently omits an edge — degrades impact analysis
> without ever failing `--check`. There is no cheap defense. This is the residual risk the
> design accepts, bounded only by the full suite still running at the gate.
> **(c) The DUALVIEW citation does not support this design, and it would be dishonest to imply
> it does.** DUALVIEW is a *dual-modal* framework: its contribution is rendering repository
> structure **visually** alongside text, and its central ablation exists to show that
> serializing graph topology into linear text loses multi-hop connectivity. `docs/graph/*.json`
> is exactly such a serialization. pm-zero borrows DUALVIEW's *decomposition of what to model*
> (module coupling, calls, hierarchy, dependence) and rejects its delivery mechanism on cost
> grounds. The design evidence is **TDAD**, which really is a static map and really did measure
> a 70% regression reduction with one. Cited correctly in §17-4.

### 2-3. G_org — who acts, under which rules

Stable, version-controlled, and — this is the v11.2 change — **path-scoped**, so it costs
nothing when it does not apply.

| Layer | File | Loads when | Contains |
|---|---|---|---|
| Global behavior | `~/.claude/CLAUDE.md` | every turn, every project | budget, routing, autonomy, git policy, language |
| Project behavior | `CLAUDE.md` | every turn | commands, source-of-truth pointers, boundaries |
| **Zone rules** | `.claude/rules/*.md` with `paths:` frontmatter | **only when Claude touches a matching file** | the rules that used to bloat `CLAUDE.md` |
| Roles | `.claude/agents/*.md` | when that subagent is spawned | reviewer, explorer, worker definitions |

`.claude/rules/` is the single highest-value new primitive for pm-zero's "keep `CLAUDE.md`
lean" law, because it changes lean from *"write less"* to *"write it where it applies."*
Rules are discovered recursively; each file covers one topic; `paths:` frontmatter scopes it.

```markdown
---
paths:
  - "src/auth/**"
  - "src/**/session*.ts"
---
# Auth zone rules
- Never log a token, a session id, or a password hash — not even at debug level.
- Every auth change is Tier 2 review (§7-4), no exceptions, no "it's only a rename".
- Session expiry changes require a migration note in docs/decisions.md.
```

That block used to be three lines of a global file that every turn paid for and that the model
had to remember applied *here*. Now it loads when `src/auth/**` is opened, and it carries the
risk classification with it. **The rule became an edge in the graph.**

> **The trigger is `Read`, and §4 tells the agent to stop reading. This is a real seam.**
> Path-scoped rules load when Claude **reads** a matching file — not on `Edit`, not on a graph
> query. Two of v11.2's own new flows therefore miss them: an `Edit` that follows a
> `--impacted` query without a prior `Read`, and a Tier 1 reviewer that reads `git diff` output
> rather than the files themselves. The mechanism is weakest exactly where v11.2 leans hardest.
> Two countermeasures, both explicit rather than clever:
> 1. One surviving line in `CLAUDE.md`: *"Before editing a file under a governed path, read the
>    matching `.claude/rules/*.md`. `graph/zones.json` lists which globs are governed."* This is
>    the one place v11.2 keeps a procedural instruction after §10-3a argues against them,
>    because the alternative is a silent failure rather than a noisy one.
> 2. Tier 1 and Tier 2 reviewer prompts are constructed with the governing rule files **attached
>    by path**, resolved from `graph/zones.json` against the changed files. The reviewer does not
>    have to remember; the dispatcher does it.
>
> A cleaner refactor exists and is recorded rather than pretended away: a rule of the form
> *"when you touch X, also do Y"* is not a rule at all — it is an **edge**, and it belongs in
> `graph/tests.json` where `--impacted` will surface it unprompted. **If a rule mentions two
> paths, it is probably an edge wearing a rule's clothes.**

Recommended starting zone rules (add on concrete need, not speculatively):
`rules/auth.md`, `rules/data.md` (schema/migrations), `rules/api.md` (contracts),
`rules/tests.md`, `rules/ui.md`.

### 2-4. G_work — what must happen, gated by evidence

`tasks.md` remains the single execution ledger and the main agent remains its only writer.
v11.2 types its edges and hardens its exit condition.

**Node** = a task. Fields unchanged from v10 (ID, Status, Owner, Depends On, Write Scope,
Acceptance, Verification, Evidence), with one addition:

- **`Gate`** — the exact command whose **exit code 0** closes this task. Not a description of
  verification. The command. `pnpm test -- src/auth`, `pnpm verify`, `node scripts/verify.mjs --task T-14`.

**Edge types** (this is what "typed" buys):

| Edge | Meaning | Enforced by |
|---|---|---|
| `depends-on` | B cannot start until A is `verified` | main agent; `TaskCreated` hook rejects a `ready` task with unmet deps |
| `writes` | task → write scope (path globs) | disjointness check before parallel dispatch; worktree isolation if overlapping |
| `gated-by` | task → its `Gate` command | `Stop` / `TaskCompleted` hooks (§10-2) |
| `impacts` | task → test set, computed from `graph/tests.json` | `scripts/graph.mjs --impacted` (§10-3) |
| `caused` | issue → task (a failure that spawned remediation) | Self-Evolution loop (§11) |

**Status vocabulary** unchanged: `proposed / ready / doing / blocked / review / done / verified`.
One rule sharpened: **`done` is a claim, `verified` is an exit code.** Only the harness may
write `verified`.

**The work graph has two tiers, and the distinction is the whole point of dynamic workflows:**

| Tier | Mechanism | Intermediate results live in | Use for |
|---|---|---|---|
| Durable | `tasks.md` | git | everything that survives the session |
| Ephemeral fan-out | dynamic workflow (`ultracode:` keyword, §7-4) | **script variables, outside the context window** | one-shot wide operations: audit N files, port N modules, cross-check N findings |

A workflow's value to a budget-bound operator is not "more agents." It is that
**the orchestration state never enters the context window** — the docs are explicit that "a
workflow script holds the loop, the branching, and the intermediate results itself, so Claude's
context holds only the final answer." A 60-file audit that would compact the main session three
times becomes one report. That is a context-economy mechanism wearing a parallelism costume.

### 2-5. Layer structure

```text
Project Knowledge (this file)
  +-- PM Agent executes Phase 0-7 (§11)

Graph Layer (NEW in v11.2)
  +-- G_code   docs/graph/{modules,calls,tests,zones}.json  <- generated, never hand-edited
  |             +-- rendered to docs/repo-map.md (Directory Map / Entry Points)
  |             +-- queried by scripts/graph.mjs --impacted
  +-- G_org    CLAUDE.md (global) + .claude/rules/*.md (path-scoped) + .claude/agents/*.md
  +-- G_work   tasks.md (durable, typed edges, Gate column) + dynamic workflows (ephemeral)

Autonomy Layer (runtime)
  +-- permissions.defaultMode: bypassPermissions -- zero prompts
  +-- guard.mjs PreToolUse hook (all modes, all agents, all subagent depths)
  +-- COMPLETE allow list -- load-bearing again: workflow subagents run acceptEdits (C2)
  +-- Deny rules retained as second layer for non-bypass modes

Loop Layer (NEW in v11.2 -- §10)
  +-- Stop hook: cannot stop while the Gate is red
  +-- TaskCompleted hook: cannot mark done without evidence
  +-- PostToolUse(Edit|Write): regenerate G_code, run impacted tests
  +-- StopFailure(rate_limit): deterministic checkpoint at the budget wall
  +-- bounded: max iterations + no-progress detection + budget signal

Budget Layer (runtime)
  +-- Session Budget Protocol (§9-4)
  +-- Sonnet-first routing; Opus 5 for top-risk + hard architecture; Fable never
  +-- Haiku-first exploration; workflows for wide fan-out; /handoff session splits

Continuity Layer (runtime)
  +-- Auto-compact at absolute ~175K (§9), verified empirically not assumed
  +-- Session-memory template aligned to pm-zero's ledger (§9-2)
  +-- PreCompact hook: deterministic checkpoint before the summary fires
  +-- /handoff for session transitions
  +-- Auto-memory (MEMORY.md) for cross-project operator preferences ONLY

User Repository (files -- 15-file default, 13 from v10 + 2)
  +-- Core Layer       : CLAUDE.md + .claude/settings.json + HANDOFF-JA.md
  +-- Ledger Layer     : vision / tasks / state / decisions / issues
  +-- Graph Layer      : docs/graph/* (generated)          <- NEW
  +-- Navigation Layer : repo-map (now rendered from graph)
  +-- Rules Layer      : .claude/rules/*.md                <- NEW
  +-- Scripts Layer    : setup / verify / graph
  +-- Aux Layer        : env example / gitignore
```

### 2-6. Default file structure (15 files)

Core (3): `CLAUDE.md`, `.claude/settings.json`, `HANDOFF-JA.md`.
Ledger (5): `docs/vision.md`, `tasks.md`, `docs/state.md`, `docs/decisions.md`, `docs/issues.md`.
Navigation (1): `docs/repo-map.md` *(now generated in part)*.
Graph (1 dir): `docs/graph/` — `modules.json`, `calls.json`, `tests.json`, `zones.json` **(new)**.
Rules (1 dir): `.claude/rules/` — starts with `rules/tests.md` only **(new)**.
Scripts (3): `scripts/setup.mjs`, `scripts/verify.mjs`, `scripts/graph.mjs` **(graph.mjs new)**.
Aux (2): `.env.example`, `.gitignore`.

Optional extensions (add on concrete need, unchanged): `docs/lessons.md`, `.claude/hooks/*.mjs`,
`.claude/agents/*.md`, `.claude/commands/*.md`, `.claude/workflows/*.js`, `.mcp.json`,
`.claudeignore`, `CONTEXT.md`, `scripts/lib/*`.

**Count this honestly:** "15" counts `docs/graph/` and `.claude/rules/` as one entry each. The true tracked-file
minimum is ~18, plus four global hook scripts and a session-memory template
outside the repo. Two disciplines were removed (RTK setup, hand-maintained repo-map sections)
but the moving-part count roughly doubles. Net token cost is down; net complexity is **up**, and
§19-14.4 states the condition under which that trade is not worth taking.

### 2-7. Global vs project split

**Global owns behavior; project owns facts and structure.**

| Lives in global (`~/.claude/`) | Lives in project |
|---|---|
| `settings.json`: bypassPermissions, **complete** allow list, deny baseline, guard hook, loop hooks, autocompact override (18), `fallbackModel`, subagent concurrency ceiling, **spawn depth 1** | `.claude/settings.json`: project deny additions + project hooks (graph regen, impacted tests) |
| `hooks/guard.mjs`, `hooks/loop.mjs`, `hooks/budget-wall.mjs` | project hooks only when a deterministic project job exists |
| `CLAUDE.md`: budget, routing, autonomy, git, language, self-evolution | `CLAUDE.md`: commands, pointers, boundaries; `.claude/rules/*.md`: zone rules |
| `session-memory/config/template.md` aligned to pm-zero's ledger (§9-2) | `docs/graph/*` (generated), vision / tasks / state / decisions / issues / repo-map |
| `myself-info.md` equivalent facts (via pm-zero repo) | — |

`C:\Users\chidj\project\pm-zero\myself-info.md` stays the operator's environment sheet; the PM
Interview (Phase 1) reads it instead of re-asking environment questions.

---

## 3. Source of Truth

| Question | File | Graph |
|---|---|---|
| What product are we building? | `docs/vision.md` | G_work root |
| What exact work remains? | `tasks.md` | G_work |
| What is active right now? | `docs/state.md` | G_work cursor |
| Why did we choose this? | `docs/decisions.md` | provenance |
| What failed before, and what fixed it? | `docs/issues.md` | `caused` edges |
| **What does this code touch?** | `docs/graph/` | **G_code** |
| Where is the relevant code? | `docs/repo-map.md` | G_code, rendered |
| What rules apply *here*? | `.claude/rules/*.md` | G_org edges |
| What rules always apply? | `CLAUDE.md` | G_org root |
| How do we verify? | `scripts/verify.mjs` + task `Gate` | edge conditions |
| What should the user receive? | `HANDOFF-JA.md` | — |

Responsibilities unchanged from v10 except:

- `tasks.md` — adds the `Gate` column. Every `ready` task must have a runnable gate command.
  A task without a gate is not `ready`; it is `proposed`.
- `docs/repo-map.md` — the Summary is authored; the Directory Map and Entry Points are
  generated. Hand-edits to generated sections are overwritten without warning.
- `docs/graph/` — generated, git-tracked, never hand-edited, regenerated on structural change.

**Harness Task tools:** `TaskCreate`/`TaskUpdate` remain an ephemeral in-session mirror.
`tasks.md` is the system of record. **New in v11.2:** the `TaskCreated` and `TaskCompleted`
hooks fire on those tools and are used as gates (§10-2), so the mirror is no longer inert — it
is the trigger surface for the loop.

**Auto-memory:** `MEMORY.md` carries *cross-project operator facts* only. Never project facts.
Memory is convenience; the ledger is record.

---

## 4. Graph Traversal Policy (replaces Navigation Policy)

v10–v11.1 said "read the repo-map Summary, then read the relevant directory section, prefer
`rg` over browsing." That was a good policy for a prose map. With G_code the policy becomes
cheaper and sharper:

1. **Session start:** read `CLAUDE.md`, `docs/state.md`, `docs/decisions.md`, and
   `docs/repo-map.md` `## Summary` only. Nothing else. (Unchanged — this is the fixed tax.)
2. **Before editing:** `node scripts/graph.mjs --impacted <target-files>`. Returns the
   at-risk test set and the direct dependents. This replaces exploratory reading.
   Cost: one Bash call, output measured in hundreds of tokens.
3. **When you need to know who calls X:** query `graph/calls.json`, do not grep the tree.
4. **When the graph disagrees with reality:** the graph is wrong. Regenerate it, and if
   regeneration does not fix it, log a `docs/issues.md` entry — a systematically wrong graph
   is a P1 defect (Structural Fidelity, §1-2).
5. **When you genuinely need to read widely** (unfamiliar subsystem, "how does X work"):
   Explore subagent (Haiku), or a dynamic workflow if it spans more files than one context
   should hold. Only the summary returns.
6. **Never** read many files in the main context. This is the rule the acquisition-cost
   argument exists to justify (§9-1).

Zone rules load themselves — when Claude opens `src/auth/foo.ts`, `rules/auth.md` arrives with
it. There is no "remember to check the auth rules" instruction anywhere in v11.2, because that
instruction is now an edge.

---

## 5. Work Graph Operations

### 5-1. Coordination and parallelism

- Main agent owns `tasks.md` and `docs/state.md`. Subagents report; they do not write ledgers.
- Parallel work only on **disjoint `writes` edges**. Same file → serialize.
- When scopes overlap or are uncertain, spawn with `isolation: "worktree"`. Worktree isolation
  had two escape bugs fixed in the current line (`git -C`/`--git-dir` redirection into the
  shared checkout; landing in another project's leftover worktree), so it is *more* reliable
  than earlier in 2026 (§17). Two fixed escapes is not evidence that a third does not exist —
  keep write scopes disjoint anyway.
- Subagents **inherit the parent's permission mode** (the Task tool's `mode` parameter is
  deprecated), so under `bypassPermissions` they run prompt-free and the guard hook still
  applies to them. A subagent cut off by a rate limit or server error returns whatever output
  it had **already produced** rather than failing silently.
- **Concurrency ceiling:** ≤2 concurrent worker subagents as a soft prose default;
  `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=3` as a hard total-concurrency backstop across all
  roles (explore + worker + reviewer). Platform default is 20.
- **Spawn depth: 1, explicitly (C1).** The platform now defaults to depth 3. pm-zero sets
  `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`. Rationale unchanged from v11.1 — agent trees fan
  token cost geometrically against one shared window — but the *action* changed from "leave the
  default alone" to "override the default," and leaving it alone is now a budget bug.
- **Dynamic workflows are the sanctioned exception** to the concurrency ceiling, because their
  agents' results do not land in the main context. Even so: one workflow at a time, always
  scoped, never as a session mode. See §7-4.

### 5-2. `tasks.md` template delta

Unchanged from v10 (Goal Binding, Status Vocabulary, Tasks table, Blockers table, Review Notes)
plus:

```markdown
| ID | Status | Owner | Depends On | Write Scope | Acceptance | Gate | Evidence |
|----|--------|-------|-----------|-------------|-----------|------|----------|
| T-14 | doing | main | T-11 | src/auth/**, test/auth/** | login rejects expired tokens | `pnpm test -- test/auth` | — |
```

`Gate` is the command. `Evidence` is filled by the harness with `<command> → exit 0 @ <sha>`.
The agent never writes `Evidence` from memory.

---

## 6. Self-Coordinating Main Agent

Unchanged: the main Claude Code agent decomposes, delegates, integrates, and owns the ledger.
No "you are the coordinator" prompt is needed.

What v11.2 adds is that the main agent is now a *graph* coordinator: it reads the frontier of
G_work (tasks whose `depends-on` edges are all `verified`), checks `writes` disjointness,
dispatches, and closes edges only on evidence. That is a mechanical procedure, which is why
§10 can run it without a human.

---

## 7. Orchestration and Model Routing

### 7-1. The lineup on 2026-07-27

| Model | Price /MTok | Context **on a Pro plan** | Notes |
|---|---|---|---|
| **Sonnet 5** | $2/$10 intro through 2026-08-31, then $3/$15 | 1M | Claude Code default since 2026-06-30 |
| **Opus 5** | $5/$25 (unchanged from Opus 4.8); fast mode $10/$50 | **200K** — 1M requires usage credits | Released 2026-07-24. Default on Max, **strongest model on Pro**. Thinking on by default, 128K max output |
| **Haiku 4.5** | $1/$5 | 200K | Exploration only |
| Fable 5 | $10/$50 | — | Design-time only; never in runtime routing |

> **The Pro-plan context asterisk, which matters more than it looks.** Opus's 1M window is
> automatic on Max/Team/Enterprise but **requires usage credits on Pro** — and usage credits are
> exactly the overage pm-zero's first constraint forbids. So on this operator's plan, **Opus 5
> is a 200K-context model.** Two consequences: an Opus review of a very large change may not fit
> where a Sonnet 5 review would, and any global context setting expressed as a *percentage* is
> computed against 200K for every Opus call (this is half of C5). Sonnet 4.6's 1M likewise
> requires credits on every plan including Max; Sonnet 5's does not.

### 7-2. Sonnet-first survives, for a corrected reason

v11.1's argument was "Sonnet 5 ≈ Opus 4.8 at 40–60% of the cost, so Opus is optional." Opus 5
weakens that argument on the capability axis — it is reported as state-of-the-art on
Frontier-Bench v0.1 and GDPval-AA, more than doubling Opus 4.8 on Frontier-Bench *at a lower
cost per task*. Keeping the old argument would mean arguing from a stale premise.

The argument that survives is a **rate-limit** argument, not a capability argument:

> On a flat Pro subscription what is scarce is not dollars — it is the shared 5-hour window.
> Opus's API list price is 2.5× Sonnet 5's intro rate and 1.67× its post-August rate. **How
> subscription rate-limit weight relates to API price is not documented**, so treat any
> multiplier as an ordering, not a number: Opus costs meaningfully more window per token than
> Sonnet, and Sonnet costs meaningfully more than Haiku. That ordering is enough to route on;
> the precise ratio is not knowable from published material and v11.1's "~5×" and this
> document's earlier "~2.5×" were both unsourced.

So the routing rule is: **Sonnet 5 for volume, Opus 5 for irreversibility.** Where a mistake is
cheap to fix, spend window on quantity. Where a mistake is expensive or hard to detect, spend it
on quality.

**One tempting inference, deliberately not adopted as a default.** Anthropic's launch post
carries partner reports of large efficiency gains — ~26% fewer tokens at max reasoning, "a third
fewer turns and tool calls," "roughly a seventh of the reasoning tokens." If those transfer,
Opus 5 at *low* effort could beat Sonnet 5 at `xhigh` on hard problems in total window weight,
inverting v11.1's "raise effort before switching models."

pm-zero **keeps v11.1's default** and does not act on this. The reports come from legal,
financial and trading workloads, none of them TypeScript coding, and none reports rate-limit
weight — which §7-2 has just established is the only currency that matters here. Writing a
budget reversal into an always-loaded `CLAUDE.md` on the strength of launch-post marketing is
precisely the mistake §1-1.8 exists to prevent, and it is the same mistake that let RTK into
v11.1. **Record it in `docs/decisions.md` as a hypothesis with a measurement plan** — one hard
task, run both ways, compare the `/context` and usage-window cost — and promote it only if your
own numbers agree.

### 7-3. Routing table

| Work | Model | Why |
|---|---|---|
| Default: implementation, refactor, tests, debugging, routine planning | **Sonnet 5** (main context) | Lowest window-weight per unit of work; the Pro plan is sized for it |
| Exploration, wide reads, "how does X work" | **Haiku 4.5** (Explore subagent) | Cheapest; context discarded after the summary returns |
| Standard self-review | **Sonnet 5, fresh subagent** | Blind-spot removal comes from fresh context, not model size |
| Highest-risk review: auth, billing, DB schema, RLS, deploy, security, prod data, PII | **Opus 5** | Reported best-in-class at code review and hazard spotting; these are the irreversible classes |
| Hard architecture decision, root-cause on a bug that survived 2 attempts | **Sonnet 5 at high effort first; Opus 5 if that fails** | v11.1's order, retained deliberately (§7-2) |
| Wide mechanical fan-out (audit N files, port N modules) | **a saved `.claude/workflows/` command** if one exists; otherwise queue it for the next human-attended session | Intermediate results stay out of the context window — but the agent cannot author a workflow unattended (§7-4) |
| A routed model is overloaded/unavailable | **Sonnet 5** via `fallbackModel` | Pipeline never stalls; see §8-2 |

Fable 5 is design-time only and is never part of runtime routing.

**Effort discipline.** `medium` globally. Raise per-task. `xhigh`/`ultracode` only for a task
that has already failed at `high`. Extended thinking bills at output rates and Sonnet 4.6+ /
Opus 4.5+ **keep all prior thinking blocks in context by default** — so thinking is not just a
per-turn cost, it is a permanent context tax for the rest of the session (§17).

### 7-4. Dynamic workflows — the sanctioned fan-out

**What it is (Fact):** a JavaScript script Claude writes, executed by the runtime in the
background, orchestrating dozens to hundreds of subagents. Requires Claude Code ≥ 2.1.154;
**available on Pro but off by default — turn it on in the Dynamic workflows row of `/config`.**

**Why pm-zero cares:** the intermediate results live in script variables, not in the context
window. This is the only mechanism in the platform that makes a wide operation *context-free*.

> **The constraint that determines how pm-zero can use this at all.** The `ultracode` keyword is
> an **opt-in only in a prompt the human types**: at the interactive prompt, in an IDE panel, in
> Remote Control, or in an SDK app that stamps the input as human. It explicitly does **not**
> start a workflow from a `-p` prompt, an unstamped SDK prompt, a scheduled task, or a relayed
> payload. **A `Stop` hook's `reason` string is not human keyboard input.** Therefore the
> autonomous loop of §10 **cannot start a workflow by itself.** Any rule telling the agent to
> "use a workflow for wide fan-out" is an instruction it structurally cannot execute while the
> operator is away — which is exactly when §10 runs.

**So workflows are a human-initiated, agent-replayable mechanism, in two phases:**

| Phase | Who | What |
|---|---|---|
| **Author** (human, at the keyboard) | operator types the keyword | `ultracode: audit every route under src/routes/ for a missing auth check; have a second agent try to refute each finding before it is reported` |
| **Replay** (agent, any time) | `/workflows` → select the run → `s` saves the script into `.claude/workflows/` | it becomes `/<name>`, an ordinary command the agent *can* invoke |

The saved-command path is the only one the loop can take, which makes §7-4 rule 5 below not a
nice-to-have but the entire mechanism by which workflows are available to an autonomous session
at all. Plan sessions author workflows; execution sessions replay them.

Never `/effort ultracode` as a session mode (rejected; see `update.md` §3).

**pm-zero rules for workflows:**

1. **Allow-list first.** Workflow subagents run in `acceptEdits` and inherit the tool allow
   list *regardless* of session mode. Anything outside the allow list prompts mid-run. Run the
   Phase 0.5 allow-list audit before the first workflow in a project (§8-3). This is C2.
2. **Under `bypassPermissions` the launch prompt never appears** — the run starts immediately.
   Convenient and dangerous: there is no "are you sure" for a token-expensive operation. So:
3. **Budget gate.** A workflow is only justified when the same work in the main context would
   force ≥2 full compactions. Below that, use subagents. The docs warn workflows "consume
   substantially more tokens than a typical session."
4. **One at a time**, always scoped to a path or a file list, never "the whole repo."
5. **Save what works.** `/workflows` → select the run → `s` saves the script as a command in
   `.claude/workflows/`. A workflow that earned its cost once should never be re-planned. This
   is the single best token trade in the whole feature: **planning is expensive, replaying is
   not.**
6. **The adversarial pattern is the point.** A workflow can "have independent agents
   adversarially review each other's findings before they're reported." For pm-zero this is how
   a Tier 2 review gets *better* than a single Opus pass without a Max plan.

**Bundled:** `/deep-research` for questions needing cross-checked sources. As of v2.1.218 it
runs only when invoked, never on Claude's own initiative.

### 7-5. Subagent routing heuristics

| Situation | Action | Rationale |
|---|---|---|
| Single-file fix, small edit, config change | Main context, Sonnet 5 | Spawn cost exceeds benefit |
| "What does this change break?" | `scripts/graph.mjs --impacted` | A parser, not a model |
| Error debugging, attempts 1–2 | Main context, Sonnet 5 | Direct context access is faster |
| Error debugging, attempt 3+ | Web search (global rule) → Opus 5 root-cause in main context | The 3-failure rule; §7-2 on hard problems |
| Multi-file feature | Worker subagents on disjoint `writes` (Sonnet 5); worktree isolation if overlapping | Parallel savings justify spawn cost |
| Codebase exploration | Explore subagent (Haiku 4.5) | Only the summary returns |
| Wide mechanical operation (>15 files) | Saved workflow command if available; else Explore subagents + serialize | Intermediate state stays out of context, *when* a saved workflow exists (§7-4) |
| Self-review (review classes) | Fresh subagent per §7-6 tiers | Fresh context is mandatory |
| Ad-hoc work (no `tasks.md` entry) | Main context, Sonnet 5 | Cheapest effective option |

Default bias: stay in main context with Sonnet 5. Every spawn costs at least one prompt.

### 7-6. The reviewer without a human — tiered

- **Tier 0 — deterministic gates (always, near-free):** the task's `Gate` command,
  `scripts/verify.mjs`, tests, lint, typecheck, `git diff --check`, gitleaks when available,
  **plus the impacted-test set from G_code**. These run before any model review.
- **Tier 1 — fresh-context Sonnet 5 subagent (default for review classes):** no implementation
  context; reads the diff, the acceptance criteria, the relevant tests, and the zone rules that
  apply to the changed paths. Returns pass/fail with findings. The mechanism is the *fresh
  context*, not the model size.
- **Tier 2 — Opus 5 (highest-risk classes):** auth, billing, DB schema, RLS/permissions,
  deploy, security, production data, personal information. Opus 5 replaces Opus 4.8 here and
  the case is stronger than in v11.1: it is reported as the strongest code-review model in the
  family and specifically better at "subtle, codebase-specific" hazards. If Opus 5 is
  unavailable or the window is nearly exhausted, run Tier 1 at high effort and record the
  substitution in `tasks.md` Review Notes.
- **Tier 2+ — adversarial workflow (optional):** for a change that is both high-risk and large,
  a dynamic workflow with independent reviewers that must refute each other's findings. Use
  sparingly; it is the most expensive gate in the system.

Review classes (Tier 1 minimum): 300+ line diff, new external API, behavior changes in
critical workflows, and everything in the Tier 2 list.

Reviewer instructions: report every finding with confidence and severity; the main agent
filters. **Never** tell the reviewer "only report serious issues" — models follow that
literally and recall collapses.

`/code-review` runs as a background subagent (so review no longer fills the conversation);
`/ultrareview` and `/code-review ultra` exist for a cloud review pass. Use `/code-review` for
routine branches, keep Tier 2 for the risk classes.

### 7-7. Execution flow

```text
Human goal
  -> Main agent (Sonnet 5): read state + decisions + repo-map Summary
  -> Decompose into G_work nodes with typed edges and a Gate per node
  -> For each frontier node:
       graph.mjs --impacted   -> the at-risk test set (a floor, not a ceiling)
       implement (main context, or worker subagents on disjoint writes)
       PostToolUse: regenerate G_code; run impacted tests
       Gate command                                     <- exit code decides
       Tier 0 -> Tier 1 -> Tier 2 as risk requires
       commit + push
  -> Stop hook: any frontier node still red or unstarted? -> block, continue (§10)
  -> All nodes verified -> PR -> risk gate -> auto-merge if low/medium and green
  -> Handoff (Japanese)
  -> Self-Evolution: promote failures to rules, attached to the paths they govern
```

---

## 8. Autonomy and Permissions

Principle unchanged: **bypass the permission layer; enforce the dangerous set with a hook.**
What changed is that bypassing the layer no longer bypasses *everything* — workflows
reintroduced a prompting path, so the allow list is back on the critical path.

### 8-1. Why v10 prompted (retained, still the reason the config looks like this)

1. **Wrong schema key, wrong file.** Top-level `"permissionMode"` is not the documented key;
   the key is `permissions.defaultMode`. A second attempt lived in user-level
   `~/.claude/settings.local.json`, which is a *project-level* filename and is not part of the
   loaded user hierarchy.
2. **The PowerShell tool had no allow rule.** `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` routes
   Windows shell work to a `PowerShell` tool with its own permission namespace; `Bash` rules do
   not cover it.
3. **Newer tools absent from the allow list** (Skill, ToolSearch, Task tools, NotebookEdit).

### 8-2. The v11.2 global configuration

`~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000",
    "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "3",
    "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "1",
    "CLAUDE_CODE_STOP_HOOK_BLOCK_CAP": "8"
  },
  "fallbackModel": ["claude-sonnet-5"],
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["*"],
    "deny": [
      "Bash(rm -rf /)", "Bash(rm -rf ~)", "Bash(sudo rm *)",
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git reset --hard*)",
      "PowerShell(git push --force*)", "PowerShell(git push -f*)",
      "PowerShell(git reset --hard*)",
      "Read(**/.env)", "Read(**/.env.*)",
      "Edit(**/.env)", "Edit(**/.env.*)",
      "Write(**/.env)", "Write(**/.env.*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash|PowerShell|Read|Edit|Write",
        "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/guard.mjs" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/loop.mjs" }] }
    ],
    "StopFailure": [
      { "matcher": "rate_limit|overloaded",
        "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/budget-wall.mjs" }] }
    ],
    "PreCompact": [
      { "matcher": "auto|manual",
        "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/checkpoint.mjs" }] }
    ],
    "PermissionRequest": [
      { "matcher": "*",
        "hooks": [{ "type": "command",
                    "command": "node C:/Users/chidj/.claude/hooks/leak-log.mjs" }] }
    ]
  },
  "skipDangerousModePermissionPrompt": true
}
```

> **Windows path caveat (still required):** write hook commands with **forward slashes**
> (`node C:/Users/.../guard.mjs`). Claude Code runs hook commands through a POSIX shell, which
> eats Windows backslashes as escapes and mangles the path into a "Cannot find module" failure —
> so the guard silently never fires. Related and current: a bug where Windows paths with
> `\u`-prefixed segments (`C:\Users\unicorn`) were corrupted into CJK characters in tool inputs
> was fixed in the current line, but the forward-slash rule for hook commands stands.

**Key-by-key rationale for what changed:**

| Key | v11.1 | v11.2 | Why |
|---|---|---|---|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `15` | **deleted** | **C5.** It is a percentage of whatever window the harness resolves, applied globally including to subagents. `15` meant 150K on Sonnet 5 but **30K on every 200K model** — Haiku, and Opus 5 on Pro. 30K is thrash. |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | *(unknown to v11.1)* | **188000** | The absolute knob v11 and v11.1 were reaching for and never found. `188000 − 13000 ≈ 175K` on **every** model, whatever its native window. One key, model-independent. §9-3 |
| `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | *(unset — correctly, at the time)* | **1** | **C1.** The default flipped to 3 on 2026-07-24. Silence is now a budget bug |
| `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` | *(n/a)* | **8** (the default, pinned) | §10. pm-zero's own cap is 6, deliberately below it, so pm-zero's *clean* exit always fires before the platform's dirty override |
| `permissions.allow` | `[...15 named tools...]`, called "moot" | **`["*"]`** | **C2 + M1.** Workflow subagents run `acceptEdits` and prompt on anything outside the list — and the platform's tool list grows every release, so a hand-maintained enumeration is a leak that reappears on its own. Since §8-4 states plainly that the *guard hook plus deny rules* are the real boundary, `"*"` makes the security model honest instead of pretending an unmaintainable list is doing work. |
| `deny` | `Read(.env*)` only | **`Read` + `Edit` + `Write` on `.env*`** | **M11.** The read path was guarded twice and the *write* path — the one that commits a secret — was guarded by nothing, in any mode |
| guard hook matcher | `Bash\|PowerShell\|Read` | **+`Edit\|Write`** | Same hole: `Write(.env)` reached the disk unchallenged |
| RTK PreToolUse hook | present | **removed** | **C3.** Measured +7.6% at low effort, ±0% at high |
| `Stop` / `StopFailure` / `PreCompact` | absent | **present** | §10. The loop and the budget wall become deterministic |
| `PermissionRequest` → `leak-log.mjs` | absent | **present** | The detector for C2. Under `bypassPermissions` this event should *never* fire; if it does, a workflow subagent hit something outside the allow list. Logging it turns an invisible regression into a line in `docs/issues.md`. |
| `model` | unpinned | unpinned | Sonnet 5 is the Claude Code default; ride the default |

> **On `allow: ["*"]`.** This looks alarming and is the honest position. Under
> `bypassPermissions` the main session already runs every tool without a prompt; the allow list
> only governs *workflow subagents*, which are spawned by the same agent under the same
> operator. Restricting them to a subset of what their parent may do buys no security — the
> parent can simply do it directly — while an incomplete list buys a mid-run prompt, which is
> the exact failure v11 was built to eliminate. The boundary that actually holds is
> `guard.mjs`, which fires for every agent at every depth in every mode. If you are not
> willing to rely on the guard hook, the correct response is to fix the guard hook, not to
> maintain a list that the next release will invalidate.

`fallbackModel` substitutes Sonnet 5 when a *routed* model is **overloaded or unavailable** —
in practice the optional-Opus paths. It contains **only Sonnet 5**: Haiku is deliberately
excluded so the default coding agent can never silently drop to a read-only model. It does
**not** fire on the Pro-window *rate limit* (that surfaces immediately by design) — that case
belongs to `StopFailure` + the Session Budget Protocol.

### 8-3. The allow list is load-bearing again (C2)

Add to **Phase 0.5 self-audit**, and run before the first dynamic workflow in any project:

```powershell
# Every command a workflow agent might run must be allow-listed, or it prompts mid-run.
# Enumerate what the project actually needs, then verify each is covered.
pnpm install; pnpm lint; pnpm typecheck; pnpm test; pnpm build; pnpm verify
git status; git add; git commit; git push; gh pr create
node scripts/verify.mjs; node scripts/graph.mjs
```

The blanket `"Bash"` and `"PowerShell"` entries in §8-2 cover these. The audit exists for the
case where a project adds an MCP server or a non-obvious binary: **MCP tools are not covered by
`Bash`**, and a workflow calling an unlisted MCP tool will prompt. Record every MCP addition and
its allow-list entry in `docs/decisions.md`.

### 8-4. Three defensive layers

| Layer | Fires in bypass mode? | Fires for subagents? | Fires for workflow agents? | Survives compaction? |
|---|---|---|---|---|
| `guard.mjs` PreToolUse hook | **Yes — always** | Yes | Yes | Yes (not prompt-based) |
| `permissions.allow` / `deny` | deny: not guaranteed | Yes | **Yes — allow is enforced** | Yes |
| `CLAUDE.md` / zone-rule prose | Advisory | Yes | Yes | Yes (reloads per turn / per path) |

### 8-5. The guard hook

`~/.claude/hooks/guard.mjs`, deployed and test-verified (16 cases). Blocks, in Bash and
PowerShell forms:

- `rm -rf /`, `rm -rf ~`, `Remove-Item -Recurse` on a drive root / `$HOME` / `~`
- `git push --force`, `git push -f`, `git push --force-with-lease`
- `git reset --hard`
- `sudo su`, `runas`
- reading `.env` / `.env.*` via `Read`, `cat`, `type`, `Get-Content`
  (`.env.example` is explicitly allowed — it is the template)

Exit code 2 blocks the call and shows the reason to the agent; exit 0 allows. The hook
**fails open** on unparseable input and on Windows stdin pipe failures (Node.js #46601: stdin
`end` may not fire — the guard uses a 3-second timeout plus an error handler, both exit 0) so a
hook bug can never brick the session. Scoped deletes (`rm -rf node_modules`,
`Remove-Item -Recurse .\dist`) pass — the guard blocks the catastrophic set, not cleanup.

**Optimization (new):** narrow the handler with the `if` field so the process only spawns when
it might matter — `"if": "Bash(rm *)"`, `"if": "Bash(git *)"`, `"if": "Read(**/.env*)"`. This
uses permission-rule syntax against tool name *and* arguments, and avoids a Node spawn on every
`pnpm test`. Keep a catch-all matcher group as the safety net; the `if` narrowing is a
performance measure, not a security boundary.

Agent-side rule (global `CLAUDE.md`): if the guard blocks a command, do not retry or work
around it; find a safe alternative or surface it to the human.

### 8-6. New tools and MCP mid-session

Under `bypassPermissions` a newly connected MCP server's tools work immediately in the main
session — no per-tool approval. **But not inside a workflow** (C2): an MCP tool outside the
allow list prompts. Add MCP tools to the allow list when you add the server, and record the
addition and its reason in `docs/decisions.md`. The guard hook does not intercept MCP tools;
for genuinely dangerous MCP capabilities (payments, production deploy) the human gate in §16
applies, enforced by the agent's own risk classification.

### 8-7. Project-level `.claude/settings.json`

Thin, because global carries the baseline. It exists so the template is portable.

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
  "env": { "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000" },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Edit",
        "hooks": [{ "type": "command",
                    "if": "Edit(tasks.md)",
                    "command": "node ${CLAUDE_PROJECT_DIR}/scripts/verify.mjs --guard-verified" }] }
    ],
    "TaskCompleted": [
      { "hooks": [{ "type": "command",
                    "command": "node ${CLAUDE_PROJECT_DIR}/scripts/verify.mjs --gate-only" }] }
    ],
    "SessionStart": [
      { "matcher": "startup|resume",
        "hooks": [{ "type": "command",
                    "command": "node ${CLAUDE_PROJECT_DIR}/scripts/verify.mjs --reconcile-loop" }] }
    ]
  }
}
```

**Three things this block gets right that the obvious version gets wrong:**

- **`${CLAUDE_PROJECT_DIR}`, not a bare relative path.** Hook commands resolve against whatever
  the current working directory happens to be — and Claude `cd`s (there is a `CwdChanged` event
  precisely because it does), and worktree-isolated subagents run in a different checkout. A
  bare `node scripts/graph.mjs` silently no-ops from the wrong directory, and a failing
  `PostToolUse` hook does not undo the tool call, so the graph goes stale with no signal: the
  exact P1 condition Q14 exists to catch. Forward slashes here too.
- **No graph refresh on `PostToolUse`.** Moved to commit time, single-writer (§2-2).
- **`Bash(rm -rf *)`, not `Bash(rm -rf:*)`.** The latter is malformed permission syntax carried
  unexamined from v11.1 — in a document whose §8-1 exists to post-mortem a wrong permission key.
  It never matched anything.

Do not set `model`, personality, or `skipDangerousModePermissionPrompt` at project level — that
last key is **ignored in project settings**, so a project-only install still shows the
bypass-confirmation prompt on first launch. That confirmation is a one-time dialog, not a
per-tool prompt, and it is not a violation of the zero-prompt goal; but expect it, and set the
key globally if you want it gone.

---

## 9. Token Economy and Context Continuity

### 9-1. Where the tokens actually go

v11.1 asserted the file-as-memory triad and cited it well. v11.2 tried to add a headline number
and got the epistemics wrong on the first pass; here is the corrected version.

**The number, with its actual provenance.** DUALVIEW reports that on SWE-bench Verified,
"simply reading repository files (via tools such as `grep` and `cat`) accounts for **76.1%** of a
coding agent's token budget" — **citing a third paper, not measuring it.** And the regime it
describes is a benchmark harness doing cold-start localization in an unfamiliar repository with
no `CLAUDE.md`, no repo map, no `state.md`, and no prompt-cache continuity across the task.
pm-zero has had all four since v10.

So the honest form is: **repository reading is the largest single line item in a cold agent's
budget, and pm-zero's addressable share of it is unmeasured and plausibly much smaller.** It
motivates the direction. It does not size the win, and any sentence of the form "the graph
recovers 76%" is unsupportable. The load-bearing evidence for G_code is TDAD's regression result
and the cost asymmetry in §19-2 — not this figure.

**Two cost centres, and they are different things** (an earlier draft ranked them against each
other with no shared unit, which was incoherent):

| | What it is | What reduces it |
|---|---|---|
| **Acquisition** | tokens spent *discovering* structure: exploratory reads, greps, file dumps | G_code `--impacted` queries; Haiku Explore subagents; saved workflows |
| **Carry** | tokens re-billed *every turn* for context already acquired — cached at ~1/10 but paid again on each turn | keeping the window small: §9-3's threshold, subagent isolation, workflow externalization |

The graph attacks **acquisition**. The compaction threshold attacks **carry**. They are
complementary and neither obsoletes the other. Note the tension the graph must respect: a
`--impacted` result and the rules it pulls in *enter* the context and then become carry cost
themselves — which is why the query returns a short test list rather than a subgraph dump, and
why `docs/graph/` is queried and never loaded.

**A third consequence, now measured rather than asserted:** CLI-output compression is noise at
this scale. The Bash hook sees ~20% of tool-result characters; `Read`/`Grep` bypass it entirely.
Ceiling: ~3% of input tokens even at perfect compression. Measured: worse than nothing (C3).

pm-zero's oldest instinct — "the file system is the memory because the conversation is
disposable" — remains the documented best practice: Anthropic frames context as a finite
"attention budget" subject to *context rot*, and prescribes exactly three long-horizon
techniques: **compaction, structured note-taking, and sub-agent architectures**. pm-zero is
those three, hardened for a $20 wall. v11.2 adds a fourth that Anthropic's own product now
implements and pm-zero should exploit: **externalizing orchestration state into a script**
(dynamic workflows), which keeps intermediate results out of the window entirely.

### 9-2. Compaction is a cascade, not an event

Claude Code does not have "a compaction." It has a layered cascade, and the layers have very
different prices. Knowing which layer you are triggering is the difference between a free
cleanup and a paid summarization.

| Layer | What it does | Cost | Status |
|---|---|---|---|
| **0. Large-result persistence** | Tool result over a size threshold is written to disk; context keeps a ~2KB preview + path | Free | Inference (reverse-engineered) |
| **1. Cached microcompact** | Old tool results deleted from the *server-side* cache via cache edits — the cached prefix is not invalidated | Free, no model call | Inference |
| **2. Time-based microcompact** | After a long idle gap the cache is cold anyway, so old tool results are cleared locally and old thinking blocks dropped | Free | Inference |
| **3. Session-memory compact** | A background agent maintains a structured notes file all session; when compaction is needed the notes *are* the summary | **No summarization call** | Inference |
| **4. Full compact** | LLM summarizes the whole conversation | **One model call reading your whole context** | Fact (observable) |

Layers 0–3 are reverse-engineered, not vendor-documented — treat the mechanism as **Inference**
and the *direction* as reliable: cheaper layers run first, and the expensive one is the fallback.
Two independent teardowns describe the same cascade (§17).

**The actionable consequence, and it is a big one.** Layer 3 uses a **user-customizable
template**. If the notes template matches what pm-zero needs to survive a compaction, then
compaction becomes free *and* lossless in exactly pm-zero's terms. This converts v11's
"custom compaction instruction in `CLAUDE.md`" — a prose request the summarizer may or may not
honor — into a structural guarantee.

Align the session-memory template (`~/.claude/session-memory/config/template.md`) to the ledger:

```markdown
# Session Title
# Current State
_Active task ID from tasks.md. Branch. Write scope. Gate command and its last exit code._
# Task specification
_Acceptance criteria verbatim from the tasks.md row._
# Files and Functions
_Files modified this session, with the graph nodes they touch._
# Workflow
_The exact commands: install / lint / typecheck / test / build / verify / graph refresh._
# Errors & Corrections
_Every failing gate this session, its signature, and what changed in response._
# Codebase and System Documentation
# Learnings
_Candidates for promotion to a zone rule, with the path glob they should attach to._
# Key results
# Worklog
```

Every field maps to something pm-zero already tracks. Sections are size-capped (reported: ~2000
tokens per section, ~12000 total), which is a feature: it forces the pointer-not-payload
discipline pm-zero already requires.

**Belt and braces:** also keep the `PreCompact` hook (§8-2). It fires before *any* compaction,
manual or auto, and runs `checkpoint.mjs` — write `docs/state.md`, stage, commit. Then it does
not matter what the summarizer preserves, because the truth is on disk and in git. This is the
first time pm-zero's "checkpoint before compaction" discipline is enforced by the harness rather
than requested in prose.

Also configured: a custom compaction instruction stays in `CLAUDE.md` as the third line of
defense — *"When compacting, always preserve: the active task ID, the Gate command and its last
exit code, the list of modified files, and any failing-gate signature not yet resolved."*

### 9-3. The autocompact value, derived

**The question:** what should `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` be, on a 1M-context model, for
a Pro-plan solo developer?

**Why the v11.1 answer needed redoing.** v11.1 reasoned: "the invariant is an absolute ~100–150K
working context; on a 1M window that is ~15." Correct in form. But the *value* of the invariant
was inherited from Sonnet 4.6's 200K window (50% of 200K ≈ 100K) — it was never derived from
what compaction actually costs. v11.2 derives it.

**The cost model.** Every Claude Code turn re-sends the whole conversation. The unchanged prefix
hits the prompt cache (~0.1× input rate); the delta is a cache write (~1.25×); output including
thinking bills at ~5× input. A full compact costs one model call that reads the current context
and emits a summary; observed post-compact context in real transcripts is 30–33K tokens. So:

```
cost(turn)    = ctx · 0.1  +  Δctx · 1.25  +  out · 5.0
cost(compact) = ctx · 0.1  +  31_000 · 5.0
```

Two forces pull in opposite directions:

- **Compact too often** → you pay `31_000 · 5` (≈155K token-equivalents) per compaction, plus
  you re-pay the summary in every subsequent turn's prefix.
- **Compact too rarely** → you pay `ctx · 0.1` **every turn** on an ever-larger `ctx`, and
  context rot forces redone turns.

The second force is the one v11.1 under-weighted and the JetBrains analysis names explicitly:
cached re-reads are cheap per token but paid on every single turn, so a big context is a
recurring tax, not a one-time cost.

**Method.** Four session profiles, swept over thresholds from 40K to the platform ceiling
(987K = window − 13,000). Context rot is modelled as a rework probability rising quadratically
with fill of a usable attention band. Sensitivity was run over rot band (80K–400K) and rework
severity (0.15–0.50), and as a control with rot switched off entirely. Full source:
`compact_sim.py` / `compact_sim2.py` in the pm-zero repo.

| Profile | Turns | Ctx growth/turn | Optimal threshold |
|---|---|---|---|
| A — quick fix | 15 | 3.5K | 100K (never compacts) |
| B — standard feature | 60 | 4.5K | 150K |
| C — nonstop code→deploy (§10) | 200 | 5.0K | **175K** |
| D — wide audit, read-heavy | 120 | 11K | 200K |
| **Weighted mix** (0.35/0.35/0.20/0.10) | | | **200K**, basin 150–200K |

**Results.**

```
threshold   penalty vs optimum        threshold   penalty vs optimum
   30,000        +372%                  200,000        +0.0%   <- optimum
   40,000        +362%                  250,000        +7.6%
   60,000        +345%                  300,000       +12.6%
   80,000         +72%                  400,000       +27.0%
  100,000         +33%                  500,000       +46.1%
  120,000         +11%                  700,000       +70.9%
  150,000          +2.4%                987,000       +99.3%
  175,000          +1.3%
```

Four findings, and the third is the one that changes the recommendation:

1. **The basin is flat between 150K and 200K** (everything within 5% of optimal). Inside that
   band the exact number barely matters. Outside it, it matters a great deal.
2. **The cliff is on the low side and it is a cliff, not a slope.** Below ~80K, compaction
   thrash dominates: the summarization call costs more than the context it saves, and the
   post-compact floor (~31K + base) means a 40K threshold re-compacts almost every turn — a
   +362% cost regime. The platform now detects this (auto-compact stops with an actionable
   error after three consecutive compacts refill the context), which is confirmation that the
   thrash regime is real enough to need a circuit breaker.
3. **Being too low costs more than being too high, at every comparable distance.** From the
   optimum, halving the threshold costs +33%; doubling it costs +27%. And the low side degrades
   *faster* thereafter. **v11.1's 15 (=150K) sat on the expensive edge of the basin.** It was
   not wrong; it was un-hedged.
4. **Context rot does not move the optimum much.** Sweeping the rot band from 80K to 400K and
   severity from 0.15 to 0.50 moves the optimum only between 150K and 200K. Turning rot off
   entirely still yields 200K. The optimum is driven mostly by the *cached-prefix-per-turn*
   term, not by rot. This matters because rot severity is the least certain input in the model —
   and the answer is robust to it.

**Independent corroboration.** Anthropic's own server-side compaction API defaults its trigger
to **150,000 input tokens** (Fact, documented). An independent cost simulation landing in a
150–200K basin and the vendor's own default landing at 150K is convergence, not coincidence:
both are answering the same question about the same cost structure. Note honestly that 150K is
at the *low* edge of the basin — so this is corroboration of the **band**, not of the point
estimate. The band is the finding; the point estimate is a choice inside it.

**The knob — and why v11, v11.1 and the first draft of v11.2 all reached for the wrong one.**

Every previous version wrote some form of "the invariant is an absolute size, not a percentage"
and then configured `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, a percentage. That is not a small
inconsistency; it produced two live defects:

1. **Scope.** The percentage is a single global value that applies to subagents as well as the
   main conversation. `15` meant 150K on Sonnet 5's 1M window — and **30K on every 200K-window
   model in the same session.** On a Pro plan that is Haiku 4.5 (every Explore subagent) **and
   Opus 5**, because Opus's 1M context requires usage credits, which pm-zero's budget rules out.
   The table above prices a 30–40K threshold at **+360%**. v11.1's own reviewer subagents were
   running in the thrash regime its own §8-5 warned about.
2. **Fragility.** The percentage is multiplied by whatever window the harness resolves, and that
   resolution has been wrong repeatedly (§17-2: a family of issues where a 1M model resolved as
   200K, fixed at least twice and re-reported after each fix).

Claude Code ships the knob that was actually wanted: **`CLAUDE_CODE_AUTO_COMPACT_WINDOW`**,
which sets the effective context capacity, in tokens, that the compaction maths runs against.
Set it and the default threshold formula (`effective window − 13,000`) does the rest, identically
on every model.

**Decision.**

```jsonc
// ~/.claude/settings.json  →  env
"CLAUDE_CODE_AUTO_COMPACT_WINDOW": "188000"   // 188,000 − 13,000 ≈ 175,000
// and NO CLAUDE_AUTOCOMPACT_PCT_OVERRIDE at all
```

> **Target an absolute working context of ~175K tokens, on every model, via one absolute key.**
> Anything in 150K–200K is within 5% of optimal; pick 175K. Never configure below 100K. If you
> must use the percentage instead, remember it applies to subagents too, and compute it against
> the *smallest* window in your routing table, not the largest.

**And the rule that outlives the number:**

> **Verify the firing point; do not trust the configuration.** A configured value is a claim
> about a number the harness computes. The transcript records the number itself. Check
> `compact_boundary` records in the session JSONL (`~/.claude/projects/*/*.jsonl`) and read
> `preTokens`. If it is not near 175K on both the main session and a subagent, the setting is
> not doing what you think.

This is C3's lesson in a different costume — *a configured value is not a measured value* — and
it applies to this document as sharply as it applied to RTK. The simulation below is a model,
not a measurement; §19-9 addresses that directly rather than hiding it.

### 9-4. The Session Budget Protocol

The Pro plan gives a rolling ~5-hour window plus a weekly cap, shared across models. Opus
consumes it faster than Sonnet; extended thinking fastest of all.

1. **One task per session.** One `tasks.md` node (or one ad-hoc fix). Finish, hand off, stop.
   §10 makes this reachable: the loop drives one task to `verified` without stopping.
2. **Plan/execute split for big features.** Plan in one session, `/handoff`, execute in a fresh
   one. Fresh context reasons better and costs less than a bloated one.
3. **Query the graph; do not read the tree.** `graph.mjs --impacted` before Haiku, Haiku before
   main-context reads, main-context reads never at scale. This replaces v11.1's rule 3 and it is
   strictly stronger.
4. **Workflows for wide fan-out, subagents for narrow.** The threshold is "would this force ≥2
   full compactions in the main context?"
5. **Effort discipline.** `medium` globally; raise per-task. Remember thinking blocks *persist*
   in context by default on current models — effort is a compounding tax, not a per-turn one.
6. **Background long commands.** `run_in_background` for builds/tests > ~1 minute. Subagents
   already run in the background by default; **shell commands still need the flag.**
7. **Batch human questions.** The PM Interview asks in rounds. Every round-trip is a full prompt.
8. **Compact at boundaries, not mid-investigation.** With the `PreCompact` hook this is safer
   than it was, but a checkpoint you chose is still better than one you were handed.
9. **Prompt-cache awareness — directionally, not dogmatically.** v11.1 said "the TTL is ~5
   minutes, so work in continuous bursts." The Anthropic API offers both 5-minute and 1-hour
   cache TTLs, and Claude Code's own idle-cleanup logic keys off a **60-minute** gap described
   as matching the server cache TTL. **Honest status: unverified which applies to your
   session.** The safe form of the rule survives either way: *step away at checkpoints, not
   mid-task.* Do not restructure your day around a 5-minute timer.
10. **Stop before the wall — now deterministically.** The `StopFailure` hook with matcher
    `rate_limit|overloaded` runs `budget-wall.mjs`: commit, write `HANDOFF-JA.md`, append the
    budget event to `docs/issues.md`. `StopFailure`'s output and exit code are ignored by the
    harness, so it cannot rescue the turn — but it can make sure the turn's work is on disk.
    This replaces "if the usage warning appears, checkpoint immediately," which required the
    agent to notice and remember.

### 9-5. What replaced RTK

RTK is removed (C3). What actually reduces tokens, in measured order of effect:

| Mechanism | Effect | Basis |
|---|---|---|
| G_code impact queries instead of exploratory reading | attacks acquisition cost | Reported (arXiv 2607.01929); TDAD 70% regression reduction |
| Dynamic workflows for wide operations | intermediate state never enters context | Fact (docs) |
| Haiku Explore subagents | only the summary returns | Fact |
| Path-scoped `.claude/rules/` instead of a fat `CLAUDE.md` | per-turn tax scales with relevance, not with rule count | Fact |
| Session-memory-aligned compaction | removes the summarization call | Inference |
| Right-sized autocompact (§9-3) | large vs a mis-set threshold; ~0 vs any value in the 150–200K band | Simulation (this document, §17-6) |
| `/effort medium` + fewer turns via Opus 5 on hard problems | thinking is the largest per-prompt driver | Fact + Reported |
| ~~RTK CLI compression~~ | **+7.6% at low effort, ±0% at high** | Reported (425-trial paired benchmark) |

**The rule this leaves behind (§1-1.8):** before adopting any token-saving tool, measure the
paired bill across a real task set. A tool's own counter grades its own homework — RTK's
reported 96.2M tokens saved coincided with a measured cost increase, because it counted a
counterfactual (full raw output) that the harness would have truncated anyway.

### 9-6. Memory layers

| Layer | Contents | Persistence | System of record for |
|---|---|---|---|
| Transcript | Everything said this session | Until compaction (~175K) | Nothing |
| Harness Task list | In-session mirror | Session | Nothing (but *is* the hook trigger surface) |
| Session memory notes | Structured session state | Session, survives compaction | Nothing — a compaction aid |
| Auto-memory (`MEMORY.md`) | Operator preferences, corrections, environment quirks | Cross-session, cross-project | Operator facts only |
| **Ledger + graph (git)** | vision, tasks, state, decisions, issues, repo-map, `docs/graph/` | Forever, versioned | **Everything project** |

Rule: if a fact matters to the project, it goes in a ledger file or the graph. If it matters to
how the agent should treat the operator anywhere, it goes in memory. Never both.

---

## 10. The Closed Coding Loop

**Requirement:** from "start implementing" to "deployed," the agent must not stop once, and it
must improve itself while running.

This is the section v11.2 exists for. Everything before it is infrastructure.

### 10-1. Why the obvious implementations fail

Four approaches are in circulation. Each fails on a $20 plan, for a specific reason.

| Approach | Mechanism | Why it fails here |
|---|---|---|
| **Prose** ("do not stop until done", v10–v11.1) | An instruction in `CLAUDE.md` | Compaction eats it; and even un-compacted, "done" is the agent's own judgment |
| **Native `/goal`** | A session-scoped prompt-based `Stop` hook: after each turn a small fast model judges whether the condition holds | The right *continuation* mechanism, and pm-zero uses it (§10-2). But the docs are explicit that the evaluator **"does not call tools, so it can only judge what Claude has already surfaced in the conversation."** It reads the transcript. If the agent says the tests pass, the evaluator has no way to disagree |
| **Promise token** (Anthropic's `ralph-wiggum` plugin) | `Stop` hook blocks unless the model emits `<promise>…</promise>` | The gate is a string the model controls. The plugin's own system message pleads *"ONLY when statement is TRUE — do not lie to exit!"* An honesty request is not a gate |
| **Blind blocking** (`{"decision":"block"}` unconditionally) | Never let it stop | Reported to burn an entire session quota in ~50 minutes. On a Pro plan this is the single most expensive failure mode available |

Note what `/goal` and the promise token have in common: **both trust the transcript.** That is
the gap pm-zero fills, and it is the only thing pm-zero adds to the native feature:

> **Use `/goal` for continuation. Add a deterministic `Stop` hook for the evidence, because a
> transcript-reading evaluator cannot check an exit code — and bound the whole thing below the
> platform's block cap so the clean exit always wins the race against the dirty one.**

### 10-2. The loop

Two cooperating mechanisms, each doing what only it can do:

| | `/goal` (native) | `loop.mjs` (pm-zero's `Stop` hook) |
|---|---|---|
| Provides | turn-level continuation, cheaply (Haiku evaluator, "typically negligible") | the evidence gate, the escalation ladder, the frontier advance, the clean exit |
| Judges | the transcript | `.claude/loop.local.json` cross-checked against `git rev-parse HEAD` |
| Scope | one session, cleared when met | every session in its settings scope |
| Can be fooled by | a confident claim in the transcript | nothing the model writes in prose |

```text
                    ┌───────────────────────────────────────┐
                    │  Stop hook fires (Claude wants out)     │
                    └────────────────┬──────────────────────┘
    .claude/loop.local.json absent? ─┴─ yes ──► ALLOW  (loop not armed — inert)
                                     │ no
              state.finished?      ──┴─ yes ──► ALLOW
                                     │ no
        iteration >= 6 (our cap)?  ──┴─ yes ──► ALLOW + issues.md + handoff   [exit 2]
                                     │ no
   stop_hook_active && iteration>=5 ─┴─ yes ──► ALLOW cleanly (platform cap imminent) [exit 5]
                                     │ no
         ┌───────────────────────────┴───────────────────────────┐
         │  read state.lastGate — the result the AGENT recorded   │
         │  stale if: no command | sha != HEAD | source dirty     │
         │            | older than 30 min                          │
         └───────────────────────────┬───────────────────────────┘
                       stale ────────┴──────── fresh
                         │                       │
             BLOCK: "commit, run       exit 0 ───┴─── exit != 0
             the gate, record it"        │              │
                              frontier empty?   signature == last?
                                yes → ALLOW [exit 1]   ├─ x1 → BLOCK: fix it + impacted tests
                                no  → BLOCK: advance   ├─ x2 → BLOCK: WEB-SEARCH the error
                                       to next node    ├─ x3 → BLOCK: Opus root-cause subagent
                                                       └─ x4 → ALLOW + blocked + handoff [exit 3]
```

**`loop.mjs` is shipped in this repo at `hooks/loop.mjs`** — 190 lines, zero dependencies (no
`jq`), Node ≥18, Windows-safe. It is verified against a 12-case matrix covering every branch
above plus corrupt state, unparseable stdin, and a source edit landing after the gate ran.

**Three design decisions that are easy to get wrong, and were:**

**(a) Do *not* branch on `stop_hook_active` alone.** The docs suggest exiting early when it is
true, as the simple way to avoid the platform's block cap. That advice makes the loop
**single-shot**: the flag is true from the second `Stop` onward, so an iteration cap of 12, a
repeat-signature counter, and the entire escalation ladder all become dead code that can never
execute. Anthropic's own `ralph-wiggum` plugin does not check the flag; it carries an iteration
counter in a state file. pm-zero does the same, and uses `stop_hook_active` only as a
corroborating signal near the cap. *This was a real defect in this document's first draft,
found by adversarial review — the loop terminated after exactly one forced continuation.*

**(b) Stay below the platform block cap, and treat its override as a real exit.**
**Claude Code overrides a `Stop` hook after 8 consecutive blocks** and ends the turn with a
warning; `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` (default 8, v2.1.143+) adjusts it. That override runs
*none* of pm-zero's cleanup — no handoff, no `issues.md` entry, no `blocked` status — so it is
the one exit that leaves the ledger lying. pm-zero therefore sets its own cap to **6**, two
below the platform's, so pm-zero's clean exit always fires first. Six also matches §9-3's
profile C rhythm better than the 12 an earlier draft assumed, and 12 was unreachable anyway.

**(c) Do *not* run the gate inside the hook.** Hooks are synchronous. A full test suite on a
16GB Windows laptop can exceed the hook timeout, and a timed-out `Stop` hook is a non-blocking
error that **allows the stop** — silently disabling the loop with no signal to anyone while the
ledger still says the task is running. It also contradicts §9-4 rule 6 (long commands go to the
background). So: **the agent runs the gate and records the result; the hook only reads it.**
That read is microseconds, and cross-checking the recorded `sha` against `git rev-parse HEAD`
catches the stale-result case that running it inline would have hidden.

**State file** — `.claude/loop.local.json`, **gitignored**, written by the agent, read by the hook:

```json
{
  "task": "T-14",
  "gate": "pnpm test -- test/auth",
  "frontier": ["T-15", "T-16"],
  "iteration": 0,
  "lastFailureSignature": null,
  "repeatCount": 0,
  "lastGate": {
    "command": "pnpm test -- test/auth",
    "exitCode": 1,
    "sha": "fd42a71b5a61a156",
    "at": "2026-07-27T09:14:00Z",
    "signature": "auth.expired-token",
    "output": "…trimmed…"
  }
}
```

`signature` is a normalized hash of the failure — test names plus error class, with paths,
timestamps and line numbers stripped — so "the same failure twice" is decidable rather than
judged.

**Hook output contract** (Fact): a `Stop` hook returns exit 0 with
`{"decision":"block","reason":…,"systemMessage":…}` on stdout, or exit 2 with the message on
stderr. `reason` becomes Claude's next input, which is why the impacted test set and the
escalation instruction go *there* and not into a file the agent might not read.

**Failure posture (M10).** `loop.mjs` **fails open, loudly**, on every internal error:
unparseable stdin (3-second timeout guarding Node #46601), corrupt state file, missing git,
unreadable paths. A broken loop hook must never make Claude Code unusable. The cost of failing
open is that the loop silently reverts to v11.1 behavior — which is why the hook writes a
one-line reason to stderr every time it does, and why §12 Phase 0.5 spot-checks it.

**Companion gate — `TaskCompleted`, and its honest limit.** The hook fires when an agent marks a
task complete via `TaskUpdate`, and exit code 2 prevents the completion and sends feedback. It
is worth having. But it only fires if the model chooses to call a tool that §3 itself describes
as an ephemeral mirror that is the system of record for *nothing* — so on its own it does not
make `verified` unforgeable. Two further controls close that:

1. **`loop.mjs` writes `verified`, not the model.** When the gate returns 0 and the sha matches
   HEAD, the loop rewrites the `tasks.md` row. The model's job is to make the gate green, not
   to declare that it is.
2. **A `PreToolUse` handler with `if: "Edit(tasks.md)"` rejects any diff that introduces the
   string `verified`.** The agent may write `done`; only the harness may write `verified`.

Without both, "`done` is a claim, `verified` is an exit code" is a slogan. With both, it is a
property. This distinction was flagged in adversarial review as the point where v11.2 came
closest to reinventing the promise token it criticizes — the criticism was correct, and the fix
is above rather than an argument that it did not apply.

### 10-3. The self-improvement loop inside the coding loop

Blocking a stop only helps if the next iteration is *better*. Three mechanisms, in order of when
they fire:

**(a) Impact-scoped feedback — before the edit.**

Before touching a file: `node scripts/graph.mjs --impacted src/auth/session.ts` returns the
test set that `graph/tests.json` says covers the affected symbols, transitively.

This is where the strongest evidence in the whole rebuild sits. TDAD, on SWE-bench Verified,
found:

- AST code–test graph + weighted impact analysis cut test-level regressions **6.08% → 1.82%
  (−70%)** and improved resolution 24% → 32%;
- **TDD prompting *without* graph context made regressions worse: 9.94%, above the 6.08%
  vanilla baseline;**
- an autonomous auto-improvement loop reached 60% resolution from 12% with **0% regression**.

The conclusion the authors draw is the design principle of §10:

> **Agents do not need to be told how to do TDD. They need to be told which tests to check.**
> Surfacing contextual information outperforms prescribing procedural workflows.

This is why v11.2 deletes procedural TDD prose from `CLAUDE.md` and replaces it with a graph
query. It is also a warning about this entire document: **instructions that tell the model how
to behave are weaker than facts that tell the model what is true.** Every prose rule in pm-zero
that could be replaced by a fact should be.

Three honest limits on the transfer: TDAD was evaluated on **Python only**, with **local 30–35B
models** (Qwen3-Coder 30B, 100 instances; Qwen3.5-35B-A3B, 25 instances), and the paper itself
notes smaller models benefit most from contextual scaffolding. The effect on Sonnet 5 / Opus 5
in a TypeScript project is **unmeasured and probably smaller**. What justifies the mechanism
here is not the effect size but the **cost asymmetry**: a `--impacted` query is a parser call
costing hundreds of tokens, against a regression that costs a review cycle plus a fix cycle.
Positive expected value holds at a tenth of the published effect. **Treat 70% as an upper bound,
not a forecast** — and §19-14.2 lists measuring it as open work.

**(b) Failure-signature escalation — during the loop.**

`lastFailureSignature` is a hash of the normalized gate output (test names + error class, with
paths/timestamps/line numbers stripped). Same signature twice in a row means the last iteration
learned nothing.

| Consecutive identical signatures | Action |
|---|---|
| 1 | Retry with the impacted-test set in the block reason |
| 2 | **Escalate:** web-search the exact error string; record the finding and its URL in `docs/issues.md` |
| 3 | **Escalate:** Opus 5 root-cause pass in a fresh subagent, given the diff, the failing output, and the graph neighborhood |
| 4 | **Stop honestly.** Mark the node `blocked`, write `HANDOFF-JA.md` in Japanese, move to the next frontier node if one exists, else end the session |

This is v11's 3-failure web-search rule, made deterministic and given two more rungs. The
important property is that it **never brute-force retries** — an escalation must change
something (new information, new model, or new approach) or the loop terminates.

**(c) Rule promotion — after the loop.**

A resolved recurring failure becomes a durable rule. v11.2 changes *where* the rule goes:

```text
Failure resolved
  -> root-cause it
  -> Does it apply to a specific part of the codebase?
       YES -> .claude/rules/<zone>.md with a paths: glob   <- NEW, the default
       NO  -> one line in CLAUDE.md (global or project)     <- now the exception
  -> Reference-level lesson    -> docs/lessons.md
  -> Operator-level lesson     -> auto-memory
  -> OS design issue           -> v11.x candidate, noted in docs/decisions.md
```

Path-scoping is the difference between a rule set that can grow and one that cannot. Under v11.1
every promoted rule was a permanent per-turn tax on every session, so the system had a hard
ceiling on how much it could learn before `CLAUDE.md` became the problem. Zone rules remove that
ceiling: a hundred zone rules cost nothing on a turn that touches none of their paths.

This is, quietly, the most consequential change in v11.2 for the *long-run* behavior of the
system. The graph makes the agent cheaper. Path-scoped rules make the agent's learning
sustainable.

### 10-4. Start to deploy, without stopping

```text
  arm:  write .claude/loop.local.json   { task, gate, frontier, iteration: 0 }
  then: /goal   <task acceptance criteria>, verified by `<gate>` exiting 0,
                or stop after 20 turns

  Phase A  Understand      graph.mjs --impacted <targets>       [a parser, no model reads]
  Phase B  Implement       edit within Write Scope
  Phase C  Gate            commit, run the Gate command, record exitCode + sha + signature
                           into .claude/loop.local.json
                           red -> Stop hook blocks -> back to B (with the impacted test set)
                           same signature repeats -> escalation ladder (§10-3b)
  Phase D  Review          Tier 0 always; Tier 1 on review classes;
                           Tier 2 (Opus 5) on the irreversible classes
  Phase E  Ship            push -> PR -> final verify -> graph.mjs --check
                           low/medium risk + green -> squash-merge + delete branch
                           high-risk class -> stop before the irreversible act,
                                              Japanese summary, human gate
  Phase F  Next node       frontier non-empty -> Stop hook blocks -> Phase A
                           frontier empty     -> allow stop -> HANDOFF-JA.md
```

Note that arming is two steps and both matter: the state file gives the hook something
deterministic to check, and `/goal` gives the session a native reason to take another turn.
Include the turn clause (`or stop after 20 turns`) — the docs recommend bounding a goal from
inside its own condition, and it is a fifth bound that costs nothing.

**Five ways the loop ends. Four are clean; the fifth is why the caps are set where they are.**

1. **Success** — frontier empty, gate green, merged. Handoff written.
2. **Iteration cap** — pm-zero's cap (6) reached. Node marked `blocked`, `docs/issues.md`
   entry, handoff written.
3. **Escalation exhausted** — four identical failure signatures. Same as (2), plus the
   root-cause analysis is attached.
4. **Budget wall** — `StopFailure(rate_limit|overloaded)` fires `budget-wall.mjs`: commit,
   handoff, `docs/issues.md` budget entry. The next session resumes from a committed state.
5. **Platform override (dirty)** — Claude Code overrides the `Stop` hook after 8 consecutive
   blocks and ends the turn with a warning. **None of pm-zero's cleanup runs**, because by
   definition the hook's decision was discarded. The ledger is then stale: `tasks.md` says
   `doing`, no handoff exists, `loop.local.json` still says the loop is armed.

Exit 5 is prevented, not merely documented: pm-zero's cap of 6 fires two blocks before the
platform's 8, and the `stop_hook_active && iteration >= 5` branch adds a second interception.
It should never occur. Because "should never" is not "cannot," **`SessionStart` reconciliation
is required**: on every session start, if `.claude/loop.local.json` exists and is not
`finished`, the previous session ended dirty — write the `docs/issues.md` entry and the handoff
that exit 5 skipped, *then* continue. That check is three lines and it is the difference between
a system that fails cleanly and one that fails quietly.

What there is still no way to reach: "the agent decided it was finished."

**What is still human-gated, and always will be:** irreversible real-world acts — real money,
production credentials, publishing personal data, destructive production operations. The loop
implements and reviews these fully, then stops *before* the irreversible step and surfaces a
Japanese summary. Autonomy is about removing the interruptions that carry no information, not
about removing the ones that do.

**Honest assessment of what this achieves.** "Never stops" is a property of the *harness*, not
a promise about outcomes. The loop guarantees that the agent will not stop while a gate is red
and will not claim success while a gate is red. It does not guarantee the gate is a good gate.
A weak `Gate` command produces a confidently-green loop around broken software — which is why
§14's Q7 (a bug fix gets a reproduction test; every feature gets a negative path) is load-bearing
in a way it was not before. **The loop makes the test suite the single point of failure of the
entire system.** That is a real and deliberate trade: it concentrates the risk somewhere a human
can inspect it, instead of diffusing it across every turn.

---

## 11. Self-Evolution Loop

```text
Failure occurs
  -> Log in docs/issues.md (symptom, context, attempted fix, failure signature)
  -> occurrence 1: retry with a corrected approach, guided by --impacted
  -> occurrence 2: WEB-SEARCH for a known fix
        -> Record finding + source URL in docs/issues.md
        -> Apply the fix
  -> occurrence 3: Opus 5 root-cause in a fresh subagent
  -> occurrence 4: STOP, mark blocked, HANDOFF-JA.md, surface to human
  (These are signature OCCURRENCE counts, matching loop.mjs exactly. §10-3b.)
  -> Root-cause any resolved recurring failure
  -> Promote a durable rule (§10-3c):
        - Scoped to a code region  -> .claude/rules/<zone>.md with paths:   [default]
        - Truly always-applicable  -> one line in CLAUDE.md                 [exception]
        - Reference-level lesson   -> docs/lessons.md
        - Operator-level lesson    -> auto-memory
        - OS design issue          -> v11.x candidate, noted in docs/decisions.md
  -> If the failure was a STALE GRAPH: regenerate, then fix scripts/graph.mjs.
     A graph that lies is a P1 defect (Structural Fidelity, §1-2).
  -> If the failure was BUDGET EXHAUSTION: root-cause what consumed the window.
     Budget overruns are failures too.
```

`docs/issues.md` template unchanged (Active Issues / Resolved with root cause / Promoted Rules),
plus a `Signature` column so §10-3b can match against it across sessions.

---

## 12. PM Agent Execution Protocol

### Phase 0 — Toolchain verification

```powershell
claude --version; node --version; pnpm --version; git --version; rg --version
```

Verify only what the task needs. RTK is no longer part of the toolchain (C3).

**Record the Claude Code version in `docs/state.md`.** If the *minor* version has moved since
the last recorded value, re-verify the §17 [F] claims before trusting them — especially the
subagent spawn depth, the Stop-hook block cap, and the compaction keys. C1 exists because "leave
it at the default" was true on 2026-07-23 and false on 2026-07-24, and nothing was watching.

### Phase 0.5 — Self-audit

- `~/.claude/settings.json` has `permissions.defaultMode: "bypassPermissions"`. No top-level
  `permissionMode` key anywhere.
- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` is **explicitly 1** (C1 — the platform default is 3).
- `permissions.allow` is `["*"]` (§8-2) — or, if you keep an enumeration, it has been
  re-checked against the current tools reference this release, because workflow subagents prompt
  on anything missing and the tool list grows (C2/M1).
- `guard.mjs` exists and blocks the hard-limit set (spot-check one case if in doubt).
- Loop hooks present: `Stop` → `loop.mjs`, `StopFailure(rate_limit|overloaded)` →
  `budget-wall.mjs`, `PreCompact` → `checkpoint.mjs`.
- **`docs/graph/` exists and is fresh.** `node scripts/graph.mjs --check` exits 0.
- **Autocompact verified empirically**, not assumed: `CLAUDE_CODE_AUTO_COMPACT_WINDOW` is set,
  `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` is **absent**, and `compact_boundary` `preTokens` in the
  session JSONL lands near 175K — **checked on a subagent transcript as well as the main one**
  (§9-3, C5).
- `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` is set and pm-zero's own cap in `loop.mjs` is strictly below
  it. Loop hooks spot-checked: pipe a synthetic Stop event through `loop.mjs` and confirm it
  blocks on a red gate and allows on a green one.
- `tasks.md` / `state.md` / `vision.md` responsibilities not mixed; every `ready` task has a
  runnable `Gate`.
- Project `CLAUDE.md` lean; zone-specific rules live in `.claude/rules/` with `paths:`.
- Generated/build/vendor files ignored. `.claude/loop.local.json` gitignored.
- Model routing references no unavailable model as a hard dependency.

### Phase 1 — PM Interview

Read `myself-info.md` first (GitHub account, OS, editor, project root, hardware) — never re-ask
what it answers. Then gather purpose, target users, success criteria, primary flows,
constraints, failure cases, priorities. Ask in batched rounds. When 3+ HIGH assumptions
accumulate, ask immediately.

### Phase 2 — Vision, graph, and task generation

1. Update `docs/vision.md`.
2. **Generate `docs/graph/`** (`node scripts/graph.mjs --init`) and render `docs/repo-map.md`.
   On a greenfield project the graph is nearly empty; that is correct, and it grows with the
   code rather than being reconstructed later.
3. Generate/update `tasks.md`: every `ready` task fully specified **including its `Gate`**.
4. Initialize `docs/state.md` with branch and next active task.
5. Seed `.claude/rules/tests.md` only. Add zone rules when a zone earns one, not before.

### Phase 3 — Implementation (the Coding Loop, §10)

- Read `CLAUDE.md`, `docs/state.md`, `docs/decisions.md`, repo-map Summary. Nothing else.
- `graph.mjs --impacted` before editing. Delegate wide reading to Haiku; wide mechanical
  operations to a workflow.
- Respect `writes` scopes; small diffs; tests for new behavior.
- Checkpoint + commit after each logical unit. Long builds/tests in background.
- The loop drives Phases A–F without stopping.

### Phase 4 — Verification

quick / standard / final per §15. Record task ID, gate command, exit code, evidence.

### Phase 5 — Self-review

Tiered per §7-6. Record reviewer model, tier, and result in `tasks.md` Review Notes. If Tier 2
was substituted by Tier 1 (Opus unavailable / budget), record that too.

### Phase 6 — Git and handoff

Full git workflow (§16) automatically. Report in Japanese via `HANDOFF-JA.md`.

### Phase 7 — Self-evolution promotion

Per §11. Additionally: if the session approached the budget wall, note what consumed it in
`docs/issues.md`; if the graph was stale at any point, that is a P1 entry.

---

## 13. Standard File Specs

### 13-1. Project `CLAUDE.md` template (v11.2)

Deliberately *shorter* than v11.1's, because zone-specific content moved to `.claude/rules/`
and procedural TDD prose was replaced by a graph query (§10-3a).

```markdown
# CLAUDE.md -- pm-zero v11.2 (Claude Code only, Windows PowerShell, Pro plan)

## Language
- Reports, error reports, manual confirmation requests: Japanese.
- Code identifiers: English.
- When 3+ HIGH assumptions accumulate, ask immediately (batched).

## Source of Truth (read on demand)
- Intent: docs/vision.md | Tasks: tasks.md | State: docs/state.md
- Decisions: docs/decisions.md | Failures: docs/issues.md
- Structure: docs/graph/ (generated) | Map: docs/repo-map.md
- Zone rules: .claude/rules/*.md -- they load when you READ a matching file.
  Before editing a governed path, read its rule file. graph/zones.json lists
  which globs are governed. (Editing alone does not load them.)
- Report: HANDOFF-JA.md

## Startup Read
- This file, docs/state.md, docs/decisions.md, docs/repo-map.md Summary. Nothing else.

## Structure First (the graph)
- Before editing: node scripts/graph.mjs --impacted <files>
  It returns the tests at risk. Run them. It is a floor, not a ceiling --
  the final gate is always pnpm verify.
- Never read many files to work out what depends on what. Query the graph.
- After a structural change the graph refreshes automatically (PostToolUse).
  If the graph disagrees with reality, the graph is wrong: regenerate, then
  log a P1 in docs/issues.md if it is still wrong.

## Budget (Pro plan, hard wall)
- One task per session. Plan -> /handoff -> execute for big features.
- Sonnet 5 by default. Haiku for wide reading. Opus 5 for top-risk review.
  On hard problems raise Sonnet's effort FIRST; Opus only if that fails.
  Opus 5 has a 200K window on this plan (1M needs credits). Never block on a model.
- Wide mechanical work (>15 files): a SAVED /workflow command if one exists.
  You cannot author a new workflow yourself -- the ultracode keyword only works
  from a human-typed prompt. Queue it for the next attended session instead.
- Long builds/tests in background. Batch questions. /effort medium unless earned.

## Continuity (auto-compact at ~175K, set via CLAUDE_CODE_AUTO_COMPACT_WINDOW)
- Checkpoint to tasks.md + docs/state.md and commit after each logical unit.
- When compacting, always preserve: active task ID, the Gate command and its
  last exit code, modified files, and any unresolved failing-gate signature.
- Keep this file lean. Zone-specific rules belong in .claude/rules/ with paths:.

## Autonomy
- bypassPermissions is active; never ask permission for tool calls.
- The global guard hook blocks the dangerous set; if blocked, do not work around it.
- Human gate only for irreversible real-world acts (real money, prod credentials,
  publishing personal data, destructive production operations).

## Task Ledger (the work graph)
- tasks.md is the only execution ledger; main agent is the only writer.
- Every ready task: owner, depends-on, write scope, acceptance, GATE, evidence.
- "done" is a claim. "verified" is an exit code. Only the harness writes verified.

## Parallelism
- Disjoint write scopes, or isolation: "worktree". Same file -> serialize.
- Default <=2 concurrent workers; a global env ceiling caps total concurrent
  subagents; nested spawning is pinned to depth 1.

## The Coding Loop
- Do not stop while the active task's Gate is red. The Stop hook enforces this.
- After each gate run, record command/exitCode/sha/signature in
  .claude/loop.local.json. The Stop hook reads it; it does not run the gate.
- Signature occurrence 2 -> web-search the error and record the URL.
- Occurrence 3 -> Opus 5 root-cause in a fresh subagent.
- Occurrence 4 -> mark blocked, write HANDOFF-JA.md, move on. Never brute-force retry.

## Self-Review (no human reviewer)
- Tier 0: the Gate + verify + tests + lint + the impacted test set (always).
- Tier 1: fresh-context Sonnet 5 subagent (300+ line diff, new external API,
  critical-workflow change, and all Tier 2 classes).
- Tier 2: fresh Opus 5 subagent (auth, billing, DB schema, RLS/permissions,
  deploy, security, production data, personal information).
  If unavailable: Tier 1 at high effort; record the substitution.

## Self-Evolution
- Log failures in docs/issues.md with a failure signature.
- Promote a resolved recurring failure to .claude/rules/<zone>.md with a paths:
  glob. Only a truly universal rule goes in this file.

## Engineering Role
- Principal-level full-stack engineer. Readable, testable, minimal, correct code.
- No placeholder code or TODOs. Every committed function works.

## Thinking Protocol
- Decompose into atomic subtasks; challenge assumptions; simplest correct solution.
- Compare 3 implementation skeletons (correctness, simplicity, testability, cost).
- Verify the real call shape of an external API/library before using it.
- Short progress checks, not one long reasoning dump.

## Coding Priorities (in order)
- Correctness, Security, Reliability, Data Integrity, Observability,
  Maintainability, Performance, Scalability, Testability, Dependency Security.

## Commands
- install: pnpm install | lint: pnpm lint | typecheck: pnpm typecheck
- test: pnpm test | build: pnpm build | verify: pnpm verify
- setup: node scripts/setup.mjs | graph: node scripts/graph.mjs
- Use only commands that exist in this repository.

## Shell
- PowerShell for all operations. Windows backslash paths in the shell;
  FORWARD slashes in hook command paths in settings.json.

## Git (full auto)
- Never commit to main. Branch per task: <type>/<short-description>.
- Commit after each logical unit; push after every commit; auto-PR to main.
- Stage only Write-Scope files. Never stage .env* or secrets.
- Merge: final verify green + fresh-context self-review passed.
  Low/medium risk: squash-merge + delete branch.
  High-risk classes: stop before irreversible side effects; Japanese summary.

## Execution Boundaries
- Handle every error explicitly. Safe values only in output.
- .env.example is the template; runtime reads actual env values.
- Irreversible real-world acts are human-gated. Everything else is AI-executed.
```

### 13-2. `.claude/rules/tests.md` (the one rule every project starts with)

```markdown
---
paths:
  - "test/**"
  - "tests/**"
  - "**/*.test.*"
  - "**/*.spec.*"
---
# Test zone rules
- A bug fix without a reproduction test is not a fix. Write the failing test first,
  watch it fail, then fix.
- Every new feature gets at least one negative path.
- Never weaken an assertion to make a test pass. If a test is wrong, fix the test
  in its own commit with the reason in the message.
- Never delete or skip a test to reach green. The Coding Loop reads exit codes;
  a skipped test is a lie told to a machine that cannot detect it.
```

That last rule exists because §10 makes the test suite the loop's single point of failure
(§10-4). It is the highest-leverage four lines in the whole rule set.

### 13-3. Other templates

`docs/vision.md`, `docs/state.md`, `HANDOFF-JA.md` and the README rules are unchanged from v10.
Two `HANDOFF-JA` additions:

- 自己レビュー records `レビューティア: Tier 1 (Sonnet 5) / Tier 2 (Opus 5) / Tier 2→1 代替`
- new ループ結果 section: `終了理由: 完了 / 反復上限 / エスカレーション上限 / 予算上限`,
  with the iteration count and the last failing signature if any.

---

## 14. Quality Gates (14 gates)

Q1 **Correctness** — acceptance met; no placeholders; real repo examples before editing.
Q2 **Spec** — vision carries intent; 3+ HIGH assumptions confirmed first.
Q3 **Task Ledger** — active work maps to a task ID; every ready task has a runnable `Gate`.
Q4 **Maintainability** — ~300 lines/file, ~50 lines/function targets; 300+ line diffs split or
   justified in `decisions.md`.
Q5 **Architecture** — one-direction dependencies, **checked against `graph/modules.json`**, not
   asserted. A new edge that reverses the dependency direction is a Q5 failure.
Q6 **Performance** — hot paths lean; deferrals documented.
Q7 **Test/Testability** — new features tested; bug fixes get reproduction tests; 1+ negative
   path. **Elevated in v11.2:** the Coding Loop's exit condition is the test suite, so a weak
   suite is a systemic defect, not a local one (§10-4).
Q8 **Reliability** — every error handled; failure-signature escalation followed, never
   brute-force retry; escalations recorded.
Q9 **Security** — safe output values; guard hook active; Tier 1/2 review for mandatory classes;
   auth/data zone rules loaded and honored.
Q10 **Data Integrity** — reversible migrations or documented rollback; destructive ops logged.
Q11 **Observability** — structured logs; secret redaction; failures traceable.
Q12 **Dependency Security** — deps justified and pinned; lockfile committed; vuln scan when
   available. **The graph adds no runtime dependency** — if `scripts/graph.mjs` needs one, it is
   a dev dependency or it is not built.
Q13 **Handoff** — Japanese; task IDs; verification evidence with exit codes; loop termination
   reason; unverified items explicit.

**Q14 (new) — Structural Fidelity.** `docs/graph/` matches the tree. `node scripts/graph.mjs
--check` exits 0 before merge. A stale graph silently degrades every impact query downstream, so
it is gated like a test, not like a doc.

---

## 15. Verification Modes

- **quick** — docs, copy, low-risk config: confirm changed files, task ID, `git diff --check`,
  targeted tests only if the graph says something is impacted.
- **standard** — normal implementation: the task's `Gate`, the impacted test set, lint,
  typecheck, build; update evidence with exit codes.
- **final** — pre-merge/push/deploy: `pnpm verify`, `graph.mjs --check`, e2e when available,
  browser smoke for UI, reconcile ledgers against git reality, run the §7-6 self-review.

---

## 16. MCP Policy and Git Workflow

### 16-1. MCP policy

No `.mcp.json` by default. Add MCP only for a concrete need, from official docs or a trusted
registry, with the reason in `docs/decisions.md`. Under `bypassPermissions` connected servers
work immediately in the main session — **but add their tools to the allow list anyway** (C2), or
they will prompt inside a workflow. Dangerous capabilities are gated by the agent's risk
classification, not by per-tool prompts.

**A note on graph MCP servers.** Serena (MCP + LSP, symbol-level retrieval and editing, 40+
languages, ~27K stars) is the most credible off-the-shelf way to give an agent a live semantic
code graph, and it is a genuinely strong tool. pm-zero does not adopt it by default for three
reasons: it adds a Python/uv runtime and a language-server process to a 16GB Windows laptop;
its per-call cost is a live MCP round-trip rather than a cached static file; and `graph/tests.json`
— the view that carries the measured correctness benefit — is not what an LSP is optimized to
answer. **Adopt Serena when the project outgrows the static graph** (large polyglot repo, heavy
cross-file refactoring), record it in `docs/decisions.md`, and add its tools to the allow list.
This is a scale threshold, not a rejection.

### 16-2. Git and GitHub workflow

- **Branches:** never commit to `main`; `<type>/<short-description>`; branch at task start.
- **Commits:** after each logical unit (= continuity checkpoint); `<type>: <description>`;
  stage only Write-Scope files; never stage `.env*`/secrets; no placeholder code.
  `docs/graph/` is committed with the change that altered it — a graph commit that lags its
  code commit is a Q14 failure.
- **Push:** after every commit (`git push -u origin <branch>` first, then `git push`).
- **Pre-push security:** confirm `.gitignore` covers secrets and `.claude/loop.local.json`;
  `gitleaks git --no-banner` when available. A pushed secret is public within seconds.
- **PR:** auto-open on branch completion; conventional title; body carries what/why + review
  result + verification evidence with exit codes + loop termination reason.
- **Merge:** gate on final verify green **and** fresh-context self-review passed (§7-6 tiers)
  **and** `graph.mjs --check` clean. Low/medium risk: squash-merge + delete branch. High-risk
  classes: implement and review fully, but stop before any irreversible real-world side effect
  and surface a Japanese summary. Force-push and history rewrites are blocked by the guard hook.

---

## 17. Platform Facts and Sources

Marked **[F]** Fact (vendor-documented or changelog), **[R]** Reported (third-party measurement
or vendor benchmark claim), **[I]** Inference (reverse engineering or reasoning from evidence).
Re-verify **[F]** on major releases.

### 17-1. Claude Code platform

- **[F]** Settings hierarchy: managed policy → CLI args → project `.claude/settings.local.json`
  → project `.claude/settings.json` → user `~/.claude/settings.json`. The permission mode key is
  `permissions.defaultMode`.
- **[F]** Hook events include `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`,
  `PostToolUseFailure`, `PostToolBatch`, `SubagentStart`, `SubagentStop`, `TaskCreated`,
  `TaskCompleted`, `Stop`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `FileChanged`,
  `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `SessionEnd`.
  `PreToolUse` fires in every permission mode including for subagents; exit code 2 blocks and
  returns stderr to the model. The `if` field on a handler uses permission-rule syntax to avoid
  spawning the process when it cannot match. — code.claude.com/docs/en/hooks
- **[F]** `Stop` supports `{"decision":"block","reason":…,"systemMessage":…}` on stdout at exit
  0, or exit 2 with stderr. `StopFailure` fires when a turn dies on an API error, with matchers
  including `rate_limit`, `overloaded`, `authentication_failed`, `billing_error`; **its output
  and exit code are ignored** (it can persist work, it cannot rescue the turn).
  — code.claude.com/docs/en/hooks
- **[F]** `stop_hook_active` is **"`true` when Claude Code is already continuing as a result of
  a stop hook."** The docs' suggested pattern is to exit early when it is true — which makes any
  multi-iteration loop single-shot, since the flag is true from the second `Stop` onward. The
  docs' own alternative — *"or process the transcript"* — and Anthropic's `ralph-wiggum` plugin
  (which carries an iteration counter and does not check the flag) are the patterns that
  actually support a loop. §10-2(a).
- **[F]** **Claude Code overrides a `Stop` hook after 8 consecutive blocks** and ends the turn
  with a warning. `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` (v2.1.143+, default 8, `0` disables the cap)
  adjusts it. The override discards the hook's decision, so no hook cleanup runs. §10-2(b), §10-4
  exit 5.
- **[F]** **`/goal <condition>`** (v2.1.139+) sets a completion condition; after every turn a
  small fast model (Haiku by default) judges it and, if unmet, starts another turn with the
  evaluator's reason as guidance. It **is a wrapper around a session-scoped prompt-based `Stop`
  hook**. Key limit: **"The evaluator … does not call tools, so it can only judge what Claude
  has already surfaced in the conversation."** Condition ≤4,000 chars; bound it from inside with
  a clause like `or stop after 20 turns`; `/goal` alone shows status, `/goal clear` cancels;
  restored on `--resume`; works under `-p`. Unavailable when `disableAllHooks` is set.
  Hook handlers may also be **prompt-based or agent-based**, not only shell commands.
  — code.claude.com/docs/en/goal, /hooks-guide
- **[F]** `TaskCompleted` exit code 2 prevents the completion and sends feedback;
  `TaskCreated` exit 2 prevents creation. — code.claude.com/docs/en/hooks
- **[R]** A `Stop` hook that blocks unconditionally can consume an entire session quota — a
  reported case ran ~50 minutes. — anthropics/claude-code issue #55754
- **[F]** Anthropic ships a reference implementation of the block-the-stop loop in the
  `ralph-wiggum` plugin: markdown-frontmatter state file, `iteration`/`max_iterations`,
  `completion_promise` matched against a `<promise>` tag, fail-open on every parse error, and a
  system message reading *"ONLY when statement is TRUE — do not lie to exit!"* —
  github.com/anthropics/claude-code `plugins/ralph-wiggum/hooks/stop-hook.sh`
- **[F]** `andylizf/nonstop` (MIT, ~263 stars) is a two-file autonomous-work mode: pre-flight
  risk assessment, dangerous-ops manifest, session-scoped flag file, `NONSTOP_MAX` nudge cap
  (default 5), `stop_hook_active` guard.
- **[F]** **Dynamic workflows**: a JavaScript orchestration script the runtime executes in the
  background; "the script holds the loop, the branching, and the intermediate results itself, so
  Claude's context holds only the final answer." Requires v2.1.154+. **On Pro they are off by
  default and are enabled in the Dynamic workflows row of `/config`.** Under `bypassPermissions`
  the launch prompt never appears. **Workflow subagents always run in `acceptEdits` and inherit
  the tool allowlist regardless of session mode; shell commands, web fetches and MCP tools
  outside the allowlist can still prompt mid-run.** Invoked with the `ultracode` keyword or
  natural language; `/effort ultracode` (v2.1.203+) makes it the session default. Runs are
  saved as commands via `/workflows` → `s` into `.claude/workflows/`. Docs warn workflows
  "consume substantially more tokens than a typical Claude Code session."
  — code.claude.com/docs/en/workflows
- **[F]** `workflowSizeGuideline` settings key; dynamic workflows default to a medium size
  guideline (aim for fewer than 15 agents). — changelog
- **[R]** Bun was ported from Zig to Rust with dynamic workflows: ~750,000 lines, 11 days, 99.8%
  of the existing test suite passing, "hundreds of agents working in parallel with two reviewers
  on each file," followed by "a fix loop [that] drove the build and test suite until both ran
  clean." — claude.com/blog/introducing-dynamic-workflows-in-claude-code
- **[F] C1** "Subagents can now spawn nested subagents up to **depth 3 by default** (was 1); set
  `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` to disable nesting." — changelog, same release as
  Opus 5. This reverses the v11.1 assumption.
- **[F]** `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` caps all concurrently-running subagents of
  every role (platform default 20). `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` default 200.
  `--max-budget-usd` denies new spawns and halts running background subagents at the cap; its
  effect under a flat Pro subscription is **[I]** unverified.
- **[F]** Subagents inherit the parent's permission mode (Task `mode` deprecated); they run in
  the background by default; a subagent cut off by a rate limit or server error returns output
  it had already produced. `/code-review` runs as a background subagent.
- **[F]** `.claude/rules/*.md` — path-scoped instructions with a `paths:` frontmatter glob,
  discovered recursively, loaded only when Claude works with matching files.
  `InstructionsLoaded` fires for `CLAUDE.md` and `.claude/rules/*.md`.
  — code.claude.com/docs/en/memory
- **[F]** Agent teams are experimental and disabled by default
  (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`); the docs state they "use significantly more tokens
  than a single session." — code.claude.com/docs/en/agent-teams
- **[F]** The Agent tool supports `isolation: "worktree"` and `run_in_background`;
  Bash/PowerShell support `run_in_background`. Two worktree escapes were fixed in the current
  line: worktree-isolated subagents redirecting git into the shared checkout via `git -C`,
  `--git-dir`, `GIT_DIR`/`GIT_WORK_TREE`; and worktree sessions landing in another project's
  leftover worktree. — changelog
- **[F]** `fallbackModel` (settings.json, up to 3 models) is tried in order when the primary is
  **overloaded or unavailable**. Auth, **rate-limit**, request-size and transport errors surface
  immediately and do **not** trigger fallback. Added v2.1.166.
- **[F]** With `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`, Windows shell work uses a `PowerShell` tool
  with its own permission-rule namespace, separate from `Bash(...)`.
- **[F]** Windows: paths with `\u`-prefixed segments (`C:\Users\unicorn`) were being corrupted
  into CJK characters in tool inputs; fixed. `CLAUDE_CODE_GIT_BASH_PATH` is now ignored with a
  warning when it does not point at a bash/sh binary. — changelog
- **[F]** `/handoff` compacts a session into a pickup document. Auto-memory persists `MEMORY.md`
  across sessions. Deferred tools via ToolSearch keep unused schemas out of upfront context.

### 17-2. Compaction and context

- **[F]** `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (1–100) shifts the auto-compaction trigger, **as a
  percentage**, and **applies to subagents as well as the main conversation**. It is therefore
  computed against each model's own window: one global value means different absolute thresholds
  per model in the same session.
- **[F]** **`CLAUDE_CODE_AUTO_COMPACT_WINDOW`** sets the context capacity **in tokens** used for
  auto-compaction calculations; the percentage override, if also set, applies to *this* value.
  This is the absolute knob. pm-zero sets `188000` and no percentage.
- **[I]** The threshold is computed as `min(floor(window × pct/100), window − 13000)` — so the
  percentage override can only **lower** the threshold, never raise it. Sourced to a
  deobfuscation in anthropics/claude-code issue #31806, **not to documentation**; downgraded
  from [F] to [I] on review.
- **[F/R]** A recurring bug class where a 1M-context model resolved its window as 200K and fired
  auto-compact at ~195K regardless of the configured override. Issues #31806, #36381, #52519,
  #53358, #53801 (the last with a six-compaction transcript table: preTokens 192.5K–196.5K,
  postTokens 30.2K–32.9K). A fix shipped ("Fixed Opus 4.7 sessions showing inflated `/context`
  percentages and autocompacting too early; it was computing against 200K instead of Opus 4.7's
  native 1M token context window") and the class was re-reported after previous fixes. **Verify
  empirically.**
- **[F]** Auto-compact thrash is now detected: "Fixed the autocompact thrash loop by detecting
  context refill after three consecutive compacts and stopping with an actionable error."
  `/context` was fixed to stop reporting stale pre-compact usage after compacting. — changelog
- **[F]** **Anthropic's server-side compaction API (`compact_20260112`) defaults its trigger to
  `{"type":"input_tokens","value":150000}`**, minimum 50,000, with an `instructions` parameter
  that completely replaces the default summarization prompt. Supported on Opus 5, Sonnet 5,
  Fable 5, Opus 4.6–4.8, Sonnet 4.6. Beta header `compact-2026-01-12`.
  — platform.claude.com/docs/en/build-with-claude/compaction
- **[F]** Context editing (`context-management-2025-06-27`): `clear_tool_uses_20250919` clears
  old tool results and **invalidates the cached prefix**, so `clear_at_least` should be set high
  enough to be worth the cache write; `clear_thinking_20251015` manages thinking blocks, and
  **the default for Sonnet 4.6+ and Opus 4.5+ is to keep all prior thinking**.
  — platform.claude.com/docs/en/build-with-claude/context-editing
- **[I]** Claude Code's internal cascade, from two independent teardowns: (0) tool results over
  ~50K chars persisted to disk with a ~2KB preview, `Read` exempt; per-message tool_result
  aggregate cap ~200K chars; (1) cached microcompact deleting old tool results via server-side
  cache edits *without* invalidating the prefix; (2) time-based microcompact after a ~60-minute
  idle gap (described as matching the server cache TTL); (3) session-memory compact using a
  background-maintained structured notes file **as the summary, with no summarization call** —
  template user-overridable at `~/.claude/session-memory/config/template.md`, ~2000 tokens per
  section and ~12000 total, keeping a recent tail of ≥10K tokens / ≥5 text messages and ≤40K;
  (4) full LLM compact as the fallback. — finisky.github.io teardown; 0xtresser
  "Claude Code VS OpenCode" ch. 5.3. **Mechanism is Inference; direction is reliable.**
- **[F]** Anthropic, *Effective context engineering for AI agents*: context is a finite
  "attention budget"; **context rot** degrades recall as the window fills; the three long-horizon
  techniques are **compaction, structured note-taking, and sub-agent architectures**; aim for the
  smallest set of high-signal tokens; Claude Code drops `CLAUDE.md` in up front and retrieves the
  rest just-in-time. — anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **[F]** Anthropic, *Effective harnesses for long-running agents*: reliability is governed by
  the harness around the model, not the model alone.

### 17-3. Models (2026-07-27)

- **[F]** **Claude Opus 5** released 2026-07-24. $5/$25 per MTok (unchanged from Opus 4.8);
  **fast mode $10/$50**. 1M context (default and maximum, no smaller variant), 128K max output,
  thinking on by default. "The new default model on Claude Max, and **the strongest model on
  Claude Pro**." State-of-the-art on Frontier-Bench v0.1 and GDPval-AA; behind Mythos 5 on
  cybersecurity. Added to Claude Code as `claude-opus-5`, now the default Opus model.
  — anthropic.com/news/claude-opus-5; changelog
- **[R]** Opus 5 efficiency claims from Anthropic's launch post and its named early-access
  partners: "more than doubles Opus 4.8's performance [on Frontier-Bench] at a lower cost per
  task"; within 0.5% of Fable 5's peak CursorBench 3.2 score at half the cost per task; one legal
  partner reports "similar performance while generating **26% fewer tokens** on average compared
  to Opus 4.8 at max reasoning"; one finance partner reports "**a third fewer turns and tool
  calls and 60% less time**"; one trading partner reports "roughly **a seventh of the reasoning
  tokens** and under half the latency of Opus 4.8." **These are vendor-published partner claims,
  not measured here.**
- **[F]** **Claude Sonnet 5**: Claude Code default since 2026-06-30, native 1M context, intro
  pricing $2/$10 through 2026-08-31 then $3/$15.
- **[F]** **1M context availability by plan.** Opus is auto-upgraded to 1M on Max, Team and
  Enterprise; **on Pro, Opus 1M requires usage credits.** Sonnet 4.6 with 1M requires credits on
  *every* plan including Max. Sonnet 5's 1M does not. 1M uses standard pricing with no premium
  beyond 200K. **Consequence for pm-zero: on a credit-free Pro plan Opus 5 is a 200K model.**
  — support.claude.com / code.claude.com/docs/en/model-config
- **[F]** Haiku 4.5 $1/$5. Fable 5 $10/$50 — its temporary Pro window closed 2026-07-07;
  design-time only, never in runtime routing.
- **[F]** Extended thinking bills at output rates.
- **[I] Not found in any source:** a published ratio between subscription *rate-limit weight* and
  API price. v11.1's "~5×" and this document's first draft "~2.5×" were both unsourced. §7-2 now
  claims only an ordering.

### 17-4. Graph engineering — the evidence base

- **[R]** **TDAD: Test-Driven Agentic Development — Reducing Code Regressions in AI Coding
  Agents via Graph-Based Impact Analysis** (arXiv 2603.17973). AST-derived code–test dependency
  graph + weighted impact analysis, delivered as "a static test map and a 20-line instruction
  file," requiring "only `grep` and `pytest` at runtime, with no graph database, MCP server, or
  API calls." On SWE-bench Verified: regressions **6.08% → 1.82% (−70%)**, resolution 24% → 32%;
  **TDD prompting alone *raised* regressions to 9.94%**; an autonomous auto-improvement loop
  reached 60% resolution from 12% with 0% regression. Conclusion: *"agents do not need to be told
  how to do TDD; they need to be told which tests to check"* — surfacing contextual information
  outperforms prescribing procedural workflows. **Evaluated with Qwen3-Coder 30B (100 instances)
  and Qwen3.5-35B-A3B (25 instances), Python only.** Transfer to frontier models on TypeScript is
  unmeasured and probably smaller.
- **[R]** **DUALVIEW / "Beyond Textual Repository Exploration"** (arXiv 2607.01929, 2026-07-02).
  Four graph views — Module Coupling, Function Call, Class Hierarchy, Program Dependence —
  exposed through a queryable interface. Reports that on SWE-bench Verified, **"simply reading
  repository files (via tools such as grep and cat) accounts for 76.1% of a coding agent's token
  budget."** Argues that serializing graph topology into linear text loses exactly the multi-hop
  connectivity the agent needs.
- **[R]** **Code Graph Model (CGM)** (arXiv 2505.16901): repository code graph integrated into
  the LLM attention mask plus an agentless Graph-RAG framework; 43.00% on SWE-bench Lite with an
  open-weight model. Establishes that graph structure is a first-class signal, not a retrieval
  convenience.
- **[R]** Prior art the above build on: RepoGraph (ICLR 2025), CodexGraph (NAACL 2025), code
  property graphs (Yamaguchi et al. 2014), GraphRAG (Edge et al. 2024), GRACE (2025).
- **[R]** **METR**: roughly half of SWE-bench-passing patches would not be merged by real
  maintainers. **Ehsani et al.**: across 33k agent-authored pull requests, CI/CD failures and
  regression are among the most common rejection reasons. Both cited via TDAD §1. Together they
  are the empirical case for §10's evidence gate: resolution rate is not merge-worthiness.
- **[R]** **Graph engineering as a discourse**: Peter Steinberger's 2026-07-18 post ("Are we
  still talking loops or did we shift to graphs yet?") and the org-graph / work-graph
  distinction that emerged in its thread. pm-zero adopts the *vocabulary* and the org/work split;
  it rejects the accompanying tooling advice (graph databases, deep agent hierarchies, always-on
  multi-agent orgs) as inapplicable to a cost-capped solo operator. Note the source quality:
  this material lives mostly in SEO-optimized secondary blogs; the primary artifacts are the
  posts themselves, and the load-bearing claims in §2 rest on the arXiv work and the Claude Code
  docs, not on the commentary.
- **[F]** **Serena** (github.com/oraios/serena, MIT, ~27K stars): MCP + LSP toolkit giving
  symbol-level retrieval and editing across 40+ languages via language servers or a JetBrains
  plugin. The credible off-the-shelf semantic-graph option; §16-1 records why pm-zero defers it.
- **[R]** **Harness Engineering for Agentic AI Coding Tools** (arXiv 2602.14690): an empirical
  study of 2,926 GitHub repositories identifying eight configuration mechanisms — Context Files,
  Skills, Subagents, Commands, **Rules**, Settings, **Hooks**, MCP servers. Findings: Context
  Files dominate and are often the *only* mechanism used; Skills and Subagents are shallowly
  adopted (most repos define one or two); Claude Code users employ the broadest range. pm-zero
  v11.2 uses seven of the eight — the empirical baseline says that is unusual, which is either an
  edge or an over-engineering risk. §19-8 addresses which.

### 17-5. Falsified claims

- **[R] C3** **RTK (Rust Token Killer)**: advertised 60–90% token reduction. JetBrains AI ran a
  paired A/B benchmark — Claude Code 2.1.201, `claude-sonnet-5` at low and high effort,
  SkillsBench 86 tasks, headless `bypassPermissions`, Harbor sandboxes, **425 billed trials,
  ~USD 320**. Result: **+7.6% median cost per task at low effort (p=0.004)**, +13.8% turns
  (p=0.03), +14.3% cache reads (p=0.008); **±0.1% at high effort (p=0.99)**; task quality
  statistically tied at both effort levels (sign test p=1.0). Ceiling analysis before spending:
  `Read`/`Grep` bypass the Bash hook entirely, ~half of shell calls are uncovered commands, and
  the remaining 33% of Bash calls carry just under 20% of tool-result characters — so even
  perfect compression caps at ≈3% of input tokens. RTK's own `rtk gain` counter reported 96.2M
  tokens saved over the same trials in which the bill rose, because it counts full raw output as
  the counterfactual against a harness that already truncates. — blog.jetbrains.com/ai/2026/07/
  rtk-claude-code-token-savings/
  **Generalized lesson, adopted as §1-1.8:** *a tool's self-reported savings are a claim about
  its counterfactual, not about your bill. Measure the paired bill.*

### 17-6. Derived in this document

- **§9-3 autocompact simulation.** Four session profiles swept 40K–987K, sensitivity over rot
  band (80K–400K) and severity (0.15–0.50), plus a rot-off control. Optimum 175–200K; flat basin
  150–200K; +33% at half the optimum vs +27% at double; catastrophic below 80K. Source:
  `compact_sim.py` and `compact_sim2.py`. **This is a model, not a measurement** — its price
  ratios (cache read 0.1×, cache write 1.25×, output 5×) and its rot function are assumptions.
  What makes it trustworthy is not the point estimate but the robustness: the optimum barely
  moves across the entire sensitivity sweep, and it agrees with Anthropic's independently-chosen
  150K API default.

---

## 18. Migration

Moved to `update.md` §4-2.

---

## 19. Logical Destroyer Final Verification

**This section is different from v11's and v11.1's.** Those were self-audits that resolved every
objection in their own favour — which, as this one's own §19-9 notes about the simulation, is
grading your own homework. v11.2's audit was run by a **separate Opus subagent given the draft,
the previous version, web access, and an explicit mandate to find at least fifteen substantive
defects and to soften nothing.** It found seven critical, fourteen major, and fourteen minor.

Seven of those were load-bearing enough to change the design rather than the prose; what they
changed is recorded in `update.md` §5, because a review that produced no edits would not have
been a review. **§19-14** lists what remains unresolved.

The standing objections:

**19-1. The graph is a second source of truth. Doesn't that violate pm-zero's own first law?**
It would, if it were authored. It is *generated*, from the code, by a parser, and it is
regenerated on every structural edit. It is a **derived view**, in the same category as a
compiled bundle or a lockfile — and pm-zero already commits those. The invariant is preserved
precisely: the code is the truth, the graph is a cache of the truth, and Q14 gates staleness.
The failure mode that would break this — a hand-edited graph — is prevented by never giving the
agent a reason to edit it and by `--check` failing on any hash mismatch. **Consistent.**

**19-2. TDAD's 70% was measured on Python with 30B open models. You are on TypeScript with
Sonnet 5. Isn't citing it overclaiming?**
It would be, if the number were load-bearing. §10-3a states the transfer limit explicitly and
calls 70% an upper bound rather than a forecast. What actually justifies the mechanism is not
the effect size but the **cost asymmetry**: a `--impacted` query is a parser call costing
hundreds of tokens, against a regression that costs a review cycle plus a fix cycle. Even at a
tenth of the published effect the expected value is strongly positive. The *directional* finding
— that contextual information beats procedural instruction, evidenced by TDD prompting making
things measurably worse — is the part pm-zero actually relies on, and it is the part least
likely to be model-size-specific. **Acceptable, and the limit is stated where the claim is
made.**

**19-3. `scripts/graph.mjs` is new code with no tests, on the critical path of every edit. You
have added a single point of failure to save tokens.**
This is the strongest objection to the rebuild and it is partly conceded. Three mitigations, and
one honest residual. (a) The graph is *advisory*: §10-3a specifies the impacted set as a floor,
and the final gate is always `pnpm verify`. A wrong graph produces a slower loop, not a wrong
merge. (b) The refresh hook runs `--quiet` and its failure does not block the edit — a
`PostToolUse` hook that errors does not undo the tool call. (c) `--check` is gated at merge
(Q14), so staleness surfaces before it can compound. **Residual risk, stated plainly:** a
*subtly* wrong graph — one that silently omits an edge — degrades impact analysis without ever
failing `--check`. There is no cheap defense against this. It is the price of cheap acquisition, and it is
bounded by the fact that the full suite still runs at the gate. **Accepted with a named residual.**

**19-4. The Stop hook can burn the entire Pro window. A documented case ran 50 minutes.**
Four independent bounds, any one of which terminates the loop: the platform's `stop_hook_active`
reentrancy guard (checked first, unconditionally); pm-zero's own `maxIterations` (default 12);
no-progress detection via failure signature (four identical signatures ends it); and
`StopFailure(rate_limit)` which fires at the wall regardless of loop state. The documented
failure case had *zero* of these — it returned `{"decision":"block"}` unconditionally. The loop
is also armed explicitly by a state file, so a stale hook on a project that never runs `/loop`
is inert. **Mitigated, four ways, deliberately redundant.**

**19-5. Isn't the evidence gate just Ralph's promise with extra steps? The model writes the
tests too.**
No, and the distinction is exactly the point. Ralph's gate is a *string the model emits* — the
model can emit it whenever it likes, which is why the plugin has to ask it not to lie. pm-zero's
gate is a *process exit code*, which the model cannot fabricate without writing a passing test
for broken behavior. That is a strictly harder thing to do accidentally, and a visible thing to
do deliberately: it shows up in the diff, where Tier 1 review reads it. The objection does land
in one place — **the model authors the tests**, so a lazy or wrong test weakens the gate. §10-4
concedes this in the text and §13-2 puts the countermeasure (never weaken an assertion, never
skip a test to reach green, reproduction test before fix) in a path-scoped rule that loads on
every test-file edit. **Materially different from a promise; the residual is named and
countered, not hidden.**

**19-6. `bypassPermissions` + workflows + no launch prompt = an agent that can spend a large
share of the window with no confirmation whatsoever.**
Correct, and it is the sharpest *new* risk in v11.2 — v11.1 did not have it because v11.1 did
not use workflows. Three controls: workflows are invoked per task with an explicit `ultracode:`
keyword rather than as a session mode; §7-4 rule 3 sets a budget gate (only when the main
context would need ≥2 full compactions); and `--max-budget-usd` exists as a hard stop, though
its behavior under a flat Pro subscription is unverified **[I]**. The honest position: this is a
real, accepted risk, chosen because a single workflow that avoids three compactions is usually
cheaper than the alternative — but it is the one place where v11.2 trades a safety property for
a performance one, and the operator should know that. **Accepted with disclosure.**

**19-7. You removed RTK on one benchmark from one vendor. JetBrains competes with Claude Code.
Isn't that motivated reasoning?**
The conflict of interest is real and worth naming. Three reasons it does not change the
conclusion. (a) The mechanism is falsifiable independent of the measurement: `Read` and `Grep`
bypass the Bash hook, which is stated in RTK's own README, and that alone caps the achievable
saving at a few percent. (b) The benchmark's headline finding is *not* "RTK is bad" — quality
came out statistically tied and the writeup calls the filters "real and often elegant." A
motivated attacker would have found a quality regression. (c) The decisive evidence is RTK's own
counter reporting 96.2M tokens saved while the paired bill rose; that is an internal
inconsistency, not a competitor's opinion. **Even discounting the vendor's numbers entirely, the
ceiling analysis is sufficient to remove RTK from the critical path.** And the cost of being
wrong is asymmetric: dropping a tool that saved ~3% costs ~3%; keeping one that costs 7.6% costs
7.6%. **Sound.**

**19-8. The Harness Engineering study found most repos use one or two mechanisms. pm-zero uses
seven of eight. Is this over-engineering?**
The comparison is not apples-to-apples: that population is mostly multi-developer repos where
configuration must be agreed on, and its own finding is that "advanced mechanisms are only
shallowly adopted" — a statement about adoption, not about value. pm-zero is a single operator
optimizing one workflow to the limit, which is exactly the case where more mechanisms pay off.
But the objection has teeth in one place: **every mechanism is a thing that can be
misconfigured, and pm-zero's operator is explicitly a non-engineer.** The mitigation is that
five of the seven are configured once in global settings and never touched, and the two that
live per-project (`rules/`, `graph/`) both degrade gracefully — a missing zone rule costs
nothing, and a missing graph falls back to grep. **Defensible, with the complexity cost
acknowledged rather than denied.**

**19-9. The autocompact number is from your own simulation. Isn't that grading your own
homework — the exact thing you criticize RTK for?**
A fair and uncomfortable parallel, and §17-6 marks the simulation as a model rather than a
measurement for that reason. Three things distinguish it from RTK's counter. (a) The code is
published in the repo and the assumptions are stated, so it is falsifiable; RTK's counter was
opaque. (b) It is corroborated by an *independent* number chosen by a party with no stake in
this document: Anthropic's own API default of 150,000. (c) Its conclusion is robust rather than
sharp — the answer is a *basin* from 150K to 200K, and every sensitivity sweep lands inside it,
so the recommendation does not depend on the assumptions being right, only on them not being
wildly wrong. And §9-3 ends by telling the operator to go measure the real firing point in the
transcript, which is precisely the discipline RTK failed. **The parallel is acknowledged and
the discipline is applied to ourselves.**

**19-10. Path-scoped rules load only when a matching file is touched. What about a rule that
should fire when a file is *not* touched — "never edit auth without updating the session tests"?**
Genuine gap. Path-scoped rules are reactive; they cannot enforce a negative. The answer is that
this class of rule is not a rule at all — it is an **edge in the graph**, and it belongs in
`graph/tests.json`, where `--impacted` will surface the session tests when auth is edited.
Rules that say "when you touch X, also do Y" should be encoded as graph edges, not as prose in
either location. This is a useful sharpening: **if a rule mentions two paths, it is probably an
edge wearing a rule's clothes.** Recorded as a design principle rather than a defect.

**19-11. Opus 5 is "the strongest model on Claude Pro." Why is Sonnet still the default? That
looks like inertia dressed as principle.**
It would be, if the argument had not changed — and v11.1's argument genuinely does not survive
Opus 5. §7-2 replaces it rather than defending it: the surviving case is about *rate-limit
weight against a shared 5-hour window*, not about capability. Opus consumes that window ~2.5×
faster per token; its reported efficiency gains shrink the multiplier but do not invert it. And
v11.2 does move ground where the evidence points: Tier 2 review is now Opus 5, and "Opus 5 at
low effort beats Sonnet 5 at xhigh for hard problems" reverses v11.1's explicit advice. That
reversal is flagged as **Inference from vendor-reported partner benchmarks** and the operator is
told to verify it. **Re-derived, not defended; and the part that is uncertain is labeled.**

**19-12. If workflows keep intermediate results out of the context window, why bother with the
autocompact tuning at all? Doesn't one obsolete the other?**
They address different phases. Workflows help wide *mechanical* fan-out — audits, migrations,
ports — where the work decomposes into independent units. The Coding Loop's inner cycle
(edit → test → read failure → edit) is inherently sequential and stateful; it cannot be
decomposed into independent agents without losing the state that makes iteration work. That
inner cycle is what fills the window, and §9-3 profile C models exactly it. **Complementary, not
redundant** — and the §9-4 rule (workflow only when the main context would need ≥2 compactions)
is precisely the boundary between them.

**19-13. Is the zero-prompt goal still achieved?**
Under v11.1's configuration: **no** — workflow subagents would have prompted on any command
outside the allow list (C2), and v11.1 explicitly declared the allow list moot. Under v11.2's:
yes, subject to the allow list actually being complete, which Phase 0.5 now audits and which the
blanket `Bash`/`PowerShell` entries cover for everything except MCP tools. Remaining
interruptions are by design: `AskUserQuestion` (a deliberate agent question, not a permission
prompt) and the human gate for irreversible real-world acts. **Achieved, and the regression that
had crept in is closed.**

**19-14. What remains unresolved.**

Every previous version's audit closed with everything resolved. This one does not, because four
things are genuinely open and saying otherwise would be the failure mode §1-1.8 exists to name.

1. **The compaction cascade (§9-2) is inference, and a "structural guarantee" rests on it.**
   Layers 0–3 come from two independent reverse-engineering teardowns, not from Anthropic. The
   `~/.claude/session-memory/config/template.md` path, the ~2000-tokens-per-section cap, and the
   no-summarization-call property are **unverified in any vendor documentation.** Migration step
   3 asks the operator to edit that file. If it does not exist on their install, the step is a
   no-op and the `PreCompact` checkpoint hook is doing all the work. Treat §9-2 as a map of
   plausible terrain, not a contract.
2. **The graph's benefit is unquantified for this workload.** TDAD's 70% was Python, 30–35B
   local models, SWE-bench. §19-2 argues the cost asymmetry justifies the mechanism regardless,
   and that argument stands — but *nobody has measured what `--impacted` saves on a TypeScript
   project driven by Sonnet 5*. The honest claim is "cheap enough to be worth trying," not "cuts
   regressions by 70%." Measure it: run ten tasks with and without, count P2P failures.
3. **A subtly wrong graph is undetectable.** A missing edge degrades every downstream impact
   query and never fails `--check`, which only hashes the tree. The full suite at the gate bounds
   the damage; nothing detects the degradation itself. This is the accepted price of a static
   artifact and there is no cheap defense.
4. **Complexity has roughly doubled for a non-engineer operator.** v11.1 was two settings keys,
   one tested hook, and prose. v11.2 adds four hook scripts, a graph generator, a rules
   directory, a state file, and a five-exit loop. Five of the seven new mechanisms are
   configured once in global settings and never touched, and the two that live per-project both
   degrade gracefully — but the moving-part count is what it is, and calling it "roughly flat"
   (as an earlier draft did) was false. **If the operator will not maintain this, v11.1 plus the
   C1/C2/C3 corrections is a better system for them than v11.2.** That is a real recommendation,
   not a rhetorical hedge: the corrections are worth deploying on their own, today, in about ten
   minutes, and they carry most of the safety value of this entire document.

**19-15. Final judgment.**

```text
Claude Code only. PowerShell only. Claude Pro plan only -- the budget is a hard wall,
  and on this plan Opus 5 is a 200K model, because 1M would cost credits.
Three explicit graphs: code (generated by a shipped, tested, zero-dependency parser),
  org (path-scoped rules + roles), work (typed edges, evidence-gated tasks).
  Structure is stored, not re-derived: acquisition is the top line item, carry is the
  other one, and they need different remedies.
Zero permission prompts: bypassPermissions + allow ["*"], because a hand-maintained
  list is a leak that reappears every release and the guard hook is the real boundary.
One deterministic guard hook enforces the dangerous set in every mode, at every depth,
  now including Edit and Write -- the .env write path was guarded by nothing.
Nested spawning pinned to 1 -- the default moved to 3 one day after v11.1 shipped,
  which is an argument for a re-verification trigger, not for blaming v11.1.
Sonnet 5 is the workhorse on a rate-limit ordering, not an invented multiplier.
  Opus 5 owns the irreversible classes. Haiku reads. Fable never runs.
The Coding Loop: /goal continues, loop.mjs gates. It cannot stop while a gate is red,
  cannot close a task the model merely called done, cannot brute-force retry, and
  cannot outrun the budget wall. Five exits; four clean, and the fifth is engineered
  out by capping two blocks below the platform's and reconciling at SessionStart.
The gate runs in the agent, not in the hook -- a hook that times out ALLOWS the stop.
Impact analysis before the edit; the impacted set is a floor, the full suite is the gate.
Auto-compact at an absolute ~175K via CLAUDE_CODE_AUTO_COMPACT_WINDOW -- because a
  percentage also applies to subagents, where 15 meant 30K and 30K is thrash.
RTK is gone: measured +7.6%, not -60%. A tool's own counter grades its own homework --
  and so does an audit that resolves all thirteen of its own objections, which is why
  this one was run by a separate model and why 19-14 lists what is still open.
No human code review: deterministic gates + tiered fresh-context self-review.
Human gate only for irreversible real-world acts.
Self-Evolution promotes rules to the paths they govern, so learning no longer taxes
  every turn -- which is what makes the system able to keep learning at all.
```

---

## 20. v11.2 Production Summary

v11.2 evolves pm-zero from **Budget-Bound** to **Graph-Bound** Autonomous Solo-Dev OS.

Quality is guaranteed by:

1. **Three explicit graphs.** Product intent in `docs/vision.md`; the work graph in `tasks.md`
   with typed edges and a `Gate` per node; the code graph generated into `docs/graph/`; the org
   graph in `CLAUDE.md` plus path-scoped `.claude/rules/`; provenance in `docs/decisions.md`;
   failures in `docs/issues.md`.
2. **Structure stored, not re-derived.** Impact analysis answers "what does this break" with a
   parser call instead of an exploration pass — the single largest token lever available, since
   repository reading is the largest single line item in a cold agent's token budget (§9-1).
3. **Zero permission prompts** via correctly-configured `bypassPermissions`, a complete
   allow list (load-bearing again under workflows), and one test-verified guard hook that fires
   in every mode at every subagent depth.
4. **A coding loop that does not stop.** Start to deploy, gated by exit codes rather than
   claims, scoped by graph impact analysis, bounded by iteration count, failure-signature
   escalation, and a deterministic budget-wall checkpoint. Four clean terminations, no fifth.
5. **Tiered self-review replacing human review:** deterministic gates always; fresh-context
   Sonnet 5 by default; Opus 5 for the irreversible classes; an adversarial workflow above that
   when a change is both large and high-risk.
6. **Budget discipline as a runtime layer:** Sonnet-first on a rate-limit argument, Haiku-first
   reading, workflows for wide fan-out, background execution, batched questions, and the removal
   of a "token saver" that was measurably costing tokens.
7. **Context continuity at an absolute ~175K**, derived by simulation rather than inherited from
   an older window size, enforced by a `PreCompact` checkpoint hook and a session-memory
   template aligned to the ledger, and required to be verified in the transcript.
8. **Memory layering:** auto-memory for operator facts, git ledgers and the graph for project
   facts.
9. **Self-Evolution that scales:** failures become rules attached to the paths they govern, so
   the rule set can grow without taxing every turn — the change that lets the system keep
   learning past the point where v11.1 would have choked on its own `CLAUDE.md`.
10. **14 quality gates** (13 + Structural Fidelity), 3 verification modes, 10 coding priorities,
    solo-dev full-auto git with risk-gated auto-merge, human gate only for irreversible
    real-world acts, Japanese handoff.

Work that does not satisfy these criteria is not complete under pm-zero v11.2.

**Coda.** v11 asked "what does this cost?" and got a budget-bound OS. v11.1 asked "is this still
true?" and got a fact-refreshed one. v11.2 asked **"what shape is this?"** — and the answer
turned out to be the same answer as "where did the money go." A repository is a graph; an agent
that stores the graph stops paying to rediscover it; an agent that stops paying to rediscover it
can afford to run start-to-deploy without stopping. The budget wall did not move. The system
finally stopped walking into it.
