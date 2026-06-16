# PocketBase setup

Subfolio stays frontend-only, so PocketBase schema changes are managed by
PocketBase itself. The browser app performs a lightweight schema preflight when
it connects, but the actual migration files must be present beside the
PocketBase executable.

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
required by the frontend adapter. If you use a custom collection name in the
Subfolio connection form, create a matching migration for that name or point the
connection back to `expenses`.

## Seed data

Seed data is opt-in and intended for local testing only. Start PocketBase with
the migrations applied, then run:

```bash
npm run seed:pocketbase -- --dataset=subscriptions
```

Available datasets:

```bash
npm run seed:pocketbase -- --list
```

Useful options:

```bash
npm run seed:pocketbase -- --dataset=household --reset
npm run seed:pocketbase -- --dataset=all --reset
npm run seed:pocketbase -- --dataset=forecasting --url=http://127.0.0.1:8090 --collection=expenses
npm run seed:pocketbase -- --dataset=subscriptions --dry-run
```

Environment variable alternatives:

```bash
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_COLLECTION=expenses
POCKETBASE_SEED_DATASET=household
```
