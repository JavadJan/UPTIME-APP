# Uptime Monitor — MVP backend

A NestJS + Prisma backend for a self-hosted-style uptime monitoring app.
Add URLs, and it checks them concurrently on a schedule, stores history,
and logs an alert whenever a monitor flips between UP and DOWN.

## Architecture

- **Monitors module** — CRUD API for monitors (`src/monitors`)
- **Checker module** — the core piece. `checker.service.ts` checks monitors
  concurrently with a bounded worker pool (`concurrency.ts`) instead of
  awaiting one at a time — the same non-blocking-I/O idea as an event-driven
  web server, applied to outbound requests instead of inbound connections.
  `scheduler.service.ts` ticks every 10s and hands due monitors to it.
- **Alerts module** — logs status flips to the DB and calls `notify()`.
  `notify()` is currently a console log — wire in email (nodemailer) or a
  webhook POST there when you're ready; nothing else needs to change.
- **Prisma** — schema in `prisma/schema.prisma`, targeting Postgres. Run via
  Docker Compose from the repo root (see the root README) for a one-command
  Postgres + backend + frontend setup, or point `DATABASE_URL` at any
  Postgres instance for standalone use.

## Setup (standalone, without the root Docker Compose)

Needs a Postgres instance reachable at `DATABASE_URL`.

```bash
npm install
cp .env.example .env   # set DATABASE_URL to your Postgres connection string
npx prisma migrate dev --name init
npm run start:dev
```

The API listens on `http://localhost:3000`. For the one-command setup that
also runs Postgres and the frontend for you, use `make` from the repo root
instead.

## API

| Method | Path                    | Description                          |
|--------|-------------------------|---------------------------------------|
| POST   | `/monitors`              | Create a monitor `{ name, url, intervalSecs?, timeoutMs? }` |
| GET    | `/monitors`               | List all monitors |
| GET    | `/monitors/:id`           | Get one monitor |
| GET    | `/monitors/:id/history`   | Recent check results (`?limit=`) |
| PATCH  | `/monitors/:id/pause`     | Stop checking a monitor |
| PATCH  | `/monitors/:id/resume`    | Resume checking |
| DELETE | `/monitors/:id`           | Remove a monitor |

Example:

```bash
curl -X POST http://localhost:3000/monitors \
  -H "Content-Type: application/json" \
  -d '{"name": "My site", "url": "https://example.com", "intervalSecs": 60}'
```

Within ~10 seconds the scheduler picks it up, checks it, and you'll see a
row in `/monitors/:id/history`.

## What's deliberately left out of this MVP

- **Auth** — every endpoint is open. Add a NestJS guard + API keys or JWT
  before deploying anywhere public.
- **Frontend** — lives in `../frontend`, a Next.js dashboard that calls
  these endpoints.
- **Real notifications** — `AlertsService.notify()` just logs. Swap in
  email/webhook when you're ready to charge people for alerts.
- **Retries before declaring DOWN** — right now one failed check = DOWN.
  Most monitoring tools require 2-3 consecutive failures to avoid false
  alarms from a single dropped packet. Worth adding before this is
  customer-facing.

## Note on this sandbox

Two things couldn't be run end-to-end in the sandbox this was built in,
both for network/tooling reasons that don't apply on a normal machine:

- `prisma generate`/`migrate` need `binaries.prisma.sh`, which isn't
  reachable here.
- Docker itself isn't installed in this sandbox, so `docker compose up`
  hasn't been run here either.

What *was* verified here: the schema is valid Prisma syntax, the
`docker-compose.yml` is valid YAML with the three services wired up
correctly, the Makefile targets expand to the right commands, and the
concurrent-checking logic itself was tested standalone — `npm run smoke`
runs the same check/concurrency code against real URLs without touching
Prisma, and correctly detects UP, non-2xx, and unreachable-host cases.
