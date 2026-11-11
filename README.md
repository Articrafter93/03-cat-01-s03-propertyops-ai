# PropertyOps AI

Executive dashboard for managing rooms-for-rent operations — covering the full lifecycle from applicant intake to deposit return — through a "control-room" interface over operational data.

> **Scope of this build (honest).** What is **built and running** is the **Next.js 16
> dashboard** on **static demonstration data** (`seed.json`) with **local mock authentication**
> via cookie. The multi-service automation layer (Make / Google Apps Script / WhatsApp / OpenAI /
> Drive) is the **target architecture design**, documented under `docs/`, but is **not implemented
> as live integrations** in this repository: in the demo, the "automations" are represented as
> seeded data (scenario monitor, error logs). All data is fictitious — this is a sandbox
> demonstration environment, not a production system.

---

## Stack (what's built)

| Layer | Technology | Status |
|------|-----------|--------|
| Dashboard | Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Recharts | ✅ Implemented |
| Data | Static seed (`frontend/data/seed.json`, fixed date 2026-04-25) typed via `lib/seed.ts` | ✅ Implemented |
| Auth | Local mock via an HMAC-signed cookie (`lib/auth.ts`, `lib/session-token.ts`, gated by `NEXT_PUBLIC_DEMO_AUTH`) | ✅ Implemented |
| Deployment | Vercel | 🎯 Target |

### Key technical decisions (the *why*)

- **Next.js 16 App Router + React Server Components** — data is read on the server and streamed as
  HTML, so the dashboard renders without shipping the dataset or a client data-fetching layer to the
  browser. Route groups (`(dashboard)`) share one authenticated shell without repeating layout code.
- **Static typed seed instead of a live database** — this build is a portfolio demonstration, so a
  real Postgres/Supabase instance would add operational cost (and free-tier pausing) with no benefit
  for an evaluator. The data is fully typed (`lib/types.ts`) and accessed through an async data layer
  (`lib/data.ts`), so swapping the seed for a real DB later is a single-layer change, not a rewrite.
- **Local mock auth over a real IdP** — role-based access (admin vs. maintenance technician) is
  enforced at a **real boundary** (Next.js middleware, `proxy.ts`), not just hidden in the UI. The
  mock is gated by `NEXT_PUBLIC_DEMO_AUTH` so it can never ship enabled to a real production build:
  the proxy and the server helpers share one rule (`lib/roles.ts`), so without the flag no cookie
  opens a page, and an email that is not a demo account gets no role instead of a default.
- **Signed session cookie with a per-build key** — the cookie carries the email plus an
  HMAC-SHA256 signature (`lib/session-token.ts`), so it cannot be forged by editing it. The key is
  generated when the build starts (`next.config.ts`) and inlined at compile time into one module,
  `lib/session-key.ts`, marked `server-only`: a client component that imported it would fail the
  build. It is not a `NEXT_PUBLIC_` variable, needs no manual secret, and a redeploy simply signs
  everyone out. Like any server-side value, it is part of the server build output (`.next/server`,
  `.next/required-server-files.json`), which is never served: whoever holds that output can sign
  sessions, which here grants nothing beyond the public demo accounts. In production builds the
  cookie is `Secure`, so the app must be served over HTTPS (or `localhost`) for the login to stick.
  Unit tests run on Node's built-in test runner (`npm test`), with no test dependency.
- **Zero-dependency i18n (EN/ES)** — a cookie-based dictionary (`lib/i18n/`) with English as the
  default avoids pulling a full i18n framework for a two-locale toggle; formatters are locale-aware
  and `<html lang>` is set dynamically.

## Target architecture (design, not implemented in this build)

