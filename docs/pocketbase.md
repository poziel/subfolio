# PocketBase setup

Subfolio stays frontend-only, so PocketBase schema changes are managed by
PocketBase itself. The browser app performs a lightweight schema preflight when
it connects, but the actual migration files must be present beside the
PocketBase executable.

## App configuration

The browser app now uses the managed PocketBase deployment configured through
Vite environment variables instead of asking users to paste database details at
sign-in.

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_POCKETBASE_EXPENSES_COLLECTION=expenses
VITE_POCKETBASE_AUTH_COLLECTION=users
```

Copy `.env.example` to `.env.local` for local development and change the URL to
the PocketBase application you want the frontend to use. Production deployments
should set the same variables in the hosting environment.

The PocketBase verification email should point back to the frontend route that
handles verification tokens, such as:

```text
https://your-subfolio-app.example/connect?token=<verification-token>
```

The app also accepts `/login?token=...` for backward-compatible links because
`/login` redirects to `/connect` with the query string preserved.

The `users` auth collection must keep password auth enabled with both
`username` and `email` as identity fields. Subfolio also expects a unique
`username` text field and the standard `name` text field for display names.

## Migrations

Subfolio includes a PocketBase command wrapper for local development. It uses a
global `pocketbase` executable and keeps runtime data outside the repository.

```bash
npm run db -- serve
```

The wrapper injects these defaults for `serve`:

```text
--dir=<runtime>/pb_data
--hooksDir=<runtime>/pb_hooks
--publicDir=<runtime>/pb_public
--migrationsDir=<repo>/pocketbase/pb_migrations
--dev
```

On Windows, the default runtime folder is:

```text
D:\Dev\6-miscellaneous\pocketbase\subfolio
```

Override it with `SUBFOLIO_POCKETBASE_ROOT` when needed.

You can pass PocketBase arguments after the command:

```bash
npm run db -- serve --http=127.0.0.1:8090
```

Apply migrations explicitly with:

```bash
npm run db -- migrate up
```

Other PocketBase commands pass through without Subfolio runtime flags:

```bash
npm run db -- update
```

Preview the generated command without running PocketBase:

```bash
npm run db -- serve --dry-run
```

The first Subfolio migration creates the `expenses` collection with the fields
required by the frontend adapter. Later migrations add optional metadata fields,
a required `user` relation, and username support for the `users` auth
collection. The final expense collection rules require
`@request.auth.id` and restrict list, view, create, update, and delete access to
the authenticated owner.

## Seed data

Seed data is opt-in and intended for local development only. Start PocketBase
with the migrations applied, create a PocketBase user account, then generate
expenses for that user:

```bash
npm run seed:pocketbase -- --user=poziel --count=100 --categories=12
```

The seeder uses Faker to generate recurring expense names, categories, amounts,
frequencies, date patterns, URLs, icons, notes, tax fields, and active states.
It resolves the target account by username or email and does not require the
user password. Internally it writes through a temporary local PocketBase
migration so normal collection rules stay strict for the browser app.

Useful options:

```bash
npm run seed:pocketbase -- --email=user@example.com --count=1000 --categories=25
npm run seed:pocketbase -- --username=poziel --count=10000 --categories=60 --reset
npm run seed:pocketbase -- --list-users
npm run seed:pocketbase -- --user=poziel --count=50 --categories=8 --seed=223 --dry-run
npm run seed:pocketbase -- --user=poziel --currency=USD --runtime-root=D:\Dev\6-miscellaneous\pocketbase\subfolio
```

If seeding says no user was found, run `--list-users` and seed with one of the
printed usernames or email addresses. This can happen after local migration
rollback if the `username` field was recreated and existing records have not
been given a username again.

Environment variable alternatives:

```bash
POCKETBASE_COLLECTION=expenses
POCKETBASE_AUTH_COLLECTION=users
POCKETBASE_SEED_USER=poziel
POCKETBASE_SEED_COUNT=100
POCKETBASE_SEED_CATEGORIES=12
POCKETBASE_SEED_CURRENCY=CAD
POCKETBASE_SEED_RANDOM=223
```
