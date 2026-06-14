# Ruler Workflow

## Source Of Truth

- Store all editable AI-agent instruction sources in `.ruler/`.
- Keep `ruler.toml` committed.
- Do not put plaintext API keys or secrets in `ruler.toml`.
- Use `${VARIABLE_NAME}` placeholders in `ruler.toml` for secret values.
- Use `npm run ruler` from the repository root to regenerate agent outputs.

## Local Env Files

Ruler MCP configuration can read secret values from the environment. If local
helper scripts are added later, they may read these files from `.ruler/`:

- `.ruler/.env`
- `.ruler/.env.local`
- `.ruler/.env.<mode>`
- `.ruler/.env.<mode>.local`

Mode is resolved from `RULER_ENV`, then `MODE`, then `NODE_ENV`.

Use `RULER_ENV_FILE=<path>` when a one-off env file should override the normal
lookup order.

Local `.ruler/.env*` files are secret-bearing files and must stay uncommitted.
Commit only `.ruler/.env.example` when documenting required variables.
