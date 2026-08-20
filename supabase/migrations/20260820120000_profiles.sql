-- What to call you. Separate from auth.users because that table belongs
-- to Supabase — app-level facts about a user go here instead.
--
-- One row per user, so user_id is the primary key rather than a plain
-- column. The row only exists once a name has been chosen: no row means
-- the app still has to ask.

create table profiles (
  user_id uuid primary key default auth.uid()
    references auth.users on delete cascade,
  display_name text not null
    check (btrim(display_name) <> '' and length(display_name) <= 40),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "own rows" on profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
