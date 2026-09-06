# Uptime Monitor

Full stack: NestJS/Prisma API (`backend/`) + Next.js dashboard (`frontend/`),
orchestrated with Docker Compose.

## Run everything with one command

```bash
cp .env.example .env
make
```

That builds and starts three containers:

| Service  | URL                    | What it is                        |
|----------|------------------------|-------------------------------------|
| db       | localhost:5433          | Postgres                            |
| backend  | http://localhost:3000   | NestJS API                          |
| frontend | http://localhost:3001   | The dashboard                       |

First time only, once the containers are up, run migrations in a second
terminal:

```bash
make migrate
```

This creates the initial migration files under `backend/prisma/migrations/`
(commit those to git) and applies them. After that, the backend's `CMD`
applies migrations automatically on every restart, so you won't need to run
this again unless the schema changes.

Then open **http://localhost:3001**.

## Other commands

```bash
make logs    # tail all container logs
make down    # stop everything
make clean   # stop everything AND delete the Postgres data volume
make ps      # what's running
make help    # list all commands
```

## Why two ports (3000 and 3001)

The backend owns 3000. The frontend's dashboard code runs in your browser,
not inside its container, so its API calls go to whatever
`NEXT_PUBLIC_API_URL` was set to *at build time* — that has to be
`localhost:3000` (reachable from your browser), not `http://backend:3000`
(only resolvable inside the Docker network). The database is exposed on
`localhost:5433` by default so it won't clash with a local Postgres on
5432.

## Deploying somewhere real

Nothing here is production-hardened yet:

- **No auth** on the API — anyone who can reach port 3000 can add/remove
  monitors.
- **CORS is wide open** on the backend.
- **Postgres password is a placeholder** in `.env.example` — change it
  before this touches the internet.
- If you deploy backend and frontend to different domains, set
  `NEXT_PUBLIC_API_URL` to the backend's real public URL before building
  the frontend image.

## Project layout

```
uptime-app/
├── docker-compose.yml
├── Makefile
├── .env.example
├── backend/     # NestJS API, Prisma, the checker + scheduler
└── frontend/    # Next.js dashboard
```

See each folder's own README for details on that half of the stack.
