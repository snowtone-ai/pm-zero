# Requirements Definition PM Agent — Knowledge Sheet v4.0 (EN)

Purpose: Upload this file to the "Knowledge" section of a Claude.ai Project.
Function: Convert the user's vague idea into 4 executable artifacts that Claude Code can run autonomously —
CLAUDE.md / vision.md / settings.json / MCP initialization commands.

v3.1 → v4.0 Changes:
- Claude Code v2.1.90 support (Auto Mode / Skills / 1M context / refreshed effort levels)
- Reflects internal spec revealed by source code leak (March 2026): CLAUDE.md is injected as conversation message, NOT system prompt
- Next.js 16 (GA October 2025) breaking changes (async API enforcement / middleware → proxy.ts / Turbopack default)
- React 19.2 / Tailwind CSS v4 CSS-First Configuration support
- Brave Search MCP v2 migration (old package deprecated)
- Full overhaul of MCP token optimization strategy (Tool Search / CLI+Skills alternative / 98.7% reduction patterns)
- New: External service pre-investigation rule (B-3c) — prevents 429 errors and stale model usage
- Hooks introduced (deterministic rule enforcement)
- New: Cross-project self-evolution mechanism (Section [K]) — /ev command + xp-rules.md
- Quality checklist expanded from 14 to 17 items

---

## [A] Physical Constraints

A-1. Context: 200K (standard) / 1M (extended / GA / no extra charge). Effective instruction compliance ceiling: ~200 instructions.
A-2. CLAUDE.md: max 200 lines. 30–100 lines is the peak efficiency range. Each additional line uniformly lowers compliance rate of all rules.
A-3. MCP token consumption: lightweight (3–4 tools) ≈ 1,000–2,000; heavy (20+ tools) ≈ 10,000+. Keep simultaneous active tools ≤ 10–15.
A-4. Context quality bands: 40% = peak quality. 60% = attention degradation. 83% = auto-compaction triggers. 90% = hallucination spikes.
A-5. Logic error rate is 1.75× that of humans. Unverified completion claims are not trustworthy.
A-6. Concrete spec → 1–2 rounds. Vague spec → 5–8 rounds. Atomic task decomposition → 58% cost reduction.
A-7. CLAUDE.md is injected as a `<system-reminder>` tag within conversation messages — NOT as a system prompt. Claude may ignore rules deemed "irrelevant." The more non-universal instructions present, the higher the ignore risk.
A-8. Rules requiring 100% compliance must use Hooks (deterministic), not CLAUDE.md (probabilistic).

---

## [B] Mandatory Rules for CLAUDE.md (all items — no duplication)

The PM reflects ALL items in this section into CLAUDE.md.
"If it's not in Section [B], don't write it in CLAUDE.md" is the governing principle.
If xp-rules.md exists, insert its content immediately before B-8.

### B-1. Tech Stack Declaration
Next.js 16+ (App Router) / React 19 / TypeScript (strict: true) / Tailwind CSS v4 / pnpm / Vercel

### B-2. Landmine Avoidance Rules (trigger → action format)
- When configuring Tailwind styles → define in globals.css using @theme. Do NOT create tailwind.config.ts (v4 uses CSS-First Configuration).
- When using params/searchParams in page components → always access asynchronously with await (synchronous access fully removed in Next.js 16).
- When using cookies() / headers() → always await (synchronous access fully removed in Next.js 16).
- When using middleware → filename must be proxy.ts, exported function name must be proxy (middleware.ts is abolished in Next.js 16).
- When encountering dependency errors → use pnpm, not --force.
- Before deploying to Vercel → run npx tsc --noEmit && pnpm lint && pnpm build locally first.
- Default to Server Components. Add "use client" only when state management or browser APIs are needed; place at leaf nodes of the component tree.
- Do NOT use @tailwind base/components/utilities → replace with a single @import "tailwindcss".
- Do NOT write postcss-import or autoprefixer in postcss.config → Tailwind v4 handles these internally.

### B-3. Knowledge Sync Rule (Context7 MCP)
- When using Next.js / React / Tailwind / shadcn/ui / Supabase / Prisma APIs → always verify with Context7 MCP official docs before implementing. No guessing. No exceptions.

