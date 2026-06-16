# Key Files

| File | Purpose |
|---|---|
| `src/router/index.js` | Routes, `?config=` application, and database-connection guards |
| `src/main.js` | PrimeVue plugin, Aura-derived theme preset, PrimeIcons import, and app mount |
| `src/App.vue` | Root layout switch between public pages and app shell |
| `src/components/AppShell.vue` | Connected app shell, sidebar, and global add-expense modal |
| `src/components/ExpenseFormModal.vue` | Add/edit form for recurring expenses |
| `src/components/ExpenseTable.vue` | PrimeVue DataTable for expense rows, actions, and pagination |
| `src/composables/useExpenses.js` | Expense state, provider calls, recurrence helpers, and local fallback data |
| `src/composables/useDatabaseConnection.js` | Saved Firebase/PocketBase connection state and encoded config-link parsing |
| `src/composables/useSettings.js` | Currency/settings state, local persistence, and conversion helpers |
| `src/composables/useAuth.js` | Compatibility wrapper around saved connection state |
| `src/services/database/expenseConnections.js` | Firebase and PocketBase expense adapters |
| `src/views/landing/` | Public landing-site pages, including overview, features, BYODB, pricing, open source, changelog, and legal pages |
| `src/views/LoginView.vue` | Bring-your-own-database connection page |
| `src/views/HomeView.vue` | Connected dashboard |
| `src/views/TrackerView.vue` | Expense tracker page |
| `src/views/CategoriesView.vue` | Category breakdown page |
| `src/views/RecurrenceOverviewView.vue` | Recurring payment overview page |
| `src/views/SettingsView.vue` | Local user preference settings and connection detail |
| `src/assets/main.css` | Tailwind import, Subfolio tokens, and app layout helpers |
| `docs/architecture.md` | Current technical plan and provider notes |
