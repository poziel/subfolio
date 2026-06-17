# Subfolio

Subfolio is a forward-looking finance app for tracking subscriptions and
recurring expenses, projecting upcoming costs, and giving users a clearer view
of where money goes over time.

The current repo focus is a frontend-only app shell backed by a managed
PocketBase application for user accounts, verified sessions, and recurring
expense storage. Accounts store a username for sign-in, an email address for
verification, and a display name for in-app identity.

Legacy database connections can still be supplied with a `config` URL query
parameter, but protected app routes now require a valid verified PocketBase user
session.

## Project Structure

- `src/`: Vue 3 + Vite app.
- `src/components/PublicSiteShell.vue`: shared shell for public site pages.
- `src/services/database/`: provider adapters for recurring expense storage.
- `CHANGELOG.md`: release history rendered by the public changelog page.
- `.github/`: pull request template and release workflow that can append
  versioned release notes to the changelog.
- `docs/`: architecture notes and project decisions.
- `.ruler/`: source files for generated AI-agent instructions.

## Public Site

Public routes include `/`, `/features`, `/about`, `/byodb`, `/pricing`,
`/open-source`, and `/changelog`. Legal pages are linked from the footer at
`/privacy`, `/terms`, `/refund-policy`, and `/license`.

The public shell links to the project repository at
`https://github.com/poziel/subfolio`.

## Setup

Install dependencies:

```sh
npm install
```

The UI is built with PrimeVue styled mode, an Aura-derived Subfolio theme preset,
and PrimeIcons.

Local PocketBase configuration is read from Vite environment variables:

```sh
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_POCKETBASE_EXPENSES_COLLECTION=expenses
VITE_POCKETBASE_AUTH_COLLECTION=users
```

## Development

```sh
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

Generate local PocketBase expense data for a username or email:

```sh
npm run seed:pocketbase -- --user=poziel --count=100 --categories=12
```

## Verification

```sh
npm run check
npm run lint
npm run verify
```

`npm run verify` runs the build check and lint in the same order expected by
the project collaboration guide.

## Agent Instructions

Edit `.ruler/` source files first, then run `npm run ruler` to regenerate
agent-specific instruction outputs such as `AGENTS.md`.
