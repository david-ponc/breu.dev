<div align="center">
  <img src="./public/breu-logo.png" alt="Breu" width="160" />
  <h3>Short links. Clear insights.</h3>
  <p>
    Create and manage short links, then understand what happens after someone clicks.
  </p>
  <p>
    <a href="https://breu.dev">Visit Breu</a>
  </p>
</div>

## What Breu does

Breu is a link shortener with link management and click analytics. Create a first link as a guest, or sign in to manage more links from one place.

- Create, edit, pause, and organize short links.
- Generate readable slugs, with optional AI suggestions.
- See click activity over time and recent visits.
- Explore visit breakdowns such as country, referrer, device, and browser.

## Development

### Requirements

- [Bun](https://bun.sh/)
- PostgreSQL and Redis
- A Vercel project for exercising queue-backed link and analytics events locally

Install dependencies:

```bash
bun install
```

Create a `.env.local` file with the variables listed below. `docker-compose.yml` uses this file for the PostgreSQL container, so include `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` as well.

Start the local services and initialize the database:

```bash
docker compose up -d
bun run db:init
```

Run the app:

```bash
bun run dev
```

The app publishes domain events through Vercel Queues. To test queue producers and consumers locally, link the Vercel project and run through the Vercel CLI:

```bash
vercel link
vercel env pull
vercel dev
```

### Environment variables

The server validates its required configuration at startup.

| Variable | Purpose |
| --- | --- |
| `BASE_URL`, `VITE_BASE_URL` | Public base URL used by the server and client. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis connection string, used for anonymous sign-in rate limiting. |
| `BETTER_AUTH_SECRET` | Better Auth secret; must be at least 32 characters. |
| `BETTER_AUTH_URL` | Base URL for authentication callbacks. |
| `RESEND_FROM` | Sender identity for authentication emails. |
| `RESEND_API_KEY` | Resend API key. Optional in development; required in production. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub sign-in credentials. |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord sign-in credentials. |
| `AI_GATEWAY_API_KEY`, `AI_SLUG_MODEL` | Vercel AI Gateway credentials and model used for AI slug suggestions. |
| `NODE_ENV` | `development`, `test`, or `production`. |

For Docker Compose, set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `.env.local` too. Keep real credentials out of version control.

## Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Vite development server. |
| `bun run build` | Build the app for production. |
| `bun run serve` | Preview the production build locally. |
| `bun run test` | Run the Vitest test suite. |
| `bun run lint` | Lint with Biome. |
| `bun run format` | Format with Biome. |
| `bun run check` | Run Biome checks. |
| `bun run db:init` | Initialize the Breu, analytics, and redirect database schemas. |

## Project structure

- `src/features/` — user-facing pages and feature components.
- `src/contexts/` — domain logic and infrastructure for links, redirects, and analytics.
- `database/` — SQL schemas and initialization scripts.
- `server/` — server plugins, including the Vercel Queue consumer.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start and TanStack Router with server-side rendering |
| UI | React 19 and Base UI |
| Styling | Tailwind CSS 4 with Vite |
| Typography | IBM Plex Sans and Fira Code via Fontsource |
| Language | TypeScript |
| Database | PostgreSQL |
| Rate limiting | Redis |
| Authentication | Better Auth |
| Background events | Vercel Queues |
| Code quality | Biome (lint, format, check) |
| Testing | Vitest and Testing Library |
| Deployment | Vercel with Nitro |
