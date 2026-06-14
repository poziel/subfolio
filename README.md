# Subfolio

Subfolio is a forward-looking finance app for tracking subscriptions and
recurring expenses, projecting upcoming costs, and giving users a clearer view
of where money goes over time.

The current repo focus is a frontend-only app shell. Users bring their own
realtime database connection, so Subfolio can run without a hosted backend.
Firebase Realtime Database and PocketBase are the first supported providers.

Database connections can also be supplied with a `config` URL query parameter.
The value is a base64-encoded JSON connection object. Subfolio accepts native
connection objects such as `{ "provider": "pocketbase", "pocketbase": { ... } }`
and Firebase config objects using either `databaseURL` or Refinimo-style
`databaseUrl`.

## Project Structure

- `src/`: Vue 3 + Vite app.
- `src/components/PublicSiteShell.vue`: shared shell for public site pages.
- `src/services/database/`: provider adapters for user-owned realtime databases.
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

## Development

```sh
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

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
