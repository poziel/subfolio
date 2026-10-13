# Subfolio architecture notes

## Current direction
- Build Subfolio as a frontend-only app shell.
- Use the managed PocketBase application for user accounts, email verification,
  authenticated sessions, and recurring expense storage.
- User accounts include a username for preferred sign-in, an email for
  verification and optional sign-in, and a display name for in-app references.
- Keep all persistence behind provider adapters so Firebase, PocketBase, and
  future realtime data sources can share the same expense workflow.
- Treat a valid authenticated and email-verified PocketBase user as the current
  app entry condition.

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
  - account connection (`/connect`)
  - dashboard (`/app`)
  - expense tracker (`/app/expenses`)
  - expense detail and payment history (`/app/expenses/:id`)
  - category overview (`/app/categories`)
  - recurrence overview (`/app/recurrences`)
  - settings (`/app/settings`)
- `/login` redirects to `/connect` for backward-compatible links.
- Route guard requires a refreshed, verified PocketBase user session for app
  routes.
- Any route may include a `config` query parameter. The router applies the
  base64-encoded JSON connection before route guards run, saves it as the
  active database connection, then removes `config` from the URL with a replace
  navigation.
- `TrackerView` reads/writes expenses through the selected provider adapter,
  using the authenticated managed PocketBase client for the current default app
  flow.
- Shared tracker state lives in `src/composables/useExpenses.js`.
- PocketBase user session state lives in `src/composables/useAuth.js`.
- `/connect` accepts verification-link token query parameters and confirms
  email verification without exposing verification as a separate login tab.
- Managed database connection state lives in
  `src/composables/useDatabaseConnection.js` for adapter compatibility.
- User display preferences live in `src/composables/useSettings.js` and are
  persisted locally in the browser.

## Public site and changelog
- Public marketing/documentation pages share `src/components/PublicSiteShell.vue`.
- Public CTAs use "Open App" and route to `/app`; when no verified PocketBase
  session is available, the route guard sends users to `/connect` for account
  access.
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
- PocketBase uses the managed URL and collection names from Vite environment
  variables.
- URL config links accept native Subfolio connection objects and raw Firebase
  config objects using either `databaseURL` or Refinimo-style `databaseUrl`.
- Both adapters expose realtime subscribe, create, update, and delete methods
  for recurring expense records.
- The managed PocketBase adapter also stores payment history in an
  `expensePaymentHistory` collection linked to the authenticated user and parent
  expense. History records keep scheduled date, actual paid date, paid amount,
  currency, change metadata, and timestamps separate from the recurring expense
  source record.
- Managed PocketBase expense records include a `user` relation and collection
  rules restrict reads and writes to `@request.auth.id`.
- Expense records include amount, currency, tax, category, recurrence,
  date-pattern, URL, active/inactive state, and timestamps.
- Additional realtime providers should be added by implementing the same
  adapter contract instead of changing view components.

## Environment
- Start the app with `npm run dev`.
- `VITE_POCKETBASE_URL` points the frontend at the managed PocketBase
  application.
- Do not commit user database credentials, API keys, or provider secrets.

## Next planned steps
- Add connection diagnostics and provider-specific setup guidance.
- Expand the provider adapter contract for income and forecasting records.
- Expand tracker features around income, forecasting, filters, and reporting.