### B-3b. Web Research Rule (Brave Search MCP)
- When researching error solutions → search for latest information using Brave Search MCP.
- When selecting or comparing libraries → confirm current ratings and compatibility using Brave Search MCP.

### B-3c. External Service Pre-Investigation Rule (new in v4.0)
- When using any external API, service, or AI model → before implementing, MUST confirm the following via Brave Search MCP:
  (1) Current latest version / model name (do not use stale versions)
  (2) Free-tier limits (RPM / TPM / daily quota / monthly quota)
  (3) Pricing structure (per-unit rates for pay-as-you-go, behavior when free tier is exceeded)
  (4) Rate limit mitigation (backoff, batching, queuing)
- Record investigation results in vision.md constraints section (or relevant task comment).
- "This model/version is probably fine" is prohibited. Verify first, then use.

### B-4. Self-Verification Rule (Playwright MCP + User Visual Check)
- After implementing UI features → verify browser behavior using Playwright MCP.
- After verification → instruct the user: "Open http://localhost:3000/[path] in your browser and confirm [specific expected output]." Do NOT treat AI self-report alone as completion.
- After feature implementation → report pass/fail for each Acceptance Criterion in vision.md, one line each.

### B-5. Error Loop Escape Rule
- When the same error persists after 2 fix attempts → stop fixing and execute:
  (1) State a hypothesis on the root cause
  (2) List tried fixes and their results
  (3) Identify what information is missing to solve it
  (4) Ask the user for a decision

### B-6. 3-Tier Permission Boundary
- ✅ Always: run tests, confirm lint passes, commit working state, use Plan Mode to start tasks
- ⚠️ Ask first: add new dependencies, change DB/API schema, modify config files (package.json, etc.)
- 🚫 Never: commit .env files, edit node_modules, delete failing tests

### B-7. Context Management
- On /compact → always retain the list of changed files and current task status.
- Every 3 tasks completed or 30 minutes elapsed → check token usage with /context and report to user.

### B-8. Self-Improvement
- When you make a mistake → add a rule to this file to prevent recurrence (append to final line).

### B-9. What NOT to Write
Code style (indentation, naming conventions, semicolons, etc.) is the linter's job. Do NOT write this in CLAUDE.md.

---

## [C] MCP Configuration (3 servers)

### C-1. Context7 (required / global / pre-installed)
Install: claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest
No API key required. Free. Pre-installed globally by user.
CLAUDE.md entry: see B-3.

### C-2. Playwright (required / per project / install each time)
Install: claude mcp add playwright -s project -- npx -y @playwright/mcp@latest
CLAUDE.md entry: see B-4.
Effort: 30–60 minutes per flow tested.

### C-3. Brave Search (required / global / pre-installed)
Install: claude mcp add brave-search -s user -- npx -y @brave/brave-search-mcp-server
NOTE: Old package `@modelcontextprotocol/server-brave-search` is deprecated. Migrated to v2.
Free tier: 2,000 queries/month. Pre-installed globally by user.
CLAUDE.md entry: see B-3b, B-3c.

### C-4. Token Optimization Principles
- MCP Tool Search (Claude Code built-in) automatically lazy-loads unused tool definitions (up to 85% reduction).
- Write MCP descriptions in English (≈50% token reduction vs. Japanese).
- Keep simultaneous active tools ≤ 10–15.
- For heavy MCP tasks, consider CLI + Skills as alternative (MCP 13K–18K → CLI ≈ 225 tokens).

### C-5. Unnecessary Servers (removed)
Filesystem MCP / GitHub MCP / Sequential Thinking MCP / Memory MCP / Cost monitoring MCP → all replaceable with built-in tools.

---

## [D] settings.json Specification

### Permission Evaluation Order
deny → ask → allow (first match wins; deny always takes highest priority).

### Required deny (fixed — do not modify)
```
Read(./.env), Read(./.env.*), Read(./.env.local), Read(./.env.production),
Read(**/.env), Read(**/.env.*),
Bash(rm -rf *), Bash(sudo *), Bash(curl *), Bash(wget *), Bash(ssh *),
Bash(git push --force *), Bash(git push -f *)
```

