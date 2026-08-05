# update.md — pm-zero change history

Version deltas, migration steps, and the reasons behind each change. The
`pm-zero-knowledge-*.md` files are pure design specifications and state only what the system
*is*; everything about what *changed*, and why, lives here.

**Current files**

| File | Status |
|---|---|
| `pm-zero-knowledge-v11.2.md` | Current. Graph-Bound Autonomous Solo-Dev OS. Requires `scripts/graph.mjs` and `hooks/loop.mjs` |
| `pm-zero-knowledge-v11.1.1.md` | Current, config-only alternative. Every correction and improvement that costs no new code |
| `pm-zero-knowledge-v10.md` | Historical reference. Some v11.x templates still cite its section numbers |

`pm-zero-knowledge-v11.md` and `pm-zero-knowledge-v11.1.md` were removed on 2026-07-27: both are
complete subsets of the two current files, and both carried claims the platform has since
falsified (P1–P7 below).

**Label index** — these identifiers are referenced from inside the design specs:

| Prefix | Meaning | Defined in |
|---|---|---|
| `P1`–`P7` | v11.1 claims corrected in v11.1.1 | §2 |
| `A1`–`A6` | v11.1.1 additions that cost no new code | §2 |
| `S1`–`S2` | v11.2 structural changes | §3 |
| `C1`–`C7` | v11.1 claims corrected in v11.2 | §3 |

---

## 1. Lineage

```text
v10   2026-06-08  Autonomous Solo-Dev OS
v11   2026-07-05  + budget wall, zero prompts, guard hook          [removed 2026-07-27]
v11.1 2026-07-23  + platform facts refreshed, prose -> harness      [removed 2026-07-27]
  |
  +-- v11.1.1  2026-07-27  truth patch, config only        -> pm-zero-knowledge-v11.1.1.md
  +-- v11.2    2026-07-27  graph re-architecture           -> pm-zero-knowledge-v11.2.md
```

v11.1.1 and v11.2 are siblings, not a sequence. Both correct the same set of v11.1 errors. They
differ in where they stop: v11.1.1 stops exactly where new programs would begin; v11.2 crosses
that line deliberately and ships the programs.

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
