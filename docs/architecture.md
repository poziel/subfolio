# Subfolio architecture notes

## Current direction
- Build Subfolio as a frontend-only app shell.
- Users bring their own realtime database connection, so the project does not
  need a hosted Subfolio backend.
- Keep all persistence behind provider adapters so Firebase, PocketBase, and
  future realtime data sources can share the same expense workflow.
- Treat a saved database connection as the current app entry condition. Real
  user authentication can be layered in later if a provider needs it.

## Frontend structure
- Frontend lives at the repo root.
- UI uses PrimeVue styled mode with an Aura-derived Subfolio preset and
  PrimeIcons. Tailwind remains available for layout, spacing, and responsive
  composition.
- Vue Router pages:
  - landing (`/`)
  - features (`/features`)
  - about (`/about`)
  - bring your own database (`/byodb`)
  - pricing (`/pricing`)
  - open source (`/open-source`)
  - changelog (`/changelog`)
  - legal pages (`/privacy`, `/terms`, `/refund-policy`, `/license`)
  - database connection (`/connect`)
  - dashboard (`/app`)
  - expense tracker (`/app/expenses`)
  - category overview (`/app/categories`)
  - recurrence overview (`/app/recurrences`)
  - settings (`/app/settings`)
- `/login` redirects to `/connect` for backward-compatible links.
- Route guard requires a saved database connection for app routes.
- Any route may include a `config` query parameter. The router applies the
  base64-encoded JSON connection before route guards run, saves it as the
  active database connection, then removes `config` from the URL with a replace
  navigation.
- `TrackerView` reads/writes expenses through the selected provider adapter,
  with demo data as a local fallback when no connection is configured.
- Shared tracker state lives in `src/composables/useExpenses.js`.
- Database connection state lives in `src/composables/useDatabaseConnection.js`.
- User display preferences live in `src/composables/useSettings.js` and are
  persisted locally in the browser.

## Public site and changelog
- Public marketing/documentation pages share `src/components/PublicSiteShell.vue`.
- Public CTAs use "Open App" and route to `/app`; when no database connection
  is saved, the route guard sends users to `/connect` for setup.
- The public shell links to the source repository at
  `https://github.com/poziel/subfolio`.
- Legal pages are footer-only links and are intentionally excluded from the top
  public navigation.
- `CHANGELOG.md` is the source of truth for release history and is rendered by
  `/changelog`.
- GitHub release automation lives under `.github/`. Release-included pull
  requests must include a `## Changelog` section and exactly one semantic
  version label: `major`, `minor`, or `patch`.

## Database providers
- Provider adapters live in `src/services/database/expenseConnections.js`.
- Firebase uses Realtime Database paths supplied by the user.
- PocketBase uses a user-supplied URL and collection name.
- URL config links accept native Subfolio connection objects and raw Firebase
  config objects using either `databaseURL` or Refinimo-style `databaseUrl`.
- Both adapters expose realtime subscribe, create, update, and delete methods
  for recurring expense records.
- Expense records include amount, currency, tax, category, recurrence,
  date-pattern, URL, active/inactive state, and timestamps.
- Additional realtime providers should be added by implementing the same
  adapter contract instead of changing view components.

## Environment
- Start the app with `npm run dev`.
- No Subfolio backend URL is required.
- Do not commit user database credentials, API keys, or provider secrets.

## Next planned steps
- Add connection diagnostics and provider-specific setup guidance.
- Expand the provider adapter contract for income and forecasting records.
- Expand tracker features around income, forecasting, filters, and reporting.