| Layer | Technology | Status |
|------|-----------|--------|
| Orchestration | Make (Integromat) — 5 scenarios | 📐 Design (not built) |
| Business logic | Google Apps Script — 7 scripts | 📐 Design (not built) |
| Documents | Google Drive + Google Docs | 📐 Design (not built) |
| Communication | WhatsApp Business Cloud API | 📐 Design (not built) |
| AI | OpenAI GPT-4o (vision) + GPT-4o-mini (NLP) | 📐 Design (not built) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the proposed end-to-end design.

---

## Frontend dashboard (8 views, implemented)

Next.js 16 App Router, data from the typed static seed, "control-room" design (teal/petrol):

- **Executive dashboard** — KPIs, 30-day trend, activity feed
- **Onboarding Kanban** — lead pipeline with score and actions
- **Tenants** — table with individual file (payments, incidents, documents)
- **Rooms** — grid by property + per-room inventory
- **Incidents** — real-time SLA traffic-light, filters, row expansion
- **Checkout** — 4-step wizard (notice → inspection → charges → close)
- **Inspections** — before/after slider, AI-score donut, charges table
- **Automations** — scenario monitor (simulated data) + error log

---

## Project structure (real)

```
PropertyOps AI/
├── frontend/                    # Next.js 16 dashboard (what's built)
│   ├── app/
│   │   ├── (dashboard)/         # Route group — 8 sections
│   │   │   ├── dashboard/  onboarding/  tenants/[id]/
│   │   │   ├── rooms/[id]/  incidents/  checkout/
│   │   │   ├── inspections/[id]/  automations/
│   │   │   ├── auth/                # Auth server actions (local mock)
│   │   │   ├── login/              # Multi-role login
│   │   │   ├── privacy/            # Privacy policy (public route)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx             # Redirect → /dashboard
│   ├── components/
│   │   ├── charts/              # OccupancyTrendChart, RevenueByPropertyChart
│   │   ├── layout/              # Sidebar, TopBar, DashboardShell
│   │   └── ui/                  # KpiCard, StatusBadge, SlaIndicator, BeforeAfterSlider
│   ├── data/
│   │   └── seed.json            # Demo data (fixed date: 2026-04-25)
│   ├── tests/                   # Unit tests for the session rules (node --test)
│   └── lib/
│       ├── seed.ts              # Data source: typed seed.json + helpers
│       ├── data.ts              # Data-access layer (async API over the seed)
│       ├── auth.ts              # Local mock session (sign in, sign out, current session)
│       ├── session-token.ts     # HMAC signature of the session cookie
│       ├── session-key.ts       # Per-build signing key (server-only)
│       ├── demo-accounts.ts     # Demo accounts (login selector)
│       ├── roles.ts             # Demo identity: role mapping, session rule, role-gating
│       ├── i18n/                # Zero-dependency EN/ES dictionary
│       └── types.ts             # TypeScript interfaces for the entities
├── docs/
│   ├── ARCHITECTURE.md          # Target architecture design (Mermaid)
│   └── DATABASE.md              # Conceptual data model (16 entities)
└── src/                         # Reserved for target backend (not implemented)
    ├── ai/                      # (empty)
    └── automation/              # (empty)
```

---

## Run locally

```bash
cd frontend
npm install && npm run dev
# → http://localhost:3000/dashboard
```

Requires a single variable in `frontend/.env.local` (see `frontend/.env.example`) to enable the
local mock demo login:

```bash
NEXT_PUBLIC_DEMO_AUTH=enabled
```

Demo accounts (password pre-filled `Demo1234!`): `admin@propertyops.demo` (admin → `/dashboard`),
`tecnico@propertyops.demo` (technician → `/incidents`).

The session signing key needs no setup: `next.config.ts` generates one per build. Unit tests
(Node.js 22.18 or newer, which loads the TypeScript modules under test natively):

```bash
cd frontend
npm test
```

---

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **target** end-to-end architecture design (not implemented in this build).
- [docs/DATABASE.md](docs/DATABASE.md) — conceptual data model (16 entities); the demo implements a subset as static data in `seed.json`.
