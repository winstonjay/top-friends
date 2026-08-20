# Top Friends

Private single-user web app for keeping up with friends. Mobile-first,
React + Vite, Supabase behind it.

## Development

```sh
npm install
cp .env.example .env.local   # fill in from the Supabase dashboard
npm run dev
```

First time against a fresh Supabase project, the schema has to be applied
and the single user created by hand — there is no signup form. See
[supabase/README.md](supabase/README.md).

## Scripts

```sh
npm run dev         # vite dev server
npm test            # vitest, single run
npm run test:watch  # vitest in watch mode
npm run lint        # oxlint
npm run build       # production build to dist/
npm run preview     # serve the production build locally
```

## Layout

```
src/lib/        shared clients and helpers (supabase.js, auth.js)
src/components/ screens and pieces of screens
src/test/       vitest setup
supabase/migrations/   schema changes, as SQL files
.claude/skills/        product and design decisions
```

Conventions for working in this repo are in [CLAUDE.md](CLAUDE.md).

## Deployment

Netlify builds `main` and opens a deploy preview for every pull request.
Build settings live in `netlify.toml`; the two `VITE_` env vars are set
in the Netlify UI under Site configuration → Environment variables.
