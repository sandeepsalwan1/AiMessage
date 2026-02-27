# AGENTS.md

## Cursor Cloud specific instructions

### Overview

AiMessage is a Next.js 13 (App Router) real-time messaging app with sentiment analysis. Single application (not a monorepo).

### Services

| Service | How to run | Port | Notes |
|---------|-----------|------|-------|
| Next.js app | `npm run dev` | 3000 | Main app (frontend + API routes) |
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | 5432 | Must be running before the app starts |

### Key commands

- **Install deps**: `npm install` (also runs `prisma generate` via postinstall)
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **Dev server**: `npm run dev`
- **Push schema to DB**: `npx prisma db push`

### Non-obvious caveats

- The file `app/libs/db-build-helper.ts` was accidentally removed from git history but is still imported by `pusher.ts`, `getCurrentUser.ts`, and `getSession.ts`. It has been restored. If the build fails with "Module not found: Can't resolve './db-build-helper'", restore it from commit `78586e5`.
- The Prisma schema uses `postgresql` provider (despite README mentioning MySQL). The `.env` file needs both `DATABASE_URL` and `DIRECT_URL` pointing to a PostgreSQL instance.
- Pusher env vars have fallback defaults in `app/libs/pusher.ts`, so the app runs without real Pusher credentials — but real-time messaging won't work without them.
- OAuth providers (GitHub, Google) and Cloudinary are optional. Credentials-based auth (email/password) works without them.
- The `next.config.js` has `typescript.ignoreBuildErrors: true` set intentionally for Vercel deployments.
- Use `npx prisma db push` (not `migrate`) to sync the schema locally — there are no migration files in the repo.
