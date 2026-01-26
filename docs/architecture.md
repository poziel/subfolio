# Subfolio architecture notes

## Current direction
- Build the tracker UX first, then add real authentication later.
- Use a lightweight SQLite-backed API for quick prototyping.
- Keep all data access behind a small API so we can swap database providers later.
- Auth will be self-hosted (Keycloak or Authentik) on `auth.poziel.com` once chosen.

## Frontend structure
- Frontend lives in `client/`.
- Vue Router pages: landing (`/`), login (`/login`), app tracker (`/app`).
- Route guard uses a simple mock auth state for now.
- `TrackerView` reads/writes expenses from the API, with a local fallback if the API is offline.

## Backend API (local prototype)
- Backend lives in `server/`.
- Express server in `server/index.js`.
- SQLite database file stored at `server/subfolio.db`.
- Endpoints:
  - `GET /expenses`
  - `POST /expenses`
  - `PUT /expenses/:id`
  - `DELETE /expenses/:id`

## Environment
- Frontend expects `VITE_API_URL` (defaults to `http://localhost:3001`).
- Start API with `npm start` from `server/`.
- Start frontend with `npm run dev` from `client/`.

## Next planned steps
- Replace mock auth with a self-hosted OIDC provider (Keycloak/Authentik).
- Add protected route handling based on real tokens.
- Expand tracker features (filters, monthly/yearly grouping, deletion, editing).
