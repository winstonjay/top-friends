-- Top Friends: the people, the bindings that tie you to them, and the
-- meetups that actually happened.
--
-- Everything is owned by exactly one user. The anon key ships inside the
-- public JS bundle, so row-level security is the *only* thing between a
-- stranger and these tables — a table without it is a public API. Every
-- table below enables RLS and gets a policy in the same breath.

-- People ---------------------------------------------------------------
--
-- A row here is *your record of* a person, not the person themselves and
-- not an account. Friends never sign in. If two accounts are ever linked
-- so their logs face each other, each side still keeps its own row and
-- gains a nullable pointer to the other's user — additive, not a rewrite.

create table people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users on delete cascade,
  name text not null check (btrim(name) <> ''),
  photo_url text,
  -- No check constraint yet: the tier vocabulary isn't settled. Once it
  -- is, add `check (depth_tier in (...))` in a follow-up migration.
  depth_tier text not null default 'adult',
  ambient boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),

  -- Redundant against the primary key, but it gives the child tables a
  -- composite foreign key to point at (see bindings/meetups below).
  unique (id, user_id)
);

create index people_user_id_idx on people (user_id);

alter table people enable row level security;

create policy "own rows" on people
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bindings -------------------------------------------------------------

create table bindings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users on delete cascade,
  person_id uuid not null,
  label text not null check (btrim(label) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),

  -- Composite rather than `references people`: this makes it impossible
  -- for a binding to point at somebody else's person, even if an RLS
  -- policy is later loosened by accident.
  foreign key (person_id, user_id)
    references people (id, user_id) on delete cascade,

  -- Same trick as on people, for meetups to point at.
  unique (id, user_id)
);

create index bindings_user_id_idx on bindings (user_id);
create index bindings_person_id_idx on bindings (person_id);

alter table bindings enable row level security;

create policy "own rows" on bindings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Meetups --------------------------------------------------------------

create table meetups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users on delete cascade,
  person_id uuid not null,
  binding_id uuid,
  met_on date not null,
  note text,
  created_at timestamptz not null default now(),

  foreign key (person_id, user_id)
    references people (id, user_id) on delete cascade,

  -- Retiring a binding shouldn't erase the history of having seen
  -- somebody, so this detaches rather than cascades. The column list on
  -- SET NULL is what keeps it from nulling user_id along with it, and
  -- needs Postgres 15 or newer.
  foreign key (binding_id, user_id)
    references bindings (id, user_id) on delete set null (binding_id)
);

create index meetups_user_id_idx on meetups (user_id);
create index meetups_person_id_met_on_idx on meetups (person_id, met_on desc);
create index meetups_binding_id_idx on meetups (binding_id);

alter table meetups enable row level security;

create policy "own rows" on meetups
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
