# Supabase

The schema lives in `migrations/` as plain SQL, so the repo is the record
of what the database looks like. Changing the schema means adding a file
here and merging it — not clicking around the dashboard.

Auth settings are the exception: providers, redirect URLs and the user
itself are dashboard state, not migrations. Those steps are below.

## How migrations get applied

`.github/workflows/migrations.yml` runs them. A pull request that touches
`supabase/migrations/` gets a `supabase db push --dry-run` so the pending
statements show up in the checks; merging to `main` runs the real push.
Nothing is applied by hand.

It needs three secrets on the `Deploy` environment (Settings →
Environments → Deploy → Environment secrets). The workflow job declares
`environment: Deploy` to reach them; repository-level secrets would work
too, but then the `environment:` line has to come back out.

| Secret | Where it comes from |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Account → Access Tokens, on supabase.com |
| `SUPABASE_DB_PASSWORD` | Project Settings → Database → the password set at project creation |
| `SUPABASE_PROJECT_REF` | Project Settings → General → Reference ID |

Two things about that environment are load-bearing. **Deployment branches
and tags** has to stay unrestricted, or the pull-request dry run can't
read the secrets. And turning on **Required reviewers** gates the dry run
as well as the real push, so every schema PR would sit waiting for an
approval you'd have to click twice.

The CLI records what it has applied in `supabase_migrations.schema_migrations`,
so re-running is a no-op and only new files execute.

### The first one

The three tables were originally created by hand in the SQL editor, so
they exist in the project already and `create table` would collide with
them. There's no data worth keeping, so drop them once in the SQL editor:

```sql
drop table if exists meetups, bindings, people cascade;
```

That is the whole cleanup — the RLS policy you wrote by hand belongs to
`people` and goes with it. There's nothing to drop separately.

Then merge, and the workflow applies `20260820000000_initial_schema.sql`
for real. If you'd already run the migration by hand before the workflow
existed, tell the CLI so instead of dropping anything:

```sh
supabase migration repair --status applied 20260820000000
```

### Running one yourself

Occasionally useful — a local Docker stack, or a project the workflow
doesn't know about:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

If the runner or your machine can't reach the direct database connection
(it is IPv6-only), point the CLI at the session pooler instead, using the
connection string from Project Settings → Database:

```sh
supabase db push --db-url "postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres"
```

`db push` only rolls forward. There is no `down` — undoing something
means writing the migration that undoes it.

### New migrations

```sh
supabase migration new add_depth_tier_check
```

That creates a correctly timestamped empty file in `migrations/`. Writing
the file by hand with the same `<timestamp>_<name>.sql` shape works too.

## Creating the user

There is no signup form, on purpose: the anon key ships inside the public
JS bundle, and this app is for one person. So the account gets made by
hand, once:

**Authentication → Users → Add user → Create new user.** Use your email,
tick *Auto Confirm User*. The password field is required by the dialog and
irrelevant — sign-in is by magic link.

Then turn signups off entirely at **Authentication → Sign In / Providers →
Allow new users to sign up**. Existing users can still request magic
links; strangers get nothing.

## Redirect URLs

The magic link comes back to `window.location.origin`, which has to be on
the allowlist or Supabase silently redirects to the site URL instead.
**Authentication → URL Configuration:**

- Site URL: the Netlify production URL
- Redirect URLs: add `http://localhost:5173/**` for `npm run dev`, plus
  `https://<your-site>.netlify.app/**` and any deploy-preview pattern

## Checking RLS is actually on

A table with RLS disabled is readable *and writable* by anyone holding the
anon key. Worth confirming after any migration:

```sql
select relname, relrowsecurity
from pg_class
where relname in ('people', 'bindings', 'meetups');
```

All three should say `t`.
