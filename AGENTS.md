# PM-Zero Agent Rules

## Environment

- Work from Windows VSCode using PowerShell.
- Do not assume a remote Unix-style shell or remote project path is available.
- Prefer Windows paths such as `C:\Users\chidj\project\pm-zero`.
- Use `rtk` for noisy CLI commands when available.

## Workflow

- Read `README.md` first for the current environment policy.
- Treat `pm-zero-knowledge-v9.2.md` as the current knowledge base. If any generated artifact conflicts with `README.md` or this file, follow the Windows PowerShell policy.
- Keep edits small and focused.
- Keep the repository aligned to the Windows PowerShell workflow unless explicitly requested otherwise.

## Verification

- For documentation-only changes, run `git diff --check` when practical.
- For environment checks, use PowerShell commands such as `git status`, `claude --version`, and `codex --version`.
- Do not add MCP servers globally from this repository.
