# update.md — pm-zero change history

Version deltas, migration steps, and the reasons behind each change. The
`pm-zero-knowledge-*.md` files are pure design specifications and state only what the system
*is*; everything about what *changed*, and why, lives here.

**Current files**

| File | Status |
|---|---|
| `pm-zero-knowledge-v12.2.md` | Current. Sole active line |
| `pm-zero-knowledge-v10.md` | Historical reference. Some v11.x templates still cite its section numbers |

`pm-zero-knowledge-v11.1.1.md` was removed on 2026-08-16 when superseded by
`pm-zero-knowledge-v12.md` (Section 9); `pm-zero-knowledge-v12.md` was itself removed on
2026-08-21 when superseded by `pm-zero-knowledge-v12.1.md` (Section 10); v12.1 was removed on
2026-08-30 when superseded by `pm-zero-knowledge-v12.2.md` (Section 11).

`pm-zero-knowledge-v11.md` and `pm-zero-knowledge-v11.1.md` were removed on 2026-07-27: both are
complete subsets of the two files that were current at that time, and both carried claims the
platform has since falsified (P1–P7 below).

`pm-zero-knowledge-v11.2.md` was removed on 2026-08-16, along with its dedicated implementation
(`scripts/graph.mjs`, `hooks/loop.mjs`, generated `docs/graph/`). Not a platform-fact failure like
the v11/v11.1 removal above — a fit decision, made against this operator's actual workload: small,
personal products (e.g. `task-plant`, `grimoire`) built intermittently, on a non-engineer's own
maintenance capacity. v11.2's two mechanisms both target problems that workload doesn't have —
G_code's token savings matter at a repo size this operator's projects don't reach, and the closed
coding loop's value is unattended multi-hour runs, not supervised bursts of hobby coding — while
its cost (four hook scripts, a graph generator, a five-exit loop, ~18 tracked files, two bugs the
design review itself only caught by running the code) lands hardest on exactly the operator who
cannot debug a broken hook. v11.2's own §19-14.4 named this condition before it applied: *"If the
operator will not maintain this, v11.1 plus the corrections is a better system for them than
v11.2."* See §8 for the full record. `pm-zero-knowledge-v11.1.1.md` is retained unmodified by this
decision — it already carried the full safety and budget core (guard hook, bypassPermissions,
ledger-file memory, tiered review, Self-Evolution) that both siblings shared.

**Label index** — these identifiers are referenced from inside the design specs:

| Prefix | Meaning | Defined in |
|---|---|---|
| `P1`–`P7` | v11.1 claims corrected in v11.1.1 | §2 |
| `A1`–`A6` | v11.1.1 additions that cost no new code | §2 |
| `S1`–`S2` | v11.2 structural changes | §3 |
| `C1`–`C7` | v11.1 claims corrected in v11.2 | §3 |
| `R1`–`R2` | Corrections found after both v11.1.1 and v11.2 shipped | §7 |

---

## 1. Lineage

```text
v10   2026-06-08  Autonomous Solo-Dev OS
v11   2026-07-05  + budget wall, zero prompts, guard hook          [removed 2026-07-27]
v11.1 2026-07-23  + platform facts refreshed, prose -> harness      [removed 2026-07-27]
  |
  +-- v11.1.1  2026-07-27  truth patch, config only              [removed 2026-08-16]
  +-- v11.2    2026-07-27  graph re-architecture                 [removed 2026-08-16]
        |
        v
v12   2026-08-16  executable-only; first subtractive release       [removed 2026-08-21]
  |
  v
v12.1 2026-08-21  + frontend/UI operating layer                 [removed 2026-08-30]
  |
  v
v12.2 2026-08-30  old UI layer withdrawn; live capability gate + direct UI directives
                                                   -> pm-zero-knowledge-v12.2.md
```

v11.1.1 and v11.2 were siblings, not a sequence. Both corrected the same set of v11.1 errors.
They differed in where they stopped: v11.1.1 stopped exactly where new programs would begin;
v11.2 crossed that line deliberately and shipped the programs. v11.2 was discontinued on
2026-08-16 (Section 8); v11.1.1 was superseded by v12 the same day (Section 9). v12.1 added a
frontend/UI layer on 2026-08-21 (Section 10), but applied the executable-gate test to product
direction and failed to preserve the operator's intent. v12.2 withdraws that layer and separates
falsifiable quality evidence from direct product constraints (Section 11).

---

## 2. v11.1 → v11.1.1

*This section was Section 0.2 of the v11.1.1 design spec, plus its release framing.*

**v11.1.1 is a truth patch. It changes no architecture and adds no program.**
Everything here is either (a) a v11.1 statement that the platform has since falsified, or
(b) an improvement that costs nothing but a settings key and a markdown file. If a fix would
have required writing and maintaining new code, it was deferred to v11.2 rather than smuggled
in here. That boundary is the whole point of this release: **v11.1.1 is what a careful operator
can deploy in an evening, with no new failure surface.** Section 0.2 enumerates every change.

Six v11.1 claims are now false, and two of them are live defects rather than stale trivia: the
`.env` **write** path is guarded by nothing in any mode, and nested subagent spawning silently
became three levels deep. Both are fixed below. One further claim — that RTK compresses CLI
output 60–90% — was falsified by measurement, not by platform drift; it is removed.

