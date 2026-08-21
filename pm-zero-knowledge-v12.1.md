# pm-zero v12.1 — Executable-Only Solo-Dev OS

    Version   v12.1
    Date      2026-08-21
    Runtime   Claude Code 2.1.224 · Codex CLI · Windows 11 · PowerShell · Claude Pro ($20/mo, no overage)
    Replaces  v12 (deleted in this release)
    Size      683 lines, up from v12's 557 — the first release since v12 to grow, by design (§16)

---

## 0. Result

v12 is the first release in pm-zero's history whose primary act is **subtraction**.

v4.0 through v11.1 grew monotonically because adding a prose rule cost nothing to write and
nothing to enforce, so nothing ever pushed back. The result was a 1429-line specification its
own operator could not hold in their head — which is a failure of the system, not of the
operator, because pm-zero exists precisely so that a non-engineer does not have to design a
harness.

v12 does not reorganise that specification. It changes **the criterion for what may enter it**,
then deletes everything that fails the new criterion.

Three things drove the design, all established by audit rather than assumption:

1. **Long sessions are cheaper than short ones.** Cached input bills at ~10% of the standard
   rate and a Claude subscription holds the cache for one hour. v11's "one task per session"
   rule paid a cold-cache tax on every handoff for a context-hygiene benefit auto-compaction
   already provides.
2. **Switching model or effort mid-session re-reads the whole conversation.** v11's routing
   table and per-task effort escalation were both priced as free. They are not.
3. **Seven of v11's thirteen quality gates could only ever be satisfied by prose**, written by
   the same model that wrote the code, in the same context. Four months of real projects
   confirm the consequence: `scripts/verify.mjs` (executable) exists in 12 of 18 projects;
   not one gate-assessment artifact survives anywhere.

**v12.1 adds one thing on top of that subtraction.** A separately drafted frontend/UI
design-operations document (`AI_Agent_Design_Operating_System.md`) proposed an 8-phase workflow,
five operating rules, and a 14-point self-critique checklist for UI work — almost all of it the
same shape of self-graded prose judgment point 3 already rejected for the backend. Section 16
keeps only what reduces to a check, a triggered tool invocation, or a config value, and discards
the rest under the same constitution, not a looser one for having a UI in scope.

---

## 1. The Constitution

> **A rule enters pm-zero only if it is a config value, a script exit code, or a hook.**

That is the whole of it. Three consequences, all intended:

- **Prose advice is no longer admissible.** If a lesson cannot be written as a check, the
  correct response is usually that it was not a rule to begin with.
- **Quality claims become falsifiable.** "The architecture is sound" is not a claim v12 can
  make. "`node scripts/verify.mjs` exits 0" is.
- **Growth has a cost again.** Every future addition must be built, not merely written. That
  is the pressure v4–v11 never had.

One deliberate exception is carried, and it is named rather than smuggled: the global
`~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md` contain a small number of judgment-level
instructions ("prefer minimal safe edits", "think before editing") that no exit code can
express. They are kept because removing them measurably degrades output, and are capped at the
length of those files. They are the exception that must justify itself, not the default.

The following operator-facing judgment is part of that exception and belongs in those global
instruction files, not in a project checklist or a self-assessed quality gate:

> **Translate a non-engineer's words into the intended product outcome before implementing.**
> Preserve the product image and the problem they are trying to solve; do not mechanically
> implement the literal phrasing when it would miss that intent. Build code as small, cohesive
> modules with clear boundaries so likely changes stay local, and make choices that can scale
> when the product's actual needs require it. Do not introduce abstraction, infrastructure, or
> generality before there is a concrete need.

This is deliberately a judgment instruction rather than an architecture rule. It gives the
agent a decision order: intended outcome first; modular, change-friendly implementation second;
proven scale requirements third; and the smallest adequate design throughout. When an ambiguity
would materially change the product, state the inferred intent and assumption before proceeding.

---

## 2. What pm-zero Is

An operating-system-level rule set that lets one non-engineer ship software with Claude Code or
Codex CLI, under three constraints that are facts rather than preferences:

1. **$20/month, hard wall.** Claude Pro only. No API overage, no pay-as-you-go. Budget
   discipline outranks speed.
2. **No human reviewer, ever.** There is one person, and they cannot review code. Every
   quality mechanism must work without them.
3. **Work is intermittent.** Weeks pass between sessions. The transcript is disposable; the
   file system is the memory.

Everything below derives from those three. Nothing below exists because it is good practice
in general.

---

## 3. Default Project Structure (16 files)

    Core (5)        CLAUDE.md · AGENTS.md · .claude/settings.json ·
                    .codex/config.toml · HANDOFF-JA.md
    Ledger (5)      docs/vision.md · tasks.md · docs/state.md ·
                    docs/decisions.md · docs/issues.md
    Navigation (1)  docs/repo-map.md
    Executable (3)  scripts/setup.mjs · scripts/verify.mjs ·
                    .github/workflows/ci.yml            ← new in v12
    Aux (2)         .env.example · .gitignore

