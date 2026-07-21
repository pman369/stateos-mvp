# Architecture Reference

## Overview

StateOS is a nervous-system regulation platform that helps users track internal state, detect autonomic drift, and intervene through timed protocol sessions. It runs on **Next.js 16 (App Router)** with **Supabase** for cloud persistence and **Google Gemini** for AI-assisted diagnostics and reflection. A dual-mode data layer allows full offline operation via localStorage.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (SPA)                       │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │ Zustand  │  │  App Router │  │  Web Audio API     │  │
│  │ Store    │  │  (16 pages) │  │  (chimes + pacing) │  │
│  └────┬─────┘  └──────┬─────┘  └────────────────────┘  │
│       │               │                                 │
│       └───────┬───────┘                                 │
│               ▼                                         │
│  ┌─────────────────────────┐                            │
│  │    db.ts (dual-mode)    │                            │
│  └────────┬──────────┬─────┘                            │
│           │          │                                  │
└───────────┼──────────┼──────────────────────────────────┘
            │          │
            ▼          ▼
   ┌──────────────┐  ┌─────────────────────────┐
   │  Supabase    │  │  localStorage            │
   │  (cloud)     │  │  (offline fallback)      │
   └──────┬───────┘  └─────────────────────────┘
          │
          ▼
   ┌──────────────┐
   │  Gemini API  │
   └──────────────┘
```

---

## Dual-Mode Data Layer

The core architectural pattern is a **cloud/local abstraction** in `src/components/utils/db.ts:241-248`.

### Mode Detection

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isCloudMode = !!(supabaseUrl && supabaseAnonKey);
```

If both env vars are set, all `db.*` methods route through Supabase. If either is missing, the app falls back to localStorage with JSON serialization under the `stateos_db_` prefix.

### Parity Contract

Every data method has dual implementations that must return identical TypeScript types. This means:

| Operation | Cloud Path | Local Path |
|-----------|-----------|------------|
| Read | Supabase `.select()` | `localStorage.getItem()` + `JSON.parse()` |
| Create | Supabase `.insert().select().single()` | Append to array + `JSON.stringify()` |
| Update | Supabase `.update().eq().select().single()` | Find index + merge + persist |
| Delete | Supabase `.delete().eq()` | Filter + persist |

Generated columns (`composite_score`, `drift_flag`, `recovery_window_seconds`, `recovery_tier`) are computed by Postgres in cloud mode and replicated in client-side JS for local mode.

### LocalStorage Keys

All keys use the `stateos_db_` prefix:

- `stateos_db_state_audits`
- `stateos_db_drift_events`
- `stateos_db_protocol_sessions`
- `stateos_db_identity_anchors`
- `stateos_db_daily_architecture_logs`
- `stateos_db_user_preferences`
- `stateos_db_user_profile`

---

## State Management

**Zustand** (`src/store/stateStore.ts`) manages three ephemeral, cross-component state slices. None of this is persisted to the database.

### Onboarding Draft

Tracks the 5-step onboarding wizard state: step index, baseline audit values, recovery estimate, and identity anchor text. Resets after onboarding completes.

### Active Protocol Session

Tracks the currently running protocol: slug, step index, countdown timer, play/pause state, pre/post ratings, linked drift event, and completed steps array.

### Active Diagnostic Flow

Tracks the 5-question diagnostic decision tree: current step, accumulated answers (`{question, answer: "yes" | "no"}`), and the linked drift event.

---

## Routing Map