*(v11.1's original framing follows, preserved except where a fact went stale.)*

**v11.1 is a fact-and-harness refresh, not a redesign.** It re-derives v11 from the current
platform reality — Claude **Sonnet 5** became the Claude Code default on 2026-06-30 — and pushes
three behavioral rules down into the *deterministic harness layer* where they cannot be compacted
away. That is the same "determinism over prose" principle v11 already applies to safety, now
applied to routing and parallelism. Every v11 decision, file primitive, and quality gate is
preserved except where a platform fact went stale; no section was removed. What changed, and the
concrete reason for each change, is enumerated in `update.md`. Fact vs. inference is marked
throughout; every new claim is sourced in **Section 16**.

*The v11 → v11.1 delta below was carried inside the v11.1.1 spec as its Section 0.1; it is
historical and its `D1`–`D5` labels are still referenced from the spec.*

### 2-0. Patch delta (v11 → v11.1, inherited)

v11.1 makes **no structural change** to the OS. It applies exactly four categories of edit, each
tied to a verifiable platform fact (Section 16) or a first-principles re-derivation. Nothing else
was touched.

| # | Change | Type | Concrete reason | Source |
|---|---|---|---|---|
| D1 | Workhorse model `Sonnet 4.6` → **`Sonnet 5`**; pricing note updated | Fact refresh | Sonnet 5 became the Claude Code default on 2026-06-30 (CLI 2.1.197), with a native 1M-token context window and intro pricing $2/$10 per MTok through 2026-08-31, then $3/$15. It closes most of the Opus 4.8 gap on agentic/coding at ~40–60% of the cost. This **strengthens** v11's Sonnet-first thesis; it does not change it. | §16; Claude Code changelog 2.1.197 |
| D2 | "Never block on model availability" (prose) → native **`fallbackModel`** chain in `settings.json` | Prose→harness | Claude Code v2.1.166 added a `fallbackModel` setting (up to 3 models, tried in order on overload/availability errors). The old rule was an instruction the model had to remember; now it is deterministic config. *Honest caveat:* fallback triggers on model **overload/unavailability**, not on your Pro-window **rate-limit** — so the Session Budget Protocol still owns the rate-limit case. | §16; changelog |
| D3 | Add a hard **total-subagent** concurrency ceiling (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=3`) beneath the ≤2-*worker* prose default; keep nested spawning **off** | Prose→harness backstop | The ≤2-worker rule stays a soft default the agent reasons about; the env value is a deterministic backstop on *all* concurrent subagents (explore + worker + review), so fan-out can't run away even if the prose is compacted. 3 = ≤2 workers + one concurrent explore/review. Nested spawning needs `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`; pm-zero leaves it off — deep trees multiply burn against one window. `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` (default 200) is left as-is: a runaway-loop backstop, not the binding lever (one-task-per-session + the concurrency ceiling already bound cumulative burn). | §16; changelog |
| D4 | Named the theoretical foundation + tightened sources | Framing + evidence | v11's file-as-memory + Haiku-explore + early-compaction triad **is** Anthropic's documented long-horizon context-engineering pattern (compaction + structured note-taking + sub-agent architectures) and Karpathy's Software 3.0 framing (the context window as working memory; the file system as durable memory). Naming it is DNA-level fusion, not a bolt-on: pm-zero was already this. | §16-1; Anthropic *Effective context engineering for AI agents*; Karpathy *Software 3.0* (2025–2026 talks) |
| D5 | Autocompact trigger re-expressed as an **absolute** target (~100–150K tokens); `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 50 → ~15 on Sonnet 5's 1M window | Fact-driven correction | Sonnet 5's native 1M context means the old "50" fires at ~500K — 5× the intended working set, violating "tokens are the budget." The invariant is the absolute size, not the percentage; the number moves so the discipline holds. | §8-5; §16; changelog 2.1.197 |

**Deliberately rejected** (first-principles, budget-bound): cron-scheduled agent *routines* (`/loop`),
5-level nested agent hierarchies, and cross-tool `AGENTS.md`/spec-kit adoption. All three are real
2026 trends; all three either burn the Pro window unattended, multiply concurrent token load, or
break the "Claude Code only" invariant. Section 18-12 records why. Cargo-culting a trend that
violates the binding constraint makes the system worse, not more modern.

---

### 2-1. Patch delta

**Falsified — v11.1 claims that are no longer true.**

| # | v11.1 said | Truth on 2026-07-27 | Fix |
|---|---|---|---|
| **P1** | "Nested subagent spawning is left at its platform default (off)." | **True when written; false the next day.** v2.1.217 had made nesting off-by-default; the Opus 5 release on 2026-07-24 changed it to **depth 3 by default**. | Set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` explicitly (§7-2). The deeper lesson is P7. |
| **P2** | "RTK on, always — CLI output compressed 60–90%." | A paired A/B benchmark over **425 billed trials** (Claude Code 2.1.201, Sonnet 5, SkillsBench, bypassPermissions) measured **+7.6% cost at low effort (p=0.004)** and **±0% at high effort**, quality tied. `Read`/`Grep` bypass the Bash hook entirely, capping any possible saving at ~3% of input tokens. RTK's own counter reported 96.2M tokens saved while the bill rose. | **RTK removed** from the toolchain, Phase 0, and the Session Budget Protocol (v11.1.1 §8-1 rule 4). |
| **P3** | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE = 15`, "the invariant is an absolute size, not a percentage." | The sentence was right and the setting contradicted it. The override is **a percentage**, and it **applies to subagents too** — so `15` meant 150K on Sonnet 5 but **30K on every 200K-window model** in the same session: Haiku, and Opus on Pro. Claude Code ships `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, which sets the effective window **in tokens**. | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000`, **no percentage** → ~175K on every model (§8-5). |
| **P4** | Reviewer / top-risk model is **Opus 4.8**. | **Opus 5** shipped 2026-07-24 at Opus 4.8's price ($5/$25), and is "the strongest model on Claude Pro." **But its 1M context requires usage credits on Pro** — which this budget forbids — so on this plan **Opus 5 is a 200K model**. | Routing updated (§6-2, §6-3). The 200K fact is also half of P3. |
| **P5** | "The allow list is retained even though bypass mode makes it moot." | Not moot. Dynamic-workflow subagents **always run in `acceptEdits` and inherit the tool allow list regardless of session mode**; anything outside it can prompt mid-run. | `allow: ["*"]` (§7-2), with the reasoning stated rather than a list that the next release invalidates. |
| **P6** | "The cache TTL is ~5 minutes. Work in continuous bursts." | The API offers both a 5-minute default and a 1-hour extended TTL, and Claude Code's own idle cleanup keys off a **60-minute** gap. Which applies to a given session is **unverified**. | Downgraded from a hard rule to a directional one (§8-1 rule 9). The safe form — *step away at checkpoints, not mid-task* — survives either way. |

**Security hole closed (found by audit, not by platform drift).**

| # | Defect | Fix |
|---|---|---|
| **P7** | v11.1's deny rules and guard hook both covered **reading** `.env` — the guard matcher was `Bash\|PowerShell\|Read`. The **write** path was covered by nothing, in any mode. `Write(.env)` or `Edit(.env)` reached the disk unchallenged, and a pushed secret is public within seconds. The layer table in §7-2 hid this because it scored layers by *property*, never by *hazard*. | `Edit\|Write` added to the guard matcher and to the deny list (§7-2, §7-3). |

**Improvements that cost no new code.** Each is a platform-native feature v11.1 predates or ignored. None requires a program to be written or maintained.

| # | Addition | What it replaces | Cost |
|---|---|---|---|
| **A1** | **`/goal <condition>`** for the coding phase (§10 Phase 3) | The prose instruction "keep working until done", which compaction eats | One typed command |
| **A2** | **`PreCompact` hook** committing the ledger files | v11.1's *"checkpoint before compaction"* discipline, which the agent had to remember | One inline one-liner in `settings.json` |
| **A3** | **`StopFailure(rate_limit)` hook** | §8-1 rule 10, which required the agent to notice a usage warning | One inline one-liner |
| **A4** | **`.claude/rules/*.md`** with `paths:` frontmatter | Rules piled into `CLAUDE.md`, where every rule taxes every turn forever | Markdown files |
| **A5** | **A re-verification trigger** (§10 Phase 0) | Nothing. This is the actual lesson of P1 | One line in `docs/state.md` |
| **A6** | **The measure-the-paired-bill principle** (§1-1, constraint 7) | Nothing. This is the principle whose absence caused P2 | A habit |

**Deliberately NOT included** (these are v11.2's territory and each requires code that must be
written, tested and maintained): a generated code graph, impact analysis before edits, a
deterministic `Stop`-hook coding loop, typed work-graph edges, and evidence-gated task closure.
v11.1.1 stops exactly where new programs begin. If you want those, take v11.2 and accept its
maintenance surface; if you do not, this file is the honest ceiling of a config-only system.

---

## 3. v11.1 → v11.2

*This section was Section 0.1 of the v11.2 design spec, plus its release framing.*

**v11.2 is a re-architecture, not a fact refresh.** v11.1 was honest about what it was: a
fact-and-harness patch that changed *where* decisions are enforced without changing the
decisions. v11.2 changes the decisions, because three things happened that the v11 line was
not built for:

1. **The platform grew native graph primitives.** Dynamic workflows (a JavaScript orchestration
   script the runtime executes, holding intermediate results *outside* the context window),
   `.claude/rules/*.md` with path-scoped loading, and a hook surface that now fires on
   `Stop`, `StopFailure`, `SubagentStart/Stop`, `TaskCreated/Completed`, `PreCompact/PostCompact`
   and `WorktreeCreate/Remove`. pm-zero's ledger was already a graph — an untyped one. The
   platform is now able to execute it.
2. **Three v11.1 claims turned out to be wrong.** Nested subagent spawning is now **on** by
   default to depth 3 (v11.1 assumed off and budgeted accordingly). Dynamic-workflow subagents
   run in `acceptEdits` and can prompt mid-run, so the allow list is **not** moot under
   `bypassPermissions` (v11.1 said it was). And RTK's 60–90% compression claim was falsified by
   a 425-trial paired benchmark; measured effect is +7.6% cost at low effort and ±0% at high.
   Each is enumerated with its source in §0.1 and §17.
3. **Opus 5 shipped on 2026-07-24 and is the strongest model on Claude Pro**, at Opus 4.8's
   price, with materially lower token consumption per task. The Sonnet-first thesis survives —
   but the reason changed, and the reason matters more than the conclusion.

### 3-1. Update delta

v11.2 makes one structural change (the three graphs) and seven corrections. Nothing else moved.

### Structural

| # | Change | Reason | Source |
|---|---|---|---|
| **S1** | **Graph engineering becomes the main architecture (§2).** The system is re-expressed as three explicit graphs — **G_code** (repository structure), **G_org** (agent roles + path-scoped rules), **G_work** (tasks + dependency + evidence edges). Every existing file primitive is retyped as a node or edge; none is deleted. | Repository structure, plan structure and agent-org structure are all graphs that v11.1 stored as flat text and re-derived from text every turn. Re-derivation is a top-line token cost (reported at 76.1% of a *cold benchmark* agent's budget; pm-zero's addressable share is unmeasured — §9-1). Making edges explicit is the single largest token lever available — an order of magnitude above CLI-output compression, which measures at ~0%. | §17: arXiv 2607.01929; TDAD arXiv 2603.17973; JetBrains rtk benchmark |
| **S2** | **The Coding Loop (§10) becomes a closed, evidence-gated, non-stop loop.** Native `/goal` supplies turn-level continuation; a deterministic `Stop` hook (`loop.mjs`, shipped and tested in this repo) supplies the evidence gate that `/goal`'s evaluator structurally cannot, feeds back the impacted test set from G_code, bounds iterations below the platform's 8-block cap, detects no-progress, and terminates deterministically at the Pro-window rate limit via `StopFailure`. | The requirement is start-to-deploy with no human stop. Anthropic's own `ralph-wiggum` plugin does this with a `<promise>` text token and the instruction "do not lie to exit!" — an honesty request, not a gate. `/goal`'s evaluator "does not call tools, so it can only judge what Claude has already surfaced in the conversation" — also transcript-trusting. A recorded exit code checked against `git rev-parse HEAD` is neither. TDAD shows that telling an agent *which tests are at risk* cuts regressions 70%, while telling it *how to do TDD* makes them **worse**. | §17: `/goal` docs; ralph-wiggum stop-hook.sh; andylizf/nonstop; TDAD |

### Corrections (v11.1 claims that are now false)

| # | v11.1 said | Truth on 2026-07-27 | Consequence |
|---|---|---|---|
| **C1** | "Nested subagent spawning is left at its platform default (off)." | **True when written (2026-07-23); false three days later.** v2.1.217 had made nesting off-by-default; the Opus 5 release on 2026-07-24 changed it to **depth 3 by default**, and disabling it now requires explicitly setting `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`. | A budget hole opened *under* v11.1 without v11.1 being wrong. §8-2 sets the value explicitly. **The real lesson is not "v11.1 erred" — it is that "leave it at the default" is a claim with a shelf life, and pm-zero had no re-verification trigger.** §12 Phase 0 now gates a facts re-check on the CLI minor version. |
| **C2** | "The allow list is retained even though bypass mode makes it moot." | Dynamic-workflow subagents **always run in `acceptEdits` and inherit your tool allowlist, regardless of the session's permission mode**. File edits auto-approve, but shell commands, web fetches and MCP tools **not in the allow list can still prompt mid-run**. | **Live zero-prompt leak.** The moment pm-zero uses a workflow, an incomplete allow list re-introduces exactly the interruption v11 was built to eliminate. §8-3 makes the allow list load-bearing again and adds a pre-workflow allow-list audit. |
| **C3** | "RTK on, always. CLI output compressed 60–90%." (Session Budget Protocol rule 4) | A paired A/B benchmark over **425 billed trials** (Claude Code 2.1.201, Sonnet 5, SkillsBench, `bypassPermissions`) measured **+7.6% cost at low effort (p=0.004)** and **±0% at high effort**, quality statistically tied. Ceiling analysis: the Bash hook can only ever see ~20% of tool-result characters, because `Read`/`Grep` bypass it entirely and cached re-reads dominate input cost at 1/10 the price. RTK's own counter reported 96.2M tokens saved while the bill went up. | **RTK removed from the critical path.** §9-5 replaces it with the mechanisms that actually move the number, and records the general rule: *a tool's self-reported savings are a claim about its counterfactual, not about your bill.* |
| **C4** | Workhorse Sonnet 5; "Opus 4.8 optional garnish." | **Opus 5** shipped 2026-07-24: $5/$25 (unchanged from 4.8), 1M context, thinking on by default, and **the strongest model on Claude Pro**. Reported efficiency gains are large and cost-relevant: ~26% fewer tokens at max reasoning vs 4.8, "a third fewer turns and tool calls," "roughly a seventh of the reasoning tokens" on one partner benchmark. | Sonnet-first **survives**, but for a corrected reason (§7-2). Per-token rate-limit weight still favors Sonnet ~2.5×; Opus 5's per-*task* efficiency narrows the gap enough that Tier 2 review and hard architecture calls now route to Opus 5 at *low* effort rather than being deferred. |
| **C5** | "Auto-compact target ~100–150K; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` = 15." | Two separate errors. **(a) Wrong knob.** Claude Code ships `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, which sets the *absolute* effective window the compaction maths runs against. v11 and v11.1 both declared "the invariant is an absolute size, not a percentage" and then configured a percentage. **(b) Wrong scope.** The percentage applies to subagents too, and it is a single global value — so `15` also meant 30K on every 200K-window model. On Pro that includes Haiku 4.5 **and Opus 5**, because Opus's 1M context requires usage credits that pm-zero's budget rules out. 30K is deep inside the compaction-thrash regime §9-3 prices at +360%. | Both fixed: `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000` and **no percentage at all**, which yields a ~175K trigger on *every* model regardless of its native window. §9-3. |
| **C6** | "Prompt cache TTL is ~5 minutes; a >5-minute pause re-reads context uncached." | Claude Code's time-based tool-result cleanup keys off a **60-minute** idle gap, described as matching the server cache TTL (Inference — reverse-engineered, not vendor-documented). The Anthropic API offers both a 5-minute default and a 1-hour extended cache TTL. | The "work in 5-minute bursts" rule was probably over-tight and is downgraded from a hard rule to a *directional* one (§9-4). Honest status: **unverified**; the operator should measure rather than trust either number. |
| **C7** | `docs/repo-map.md` is the navigation layer. | A hand-maintained prose map is a lossy, staleness-prone serialization of the code graph — exactly the "linearize the topology into tokens" failure mode DUALVIEW identifies. | `repo-map.md` is **kept** (it is the human-readable Summary) but demoted: it becomes the *rendered view* of `docs/graph/`, generated, not hand-written. §2-2. |

### Deliberately rejected (unchanged in spirit from v11.1, re-derived)

- **Graph databases / Neo4j / GraphRAG services.** The vendor literature on "graph engineering"
  overwhelmingly means *buy a graph database*. TDAD achieves a 70% regression reduction with a
  static AST-derived map and "only `grep` and `pytest` at runtime, with no graph database, MCP
  server, or API calls." On a $20 wall, the static artifact is not a compromise — it is the
  correct engineering choice, and it is the version that survives a laptop reboot. §2-2.
- **Agent teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). Each teammate is a full separate
  Claude Code session; the docs say plainly they "use significantly more tokens than a single
  session." The org graph is expressible with subagent definitions + path-scoped rules at a
  fraction of the burn. Revisit on a Max plan.
- **`/effort ultracode` as a session default.** Ultracode plans a workflow for *every*
  substantive task and the docs warn each request "uses more tokens and takes longer." pm-zero
  invokes workflows *per task* with the `ultracode:` keyword (§7-4), never as a session mode.
- **Cron/`/loop` unattended routines, 5-level agent hierarchies, cross-tool `AGENTS.md`.**
  Same first-principles rejection as v11.1 §18-12; the binding constraint has not changed.

---

## 4. Migration steps

### 4-1. To v11.1.1

*From Section 17 of the v11.1.1 design spec. Includes the earlier v10 → v11 and v11 → v11.1
history, retained because the two removed files are no longer available to carry it.*

#### v10 → v11

### Preserved

- The entire file model: 13 default files, 7 primitives, ledger responsibilities.
- Quality gates (13), verification modes, git workflow, MCP policy, shell routing
  (PowerShell only), Self-Evolution loop, Japanese handoff. *(RTK integration was preserved
  through v11.1 and removed in v11.1.1 — P2.)*
- Early-compaction design and the checkpoint discipline (v11.1 re-expresses the trigger as an
  absolute working-context target; see §8-5).
- `myself-info.md` as the operator environment sheet (now formally read in Phase 1).

### Fixed

| Defect in v10 | v11 fix |
|---|---|
| Top-level `permissionMode` key (not in schema) + user-level `settings.local.json` (not loaded) | `permissions.defaultMode: "bypassPermissions"` in `~/.claude/settings.json` |
| PowerShell tool unallowed → prompts | `PowerShell` in allow list; PowerShell deny mirrors added |
| Deny rules were the only dangerous-set enforcement; bypass mode can skip them | Global `guard.mjs` PreToolUse hook — deterministic in every mode, test-verified |
| Merge gate hard-required Opus | Tiered review: fresh-context Sonnet default, Opus optional Tier 2 |

### Added

| Addition | Purpose |
|---|---|
| Budget Discipline as a third cross-cutting discipline | The $20 plan is the binding constraint |
| Session Budget Protocol (Section 8-1) | Operational rules that keep sessions inside the window |
| Tiered self-review | Review quality without Opus dependency |
| Worktree isolation for overlapping-scope parallel work | Collision-free parallelism without manual locks |
| Background execution rule | Reclaim wall-clock inside the 5-hour window |
| `/handoff` session-split pattern | Cheap, lossless session transitions |
| Memory-layer boundary (Section 8-4) | Auto-memory for operator facts; ledger for project facts |
| Guard hook with `.env.example` carve-out | Template file stays usable |

### Changed

| Item | v10 | v11 |
|---|---|---|
| Identity | Autonomous Solo-Dev OS | Budget-Bound Autonomous Solo-Dev OS |
| Default reviewer | Fresh Opus subagent (mandatory) | Fresh Sonnet subagent; Opus = Tier 2 optional |
| Permission strategy | allow-by-default + deny rules | bypassPermissions + deterministic guard hook |
| Concurrent worker cap | ≤3 | ≤2 (Pro-plan window) |
| Opus role | Orchestration, architecture, review | Optional: top-risk review/architecture only |
| Budget | "primary design constraint" (stated) | Enforced protocol with 10 operational rules |

### v11 → v11.1 (this revision)

**Preserved (verbatim — no section removed):** the entire OS — 13 default files, 7 primitives,
ledger responsibilities, 13 quality gates, 3 verification modes, git workflow, MCP policy,
PowerShell-only shell, Self-Evolution loop, Japanese handoff, RTK *(removed at v11.1.1)*,
bypassPermissions + guard hook,
early compaction, Session Budget Protocol, tiered review, worktree isolation, memory-layer boundary.

**Fixed (stale platform facts):**

| Stale in v11 | v11.1 |
|---|---|
| Workhorse "Sonnet 4.6" | **Sonnet 5** — Claude Code default since 2026-06-30, native 1M context, intro $2/$10→$3/$15 |
| Sonnet pricing "$3/$15" | Sonnet 5 intro $2/$10 through 2026-08-31, then $3/$15 |
| Autocompact "50%" (calibrated to a ~200K window) | Re-expressed as an absolute ~100–150K target; ~15% on Sonnet 5's 1M window (§8-5). Same discipline, corrected number |
| "Subagents cannot show permission prompts" (as the whole story) | Still true, and subagents now **inherit the parent's permission mode** by default (Task `mode` deprecated) |

**Added (enforcement + evidence, no new policy):**

| Addition | Purpose |
|---|---|
| `fallbackModel` chain in settings.json | Makes "never block on model availability" deterministic (overload/availability only) |
| `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS=3` | Hard ceiling on *total* concurrent subagents (all roles), backstopping the ≤2-worker prose default |
| Nested-spawn kept off + partial-work recovery noted | Budget protection + reliability, both platform-native |
| §8 context-engineering framing + §16-1 sources | Names and sources the DNA (Anthropic, Karpathy, Cherny) |
| §18-9..12 cold-audit entries | Every v11.1 claim survives the same cold audit v11 applied to itself |

**Changed (re-derived, not reversed):**

| Item | v11 | v11.1 |
|---|---|---|
| Sonnet-first rationale | ~1/5 the cost of Opus | Sonnet 5 ≈ Opus 4.8 at ~40–60% cost → Opus *more* optional |
| Default reviewer strength | Fresh Sonnet 4.6 | Fresh Sonnet 5 (closer to Opus) |
| ≤2 worker cap | Prose recommendation | Prose + env-enforced |
| "Models come and go" | Preference order + fallback-to-Sonnet by instruction | Same, now also native `fallbackModel` config |

Nothing in v11.1 changes what pm-zero *decides*; it changes where each decision is *enforced*
(prose → harness) and refreshes the facts the decisions rest on.

### v11.1 → v11.1.1 (this patch)

**Preserved:** the entire OS. 13 default files, 7 primitives, ledger responsibilities, 13 quality
gates, 3 verification modes, git workflow, MCP policy, PowerShell-only shell, Self-Evolution loop,
Japanese handoff, `bypassPermissions` + guard hook, early compaction, Session Budget Protocol,
tiered review, worktree isolation, memory-layer boundary. **No architecture changed and no program
was added.**

**Migration, in order (about one evening, all of it configuration):**

1. `~/.claude/settings.json`: **delete** `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`; add
   `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000`; add `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`;
   **remove the RTK `PreToolUse` hook**; set `allow: ["*"]`; add `Edit`/`Write` `.env*` deny rules;
   add `Edit|Write` to the guard matcher; add the `PreCompact` and `StopFailure` one-liners.
2. `~/.claude/hooks/guard.mjs`: extend the blocked set to cover `Edit`/`Write` on `.env*`, keeping
   the `.env.example` carve-out. Re-run the 16-case spot check plus two new write cases.
3. Uninstall RTK, or leave the binary and simply stop hooking it. Remove `rtk --version` from
   Phase 0 and `rtk gain` from the audit.
4. Per project: create `.claude/rules/tests.md`; move any zone-specific rules out of `CLAUDE.md`.
5. Per project: update `CLAUDE.md` from the Section 11-1 template (routing, continuity, shell,
   self-evolution, and the new Long Tasks block).
6. Adopt `/goal` at the start of any task longer than a few turns.
7. **Verify autocompact empirically** — run past 175K, grep `compact_boundary` `preTokens` in the
   session JSONL, and check a **subagent** transcript too. This is the only step that can tell you
   whether step 1 worked, and the subagent case is exactly where v11.1 was silently wrong.

**What v11.1.1 deliberately does not do.** It adds no generated code graph, no impact analysis, no
deterministic coding loop, no typed task edges, no evidence-gated closure. Every one of those
requires a program on the critical path. That is v11.2's trade, made explicitly there. v11.1.1's
identity is the complementary one: **every correction and every improvement that costs no new
code, and nothing else.**

---

### 4-2. To v11.2

*From Section 18 of the v11.2 design spec.*

#### v11.1 → v11.2

### 18-1. v11.1 → v11.2

**Preserved (nothing removed):** the 7 file primitives, ledger responsibilities, 14 quality gates (13 from v10 + Structural Fidelity), 3 verification modes, git workflow, MCP policy, PowerShell-only shell, Self-Evolution
loop, Japanese handoff, `bypassPermissions` + guard hook, early compaction, Session Budget
Protocol, tiered review, worktree isolation, memory-layer boundary, `myself-info.md` as the
operator environment sheet.

**Fixed (v11.1 claims that were false):**

| v11.1 | v11.2 | Severity |
|---|---|---|
| Nested spawning "left at its platform default (off)" | Platform default is now **3**; pm-zero sets `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` explicitly | **Live budget hole** |
| "The allow list is moot under bypass" | Workflow subagents run `acceptEdits` and prompt outside the allow list; the list is **load-bearing** | **Live zero-prompt leak** |
| "RTK on, always — 60–90% compression" | Measured +7.6% at low effort, ±0% at high; **removed** | Wrong rule, real cost |
| "Opus 4.8, optional garnish" | **Opus 5**, strongest model on Pro, same price, reported large efficiency gains; Sonnet-first survives on a *rate-limit* argument, not a capability one | Stale premise |
| Autocompact 15 (~150K) | **18** (~180K); target 175K, derived and corroborated | Correct band, expensive edge |
| "Cache TTL ~5 min; work in 5-min bursts" | Downgraded to directional; the 5-vs-60-minute question is **unverified** | Over-tight rule |

**Added:**

| Addition | Purpose |
|---|---|
| **G_code** — `docs/graph/` + `scripts/graph.mjs` | Cut acquisition cost; enable impact analysis |
| **`.claude/rules/*.md`** path-scoped zone rules | Make the rule set growable without a per-turn tax |
| **The Coding Loop** — `Stop` + `TaskCompleted` + `StopFailure` + `PreCompact` hooks | Start-to-deploy without stopping; evidence-gated, bounded, budget-aware |
| **`Gate` column** in `tasks.md` | "done" is a claim; "verified" is an exit code |
| **Dynamic workflows** as the sanctioned fan-out | Wide operations without context cost |
| **Session-memory template alignment** | Make compaction free *and* lossless in pm-zero's terms |
| **Q14 Structural Fidelity** | A stale graph is a gated defect, not a nit |
| **§1-1.8 measure-the-paired-bill** | The principle whose absence cost v11.1 the RTK rule |

**Changed (re-derived, not reversed):**

| Item | v11.1 | v11.2 |
|---|---|---|
| Sonnet-first rationale | Sonnet 5 ≈ Opus 4.8 at 40–60% cost | Opus 5 is stronger *and* efficient; Sonnet-first survives on window-weight, and Opus 5 at low effort now beats Sonnet at xhigh for hard problems |
| Navigation | Hand-written `repo-map.md` | Generated graph; repo-map is its rendered Summary |
| Rules | All in `CLAUDE.md` | Universal in `CLAUDE.md`; scoped in `.claude/rules/` with `paths:` |
| Review Tier 2 | Opus 4.8 when available | Opus 5; optional adversarial workflow above it |
| "Never block on availability" | `fallbackModel` | unchanged — still correct |
| Stopping | Prose: "don't stop until done" | Harness: cannot stop while the gate is red |

**Migration steps, in order:**

1. `~/.claude/settings.json`: add `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1`; **delete**
   `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` and add `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000`; pin
   `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=8`; remove the RTK PreToolUse hook; set `allow: ["*"]`; add
   `Edit`/`Write` deny rules for `.env*` and add `Edit|Write` to the guard matcher.
2. Copy `hooks/loop.mjs` from this repo to `~/.claude/hooks/loop.mjs`; add `budget-wall.mjs`,
   `checkpoint.mjs`, `leak-log.mjs`; wire `Stop`, `StopFailure(rate_limit|overloaded)`,
   `PreCompact`, `PermissionRequest`.
3. Align `~/.claude/session-memory/config/template.md` to §9-2.
4. Per project: copy `scripts/graph.mjs` from this repo, run `--init`, check `--stat` is under
   budget, commit `docs/graph/`.
5. Per project: add the `Gate` column to `tasks.md`; backfill every `ready` task.
6. Per project: create `.claude/rules/tests.md`; move zone-specific rules out of `CLAUDE.md`.
7. Per project: add the `TaskCompleted` gate hook, the `PreToolUse` `Edit(tasks.md)` guard, and
   the `SessionStart` loop-reconciliation hook — all with `${CLAUDE_PROJECT_DIR}` paths. Do
   **not** add a `PostToolUse` graph-refresh hook; the graph is refreshed at commit time by the
   main agent only (§2-2, single writer).
8. Enable dynamic workflows in `/config` (Pro requires this; it is off by default).
9. Gitignore `.claude/loop.local.json`.
10. **Verify autocompact empirically** — run a session past 175K, then grep `compact_boundary`
    in the session JSONL and confirm `preTokens` is near 175K. Check a *subagent* transcript too;
    that is where the percentage-based setting was silently wrong for two versions.
11. **Run the loop once, end to end, against a real failing gate, while watching.** Confirm it
    blocks on red, advances on green, and exits cleanly at the cap. Do not arm it unattended
    before you have seen it terminate.

Steps 10 and 11 are not optional. They are the only steps that can tell you whether the rest
worked, and both of the defects that survived design review into the shipped code (§19-0) were
found by running it, not by reading it.

---

## 5. Drafting record — what adversarial review changed in v11.2

*From Section 19-0 of the v11.2 design spec. Kept out of the spec because it describes defects in
a draft rather than properties of the system.*

### 5-1. What the adversarial pass broke, and what replaced it

| Finding | The defect | The fix |
|---|---|---|
| **Loop was single-shot** | The draft allowed the stop whenever `stop_hook_active` was true. That flag is true from the *second* `Stop` onward, so the iteration cap, the repeat-signature counter and the entire escalation ladder were unreachable code. The headline feature produced exactly one forced continuation. | State-file iteration counter (Ralph's pattern); `stop_hook_active` used only near the cap. §10-2(a) |
| **Cap set above the platform's** | `maxIterations: 12` under a platform cap of **8 consecutive blocks**. The platform would always win, and its override runs none of pm-zero's cleanup — a silent fifth exit that leaves the ledger lying. | Cap lowered to 6; `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` pinned; exit 5 documented and reconciled at `SessionStart`. §10-2(b), §10-4 |
| **Gate ran inside the hook** | Synchronous full test suite inside a `Stop` hook on a 16GB laptop. A timeout is a non-blocking error that **allows** the stop — silently disabling the loop. It also contradicted §9-4 rule 6. | Agent runs the gate and records it; hook reads the record and cross-checks `sha` against HEAD. §10-2(c) |
| **Wrong compaction knob** | Three consecutive versions wrote "the invariant is absolute, not a percentage" and then configured a percentage — which also applies to subagents, so `15` meant 30K on every 200K model, including Opus 5 on Pro. Deep in the thrash regime the same section priced at +360%. | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000`, no percentage. §9-3, C5 |
| **Workflows unreachable** | Four routing rules sent work to dynamic workflows. The `ultracode` keyword is **human-typed-only**; a `Stop` hook's `reason` is not human input. The agent was instructed to use a mechanism it cannot invoke — precisely when the human is away. | Reframed as author-then-replay; only saved `.claude/workflows/` commands are agent-reachable. §7-4 |
| **`graph.mjs` did not exist** | On the critical path of every edit, gate and merge, with no spec, no language matrix, no CLI contract — and "write an AST extractor per language" delegated to a non-engineer. | Shipped: `scripts/graph.mjs`, ~410 lines, zero dependencies, regex parser, stated support matrix and exit codes, exercised against a fixture repo. §2-2 |
| **`verified` was unenforceable** | "Only the harness writes `verified`" was enforced by a hook that fires only if the model volunteers to call a tool the document itself calls non-authoritative. The model could simply write the word into `tasks.md`. Ralph's promise in a different costume. | The loop writes `verified`; a `PreToolUse` `if: "Edit(tasks.md)"` handler rejects diffs that introduce it. §10-2 |

Two further defects were found by *running* the shipped code rather than by reading it, and are
recorded because they are the argument for shipping code at all: a lock released in the wrong
order (unlink-before-close, which raises `EPERM` on Windows and on network mounts, turning a
successful write into a reported failure), and a `.trim()` that ate `git status --porcelain`'s
leading status column, shifting every path by one character and jamming the loop's freshness
check permanently. Neither was visible in review. Both were caught in the first test run.

---

## 6. Editorial policy

- A `pm-zero-knowledge-*.md` file states what the system **is**. It does not say "v11.1 said X."
- Anything of the form *"this changed because…"* belongs in this file.
- Every entry carries its evidence. Platform behaviour is cited in the design spec's Platform
  Facts section, marked **[F]** fact, **[R]** reported, **[I]** inference.
- Two of the corrections below (P1, C1) were **not** errors when written — the platform default
  moved underneath them. That distinction is preserved deliberately: it is the difference between
  a reasoning failure and a missing re-verification cadence, and only the second one is fixable
  by a rule.

---

## 7. Post-release corrections (found after both v11.1.1 and v11.2 shipped)

Applies to both siblings, since both made the same call on the item below. Unlike §2/§3, these
were not found by re-reading vendor documentation on a release day — they were found by an
operator's project drifting from the spec and by the spec itself being checked against current
docs while fixing that drift.

| # | What v11.1.1/v11.2 shipped | Truth on 2026-08-16 | Fix |
|---|---|---|---|
| **R1** | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=188000`, **no percentage** — P3/C5's "wrong knob" diagnosis: the percentage was read as a mechanism defect and deleted. | The mechanism was never the defect; the *value* (`15`) was. Current official Claude Code docs state, without qualification, that `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` "applies to both main conversations and subagents" — the scoped-thrash risk P3/C5 warned about is real at `15`, not inherent to using a percentage. The two keys also **compose** rather than exclude each other (window sets the denominator, percentage sets the trigger fraction) — confirmed in current docs; P3/C5 believed them mutually exclusive. The GitHub issue underpinning half the "fragility" argument (#36381, percentage not applying to subagents) is now closed. | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW` left unset. Both knowledge files' §8-5/§9-3 revised in place rather than superseded, since the invariant (hold the trigger in a safe band on every model) is unchanged — only the mechanism-is-broken claim was wrong. |
| **R2** | Project-level `.claude/settings.json` template: `"Bash(rm -rf *)"`, introduced to fix v11.1's malformed `"Bash(rm -rf:*)"`. §7-3/§8-5 promises scoped deletes (`rm -rf node_modules`) "pass — the guard blocks the catastrophic set, not everyday cleanup." | That promise is true of `guard.mjs`, which correctly scopes to root/home. It is **not** true of this project-level deny rule: the syntax fix made it match every `rm -rf` invocation, with no scoping at all. Blocked a benign `rm -rf .next` cache clear in a real session. | **Not fixed.** Flagged inline in both knowledge files (§7-5/§8-7) as an open item — the correct glob to scope the rule to root/home paths has not been verified against Claude Code's actual permission-rule syntax, and shipping an unverified pattern would be worse than leaving the gap documented. |

Also discovered, not a knowledge-base defect but worth recording as a process lesson: a project's
`CLAUDE.md` documented `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` for an unknown period after its
`settings.json` had already been changed to `70` — a governance migration had updated one file
and not the other. Both knowledge files' "verify the firing point" rule (§8-5/§9-3) now says to
check `CLAUDE.md` prose against the actual `settings.json` value, not just the transcript.

---

## 8. v11.2 discontinued (2026-08-16)

**This is not a §7-style correction.** Nothing in v11.2 was found false. It was found *not worth
its own cost*, for one specific operator's actual workload — and the design spec had already
named the exact condition under which that verdict would apply (§19-14.4, quoted below). This
entry exists so a future session — or a future project where the calculus differs — has the
reasoning, not just the fact of removal.

**The workload it was checked against.** One non-engineer, running Claude Code to build small
personal products under a `プロダクト/` directory (`task-plant`, `grimoire` are the two named as
examples) — conceived and worked on intermittently, "when the idea strikes," not on a schedule,
and not maintained by anyone who can read or debug the hook scripts pm-zero ships.

**Why both of v11.2's headline mechanisms miss that workload:**

| Mechanism | What it buys | Why it doesn't pay off here |
|---|---|---|
| **G_code** (`scripts/graph.mjs`, generated `docs/graph/`) | Cuts *acquisition* cost — tokens spent re-deriving repo structure by reading — on a codebase large enough that this re-derivation is a real line item. | The design spec's own §19-14.2 admits the effect is unmeasured for "a TypeScript project driven by Sonnet 5" specifically — the workload here. A solo hobby app small enough to be built between other things is small enough for a Haiku Explore subagent to just read it. |
| **The closed coding loop** (`hooks/loop.mjs`, the `Stop`/`TaskCompleted` hook chain) | Lets the agent keep working across a task queue without a human present to confirm each step actually finished. | This operator's sessions are supervised, bursty hobby sessions, not unattended multi-hour runs — the scenario the loop exists to survive. Native `/goal` already covers "don't stop mid-task" for a session someone is watching. |

**Why the cost lands harder here than on the workload v11.2 was designed for.** v11.2 adds four
global hook scripts, a graph generator, a rules directory, a state file, and a five-exit loop —
and two of the bugs that shipped past its own design review (a lock released in the wrong order,
raising `EPERM` on Windows; a `.trim()` that shifted every path in `git status --porcelain` by one
character) were caught only by *running* the code, not by reading it, on the same
Windows-PowerShell setup this operator runs. An operator who cannot design a harness themselves
(the stated reason pm-zero exists for them at all) also cannot triage a hook that fails silently
in a way neither of those two bugs would have surfaced without someone watching for it.

**The spec had already priced this in.** From v11.2 §19-14.4, unedited:

> "Complexity has roughly doubled for a non-engineer operator. [...] If the operator will not
> maintain this, v11.1 plus the corrections is a better system for them than v11.2. That is a real
> recommendation, not a rhetorical hedge: the corrections are worth deploying on their own, today,
> in about ten minutes, and they carry most of the safety value of this entire document."

**What is lost, and what is not.** Lost: G_code, the closed coding loop, typed work-graph edges,
evidence-gated task closure — all real mechanisms, correctly built, just aimed at a repo size and
an unattended-runtime pattern this operator's projects don't have yet. Not lost: everything that
made v11.1.1 itself a "truth patch" rather than a downgrade — the `.env` write-path guard fix, the
subagent nesting-depth pin, the corrected autocompact threshold, the RTK removal, and the full
budget/safety/self-evolution core both siblings shared from v11.1. `pm-zero-knowledge-v11.1.1.md`
needed no edit to absorb this decision; it was never coupled to v11.2 in the first place.

**If this changes.** If a project under `プロダクト/` grows past what one person reading the diff
can track — many files, real dependency chains, regressions from unrelated changes — that is the
concrete trigger to reconsider G_code specifically (not the whole of v11.2, and not the coding
loop, which stays tied to an unattended-operation need that has to arise on its own). Re-derive
from `pm-zero-knowledge-v11.2.md` at the git commit this removal lands in, rather than from memory
of this entry — the platform facts inside it will be stale by the time it matters again.

---

## 9. v11.1.1 → v12 (2026-08-16)

**pm-zero's first subtractive release.** The spec goes from 1429 lines to 487, not by
reorganising but by changing the criterion for what may enter it. Triggered by the operator's
own report — *"v11.1.1 も複雑すぎるのでは？というか、私自身もどのような機能があるかを詳細に
把握できていない"* — which is a system failure, not an operator failure, since pm-zero exists
so that a non-engineer need not design a harness.

### 9-1. The constitution

> A rule enters pm-zero only if it is **a config value, a script exit code, or a hook**.

Root cause of v4→v11's monotonic growth: adding a prose rule cost nothing to write and nothing
to enforce, so nothing pushed back. The constitution restores the pressure — every future
addition must be built, not merely written. One named exception is carried: the judgment-level
lines in `~/.claude/CLAUDE.md` ("prefer minimal safe edits", "think before editing"), capped at
that file's length.

### 9-2. Defects found by audit (F1–F14)

All verified against Claude Code 2.1.224, the deployed config files, official documentation
retrieved 2026-08-16, and a walk of all 18 projects under `プロダクト/`.

| # | Defect | Status |
|---|---|---|
| F1 | `Write(**/.env)` ×2 deny rules: Claude Code accepts path rules on `Write` but never consults them, and warns at startup | removed |
| F2 | Global `CLAUDE.md` claimed `permissions.allow` was `["*"]`; it was a 21-entry list. A `"*"` allow rule is in fact skipped with a warning and auto-approves nothing | text corrected to reality |
| F3 | Hook matcher `"Bash\|PowerShell\|Read\|Edit\|Write"` is an **exact-match list**, not a regex — `MultiEdit`, `NotebookEdit`, `Grep` never reached the hook. v11.1.1's headline write-path fix (P7) was dead code for two of the four tools it named | matcher anchored-regex |
| F4 | `guard.mjs` asserted hooks are "the only enforcement layer guaranteed to fire" under bypassPermissions. Deny rules apply in **every** mode and are evaluated **before** hooks | layer order corrected |
| F5 | `CLAUDE.md` forbade `CLAUDE_CODE_AUTO_COMPACT_WINDOW` as "silently disabling" the percentage. The two compose; v11.1.1 §8-5 already said so. Only `CLAUDE.md` was wrong | prohibition withdrawn |
| F6 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` cannot raise a threshold and applies only to sessions compacting *before* the model limit — plausibly inert on Opus 5 at 200K on Pro | replaced by absolute window |
| F7 | `CLAUDE.md` said "keep effort at medium"; deployed config said `high`; `high` is the platform default on every model | rule and key both removed |
| F8 | `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` / `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` absent from the official env-var reference | removed |
| F9 | `CLAUDE_CODE_USE_POWERSHELL_TOOL` is documented as the switch for *non-Windows*; redundant here | **retained deliberately** — removal untested, failure mode (no shell) worse than one redundant line |
| F10 | Session start read `state.md`/`decisions.md`/`repo-map.md` and "nothing else by default" — `docs/issues.md` was never read back. The learning loop had a write path and no read path | `issues.md` added to session start |
| F11 | Shell secret-read guard covered only `cat\|type\|get-content\|gc` | widened to `head`, `tail`, `more`, `less`, `sed`, `awk`, `Select-String`, and copy/move forms |
| F12 | Commands that destroy **uncommitted** work were entirely unguarded — the `clean`/`checkout .`/`stash drop` family. For a system whose continuity model is "the files are the memory", these delete the memory | blocked at both layers; scoped forms still pass |
| F13 | The OS sandbox — the documented answer to "a script that opens files itself" — does not run on native Windows. The residual hole cannot be closed by configuration | recorded as an **accepted risk** (§9-5) |
| F14 | P6 (cache TTL, "5 minutes or 1 hour — unverified") left open since v11.1.1 | **resolved: one hour on a Claude subscription**; subagents get five minutes |

One F12 rule was added and deleted the same day, and the sequence is the whole learning loop in
miniature. A `git branch -D` guard was written; the test suite caught it blocking the safe
lowercase `-d` (a case-insensitive regex); it was fixed to be case-sensitive; then, on its first
use in anger, it blocked pm-zero's own post-merge branch cleanup. That was not a bug in the
regex — it was a bug in the rule. `-D` destroys a **pointer**: the commits stay in the reflog
for 90 days. `clean -f`, `checkout .` and `stash drop` destroy content git has no other record
of. Recoverability, not apparent danger, is the criterion. And because pm-zero mandates
squash-merge, `-d` cannot delete a merged branch at all, so `-D` is the only cleanup path — the
rule blocked the workflow that the same document prescribes. Deleted, with the reasoning left in
the guard as a comment so it is not re-added. 38 cases pass (13 allow, 25 block).

A known cost of F12: the guard now matches destructive command *shapes* anywhere in a shell
string, so writing documentation that quotes those commands via a heredoc is blocked. This is
inherent to regex-on-command-string guarding and is not worked around — file content is written
with the file tools, which is the correct path anyway.

### 9-3. Deletions (D1–D10)

| # | Deleted | Cause |
|---|---|---|
| D1 | Session Budget Protocol, 10 rules → 3 | Cached input bills at ~10% and a subscription holds the cache one hour, so "one task per session" paid a cold-cache tax on every handoff. It was not merely unnecessary — it was more expensive |
| D2 | 7 of 13 quality gates (Q1, Q2, Q5, Q6, Q8, Q10, Q11) | Satisfiable only by prose, written by the author in the author's context. For hobby projects Q6/Q10/Q11 usually do not apply, and the checklist had no "N/A", so a plausible ✓ was generated regardless |
| D3 | Review Tier 2 (Opus for auth/billing/DB/PII) | Trigger classes essentially absent from this operator's projects; plausibly never fired in four months |
| D4 | Three of four learning destinations; `docs/lessons.md` | Nothing read them |
| D5 | The "3 identical failures" trigger → **1 surprising failure** | Most lessons come from one surprise; three identical failures are rare. Measured: `.claude/rules/` exists in **1 of 18** projects |
| D6 | `AGENTS.md` from the default template | Artifact of the abandoned multi-vendor era (v9.x); Claude-Code-only since v10 |
| D7 | Per-task effort escalation | Effort is part of the cache key; raising it mid-session re-reads the whole conversation. Replaced by the `ultrathink` keyword, which leaves the API effort level unchanged |
| D8 | Plan → `/handoff` → execute session splitting | Directly contradicted by D1 |
| D9 | `effortLevel` config key | Equals the platform default |
| D10 | 942 lines of specification (1429 → 487) | Consequence of the above |

### 9-4. Additions (N1–N2)

**N1 — `.github/workflows/ci.yml` becomes a default project file.** The only mechanism added in
v12, and the one change that had to earn its place against the constitution. It runs the same
four checks as `scripts/verify.mjs`; the difference is *where*. Under v11 the agent that wanted
to merge ran the verification on its own machine and reported the result. An agent can report a
passing local run; it cannot fabricate a GitHub check. With branch protection, the merge gate
stops being a paragraph the agent grades itself against.

Measured baseline: **2 of 18** projects have a CI workflow today.

**N2 — `~/.claude/agents/{planner,reviewer}.md`.** Model routing moves from a prose table into
subagent frontmatter (`model: opus`, `effort: high`, read-only toolsets). This is the only
sanctioned way to use a second model in v12: switching `/model` mid-session re-reads the whole
conversation, whereas a subagent never shares the parent's cache, so its model choice imposes no
switching cost on the parent.

### 9-5. Accepted risk, recorded rather than closed

Deny rules and hooks do not reach a process that opens a file itself (`node -e`, `python -c`).
The documented remedy is the OS sandbox, which does not support native Windows. **The risk is
accepted and will not be mitigated**: personal hobby projects, no production system, no real
money, no third-party data, no secrets in the working tree. `bypassPermissions` likewise offers
no protection against prompt injection, and `curl`/`wget` are unrestricted.

The point of the entry is that it is written down. v11 could tell itself the hole was closed.

### 9-6. What v12 costs

Stated because every prior release stated only what it gained. Seven quality gates are gone; if
one was catching something, that catch is gone with it — the evidence says they were not, since
no artifact from any of them survives in 18 projects, but absence of evidence is what it is.
Tier 2 review is gone and would have to be re-derived rather than re-enabled. CI is real
recurring work. And the accepted risk is now permanent rather than pending.

### 9-7. Files

Deployed: `~/.claude/settings.json`, `~/.claude/hooks/guard.mjs`, `~/.claude/CLAUDE.md`,
`~/.claude/agents/planner.md`, `~/.claude/agents/reviewer.md`.
Repository: `pm-zero-knowledge-v12.md` added; `pm-zero-knowledge-v11.1.1.md` deleted;
`README.md` rewritten (it had been stale since v11 — Sonnet 4.6, RTK, 50% autocompact, and a
pointer to the no-longer-existing `pm-zero-knowledge-v11.md`).

Per-project migration, applied as each project is next touched: add `ci.yml` and branch
protection (start with `task-plant` — it already has both `verify.mjs` and the only
`.claude/rules/` file in existence); add `docs/issues.md` to the session-start read set and
strip it to current blockers; delete `docs/lessons.md` and `AGENTS.md` where unused.

---

## 10. v12 → v12.1 (2026-08-21)

> **Historical record only.** v12.2 withdrew every frontend/UI rule, special file, and tool
> default described in this section. None of it is an active pm-zero instruction; see Section 11.

**pm-zero's first additive release since the constitution shipped.** Triggered by a separately
drafted document, `AI_Agent_Design_Operating_System.md` (938 lines), proposing a frontend/UI
design-operations workflow for this operator's projects. Rather than adopt it as written, it was
run through the same admission test Section 9 applied to the backend: a rule enters only if it
is a config value, a script exit code, or a hook. Most of the source document failed that test
outright — an 8-phase implementation loop, five "Agent Operating Rules", a 14-point self-critique
checklist, and a four-file ledger (`PRODUCT.md`, `DESIGN.md`, `UX_RULES.md`,
`ASSET_REGISTRY.md`) — the same shape of self-graded prose judgment that D2 (§9-3) already
removed from the backend for being unenforceable. It was not carried over just because the domain
changed from backend to frontend.

### 10-1. What passed the constitution (K1–K4)

| # | Source rule | pm-zero mechanism |
|---|---|---|
| K1 | §6 "Raw values" — no unregistered hex/px/radius/shadow | `verify.mjs` **lint check**, active only once a project adopts `DESIGN.md` |
| K2 | §7 Rule 4 "No Blind Completion" — a screen isn't done until seen running | Existing **Playwright MCP + `run` skill**, named as the specific tool for an already-existing global instruction |
| K3 | §9 "User Prompt Contract" — a non-engineer can't review a diff but can react to a rendered design | **`/design-sync` + claude.ai/design**, generating against the project's real components instead of placeholders (Claude Code 2.1.198+, Anthropic API only) |
| K4 | §7 Rule 5 / Phase 5 "Visual QA" — fresh-eyes audit of a finished screen | Existing **Tier 1 reviewer** trigger list, extended to cover UI/design-token changes |

K3 was added mid-task at the operator's explicit direction, after the initial three-row pass —
the operator specifically wanted the Claude Code `/design-sync` mechanism (not a literal
`/design` command, which does not exist; confirmed against the official commands reference)
included as the way to put a rendered design in front of a non-engineer before or during
implementation, rather than relying only on the agent's own Playwright verification.

### 10-2. The tool stack: verified, then split by scope (T1–T2)

The first pass of this release left the source document's tool stack entirely undeployed. The
operator pushed back: the point of "integrate as the frontend system" was for the tools to
actually be available, not merely documented as deferred. Before deploying anything, every name
was checked against what actually exists — a subagent research pass first, then independent
verification of the two claims that mattered operationally:

| Name | What it actually is | Verified against |
|---|---|---|
| `frontend-design` | Official Anthropic plugin (`claude-code-plugins` marketplace), 796,950 installs | anthropics/claude-code repo, claude.com/plugins/frontend-design |
| Impeccable | Third-party (pbakaus), builds on `frontend-design`; `npx impeccable install` writes `.claude/skills/impeccable/` **into the project it's run in** | github.com/pbakaus/impeccable |
| shadcn/ui Skill | Official (shadcn team); reads the project's own `components.json` on every run | ui.shadcn.com/docs/skills — install command `npx skills add shadcn/ui` |
| Context7 | MCP server for version-specific library docs; not frontend-specific | context7.com/docs/clients/claude-code |
| Chrome DevTools MCP | Official Google Chrome DevTools team repo is `ChromeDevTools/chrome-devtools-mcp` — a subagent's first pass cited `benjaminr/chrome-devtools-mcp`, an unofficial fork, and was corrected before anything was installed | github.com/ChromeDevTools/chrome-devtools-mcp |
| Awesome Claude Design, `tweakcn` | A curated reference list and an external web app (tweakcn.com) — neither is a Claude Code integration | Confirmed not installable |

**T1 — global, deployed as part of this release.** `frontend-design` and `context7` have the
same value in every session and cost their tool-schema weight once, not per project:

    claude plugin marketplace add anthropics/claude-code
    claude plugin install frontend-design@claude-code-plugins
    claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp

Both verified connected via `claude plugin list` / `claude mcp list` on 2026-08-21.

**T2 — per-project, auto-provisioned rather than asked about.** Impeccable, the shadcn/ui Skill,
and Chrome DevTools MCP each depend on the project they run in (a written skill directory, a
project's own `components.json`, or simply being dead weight in a session with nothing to
inspect in a browser). These are not installed today; they become a `scripts/verify.mjs`
sibling step — `scripts/setup.mjs` detects a frontend-framework dependency in `package.json` (or
an already-adopted `DESIGN.md`) and runs all three with no prompt, consistent with this
operator's zero-prompt baseline. See §16.7 of the knowledge file for the exact commands.

`PRODUCT.md` and `UX_RULES.md` are still not added as ledger files: `docs/vision.md` already
carries product purpose and priorities, and per-feature UX principles are judgment calls of the
kind Section 1's global-file exception already covers.

**Conflicting existing tooling: none found.** The instruction to prefer the new document over
any existing competing frontend tooling was checked against `pm-zero-knowledge-v12.md`,
`README.md`, and `update.md` (`grep -i` for shadcn/figma/storybook/design/frontend/playwright/
lucide/tailwind/mcp). Nothing in pm-zero named a frontend design tool before this release, so
nothing was removed under that instruction.

### 10-3. Optional files (Section 3 extension)

`DESIGN.md`, `ASSET_REGISTRY.md` join the existing optional-on-need list (`.claude/rules/*.md`,
`.claude/agents/*.md`, etc.) — added only by a project with a UI surface, only when the UI work
starts, following the same rule as every other optional file in the template.

### 10-4. What v12.1 costs

The first size increase since the constitution shipped: `pm-zero-knowledge-v12.md`'s 557 lines
(post the in-progress Codex CLI additions) become 683. **Global config changed for the first
time under this constitution** — a plugin and an MCP server, both user-scoped — which v12 itself
never did. The cost is in the spec file, in the deployed global state, and in a `setup.mjs` step
every future UI project now runs unprompted; that last one is the operator trading a manual
per-project decision for a machine-checkable one, the same trade the constitution already makes
everywhere else. It is accepted because the alternative — three tools re-evaluated from scratch
on every new project, or a UI-operations document maintained outside pm-zero's own constitution
— is exactly the kind of ungoverned, unrepeatable decision-making v12 existed to stop.

### 10-5. Files

Repository: `pm-zero-knowledge-v12.1.md` added (renamed from `pm-zero-knowledge-v12.md` with
Section 16 and cross-references added); `pm-zero-knowledge-v12.md` deleted;
`AI_Agent_Design_Operating_System.md` deleted, absorbed into Section 16; `README.md` updated
(version, spec line count, a new "v12 → v12.1" section, two FAQ entries); `update.md` — this
section.
Global (deployed, not just documented): `frontend-design@claude-code-plugins` (plugin, user
scope) and `context7` (MCP, user scope) — added via `claude plugin install` / `claude mcp add`
and verified connected, both on 2026-08-21.

No per-project migration is required until a project next does UI work; at that point, Section
16.7's auto-provisioning step fires, and separately Section 16.8 applies (`DESIGN.md` when there
is a token system to register; `/design-login` once per machine and `/design-sync` once per
project before relying on K3).

