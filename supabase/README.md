# Supabase

The schema lives in `migrations/` as plain SQL, so the repo is the record
of what the database looks like. Changing the schema means adding a file
here, not clicking around the dashboard.

## Applying the first migration

The three tables were originally created by hand in the SQL editor, so
they exist in the hosted project already and `create table` would collide
with them. There's no data worth keeping, so drop them first:

```sql
drop table if exists meetups, bindings, people cascade;
```

Then run `migrations/20260820000000_initial_schema.sql`, either by pasting
it into the SQL editor or — if you install the Supabase CLI — with:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

From here on, every schema change is a new timestamped file in
`migrations/`. `supabase migration new <name>` creates one with the right
filename if you're using the CLI.

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
