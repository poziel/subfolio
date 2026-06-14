# Project Overview

Subfolio is a smart, forward-looking finance app. The current product focus is
tracking subscriptions and recurring expenses, then using that recurring
schedule to forecast future cash flow and show where money goes over time.

## Stack

- Vue 3 with Composition API and `<script setup>`
- JavaScript application code
- PrimeVue styled mode with an Aura-derived Subfolio preset
- PrimeIcons for UI iconography
- Tailwind CSS 4 theme tokens in `src/assets/main.css`
- Vue Router 4 for navigation and route guards
- Firebase Realtime Database and PocketBase client SDKs for user-owned storage
- Vite for local development and production builds

## Working Rules

- Follow the existing Vue, PrimeVue, Tailwind layout, and Vue Router patterns.
- Use npm for project commands.
- Keep root build and lint checks passing after code changes.
- Do not commit generated `dist/` output unless explicitly asked.
- Do not add auth provider secrets, API keys, or database credentials to source
  files.
- Treat saved database connection state as the current app entry condition.
- Treat `?config=` links as database-connection replacement links. The value is
  a base64-encoded JSON connection, applied before app route guards run.
- Keep Subfolio frontend-only unless the user explicitly asks for hosted backend
  work.