---

## 11. v12.1 → v12.2 (2026-08-30)

**A replacement, not an iteration on the previous frontend layer.** The operator reported that
v12.1 did not produce the intended frontend result and directed that all frontend-related material
be revoked before rebuilding. The defect was conceptual: v12.1 applied the executable-quality-
gate constitution to product direction. That correctly rejected self-issued quality certificates,
but incorrectly discarded the concrete constraints that define the product the operator wants.
v12.2 distinguishes the two. Quality claims still require executable evidence; explicit product
constraints and mandatory work-order steps may be direct prose with a concrete trigger and an
observable result.

### 11-1. Full withdrawal of the v12.1 frontend layer

Removed from the active specification: raw-value/token lint; Playwright plus run-skill browser
mandate; design-login/design-sync flow; UI-specific reviewer trigger; special `DESIGN.md` and
`ASSET_REGISTRY.md` roles; global frontend-design plugin and Context7 MCP defaults; and automatic
Impeccable, shadcn skill, or Chrome tooling triggered by framework detection. Section 10 is kept
only as labelled release history. No v12.1 frontend mechanism is reused as the basis of the new
rules.

### 11-2. Global baseline and per-project capability gate

The pm-zero-managed global MCP baseline is now exactly **Chrome DevTools MCP** for Claude Code and
Codex. Google's official repository is the canonical install and security source:
https://github.com/ChromeDevTools/chrome-devtools-mcp. Independently enabled account connectors
remain outside pm-zero's baseline.

