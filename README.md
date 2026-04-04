# PM Zero

> A requirements PM agent that **gets smarter with every project you ship.**

Non-engineers describe an idea. PM Zero interviews them, generates everything Claude Code needs to build it — and after each project, automatically distills lessons into rules that make the *next* project faster and more accurate.

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

The rules aren't project-specific. The PM Agent is designed to abstract them:

| ❌ Too specific (discarded) | ✅ Abstracted (kept) |
|---|---|
| "Gemini API returned 429 error" | "Before using any external API → verify rate limits and free tier quotas with Brave Search" |
| "Used Gemini 1.5 by mistake" | "Before using any AI model → confirm the current latest version; never rely on memory" |

After 3–5 projects, `xp-rules.md` becomes a record of your real-world experience — and Claude Code stops making the mistakes you've already encountered.

---

## What PM Zero generates

Describe your idea in plain language. The PM Agent runs a structured interview (15–40 questions across 4 stages), then outputs:

| File | What it does |
|------|-------------|
| `CLAUDE.md` | Tells Claude Code exactly how to build — tech stack, guardrails, error recovery rules, your accumulated xp-rules |
| `vision.md` | Full product spec — user stories, acceptance criteria, task breakdown, out-of-scope list |
| `settings.json` | Permission boundaries — blocks `.env` access, `rm -rf`, force pushes; scopes writes to `src/` |
| MCP setup command | Adds Playwright so Claude Code verifies UI in a real browser |

---

## How to use it

### 1. Set up the PM Agent (one time)

Create a Claude.ai Project. Configure it with three files:

```
Custom Instructions  ←  custom-instructions-v4.0.txt (paste full contents)
Knowledge            ←  pm-agent-knowledge-v4.0.md
Knowledge            ←  xp-rules.md
```

Install global MCPs once:

```bash
# Official docs lookup — prevents Claude Code from guessing API behavior
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest

# Web search — for error resolution and external API research
# Get a free key at brave.com/search/api/ (2,000 queries/month free)
claude mcp add brave-search -s user -e BRAVE_API_KEY=YOUR_API_KEY -- npx -y @brave/brave-search-mcp-server
```

### 2. Describe your idea

Open the Claude.ai Project and say what you want to build in 1–2 sentences. The PM Agent asks up to 40 questions across four stages — purpose, scope, behavior, constraints — then generates the 4 files above.

### 3. Build

```bash
# Initialize project (run manually — do NOT delegate this to Claude Code)
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-app
npx shadcn@latest init
git init && git add . && git commit -m "initial scaffold"

# Add Playwright MCP (required per project)
claude mcp add playwright -s project -- npx -y @playwright/mcp@latest

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
pm-zero/
├── custom-instructions-v4.0.txt   # PM Agent behavior — paste into Claude.ai Custom Instructions
├── pm-agent-knowledge-v4.0.md     # PM Agent knowledge base — upload to Claude.ai Knowledge
├── xp-rules.md                    # Your accumulated lessons — upload to Claude.ai Knowledge
└── pm-agent-manual.html           # Full step-by-step guide — open in browser
```

---

## Design decisions

**Why CLAUDE.md instead of a system prompt?**
Claude Code injects `CLAUDE.md` as a conversation message, not a system prompt. PM Zero accounts for this — every rule is written as a concrete `trigger → action` pair, not abstract guidance, because vague instructions get ignored.

**Why 1 task = 1 session?**
Claude Code's attention quality degrades as context grows. Keeping sessions short and using `/compact` every 30 minutes maintains consistent output quality throughout a project.

**Why Playwright MCP for every project?**
Claude Code's self-reporting is unreliable — it will say "done" when things are broken. Playwright forces verification in a real browser before a task is marked complete.

---

## Special commands

| Command | When | What happens |
|---------|------|-------------|
| `/ev` | After each project ships | Extracts lessons → append to `xp-rules.md` → re-upload |
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