Changes from v11.1.1's thirteen:

| File | v12 | Why |
|---|---|---|
| `.github/workflows/ci.yml` | **added** | The only addition in v12. Section 7. |
| `docs/lessons.md` | **removed** | Never read by anything. The learning loop now has one destination (Section 9). |
| `AGENTS.md` | **added back** | Codex's project instruction entry point. It reads `CLAUDE.md` as the canonical shared ruleset and documents only Codex-specific mechanics; never duplicate the shared rules. |
| `.codex/config.toml` | **added** | Deliberately empty project-scoped override file. It makes Codex support explicit; security-sensitive defaults remain global because Codex ignores them at project scope. |

Optional, added only on a concrete need: `.claude/rules/*.md`, `.claude/agents/*.md`,
`.claude/commands/*.md`, `.mcp.json`, `CONTEXT.md`, `scripts/lib/*`, and — for a project with a
UI surface — `DESIGN.md`, `ASSET_REGISTRY.md` (Section 16.6).

`AGENTS.md` must direct Codex to read `CLAUDE.md` first, then the same startup ledger files.
Because Codex does not load Claude's `paths:` rules automatically, it must also instruct Codex to
open every matching `.claude/rules/*.md` before editing a governed path. The ledger, verification,
git workflow, and learning loop are shared; only runtime mechanics belong in `AGENTS.md`.

---

## 4. Global Configuration (deployed, not aspirational)

`~/.claude/settings.json`, `~/.claude/hooks/guard.mjs`, `~/.claude/CLAUDE.md`,
`~/.claude/agents/{planner,reviewer}.md`. Every value below is in place as of this release.

**`env`** — two keys, down from four:

| Key | Value | Why |
|---|---|---|
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | `400000` | The single compaction knob. Replaces `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`, which docs say cannot raise a threshold and applies only to sessions that compact *before* the model's limit — a condition Opus 5 on Pro (200K) may not meet. An absolute window is unambiguous on every model. Caveat: the status line's `used_percentage` measures against the model's full window, so it no longer indicates when compaction fires. |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL` | `1` | Documented as the switch that enables the PowerShell tool *on non-Windows*, so it is redundant here. **Retained deliberately**: removing it is untested, and the failure mode (no shell) is worse for a non-engineer than one redundant line. |

Removed: `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` and `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` —
neither appears in the official environment-variable reference, so neither can be verified to
do anything.

**`permissions`** — `defaultMode: "bypassPermissions"`. The `allow` list is retained: allow
rules are inert under bypass, but a subagent running in another permission mode can still hit
a prompt without one. Note that a `"*"` allow rule, which v11's CLAUDE.md prescribed, is
skipped with a warning and auto-approves nothing.

`deny` now covers `.env`, `.env.local`, `.env.*.local`, `.env.production`, `id_rsa`, `*.pem`,
`.git-credentials`, `~/.ssh/**`, `~/.aws/**` — all anchored with `//` so they apply across the
whole filesystem rather than only under the working directory. The general `.env.*` family is
left to the hook, because deny rules cannot carry the `.env.example` exception.

Removed: `Write(**/.env)` and `Write(**/.env.*)`. Claude Code accepts path rules on `Write` but
**never consults them**, and warns at startup. The write path is covered by the hook and by
`Edit` rules, which do apply to every built-in file-editing tool.

**`model`** — `"sonnet"`. **`effortLevel`** — removed; the platform default is `high` on every
model that supports effort, so configuring it changed nothing.

**Hooks** — three:
- `PreToolUse` → `guard.mjs`, matcher `^(Bash|PowerShell|Read|Edit|Write|MultiEdit|NotebookEdit|Grep)$`
- `PreCompact` → checkpoint commit of the ledger files
- `StopFailure(rate_limit|overloaded)` → checkpoint commit + a line in `docs/issues.md`

**Codex** — machine-wide configuration belongs in `~/.codex/config.toml`; its global
`AGENTS.md`, `hooks.json`, and `hooks/guard.mjs` provide the instruction and guard layers.
The equivalent zero-prompt local-operation baseline is:

| Key | Value | Why |
|---|---|---|
| `approval_policy` | `"never"` | No approval prompt for normal in-scope development work. |
| `default_permissions` | `":danger-full-access"` | Codex can read, edit, build, and test the generated repository. |
| `[apps._default].default_tools_approval_mode` | `"approve"` | Connected app tools follow the same autonomous default. |
| `[mcp_servers.<id>].default_tools_approval_mode` | `"approve"` | Each configured MCP server follows that default independently. |
| `[agents].max_concurrent_threads_per_session` | `4` | The Codex worker-subagent ceiling; it excludes the primary agent. |
| `[windows].sandbox` | `"unelevated"` | On a normal Windows user token, `"elevated"` can prevent Codex from spawning the shell with `CreateProcessAsUserW` access-denied errors. |
| `[windows].sandbox_private_desktop` | `false` | Retain the compatible desktop path for local shell and MCP process startup. |