Every project now pauses after task discovery and before implementation to Web-search current
official or maintainer information, compare capabilities, maintenance, compatibility, auth/data
exposure, permissions, context cost, overlap, licence, and reproducibility, then install the
minimum suitable set at project scope. MCP is preferred when it directly exposes the required
external data/tool/action; a skill is used for reusable instructions/scripts; a plugin is used
only when bundling and distribution add value. Definitions were rechecked against:

- OpenAI MCP: https://learn.chatgpt.com/docs/extend/mcp
- OpenAI skills: https://learn.chatgpt.com/docs/build-skills
- OpenAI plugins: https://learn.chatgpt.com/docs/build-plugins
- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Claude Code plugins: https://code.claude.com/docs/en/plugins

### 11-3. New frontend directives

The replacement layer starts from the requested product outcome:

1. Before design, Web-search comparable shipped products and select exactly one strongest UI as
   the structural and interaction model; copy neither brand nor proprietary assets.
2. Give each page one dominant job and move subordinate jobs/details to named child pages. Reject
   dense all-in-one screens.
3. Reject card/panel collections and nested decorative boxes. Authored UI surfaces and controls
   have square corners (`border-radius: 0`); no rounded cards, buttons, inputs, badges, or pills.
4. Use one external hierarchy system: **Apple Human Interface Guidelines**. Essential information
   comes first and gets space; position/grouping, typography, spacing/alignment, then contrast and
   color communicate importance. Color is never the only signal. The operator's square-corner and
   anti-panel constraints override Apple's visual styling.