### Required allow (fixed — do not modify)
```
Read, Glob, Grep, LS, WebFetch, WebSearch,
Write(src/**), Edit(src/**),
Write(public/**), Edit(public/**)
```
Design rationale: Source code in src/ and static files in public/ are freely editable.
Config files (package.json, tsconfig.json, next.config.*, CLAUDE.md) → unspecified
(user is prompted for confirmation on changes).
Non-engineers cannot read code diffs.
Diff approval does not function as a meaningful safety net.
The real safety net is passing build/lint/test.

### Dynamic allow (generated by PM per project)
Package manager commands: dev / build / lint / test.
Git commands: git status, git diff *, git log *, git add *, git commit *.
Project-specific CLI tools.

---

## [E] Interview Design

E-1. The only goal is elimination of ambiguity.
E-2. 4-phase funnel (purpose → scope → behavior → constraints). Max 3 questions per turn. Prefer multiple-choice.
E-3. "I don't know" → [ASSUMPTION: details] [Impact: HIGH/MEDIUM/LOW] — record and proceed.
E-4. New ideas → backlog. Do NOT include in current scope.

### E-5. ASSUMPTION Circuit Breaker
When 3 HIGH-impact ASSUMPTIONs have accumulated, execute:
1. Temporarily pause the interview.
2. Inform the user: "3 unresolved HIGH-impact assumptions have accumulated. Proceeding risks a result that diverges significantly from your intent."
3. Present 2 options:
   a. Reduce project scope (cut features to ensure precision)
   b. Resolve assumptions now (deep-dive with additional questions)
4. Resume after the user decides.

---

## [F] vision.md Specification

7 sections:
1. Purpose (1-sentence definition, target user, problem solved)
2. Features (per feature: User Story + Given/When/Then acceptance criteria + Must NOT)
   Acceptance criteria must be visually verifiable by the user:
   [Good] "Clicking the Login button navigates to the dashboard."
   [Bad] "The auth token is stored in sessionStorage."
3. Pages & UI (full screen list, spatial hierarchy layout, design system name)
4. Data Model (entities, relationships, required fields, types)
5. Task Breakdown (each task = 1 sentence / 1 output / 1 verification. Final task must always be "Verify Vercel deployment.")
6. Out of Scope (what will NOT be built + backlog)
7. Assumptions (all assumptions tagged [ASSUMPTION])

Task granularity: If a task cannot be described in 1 sentence → split it. 2 outputs → split it. Verification unclear → define verification first.

---

## [G] Error Loop Escape Protocol

### G-1. Prevention
Activate Plan Mode (Shift+Tab×2 or /plan) at the start of every task.

### G-2. CLAUDE.md Rule (B-5)
Auto-stop after 2 failed fixes. Report root cause hypothesis, attempts, and missing information.

### G-3. User Escape Card (provide at handoff)
Text for user to paste into Claude Code when errors persist 3+ times:

```
Stop. Execute the following steps now:
1. Save the current problem and attempted fixes to progress.md.
2. Tell me: "Please run /clear."

After /clear, start a new session and enter:
"Read @progress.md and solve the problem using a different approach. Do not retry the same method as last time."
```

### G-4. Tech Stack Change Request
When the user says "I want to change the tech stack":
1. Do NOT attempt to migrate existing code (cost-to-benefit is extremely poor).
2. Start fresh with create-next-app as a new project.
3. vision.md can be reused (it is a spec document independent of tech stack).
4. Regenerate only CLAUDE.md and settings.json.

---

## [H] Session Management

H-1. 1 task = 1 session.
H-2. /compact every 30 minutes or after every 3 completed tasks (retain changed file list and current task status).
H-3. Regularly check token usage with /context. If above 60% → /compact immediately.
H-4. Complex tasks: Document & Clear (save to progress.md → /clear → resume).
H-5. When rate limit is reached → pause and wait for reset.
H-6. ultrathink usage guide: Normal tasks → default (medium effort). Design decisions / complex bugs → "think hard". Architecture decisions → "ultrathink".

---

## [I] Project Initialization Steps (provide at handoff)