The global Codex PreToolUse hook uses a broad matcher and `~/.codex/hooks/guard.mjs` to block the
same destructive command shapes and `.env*` access as the Claude guard (while allowing
`.env.example`). Match the input shape (shell command or patch/file target), not a fixed Codex
tool name: those names have changed between runtime versions. A changed hook can require a
one-time human trust confirmation on its next use; this intentional confirmation is outside the
normal no-prompt development baseline. Project `.codex/config.toml` is loaded only for trusted
projects. Do not put `approval_policy`, sandbox permissions, model providers, notifications, or
other security-sensitive settings in it: Codex ignores those project-scoped keys. Keep the file
empty unless a genuinely project-specific, non-security override is required.

Do not combine `default_permissions` with legacy `sandbox_mode` or
`[sandbox_workspace_write]` configuration. After a Codex update, re-check the global permission
profile, Windows sandbox settings, project-scope restrictions, and hook input shape against the
official Codex configuration reference before changing this baseline.

---

## 5. Session Protocol (three rules, replacing v11's ten)

1. **Do not split Claude Code work across sessions.** Cached input bills at roughly 10% of the standard
   rate, and on a Claude subscription Claude Code requests the one-hour TTL automatically. A
   new session rebuilds the prefix at full price; the docs warn that the first turn back into
   a long session "can be the most expensive request you send". v11's rule 1 — one task per
   session — was therefore not merely unnecessary but actively more expensive.
2. **Checkpoint at task boundaries, and commit immediately before compaction/handoff.**
   Compaction is lossy summarisation. In Claude Code, `/compact` is the manual mechanism and
   the 400K auto-compact window is the safety net. In Codex, retain the same ledger checkpoint
   discipline without importing Claude-specific cache or slash-command claims.
3. **Delegate wide file reading** to a subagent, whose context is discarded when the summary
   returns. Do not pull many files into the main context. Codex may use up to its configured
   global worker ceiling when write scopes are disjoint.

Retired from v11's protocol, with cause: Haiku-first reading (folded into rule 3), RTK
(removed in v11.1.1 after a 425-trial paired benchmark), per-task effort escalation (Section 6),
plan/execute session splitting (contradicted by rule 1), the 5-minute-TTL hedge (resolved: one
hour on a subscription), and "stop before the wall" (the `StopFailure` hook does it).

---

## 6. Model and Effort Routing (Claude Code)

**The governing fact:** model and effort level are both part of the prompt-cache key. Changing
either mid-session recomputes the entire request. v11's routing table assumed switching was
free; every switch cost a full re-read of the conversation.

| Situation | v12 |
|---|---|
| Everything by default | **Sonnet 5**, platform-default effort (`high`), main context |
| One turn needs deeper reasoning | Write **`ultrathink`** in the prompt. It adds an in-context instruction and leaves the API effort level unchanged, so the cache survives. `think hard` and `think more` are passed through as ordinary text and are **not** recognised. |
| Architecture / multi-file planning | **`planner` subagent** — Opus 5, `effort: high`, read-only |
| Final review of a finished diff | **`reviewer` subagent** — Opus 5, `effort: high`, read-only |
| Wide codebase reading | Built-in **`Explore`** subagent; only the summary returns |
| Single-file fix, small edit, first-attempt debugging | Main context. Do not spawn. |

**Why subagents make Opus free on the main thread:** a subagent opens its own conversation with
its own system prompt and never reads the parent's cache, so its model choice imposes no
switching cost on the parent. The parent's own prefix is untouched. This is the only sanctioned
way to use a second model in v12.

Two costs to keep in view: a subagent's first request is always uncached, and subagents use the
five-minute TTL even on a subscription. That is the concrete price of a spawn, and the reason
the routing table's bottom row exists.

If Opus is unavailable, `fallbackModel` substitutes Sonnet 5. The pipeline never blocks on Opus.

**Codex routing is intentionally separate.** Use the model and reasoning effort configured in
`~/.codex/config.toml`; do not copy Claude's Sonnet/Opus names, `ultrathink`, prompt-cache, or
subscription-budget rules into `AGENTS.md`. The shared rule is operational: use a fresh-context
reviewer for large, behaviour-changing, or hard-to-undo diffs; use worker subagents only for
disjoint scopes; keep small fixes in the main context.

---

## 7. Quality: Executable Checks and CI

