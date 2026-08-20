# Top Friends
Private single-user web app for keeping up with friends. A joke app
(MySpace Top 8 energy) wrapped around a sincere mechanism — copy stays
dry and funny, never earnest.

## Stack
React + Vite (JS), Supabase (auth/Postgres/storage), Netlify. Mobile-first
PWA, ~390px target. Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
Never the service_role key in client code. All tables use RLS
(auth.uid() = user_id).

## Working here
- npm run dev / npm test / npm run build — run tests before finishing
- npm run lint (oxlint) for anything you touched
- Unit-test derived logic; keep UI tests light
- Migrations as SQL files in supabase/migrations
- Small components, inline styles or plain CSS, no UI framework
- Product/design decisions live in .claude/skills/ — check them before
  building features, and propose skill updates when decisions change

## Layout
- src/lib/supabase.js — the one Supabase client, anon key only
- src/test/setup.js — vitest + jsdom + testing-library setup
- .env.local — real env values, gitignored (copy .env.example)