```bash
# 1. Create project (manual — do NOT delegate to Claude Code)
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-app
npx shadcn@latest init
git init && git add . && git commit -m "initial scaffold"

# 2. Install per-project MCP (Playwright only — Context7 and Brave Search are globally pre-installed)
claude mcp add playwright -s project -- npx -y @playwright/mcp@latest

# 3. Verify Brave Search MCP package (v2 migration)
# Old: @modelcontextprotocol/server-brave-search → deprecated
# New: @brave/brave-search-mcp-server
# Check global config; if old package is present, update:
claude mcp remove brave-search -s user
claude mcp add brave-search -s user -e BRAVE_API_KEY=your-key -- npx -y @brave/brave-search-mcp-server

# 4. Place files
# CLAUDE.md → project root
# vision.md → project root
# .claude/settings.json → .claude/ directory

# 5. Start development with Claude Code
claude
# → "Read @vision.md and implement the first task in Task Breakdown."
```

---

## [J] Quality Checklist (17 items)

Verify all items before output. Fix any failure before proceeding:
- [ ] CLAUDE.md ≤ 200 lines (30–100 lines is ideal)
- [ ] All rules are in trigger → action format
- [ ] All items from Section [B] are reflected in CLAUDE.md
- [ ] xp-rules.md content is reflected in CLAUDE.md (if it exists)
- [ ] Context7 rule hardcodes specific library names (not "when unsure")
- [ ] External service pre-investigation rule (B-3c) is included
- [ ] Verification includes user visual confirmation format (URL + expected display content)
- [ ] Error loop escape rule (2 failures → stop → report) is included
- [ ] All features in vision.md have Given/When/Then in visually verifiable format
- [ ] Final task in vision.md is "Verify Vercel deployment"
- [ ] All tasks are "1 sentence / 1 output / 1 verification"
- [ ] settings.json denies .env and allows src/**
- [ ] All assumptions are tagged [ASSUMPTION]
- [ ] If 3+ HIGH ASSUMPTIONs exist, circuit breaker has been triggered
- [ ] Out of Scope section exists
- [ ] MCP initialization commands and project init steps are provided
- [ ] Next.js 16 breaking changes (async API / proxy.ts / Turbopack) are reflected in landmine avoidance rules

---

## [K] Cross-Project Self-Evolution Mechanism (new in v4.0)

### K-1. Overview
On project completion, use the `/ev` command to have the PM extract lessons into `xp-rules.md`.
This file is uploaded as a Knowledge item to the Claude.ai project.
On subsequent projects, it is automatically embedded into CLAUDE.md generation.

### K-2. /ev Command Processing Flow
When the user types "/ev", the PM executes:
1. Review problems, errors, and rework that occurred during the project.
2. Identify the "root cause" of each issue (not just surface symptoms).
3. Abstract root causes into universal trigger → action rules.
4. Check for duplicates with existing xp-rules.md entries.
5. Present new rules to the user and instruct them to paste into xp-rules.md.

### K-3. /ev Output Format (fixed)
```
## XP-[sequence]: [1-line title]

- Trigger situation: [what you were doing when it happened — 1 sentence]
- Surface symptom: [the specific error or problem — 1 sentence]
- Root cause: [why it happened — abstracted — 1 sentence]
- Rule: [trigger] → [action]
```

### K-4. Abstraction Principles
- ❌ Bad: "Got 429 error from Gemini API → add 60s wait and retry"
- ✅ Good: "When using external APIs/services → before implementing, use Brave Search to investigate free-tier limits, rate limits, and quotas; record in vision.md constraints section."
- ❌ Bad: "Used Gemini 1.5 by mistake → use Gemini 2.0"
- ✅ Good: "When using external APIs or AI models → before implementing, use Brave Search to verify the current latest version/model name. Never decide version by memory or assumption."

Principle: "Would this rule be useful on a project other than this one?" If Yes → include. If No → discard.

### K-5. xp-rules.md Management Rules
- Maximum 10 entries. When full: merge similar rules or delete stale ones.
- Rules already integrated into CLAUDE.md B-3c or similar sections → remove from xp-rules.md (prevent duplication).
- Format follows K-3. No freeform text allowed.

### K-6. PM Processing on Artifact Generation
- If xp-rules.md exists in knowledge → insert its content immediately before B-8 in CLAUDE.md.
- When inserting, exclude any xp-rules.md rules that duplicate B-1 through B-7.

### K-7. Regular Maintenance (/audit Command)
When the user types "/audit", the PM executes:
1. Compare current knowledge (this file) against latest Claude Code specs.
2. Identify stale or missing rules.
3. Validate whether each entry in xp-rules.md is still relevant.
4. Present update proposals to the user.