**`scripts/verify.mjs`** — four checks, unchanged in substance from what already runs in 12 of
18 existing projects:

    lint · typecheck · test · build

Plus, as standing requirements that are themselves executable or observable:
- a **reproduction test** before every bug fix
- **`gitleaks git --no-banner`** before push, when available
- a **Japanese handoff** in `HANDOFF-JA.md` on completion
- for a project that has adopted `DESIGN.md`, the **raw-value lint** (Section 16.2)

**`.github/workflows/ci.yml` — the one addition in v12, and the most important change in it.**

CI runs the same four checks on GitHub. The difference is not what runs but *where*: v11 had
the agent that wanted to merge run the verification, on its own machine, in its own session,
and report the result. No engineering organisation permits the author to be the CI, and the
reason is not distrust of people — it is that a self-reported green check carries no
information. **An agent can report a passing local run. It cannot fabricate a GitHub check.**

With branch protection requiring the check, the merge gate stops being a paragraph the agent
grades itself against and becomes a condition it cannot route around.

### The seven gates that were deleted

v11 carried thirteen quality gates. Sorted by whether a machine can decide them, seven could
not: Q1 correctness ("acceptance met"), Q2 spec ("vision carries intent"), Q5 architecture
("dependencies one-directional"), Q6 performance ("hot paths lean"), Q8 reliability ("every
error handled"), Q10 data integrity, Q11 observability.

Each was a prose self-assessment by the author, in the author's context. Worse, for personal
hobby projects Q6, Q10 and Q11 usually do not apply at all — and the checklist had no concept
of "not applicable", so a plausible ✓ was generated for each. That is the precise shape of
work that looks like quality assurance and is not.

They are deleted rather than automated because most of them describe a judgment, and v12's
position is that an unenforceable judgment written down as a gate is worse than no gate: it
consumes attention and returns a false signal.

**Verification depth** (retained from v11 — these map to real commands, so they pass the
constitution): **quick** for docs and low-risk config; **standard** = `node scripts/verify.mjs`;
**final** = standard + CI green + Section 8 review.

---

## 8. Review: Two Tiers

- **Tier 0 — deterministic.** `verify.mjs` locally, then CI on the PR. Nothing proceeds past a
  red check. This is the tier that does the work.
- **Tier 1 — fresh context.** The `reviewer` subagent reads the diff with no implementation
  history. Triggered when the change is large, changes behaviour, is hard to undo, or touches
  shared UI components or design tokens (Section 16.5).

The mechanism that makes Tier 1 work is the *fresh context*, not the model size — a reviewer
that inherited the implementer's assumptions inherits their blind spots too. Opus is used
because a subagent's model is free to the parent (Section 6), not because Sonnet would fail.

Reviewer instruction, preserved from v11 because it is empirically grounded: **do not tell the
reviewer to report only serious issues.** Modern models follow that literally and recall drops.
Ask for everything with severity and confidence; the main agent filters.

**v11's Tier 2 is deleted.** It fired on auth, billing, DB schema, RLS, deploy, production data
and PII — categories that essentially do not exist in this operator's projects. A tier that has
plausibly never fired in four months costs nothing to run and something real to understand.

---

## 9. Learning Loop (rebuilt — v11's did not close)

**What was broken.** v11 logged failures to `docs/issues.md` and promoted durable lessons to one
of four destinations. Two defects, both structural:

- **Nothing read `docs/issues.md` back.** Session start read `state.md`, `decisions.md` and
  `repo-map.md` — and explicitly "nothing else by default". A record that is never re-read is
  not learning.
- **The trigger was three identical failures.** Most lessons come from one surprising failure;
  three identical ones are rare. Measured across 18 projects: `.claude/rules/` — v11.1.1's
  headline learning mechanism — exists in exactly **one**. Of 13 `docs/issues.md` files, five
  are the untouched three-line template.

**What the one instance proves.** `task-plant/.claude/rules/tests.md` records that
extension-less relative imports in `src/lib/*.ts` throw `ERR_MODULE_NOT_FOUND` under Node's raw
ESM resolver while build and typecheck both pass, so the gap stays invisible until a test
imports the module. It is accurate, specific, and preventive. **The mechanism works when it
fires.** It fired once in four months.

**v12's loop.** One question, asked on the *first* surprising failure:

```text
Something failed in a way you did not expect
  └── Can a machine detect this?
        ├── YES → add the check to scripts/verify.mjs
        │         (+ a reproduction test if it is a bug)
        │         Done. The lesson is now a build failure. ← THE DEFAULT
        └── NO  → .claude/rules/<zone>.md with a paths: glob
                  and a `由来:` line naming the failure and date. ← LAST RESORT
```

This is the constitution applied to learning: **a lesson that can be executed is worth more
than a lesson that must be read**, because the executed one cannot be forgotten, compacted
away, or skipped. The `task-plant` rule above is itself a candidate for conversion — a check
that greps `src/lib/*.ts` for extension-less relative imports would turn that carefully written
paragraph into a build failure nobody ever has to read.

Supporting changes:
- `docs/issues.md` becomes **currently blocked only**, and is **read at session start**.
  Resolved items leave it. It is a working file, not an archive.
- Four promotion destinations collapse to one. `docs/lessons.md` is deleted.
- **Rules files expire.** Any that has not been needed in six months is deleted.

**One honest seam, narrower than v11 believed.** A `paths:` rule loads when Claude first reads
a matching file. v11 worried an edit could follow a search hit without a read — but the Edit
tool requires a prior read of the file in the same conversation, so edits to existing files are
covered by the harness itself. The real gaps are creating a *new* file in a governed zone, and
a reviewer reading only a diff. Both are handled by having the reviewer open the matching rules
files by path rather than trusting them to arrive. Codex follows this explicit-read path for all
scoped rules, since it has no automatic `.claude/rules/` loading.

---

## 10. Memory Layers

| Layer | Contents | Persistence | System of record for |
|---|---|---|---|
| Transcript | Everything said this session | Until compaction | Nothing |
| Auto-memory (`MEMORY.md`) | Operator preferences, environment quirks | Cross-project | Operator facts only |
| **Ledger files (git)** | vision, tasks, state, decisions, issues, repo-map | Forever, versioned | **Everything project** |
| `.claude/rules/*.md` | Prevention steps too situational to automate | Until they expire | Zone-scoped lessons; Claude loads by path, Codex reads explicitly via `AGENTS.md` |

If a fact matters to the project it goes in a ledger file. If it matters to how the agent
should treat the operator anywhere, it goes in memory. Never both.

---

## 11. Security: Three Layers, One Accepted Hole

**The order matters, and v11 had it wrong.** `guard.mjs` stated that in bypassPermissions mode
"hooks are the only enforcement layer that is guaranteed to fire". The documentation is
explicit that deny and ask rules "apply in every mode, including `bypassPermissions`", and that
"hook decisions don't bypass permission rules". Deny rules fire *first*.

| Layer | Covers | Fires |
|---|---|---|
| 1. `permissions.deny` | Secret paths across Read/Edit and the file commands Claude Code recognises in Bash (`cat`, `head`, `tail`, `sed`); destructive git command shapes | Every mode, before hooks |
| 2. `guard.mjs` | Command *shapes* by regex; the `.env.*` family with the `.env.example` exception that deny syntax cannot encode; `MultiEdit`/`NotebookEdit`/`Grep` | Every mode, every subagent |
| 3. OS sandbox | Everything, at process level | **Unavailable on native Windows** |

**Defects fixed in layer 2:**
- The matcher `"Bash|PowerShell|Read|Edit|Write"` contained only letters and `|`, which Claude
  Code treats as an **exact-match list, not a regex**. `MultiEdit`, `NotebookEdit` and `Grep`
  never reached the hook — so v11.1.1's headline write-path fix (P7) was dead code for two of
  the four tools it named. The matcher is now anchored regex.
- Shell secret-reading covered only `cat|type|get-content|gc`. It now covers `head`, `tail`,
  `more`, `less`, `sed`, `awk`, `Select-String`, and the copy/move forms that would materialise
  a `.env` from a template.
- Commands that destroy **uncommitted** work were entirely unguarded: `git clean -f*`,
  `git checkout|restore .`, `git stash clear|drop`. For a system whose continuity model is
  "the files are the memory", these are the commands that delete the memory. Scoped forms
  still pass — `git checkout -- src/foo.ts` is allowed.

**One rule was added and removed the same day, by the loop in Section 9.** A `git branch -D`
guard was written, caught blocking the safe lowercase `-d` by its own test suite, fixed to be
case-sensitive, then deleted outright on its first real false positive: `-D` is the *only* way
to clean up a squash-merged branch, which is the merge mode pm-zero itself mandates. The
principled line it violated: `-D` destroys a **pointer** — the commits sit in the reflog for 90
days — whereas the three rules above destroy content git has no other record of. Recoverability,
not danger, is the criterion.

38 cases verified (13 allow, 25 block), including every case above.

**Fail-open is intentional and must be understood.** A hook that cannot start is non-blocking —
the action proceeds. `guard.mjs` additionally exits 0 on unparseable input and on the Windows
stdin pipe bug (#46601). For a hook that must never brick a session this is correct; as a
security boundary it means the layer disappears silently the day Node breaks. Layer 1 does not
share this property, which is another reason it, not the hook, is the primary layer.

### Accepted risk (stated, not overlooked)

Deny rules and hooks do not apply to a process that opens a file itself — `node -e`, `python -c`,
any script. The documentation's answer is the OS sandbox, and the sandbox does not run on native
Windows; the supported path is to run Claude Code inside WSL2.

**This risk is accepted and will not be mitigated.** These are personal hobby projects: no
production system, no real money, no third-party data, no secrets in the working tree.
Rebuilding the environment on WSL2 costs more than the exposure is worth. Likewise
`bypassPermissions` offers no protection against prompt injection, and `curl`/`wget` are not
restricted, because restricting them would break legitimate use for a threat with nothing to
steal.

The decision that matters is that this is **written down**. Believing the hole is closed is the
failure mode; knowing it is open is not.

**Codex equivalent.** Codex's project file cannot enforce these boundaries. Its global
`approval_policy`/permission defaults and global `hooks.json` + `hooks/guard.mjs` are therefore
part of the required setup. The hook applies the same destructive-command and secret-path policy
to shell-shaped and patch/file-shaped calls. It is fail-open on malformed hook input so a broken
hook cannot brick a session; this is an availability choice, not a claim of a complete sandbox.

---

## 12. Git Workflow

- **Branches:** never commit to `main`; `<type>/<short-description>`; branch at task start.
- **Commits:** after each logical unit (= a continuity checkpoint); `<type>: <description>`;
  never stage `.env*` or secrets.
- **Push:** after every commit.
- **PR:** opened automatically when a branch is complete; body carries what/why, the review
  result, and verification evidence.
- **Merge gate: CI green.** Low/medium risk → squash-merge and delete the branch. High-risk
  classes → implement and review fully, then stop before any irreversible real-world side
  effect and surface a Japanese summary.
- **Docs-only exception:** a change touching only Markdown/doc files (no source, config, or
  CI files) may commit straight to `main`, skipping branch/PR/CI. `git diff --check` still
  required.
- Force-push, history rewrite, and the uncommitted-work destroyers are blocked at layers 1–2.

---

## 13. Verified Claude Code Platform Facts

Every fact below was read from the official Claude Code documentation on 2026-08-16 against
Claude Code 2.1.224. Facts pm-zero relies on but could **not** verify are listed separately.

| Fact | Consequence for pm-zero |
|---|---|
| Cached input bills at ~10% of the standard input rate | Long sessions are cheap (§5) |
| A Claude subscription requests the **one-hour** cache TTL automatically | Resolves v11.1.1's open item P6, which hedged between 5 minutes and 1 hour |
| Subagents do not read the parent's cache and use the **5-minute** TTL | Quantifies spawn cost (§6) |
| Model and effort are both part of the cache key | Never switch mid-session (§6) |
| `ultrathink` adds an in-context instruction; the API effort level is unchanged. `think hard` / `think more` are not recognised | The supported way to think harder on one turn (§6) |
| Default effort is `high` on every model that supports it | `effortLevel` config removed (§4) |
| Deny and ask rules apply in **every** mode including bypassPermissions; hook decisions do not bypass them | Layer order corrected (§11) |
| A matcher of letters/digits/`_`/`-`/space/`,`/`\|` only is an **exact-match list**, not a regex | The `MultiEdit`/`NotebookEdit`/`Grep` hole (§11) |
| A hook that cannot start is non-blocking; only exit 2 blocks | Fail-open is structural (§11) |
| Path rules on `Write`/`NotebookEdit`/`Glob`/`MultiEdit` are accepted but **never consulted**, and warn at startup | Two dead deny rules removed (§4) |
| `Read` deny rules apply best-effort to Grep and Glob, and to `cat`/`head`/`tail`/`sed` in Bash — but not to arbitrary subprocesses | The accepted hole (§11) |
| The Bash sandbox runs on macOS, Linux and WSL2; **native Windows is not supported** | The hole cannot be closed by configuration (§11) |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` cannot raise a threshold and applies only to sessions that compact before the model's limit | Replaced by the absolute window (§4) |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` takes precedence over `/autocompact`, the flag, and the setting; capped at the model's window | The single compaction knob (§4) |
| Sonnet 5 always runs at 1M on the Anthropic API, no credits, auto-compacting near 967K. Opus 1M on Pro requires usage credits | Sonnet remains the default (§6) |
| Subagent frontmatter supports `model`, `effort`, `tools`, `permissionMode`, `isolation`, `memory` | `planner` / `reviewer` are configured, not prompted (§6) |
| A `"*"` allow rule is skipped with a warning and auto-approves nothing | v11's CLAUDE.md prescribed a setting that does not work (§4) |
| `StopFailure` exists and accepts `rate_limit`, `overloaded`, and others | The budget-wall hook is valid (§4) |

**Not verified — do not treat as established:**

- Whether `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` was in fact inert on Opus 5 at 200K. Inferred
  from two documented conditions. v12 sidesteps the question by using the absolute window.
- Whether effort changes truly discard the cache. The documentation says so; an open GitHub
  issue (#63962) reports the confirmation dialog warns while the cache is in fact preserved.
  v12 follows the documentation as the safe side.
- Whether `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` and `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`
  do anything. Absent from the official reference; removed on the principle that an
  unverifiable mechanism must not be designed around.
- Whether the startup warning for the removed `Write(**/.env)` rules was actually being
  emitted. Inferred from the documented behaviour and version gate (v2.1.210+).
- Actual Pro-plan consumption. The finding that long sessions are cheaper rests on the
  documented cache mechanism plus the operator's own observation, not on measured usage.

---

## 14. Migration from v11.1.1

Deployed as part of this release — no action required:

1. `~/.claude/settings.json` — env reduced to two keys; two dead `Write` deny rules removed;
   secret deny coverage widened and `//`-anchored; hook matcher fixed; `effortLevel` removed;
   `model` set to `sonnet`.
2. `~/.claude/hooks/guard.mjs` — matcher gaps closed; uncommitted-work destroyers added; shell
   secret coverage widened; layer-order comment corrected. 38 cases pass.
3. `~/.claude/agents/planner.md`, `~/.claude/agents/reviewer.md` — created.
4. `~/.claude/CLAUDE.md` — rewritten to v12.
5. `pm-zero-knowledge-v11.1.1.md` — deleted. `README.md` — rewritten.

Remaining, per project, when each is next touched:

6. Add `.github/workflows/ci.yml` running the same four checks as `verify.mjs`, and enable
   branch protection requiring it. **Start with `task-plant`** — it already has both
   `verify.mjs` and the only `.claude/rules/` file in existence.
7. Add `docs/issues.md` to the session-start read set; strip it to current blockers only.
8. Delete `docs/lessons.md` and `AGENTS.md` where they exist and are unused.

**Verify the deployment:**

```powershell
node C:/Users/chidj/.claude/hooks/guard.mjs   # expects JSON on stdin; exits 0 on garbage
claude --version                              # 2.1.224 at time of writing
```

The guard's 38-case suite is not committed to this repository; it is reproducible from
Section 11's rule list.

---

## 15. What v12 Costs

Stated plainly, because every previous release stated only what it gained:

- **Seven quality gates are gone.** If one of them was catching something, that catch is gone
  too. The evidence says they were not — no artifact from any of them survives in 18 projects —
  but absence of evidence is what it is.
- **Tier 2 review is gone.** If a project ever grows real auth, billing, or user data, that
  tier has to come back, and it will have to be re-derived rather than re-enabled.
- **CI is real work.** It is one workflow file per project and it must be kept green, which is
  a cost v11 did not have. It is also the only change in v12 that adds a mechanism rather than
  removing one, which is why it had to earn its place.
- **The accepted risk is now permanent, not pending.** v11 could tell itself the secret-file
  hole was closed. v12 cannot.

If a future version wants to add something back, the constitution in Section 1 is the test it
has to pass first.

---

## 16. Frontend/UI Operating Layer (v12.1 addition)

Absorbed from a separately drafted document, `AI_Agent_Design_Operating_System.md` (2026-08-21,
938 lines), and cut to whatever in it survives Section 1's constitution. Applies only to a
project with a UI surface; a project without one adopts none of it.

### 16.1 What survived the constitution

The source document is a workflow specification: an 8-phase implementation loop, five "Agent
Operating Rules", a 14-point self-critique checklist, a tool stack, and four proposed ledger
files (`PRODUCT.md`, `DESIGN.md`, `UX_RULES.md`, `ASSET_REGISTRY.md`). Nearly all of it is
judgment about hierarchy, composition, and taste — exactly the shape of self-graded assessment
Section 7 already found unenforceable for backend quality gates, now proposed again for the
frontend. It does not enter pm-zero. Four pieces do, because each reduces to a check, a tool
invocation with a defined trigger, or a config value:

| Source rule | pm-zero mechanism |
|---|---|
| §6 "Raw values" — no unregistered hex/px/radius/shadow | **verify.mjs lint check**, 16.2 |
| §7 Rule 4 "No Blind Completion" — a screen isn't done until seen running | **Playwright MCP + `run` skill**, 16.3 |
| §9 "User Prompt Contract" — a non-engineer can't review a diff but can react to a rendered design | **`/design-sync` + claude.ai/design**, 16.4 |
| §7 Rule 5 / Phase 5 "Visual QA" — fresh-eyes audit of a finished screen | **Tier 1 reviewer trigger**, extended, 16.5 |

### 16.2 Executable: raw-value lint

Once a project has adopted `DESIGN.md` (16.6), `scripts/verify.mjs`'s lint step additionally
rejects, in changed frontend files, arbitrary values outside a registered token:

    bg-[#...]  text-[...px]  rounded-[...]  shadow-[...]  (or the equivalent in a non-Tailwind
    styling system) unless listed under DESIGN.md's own "Design Token Rule" exception

The check only tests whether a value is registered, never whether it looks good — that judgment
stays with the operator and the Tier 1 reviewer. A project with no `DESIGN.md` does not run it.

### 16.3 Executable: browser self-verification before "done"

Already global policy ("start the dev server and use the feature in a browser before reporting
the task as complete"); this names the specific tool. Before a UI completion report: run the
project (`run` skill), check the changed screen with Playwright MCP at the breakpoints the
change touches, confirm no console/runtime error. Code-reading is not a substitute.

### 16.4 Executable: show the design to the user

Run `/design-login` once per machine, then `/design-sync` once per project, so Claude Design
generates against the project's actual components instead of placeholders (requires Claude Code
2.1.198+ on the Anthropic API — both already true of this runtime). For a change big enough to
need sign-off before or mid-implementation — a new screen, a visual-direction change, the source
document's "ハイクオリティにして" case — generate the design at claude.ai/design and show it to
the operator instead of deciding unilaterally. The operator cannot review a diff; they can react
to a rendered design. This is Rule 4 applied to the human rather than the agent.

### 16.5 Tier 1 reviewer: UI/visual changes as a trigger

Section 8's trigger list gains one member: a change that touches shared components or design
tokens. The reviewer opens `DESIGN.md` and whatever screenshots 16.3 captured, and checks token
reuse, component reuse, and cross-screen consistency — the fresh-context substitute for the
source document's Phase 5 "Visual QA", which this operator cannot self-administer any more
reliably than the seven backend gates Section 7 already deleted for the same reason.

### 16.6 Optional files, added only on concrete need

Same rule as every other optional file in Section 3.

    DESIGN.md          tokens, typography, spacing/radius scale, component rules, motion —
                        the registry 16.2 reads
    ASSET_REGISTRY.md  name / type / source / license / context per asset — only once a
                        project has enough assets that duplication is a real risk

`PRODUCT.md` and `UX_RULES.md` from the source document are not added: `docs/vision.md` already
carries product purpose and priorities, and per-feature UX principles are judgment calls of the
kind Section 1's global-file exception already covers, not a new ledger file.

### 16.7 Tool stack: global once, per project on detection

Every name in the source document's stack was checked against what actually exists (most did;
"Awesome Claude Design" and `tweakcn` are a reference list and an external web app, not Claude
Code integrations, and are not installed anywhere). What exists splits cleanly into two groups by
a single criterion: **does its value depend on which project it runs in?**

**Global — installed once, deployed as part of this release, because the value is the same in
every session and the tool-schema cost is paid once, not per project:**

    frontend-design@claude-code-plugins   Anthropic's official design-framework plugin.
                                            claude plugin marketplace add anthropics/claude-code
                                            claude plugin install frontend-design@claude-code-plugins
    context7                               Library-doc lookup MCP; not frontend-specific.
                                            claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp

**Per-project, auto-provisioned on UI detection — because each depends on that project's own
files (a `components.json`, a written skill directory) or is dead weight in a session with no
browser to inspect.** This is a `scripts/setup.mjs` step, run once, alongside the existing
`npm install`: if `package.json` depends on a frontend framework (`react`, `vue`, `svelte`,
`solid-js`, `next`, `nuxt`, `astro`, `@angular/core`) or the project has already adopted
`DESIGN.md` (16.6), then and only then —

    npx impeccable install                                    (writes .claude/skills/impeccable/)
    npx skills add shadcn/ui                                  (only if shadcn/ui is a dependency)
    claude mcp add --scope project chrome-devtools -- npx chrome-devtools-mcp@latest
                                                                (github.com/ChromeDevTools/chrome-devtools-mcp)

No UI surface detected → none of the three run, and nothing asks the operator — consistent with
the zero-prompt autonomy baseline already in effect. A project that gains a UI surface later
re-runs `setup.mjs` the next time it is invoked, which re-checks the same condition.

### 16.8 Migration from v12

Global config changed for the first time under this constitution, deployed as part of this
release: `frontend-design@claude-code-plugins` (plugin, user scope) and `context7` (MCP, user
scope) — both installed and verified connected on 2026-08-21. No hook or settings-file change.
`AI_Agent_Design_Operating_System.md` is absorbed into this section and deleted;
`pm-zero-knowledge-v12.md` is deleted, superseded by this file. Per-project, applied the next
time `scripts/setup.mjs` runs on a project with a UI surface: the 16.7 auto-provisioning step
fires; separately, adopt `DESIGN.md` when there is a token system to register, and run
`/design-login` once per machine before relying on 16.4.
