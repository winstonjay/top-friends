# Top Friends

A private, single-user, mobile-first web app for keeping up with friends.

Built with React + Vite, backed by Supabase, deployed on Vercel.

## Development

```sh
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

## Scripts

```sh
npm run dev        # dev server
npm test           # vitest, single run
npm run test:watch # vitest in watch mode
npm run lint       # oxlint
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Layout

```
src/                   app code
src/test/              vitest setup
supabase/migrations/   SQL migrations
.claude/skills/        product & design decisions
```

`CLAUDE.md` holds the working agreement for this repo — stack, conventions,
and where decisions live. Read it before making changes.
