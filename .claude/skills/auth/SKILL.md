---
name: auth
description: How signing in works and who owns what row. Load before touching authentication, the Supabase client, RLS policies, or any table with a user_id — and before adding a users/profiles table.
---

# Auth and ownership

## One user, no signup form

Sign-in is a magic link (`signInWithOtp`) with `shouldCreateUser: false`.
The account is created by hand in the Supabase dashboard and signups are
disabled there.

The anon key is inside the public bundle by design, so an open signup
endpoint is an open signup endpoint. Passwords were the alternative and
lost: they cost a reset flow and a secret to keep, for a login used a few
times a year on one phone. Revisit if this ever stops being a single-user
app, or if magic links start bouncing off a mail client.

## No users table, but there is a profiles table

`auth.users` is the users table. `user_id uuid not null default auth.uid()`
points at it, `auth.uid()` reads it out of the JWT, and a second copy would
only drift. Nothing duplicates an email or a password here.

`profiles` holds what the app knows about you that Supabase doesn't — for
now just `display_name`. It arrived when the app needed something to call
you and stays for the next such fact (slot config, notification prefs).
Two things about its shape:

- `user_id` is the primary key, not a column alongside an `id`. One row
  per user, so a surrogate key would only allow states that shouldn't
  exist.
- `display_name` is `not null`, so **the row's existence is the flag**.
  No row means the app still has to ask; there is no half-filled profile
  and no separate `onboarded` boolean to fall out of sync.

## Asking for a name

A signed-in user with no profile row gets the name prompt instead of the
app, but the nav bar stays up while they do — a user who doesn't want to
answer can still reach settings and sign out. Don't trap them behind it.

## RLS is the whole security model

Every table with a `user_id` enables RLS and gets the same policy in the
same migration:

```sql
alter table <t> enable row level security;

create policy "own rows" on <t>
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

`to authenticated` matters — without it the policy is also evaluated for
the anon role, where `auth.uid()` is null. A table that ships without RLS
is a public read/write API, not a leak waiting to happen.

Child tables reference their parent by `(id, user_id)` composite foreign
key rather than `(id)` alone, so a row can't point at another user's row
even if a policy is later loosened by accident.

## A person is not an account

A `people` row is *your record of* someone. Friends don't sign in and have
no account. Keep it that way even if accounts are later linked: the
identity of the row is yours, not theirs.

If two users ever want their logs to face each other, the shape is
additive and nothing here blocks it:

- `people.linked_user_id uuid references auth.users` — nullable, null for
  everyone who never signs up. Each side keeps its own `people` row.
- A `connections` table for mutual consent. It's the first table
  legitimately owned by two users, so its policy is
  `using (auth.uid() in (requester_id, addressee_id))`, not the standard
  one above.
- Meetups mirror rather than share: logging one writes a row on each side.
  Each person's note about the same dinner should be allowed to differ,
  and it keeps the meetups policy a one-liner. A shared meetup row with a
  participants join table would force every read through a subquery.

Not built, and possibly never. Written down so the next person doesn't
conclude the schema has to be torn up first.
