# Architecture

## Data Flow

```text
User input
  -> Vue composables (useExpenses, useSettings, useDatabaseConnection)
  -> selected provider adapter
  -> user-owned Firebase Realtime Database or PocketBase collection
  -> reactive Vue UI
```

- Expense data should flow through provider adapters when a connection exists.
- Settings currently persist to `localStorage` under `subfolio-settings`.
- Database connection state persists to `localStorage` under
  `subfolio-database-connection`.
- Any route may include a `config` query parameter. It is a base64-encoded JSON
  database connection, applied before app route guards run, then removed from
  the URL with a replace navigation.
- Keep persistence details behind composables or adapter modules so storage can
  move later without rewriting view components.

## Routing

Routes are defined in `src/router/index.js`:

- `/` shows the public landing page.
- `/features` explains the application feature set.
- `/about` explains the project and product rationale.
- `/byodb` explains the bring-your-own-database model.
- `/pricing` shows current tiers.
- `/open-source` explains source availability, user-owned data, BYODB, and contribution through GitHub.
- `/changelog` renders `CHANGELOG.md`.
- `/privacy`, `/terms`, `/refund-policy`, and `/license` are footer-only legal pages.
- `/connect` shows the database connection page.
- `/login` redirects to `/connect`.
- `/app` shows the connected dashboard.
- `/app/expenses` shows the recurring expense tracker.
- `/app/categories` shows expenses grouped by category.
- `/app/recurrences` shows recurring payment schedules.
- `/app/settings` shows local user preferences.

App routes redirect to `/connect` when no database connection is saved.
Public "Open App" calls to action should route to `/app`; the app route guard
handles database setup by redirecting to `/connect` when needed.

`?config=` links replace the saved database connection on whatever route they
are opened from. Accepted payloads include native Subfolio connection objects
and raw Firebase config objects using either `databaseURL` or Refinimo-style
`databaseUrl`.

## Database Adapters

Provider adapters live in `src/services/database/expenseConnections.js`.

- Firebase uses the browser SDK against a user-supplied Realtime Database path.
- PocketBase uses the browser SDK against a user-supplied URL and collection.
- Adapters expose realtime `subscribe`, `create`, `update`, and `delete`
  operations.
- Adapter records should normalize to the shared expense shape before reaching
  view components.
- Additional realtime providers should implement the same adapter contract.

## Vite Notes

- The app uses Vite defaults unless `vite.config.js` says otherwise.
- PrimeVue is configured in `src/main.js` with an Aura-derived Subfolio preset.
- PrimeIcons CSS is imported from `src/main.js`.
- Tailwind theme tokens and app-level layout helpers live in `src/assets/main.css`.
