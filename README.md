# PM Zero

**A requirements PM agent that turns vague ideas into Claude Code-ready specs — through structured interviews.**

Built for non-engineers who want to ship software with AI, without writing a single line of code.

---

## What is PM Zero?

PM Zero is a Claude.ai Project configuration that acts as a product manager.

You describe your idea in plain language. The PM Agent interviews you (15–40 questions), then generates 4 files that Claude Code needs to build your app autonomously.

```
Your idea  →  PM Agent interview  →  4 output files  →  Claude Code builds it
```

No technical background required.

---

## How it works

### Step 1 — Set up the PM Agent in Claude.ai

Create a new Claude.ai Project. Paste `custom-instructions-v4.0.txt` into Custom Instructions. Upload `pm-agent-knowledge-v4.0.md` and `xp-rules.md` as Knowledge files.

### Step 2 — Describe your idea

Open the project and say what you want to build in 1–2 sentences. The PM Agent will ask clarifying questions across 4 stages: purpose, scope, behavior, and constraints.

### Step 3 — Receive 4 output files

After the interview, the PM Agent generates:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code — development rules, tech stack, guardrails |
| `vision.md` | Full product spec — user stories, acceptance criteria, task breakdown |
| `settings.json` | Claude Code permissions — blocks dangerous operations, scopes file access |
| MCP setup command | Adds Playwright for browser-based verification |

### Step 4 — Start building

```bash
# Create the project (run manually — do NOT ask Claude Code to do this)
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-app
npx shadcn@latest init
git init && git add . && git commit -m "initial scaffold"

# Add Playwright MCP (per project)
claude mcp add playwright -s project -- npx -y @playwright/mcp@latest

# Launch Claude Code
claude
```

First message to Claude Code:
```
Read @vision.md and implement the first task in the Task Breakdown.
```

---

## Repository contents

```
pm-zero/
├── custom-instructions-v4.0.txt   # Paste into Claude.ai Project → Custom Instructions
├── pm-agent-knowledge-v4.0.md     # Upload to Claude.ai Project → Knowledge
├── xp-rules.md                    # Upload to Claude.ai Project → Knowledge (grows over time)
└── pm-agent-manual.html           # Step-by-step user guide (open in browser)
```

---

## Tech stack assumption

PM Zero is designed around the following stack. The PM Agent will confirm or adjust during the interview.

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **UI components:** shadcn/ui
- **Package manager:** pnpm
- **Deployment:** Vercel

---

## MCPs used

| MCP | Scope | Purpose |
|-----|-------|---------|
| Context7 | Global (install once) | Fetches official docs before implementing any library |
| Brave Search | Global (install once) | Searches for errors, library choices, external API limits |
| Playwright | Per project | Browser automation for UI verification |

Install global MCPs once:

```bash
# Context7
claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest

# Brave Search (replace YOUR_API_KEY — free at brave.com/search/api/)
claude mcp add brave-search -s user -e BRAVE_API_KEY=YOUR_API_KEY -- npx -y @brave/brave-search-mcp-server
```

---

## Special commands

| Command | When to use | What it does |
|---------|------------|--------------|
| `/ev` | Project complete | Extracts lessons learned → add to `xp-rules.md` |
| `/audit` | Monthly | Checks knowledge base for outdated rules |

### `/ev` — Cross-project self-improvement

After finishing a project, run `/ev` in the Claude.ai PM Agent project. The agent reviews what went wrong, abstracts root causes into reusable rules, and outputs them in this format:

```
## XP-[N]: [One-line title]
- Situation: [what you were doing]
- Symptom: [what broke]
- Root cause: [why it happened — abstracted]
- Rule: [trigger] → [action]
```

Paste the output into `xp-rules.md` (max 10 entries). Re-upload to your Claude.ai project. The next project's `CLAUDE.md` will automatically include these lessons.

---

## Error recovery

If Claude Code gets stuck in a loop, paste this:

```
Stop. Follow these steps now:
1. Save the current problem and every fix you've tried into progress.md
2. Tell me to run /clear

After /clear, start a new session and enter:
"Read @progress.md and solve the problem using a different approach.
Do not try any method you already attempted."
```

---

## Who this is for

- Non-engineers who want to build apps with Claude Code
- People with product ideas but no coding background
- Anyone frustrated by vague AI outputs that don't actually ship

---

## User manual

Open `pm-agent-manual.html` in your browser for the full step-by-step guide with copy-paste commands for every action.

An English version (`pm-agent-manual-en.html`) is also available.

---

## License

MIT
