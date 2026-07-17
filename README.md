# stateOS

**A state engineering platform: track internal state, diagnose drift, and intervene in real time.**

stateOS treats "feeling off" as a solvable, trackable problem. It measures your **Recovery Window** — the time between noticing you've drifted from your baseline and getting back to it — and gets you there faster with a diagnostic flow and a library of short, timed protocols grounded in nervous-system regulation (HRV, vagal tone, paced breathing).

---

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Tech Stack](#tech-stack)
- [Project Documentation](#project-documentation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database](#database)
- [Scripts](#scripts)
- [Science & Content Policy](#science--content-policy)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

Most wellness apps ask you to log a mood. stateOS asks a narrower, more actionable question: *when something throws you off, how fast do you get back?* That single metric — the Recovery Window — is the app's north star, and everything else (the State Audit, the Diagnostic Engine, the Protocol Library) exists to make that number smaller over time, without ever treating a bad reading as a failure.

## Core Concepts

- **State Audit** — a 5-dimension check-in (Energy, Clarity, Emotional Stability, Identity Alignment, Environmental Match), 1–5 scale, that establishes a baseline and flags drift.
- **Diagnostic Engine** — a short decision tree (max 5 questions) that locates *where* a disruption started — environment, perception, internal state, identity, or behavior — and routes to the right intervention. Runs deterministically first; falls back to an AI-assisted classification only for genuinely ambiguous free-text input.
- **Protocol Library** — six short, timed interventions (33-Second Reset, Heart Coherence Switch, Instant Realignment Protocol, Full-Body Frequency Flush, Highest Timeline Lock-In, Five Micro-Alignment Cues), each closing out a Recovery Window instance.
- **Daily Architecture** — a lightweight morning/afternoon/evening structure (3 min / 1 min / 2–3 min) for maintaining baseline rather than only reacting to drift.
- **Recovery Window** — the core metric. Computed server-side as a generated Postgres column, tiered from Instant (≤60s) to Extended (2+ hrs), never presented with red/green pass-fail framing.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router), TypeScript
- **Database:** [Supabase](https://supabase.com/) (Postgres + Row-Level Security)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Client state:** [Zustand](https://github.com/pmndrs/zustand) (UI state) + [TanStack Query](https://tanstack.com/query) (server state, optimistic writes)
- **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **AI:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash` for structured classification, `gemini-2.5-pro` for reflective prompts), proxied server-side via Supabase Edge Functions — the API key never reaches the client
- **Hosting:** [Vercel](https://vercel.com/)

## Project Documentation

Full specs live in `/docs`. Start with the technical spec, then the content docs if you're working on copy or design:

| Doc | Covers |
|---|---|
| `stateOS_Technical_Specification_v2.md` | Architecture, database schema, Edge Functions, routes, MVP scope |
| `stateOS_Settings_Profile_Plan.md` | Profile and Settings surfaces, account deletion, privacy toggles |
| `stateOS_Protocol_Content_Library.md` | Full seed-ready scripts for all 6 MVP protocols |
| `stateOS_Diagnostic_Question_Bank.md` | Exact wording and branching logic for the Diagnostic Engine |
| `stateOS_Onboarding_Script.md` | Screen-by-screen first-run copy |
| `stateOS_Notification_Microcopy.md` | Push notifications, result screens, empty/error states |
| `stateOS_Visual_Design_System.md` | Color, type, layout, and motion direction |
| `StateArchitecture_Science_Framing_Cheatsheet.md` | Policy and specific fixes for how source material claims are tiered and cited |
| `stateOS_Documentation_Plan.md` | What's written, what's left, and in what order |

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- A [Supabase](https://supabase.com/) account and project
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### Installation

```bash
git clone https://github.com/your-org/stateos.git
cd stateos
npm install
```

### Supabase Setup

1. Create a new Supabase project.
2. Run the schema migration from `docs/stateOS_Technical_Specification_v2.md` §4 (tables, RLS policies, indexes) plus the additions in `stateOS_Settings_Profile_Plan.md` §2.
3. Seed the `protocols` table using the JSON blocks in `stateOS_Protocol_Content_Library.md`.
4. Deploy the Edge Functions in `supabase/functions/` (`gemini-proxy`, `diagnose-drift`, `daily-reminder-cron`, `recovery-window-digest`, `identity-anchor-reflect`, `export-user-data`, `delete-account`).
5. Set `GEMINI_API_KEY` as a secret on the Edge Functions — **not** in any client-exposed env file:

```bash
supabase secrets set GEMINI_API_KEY=your-key-here
```

### Local Development

```bash
cp .env.example .env.local
# fill in the values described below
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Used for admin-level operations (e.g. account deletion cascade checks); never expose to the client |
| `GEMINI_API_KEY` | Edge Function secret only | Set via `supabase secrets set`, never in `.env.local` or any `NEXT_PUBLIC_*` variable |

## Project Structure

```
/app
  /(auth)
    /login
    /onboarding
  /(app)
    /today
    /audit
      /new
      /history
    /diagnose
    /protocols
      /[slug]
    /recovery
      /history
    /identity
      /anchors
      /compass
    /profile
    /settings
      /account
      /reminders
      /preferences
      /privacy
/supabase
  /functions
    /gemini-proxy
    /diagnose-drift
    /daily-reminder-cron
    /recovery-window-digest
    /identity-anchor-reflect
    /export-user-data
    /delete-account
  /migrations
/docs
  (see Project Documentation above)
```

## Database

Eight core tables (`state_audits`, `drift_events`, `protocols`, `protocol_sessions`, `identity_anchors`, `daily_architecture_logs`, `diagnostic_sessions`, `user_preferences`) plus a `profiles` table for identity-facing data, all with Row-Level Security scoped to `auth.uid()`. Full schema, generated columns (Recovery Window computation, drift flags), and RLS policies are in `docs/stateOS_Technical_Specification_v2.md` §4 and `docs/stateOS_Settings_Profile_Plan.md` §2.

## Scripts

```bash
npm run dev        # start local dev server
npm run build       # production build
npm run lint          # lint
npm run typecheck      # TypeScript check
npm run db:generate     # generate Drizzle types from schema
npm run db:migrate       # run pending migrations
```

## Science & Content Policy

All in-app claims are tiered as either **Established** (peer-reviewed — HRV, vagal tone, polyvagal states, DMN, interoception) or **Working Model** (explanatory metaphor — frequency, signature frequency, coherent radiance), and this distinction is enforced at the component level via `ScienceTierLabel`, not left to individual copy edits. See `docs/StateArchitecture_Science_Framing_Cheatsheet.md` for the full policy and the specific source-material passages it was written to fix.

## Contributing

This project is currently maintained as a solo/small-team build. If you'd like to contribute:

1. Fork the repo and create a feature branch.
2. Keep new content (protocol copy, notification text, etc.) consistent with the tone guidelines in `docs/stateOS_Protocol_Content_Library.md` §1 and the science-tiering rules above.
3. Open a pull request with a clear description of the change.

## License

MIT — see [`LICENSE`](./LICENSE).

## Acknowledgments

The Protocol Library and Diagnostic Engine framework are adapted from *State Architecture: The Foundational Guide to Human State Engineering*, with claims re-tiered and re-cited per `docs/StateArchitecture_Science_Framing_Cheatsheet.md` to keep established science and practice metaphor clearly separated throughout the app.
