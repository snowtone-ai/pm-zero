# PM Zero Claude

> A requirements PM agent that **gets smarter with every project you ship.**

Non-engineers describe an idea. PM Zero interviews them, generates everything Claude Code needs to build it — and after each project, automatically distills lessons into rules that make the *next* project faster and more accurate.

---

## v6.0: Architecture-level token optimization

v6.0 redesigns the system around four architectural principles instead of bolting on tools:

| Change | Impact |
|--------|--------|
| Interview batching (3–5 questions/turn) | 75% interview token reduction |
| Phase compression (structured summaries between stages) | Prevents quadratic cost growth |
| 3-tier verification (Hooks → playwright-slim → user) | 2.7x verification token reduction |
| Deterministic Hooks (build/lint/tsc on every file save) | 80% of errors caught at zero AI token cost |

These compound to **70–90% total cost reduction** versus v5.0.

---

## The core idea: AI that learns from your projects

Most AI tools reset after every conversation. PM Zero doesn't.

Every time you finish a project, you run one command (`/ev`). The PM Agent reviews what went wrong during development — wrong assumptions, error loops, outdated APIs — and converts them into abstract, reusable rules. Those rules are saved to `xp-rules.md` and automatically embedded into the `CLAUDE.md` of every future project.

```
Project 1 → ship → /ev → xp-rules.md (1 lesson)
Project 2 → ship → /ev → xp-rules.md (3 lessons) → better CLAUDE.md
Project 3 → ship → /ev → xp-rules.md (6 lessons) → even better CLAUDE.md
                 ↑
     Your accumulated experience as a non-engineer
```

The rules aren't project-specific. The PM Agent abstracts them:

| ❌ Too specific (discarded) | ✅ Abstracted (kept) |
|---|---|
| "Gemini API returned 429 error" | "Before using any external API → verify rate limits and free tier quotas" |
| "Playwright MCP used 114K tokens" | "UI verification → use playwright-slim (73% less tokens), limit to 10 steps" |

After 3–5 projects, `xp-rules.md` becomes a record of your real-world experience — and Claude Code stops making the mistakes you've already encountered.

---

## What PM Zero generates

Describe your idea in plain language. The PM Agent runs a structured interview (15–30 questions across 4 stages), then outputs:

| File | What it does |
|------|-------------|
| `CLAUDE.md` | Tells Claude Code exactly how to build — tech stack, guardrails, error recovery rules, your accumulated xp-rules |
| `vision.md` | Full product spec — user stories, acceptance criteria, task breakdown, out-of-scope list |
| `settings.json` | Permission boundaries + Hooks for deterministic quality gates (auto-prettier, auto-build, auto-lint) |
| MCP setup command | Adds playwright-slim so Claude Code verifies UI in a real browser at 73% less token cost |

---

## How to use it

### 1. Set up the PM Agent (one time)

Create a Claude.ai Project. Configure it with three files:

```
Custom Instructions  ←  pm-zero-claude-instructions.md (paste full contents)
Knowledge            ←  pm-zero-claude-knowledge-v6.0.md
Knowledge            ←  xp-rules.md
```

Install global MCPs once:

```bash
# Official docs lookup — prevents Claude Code from guessing API behavior
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest

# Web search — for error resolution and external API research
# Get a free key at brave.com/search/api/
claude mcp add brave-search -s user -e BRAVE_API_KEY=YOUR_API_KEY -- npx -y @brave/brave-search-mcp-server
```

### 2. Describe your idea

Open the Claude.ai Project and say what you want to build in 1–2 sentences. The PM Agent asks 15–30 questions across four stages — purpose, scope, behavior, constraints — then generates the files above.

**v6.0 change:** The PM now asks 3–5 questions per turn (up from max 3), reducing total interview turns by ~40% and token costs by ~75%.

### 3. Build

```bash
# Initialize project (run each command separately)
npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
cd my-app
npx shadcn@latest init -d
git init
git add .
git commit -m "initial scaffold"

# Add playwright-slim MCP (required per project)
claude mcp add playwright -s project -- npx -y @anthropic-ai/playwright-slim@latest

# Place files: CLAUDE.md, vision.md, issues.md at project root
# Place settings.json at .claude/settings.json

# Start Claude Code
claude
```

First message to Claude Code:
```
Read @vision.md and implement the first task in the Task Breakdown.
```

### 4. Complete the loop — run `/ev` when the project ships

In your Claude.ai PM Agent project, type `/ev`. The agent outputs lessons in this format:

```
## XP-[N]: [One-line title]
- Situation:  what you were doing when the problem occurred
- Symptom:    the concrete error or failure
- Root cause: why it happened — abstracted to be reusable
- Rule:       [trigger] → [action]
```

Paste the output into `xp-rules.md`. Re-upload to your Claude.ai project. Done — the next project starts smarter.

---

## Repository contents

```
pm-zero-claude/
├── pm-zero-claude-instructions.md    # PM Agent behavior — paste into Claude.ai Custom Instructions
├── pm-zero-claude-knowledge-v6.0.md  # PM Agent knowledge base — upload to Claude.ai Knowledge
├── xp-rules.md                       # Your accumulated lessons — upload to Claude.ai Knowledge
├── pm-zero-claude-manual.html        # Full step-by-step guide — open in browser
└── README.md                         # This file
```

---

## Design decisions

**Why 3–5 questions per turn?**
Research shows users handle 7–10 questions comfortably. A 10-turn conversation costs 55x a single turn due to history resending. Batching 3–5 questions per turn cuts interview costs by 75% while staying well within cognitive load limits.

**Why 3-tier verification instead of just Playwright?**
Playwright MCP consumes 89–114K tokens per test session. The 3-tier architecture uses deterministic Hooks (lint, build, type-check) for 80% of error detection at zero AI token cost, playwright-slim for UI verification at 73% less tokens, and human visual confirmation only as the final gate.

**Why Hooks for prettier/build/lint?**
CLAUDE.md is probabilistically followed — Claude Code can and does ignore rules. Hooks are deterministic. Moving prettier/build/lint to Hooks guarantees 100% enforcement AND reduces CLAUDE.md rule count, which improves compliance with remaining rules.

**Why CLAUDE.md under 100 lines?**
Claude Code follows approximately 200 instructions consistently, but its system prompt already uses ~50 of those slots. Every line added to CLAUDE.md uniformly reduces compliance with all other lines. The 30–100 line sweet spot maximizes the signal-to-noise ratio.

**Why phase compression in interviews?**
Without compression, each interview turn resends the entire conversation history. A 15-turn interview accumulates massive redundant context. Compressing each stage into a structured summary (5–10 lines) and carrying forward only the summary prevents quadratic cost growth.

---

## Special commands

| Command | When | What happens |
|---------|------|-------------|
| `/ev` | After each project ships | Extracts lessons → append to `xp-rules.md` → generates README.md |
| `/audit` | Monthly | PM Agent reviews knowledge base for outdated rules and proposes updates |

---

## Tech stack

Next.js 16+ (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · pnpm · Vercel

The PM Agent confirms or adjusts this during the interview.

---

## Error recovery

If Claude Code loops on the same error more than twice, paste this:

```
Stop. Follow these steps now:
1. Save the current problem and every fix you've tried into progress.md
2. Tell me to run /clear

After /clear, start a new session and type:
"Read @progress.md and solve the problem using a different approach.
Do not try any method you already attempted."
```

---

## Who this is for

- Non-engineers with product ideas and no coding background
- Anyone who has tried Claude Code and gotten vague or broken outputs
- People who want their AI tooling to improve over time, not reset with every chat

---

## License

MIT