All pages use `"use client"` — the entire application is client-rendered.

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Root — auth check, redirect to `/today` or `/login` | No |
| `/login` | Email/password auth + offline demo mode | No |
| `/onboarding` | 5-step onboarding wizard | No |
| `/today` | Dashboard / Instrument Panel (main hub) | Yes |
| `/audit/new` | New state audit check-in (5-dimension slider) | Yes |
| `/audit/history` | Audit history with SVG trend charts | Yes |
| `/diagnose` | Diagnostic flow (drift origin identification) | Yes |
| `/protocols/[slug]` | Protocol player (timed intervention session) | Yes |
| `/recovery/history` | Recovery Window analytics & trends | Yes |
| `/identity/anchors` | Manage identity anchors | Yes |
| `/identity/compass` | Identity Compass (signature statement) | Yes |
| `/profile` | User profile, stats, signature statement | Yes |
| `/settings` | Settings hub (4 sub-pages) | Yes |
| `/settings/account` | Account management + danger zone | Yes |
| `/settings/reminders` | Daily Architecture notification times | Yes |
| `/settings/preferences` | Theme, timezone, units | Yes |
| `/settings/privacy` | Analytics opt-in, data export | Yes |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/reflect` | POST | Gemini-powered reflection prompts for identity anchors |
| `/api/diagnose` | POST | Gemini-powered drift origin classification |

---

## Component Architecture

```
src/components/
├── layout/
│   └── Navbar.tsx            # Desktop sidebar + mobile bottom tabs
├── ui/
│   ├── StateAuditSlider.tsx      # 5-dimension slider form
│   ├── RecoveryWindowTimer.tsx    # Live elapsed-time timer
│   ├── ProtocolPlayer.tsx         # Step-by-step protocol runner
│   ├── DiagnosticFlow.tsx         # 5-question decision tree
│   ├── DailyArchitectureCard.tsx  # Morning/afternoon/evening tracker
│   └── BreathPulse.tsx           # Animated breathing visualizer
├── shared/
│   ├── TierBadge.tsx             # Recovery tier badge
│   └── ScienceTierLabel.tsx      # Established vs. Working Model labels
├── profile/
│   ├── StatsSummaryGrid.tsx      # Aggregate statistics
│   └── SignatureStatementEditor.tsx  # "I am ___" editor
├── settings/
│   └── DangerZoneCard.tsx        # Account deletion with confirmation
└── utils/
    ├── db.ts                     # Dual-mode data layer (807 lines)
    └── audio.ts                  # Web Audio API: chimes + pacing tones
```

---

## Layout System

`src/app/layout.tsx` sets up three Google Fonts:

| Font | Role | CSS Usage |
|------|------|-----------|
| **Newsreader** | Serif — headings, brand | `font-serif` |
| **Public Sans** | Sans-serif — body text | `font-sans` |
| **IBM Plex Mono** | Monospace — data, labels | `font-mono` |

The `Navbar` component (`src/components/layout/Navbar.tsx`) renders:
- **Desktop**: Fixed left sidebar with navigation links
- **Mobile**: Fixed bottom tab bar with icon + label

---

## Authentication Flow

1. User visits `/` → `page.tsx` checks `supabase.auth.getSession()`
2. If no session → redirect to `/login`
3. `/login` supports email/password via Supabase Auth and an **offline demo mode** that bypasses auth entirely
4. First login triggers `/onboarding` (5-step wizard)
5. Post-onboarding → redirect to `/today` (dashboard)

---

## AI Integration Pattern

Both API routes follow the same graceful-degradation pattern:

1. Check for `GEMINI_API_KEY` env var
2. If missing → return deterministic fallback (empty prompts, local keyword matching)
3. If present → call Gemini API with structured JSON output schema
4. On API error → silently fall back to local resolution

| Route | Model | Fallback |
|-------|-------|----------|
| `/api/reflect` | `gemini-2.5-pro` | Empty prompts array |
| `/api/diagnose` | `gemini-2.5-flash` | `fallback_node` from decision tree, or `"internal_state"` on error |

---

## Recovery Window Tier System

A Recovery Window opens when a drift event is detected and closes when it is resolved. The tier is computed from the elapsed time:

| Tier | Threshold | Meaning |
|------|-----------|---------|
| `instant` | <= 60 seconds | Immediate resolution |
| `rapid` | <= 5 minutes | Fast intervention |
| `standard` | <= 30 minutes | Normal recovery |
| `delayed` | <= 2 hours | Slow recovery |
| `extended` | > 2 hours | Prolonged disruption |

**Cloud**: Postgres generated columns in `drift_events` compute `recovery_window_seconds` and `recovery_tier` automatically on `resolved_at` update.

**Local**: Client-side JS in `db.ts:458-498` replicates the same logic when `resolveDriftEvent()` is called.

---

## Key Design Decisions

1. **Entirely client-rendered**: All pages use `"use client"`. No Server Components are used for page content — data fetching happens client-side through `db.ts`.

2. **Static protocol definitions**: Protocol content is hardcoded in `STATIC_PROTOCOLS` (also seeded in Supabase). The frontend always reads from the static list for rendering; the DB is used for session logging only.

3. **Science tier enforcement**: All protocol claims are explicitly labeled as "Established" or "Working Model" at the component level via `ScienceTierLabel`, not left to copy edits.

4. **Dark theme instrument aesthetic**: Custom color palette (`ink`, `signal` gold, `ash`, `paper`) with a 10.9-second breathing animation cycle (5.5 breaths/min = cardiac coherence frequency). Supports `prefers-reduced-motion`.

5. **Offline-first**: The app is fully functional without any env vars set — localStorage handles all persistence, and AI features degrade gracefully to local fallbacks.
