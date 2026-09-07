# Pulse — uptime monitor frontend

Next.js (App Router, TypeScript) dashboard for the uptime-monitor backend.
Polls the API every 10 seconds and shows live status.

## Design

Built for the audience that actually uses uptime tools: developers who want
to scan status fast. A few deliberate choices:

- **Dark, dense, mono-forward.** URLs, response times, and timestamps use a
  monospace stack — that's the actual vernacular of this domain (terminals,
  logs, dashboards), not decoration.
- **The status pulse is the signature element.** A radiating "ping" only
  animates when a monitor is UP — it's a literal heartbeat, which is what
  the product is actually checking for.
- **Adding a monitor is a card in the grid**, not a separate button
  somewhere else — the empty/add state lives where the content will.
- System font stack (no external font download) so this builds with zero
  network dependencies beyond npm. If you want a specific display typeface,
  swap `--font-display` in `app/globals.css`, or add `next/font/google` in
  `app/layout.tsx` — either works fine on a machine with normal internet
  access.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point at your backend, defaults to localhost:3000
npm run dev
```

Open http://localhost:3000 for the backend and whatever port `next dev`
picks (usually 3000 too — if both projects run at once, start this one with
`npm run dev -- -p 3001` and update `.env.local` on the backend's CORS if
needed, or just set `NEXT_PUBLIC_API_URL` to wherever the backend actually
runs).

## What's here

- `app/page.tsx` — dashboard, polls `GET /monitors` every 10s
- `app/components/MonitorCard.tsx` — status, uptime %, response time,
  sparkline, pause/resume/remove actions
- `app/components/AddMonitorCard.tsx` — inline add-monitor form
- `app/components/StatusPulse.tsx` — the animated status dot
- `app/components/Sparkline.tsx` — hand-rolled SVG response-time trend, no
  charting library needed for something this simple
- `app/lib/api.ts` — thin fetch wrapper around the backend

## What's deliberately left out of this MVP

- **Auth** — matches the backend; add a login screen once the API has auth.
- **No websockets/SSE** — polling every 10s is simple and good enough for
  an MVP. Worth revisiting if you want sub-10s status updates.
- **No monitor detail page** — history is a sparkline + last-20 uptime %
  on the card. A dedicated page with a longer chart is a natural v2.

## Verified

`npm run build` completes clean (no type or lint errors), and the built
server was smoke-tested locally — serves the dashboard HTML with the
expected title. Full live behavior (actually polling data through to the
backend) needs the NestJS API running alongside it.