5. Every action gives immediate feedback. Short, restrained, interruptible transitions preserve
   continuity without blocking input; reduced-motion users receive an instant/non-motion path.
6. Effects, animations, transition assets, and sounds are searched from existing high-quality,
   licensed sources. The AI does not generate them. Unsuitable or unlicensed assets are omitted.
7. Chrome DevTools MCP supplies observable completion evidence across changed routes, actions,
   and supported widths.

Apple was selected as the one hierarchy source because its official guidance covers the full
requested chain—simplicity, progressive disclosure, placement, typography, color, and purposeful
motion—in one coherent system:

- https://developer.apple.com/design/human-interface-guidelines/design-principles
- https://developer.apple.com/design/human-interface-guidelines/layout
- https://developer.apple.com/design/human-interface-guidelines/typography
- https://developer.apple.com/design/human-interface-guidelines/color
- https://developer.apple.com/design/human-interface-guidelines/motion

### 11-4. Files and carried work

Repository: `pm-zero-knowledge-v12.1.md` replaced by `pm-zero-knowledge-v12.2.md`; `README.md`
updated for the new baseline and rules; `update.md` records this migration. Pre-existing
uncommitted non-frontend refinements were reviewed and retained: pointer-based startup, isolated
generated-output writes, precise fresh-review triggers, deterministic reproductions, layered
verification, learning-gate cost control, and single-owner ledger rules. The proposed global
CodeGraph MCP entry was dropped because it conflicts with the Chrome-only baseline; edits within
the withdrawn frontend section were dropped with that section.

Global deployment: remove user-scoped frontend-design, Context7, and Playwright defaults; install
or retain the official Chrome DevTools MCP as the only pm-zero-managed global MCP for both CLI
runtimes. Verified on 2026-08-30: resolved package version `1.8.0`; Claude reports the user-scoped
server connected, and Codex reports its sole configured MCP enabled.
