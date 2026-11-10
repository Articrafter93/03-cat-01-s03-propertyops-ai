# PORTFOLIO DESCRIPTION

**Project:** PropertyOps AI
**Status:** Final approval seal in force
**Category:** CAT-04 — Business Web Applications
**Public URL:** https://propertyops-ai-zeta.vercel.app
**Repository:** https://github.com/Articrafter93/03-cat-01-s03-propertyops-ai

## Executive summary
An executive "control-room" dashboard for managing rooms-for-rent operations end to end — from applicant intake to deposit return. It replaces a manual, scattered workflow (WhatsApp, spreadsheets, Drive folders) with a single operational panel showing real-time occupancy, collections, incidents and inspections.

## Purpose and goals
Give a property administrator one place to run the full rental cycle, with role-appropriate access for a maintenance technician, and give a technical evaluator a credible, genuinely interactive operations product rather than a static mockup.

## What it can do
- Multi-role access enforced at a real boundary: an administrator sees everything; a maintenance technician is redirected (not just hidden) to only their assigned incidents.
- Executive dashboard (KPIs, 30-day trend, activity feed), onboarding Kanban with lead scoring and optimistic approve/reject.
- Tenant files with tabs, rooms + inventory, incidents with SLA traffic-light + priority filter + expandable rows.
- A 4-step checkout wizard that advances with data, and an inspection view with a drag before/after slider and an AI-score donut.
- Bilingual EN/ES with English as the default and a live toggle.

## Architecture and framework
Next.js 16 (App Router, React Server Components) reads a fully typed static seed on the server and streams HTML — no dataset or data-fetching layer ships to the browser. Role-based access is enforced at the request boundary by the Next.js proxy (`frontend/proxy.ts`, the Next.js 16 successor to middleware). Interactive flows (filter/expand, wizard, comparison slider, optimistic Kanban) are isolated client components. A zero-dependency cookie-based i18n layer localizes UI, formatters and content; contrast is WCAG-checked. Authentication is a local mock session gated by a build flag, so the demo login never ships enabled in a real production build unless explicitly opted in.

## Tools involved
<!-- dependency | level | limit -->
- Next.js / TypeScript / Tailwind v4 / shadcn/ui / Recharts — libraries, no service cost
- Playwright — smoke + verification, no cost
- Vercel (hobby) — `GRATIS_INDEFINIDO` (deployment + public verification, no paid tier)

No database, no third-party API keys, no metered services — the demo runs indefinitely at zero cost.

## Integrations and external services
None live. The multi-service automation layer (Make / Google Apps Script / WhatsApp / OpenAI / Drive) is documented as **target architecture**, not implemented as live integrations; the automations view represents it with seeded data and discloses this honestly in the UI. Data is fictitious (sandbox).

## Evidence of final approval
- Smoke test of the role boundary and the login/logout flow: `tests/smoke.spec.ts` (re-runnable against any deployment through `BASE_URL`)
- Final approval on 2026-07-04: Vercel deployment READY and a second human functional verification on the live URL, at commit `3c5c7276f8d593e689035b80e7f3b5e481852b7d` (the deployed commit on that date; later maintenance commits are in the repository history)

## Guide for recruiter or client
Open https://propertyops-ai-zeta.vercel.app. The login pre-fills a demo account — pick **Administrator** and press Enter for the full dashboard, or switch to the **Maintenance Technician** to see role-scoped access (try navigating to `/rooms` as the technician: you'll be redirected to your incidents with an explanatory banner). Exercise the live interactions: filter incidents by priority and expand a row, walk the 4-step checkout wizard, drag the before/after inspection slider, and approve a lead on the onboarding Kanban. Toggle EN/ES in the sidebar. All data is fictitious.
