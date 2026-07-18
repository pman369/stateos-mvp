# stateOS — Technical Specification

**A state engineering platform: track internal state, diagnose drift, and intervene in real time.**

Version 0.2 · Standalone build · Reviewed for cross-document consistency

---

## 1. Product Overview

### 1.1 Core Thesis
Internal state (energy, clarity, emotional stability, identity alignment, environmental match) is trackable, diagnosable, and correctable — with **Recovery Window** (time from noticing drift to restoring baseline) as the north-star metric. stateOS is the operating layer between "I feel off" and "I know exactly what to do about it, right now."

### 1.2 Product Scope
stateOS ships as a fully independent product: its own Supabase project, its own auth, its own data model. No dependency on any other app or shared schema. Everything below assumes a clean-room build.

### 1.3 Three Pillars (from source framework, renamed for product clarity)
1. **State Audit** — 5-dimension check-in (Energy, Clarity, Emotional Stability, Identity Alignment, Environmental Match), 1–5 scale.
2. **Diagnostic Engine** — a decision-tree ("Framework Diagnostic") that locates *where* drift originated (Environment → Perception → Internal State → Identity → Behavior) and routes to the correct protocol.
3. **Protocol Library** — timed interventions (33-Second Reset, IRP, Heart Coherence Switch, Full-Body Frequency Flush, Highest Timeline Lock-In, 5 Micro-Alignment Cues), each closing a Recovery Window instance.

### 1.4 Scientific Framing Policy
Two explicit content tiers, never blended in UI copy:
- **Tier 1 — Established**: HRV, vagal tone, polyvagal states, DMN, interoception, breath-pacing effects. Cited inline with source, presented as fact.
- **Tier 2 — Working Model**: "frequency," "signature frequency," electromagnetic-field claims, "coherent radiance." Presented as metaphor/practice framework, explicitly labeled, never cited as clinical fact. This protects product credibility and mirrors the source material's own three-layer structure (Established Knowledge / Working Model / Personal Practice) — carry that structure into the UI itself (see §6.4). Full policy and specific source-material fixes: see companion doc `StateArchitecture_Science_Framing_Cheatsheet.md`.

---

## 2. MVP Scope

| In MVP | Deferred to v2+ |
|---|---|
| State Audit check-in + Recovery Window tracking | HRV device integration (Apple Health, Oura, Whoop) |
| Diagnostic Engine (5-step framework tree) | Passive/ambient drift detection (calendar, phone usage signals) |
| Protocol Library with built-in timers (6 core protocols) | Full 21-Day Program with adaptive sequencing |
| Daily Architecture (morning/afternoon/evening structured flow) | Environmental Scan with geolocation-tagged space profiles |
| Recovery Window history + trend chart | Live AI coaching during a live disruption ("talk me through it") |
| Manual drift logging (trigger, protocol used, outcome) | Social/interpersonal synchrony features (excluded permanently, see §1.4) |
| Identity Compass + Identity Anchor (text/voice memo capture) | Multiplayer/shared circles |

---

## 3. Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript 5.x
- **Database**: Supabase (Postgres + RLS)
- **ORM**: Drizzle ORM
- **State/Data**: Zustand (client UI state) + TanStack Query (server state/cache)
- **Styling**: Tailwind CSS, shadcn/ui primitives
- **Timers/Audio**: native `setInterval`-based timer engine; optional Tone.js for tonal cues on protocol completion (soft chime)
- **AI**: Google Gemini API (`gemini-2.5-flash` for low-latency classification tasks, `gemini-2.5-pro` for reflective/generative prompts) via a server-side Edge Function proxy — never exposed client-side
- **Auth**: Supabase Auth (email + OAuth)
- **Hosting**: Vercel
- **Push/Reminders**: Supabase Edge Function cron → Web Push (for Daily Architecture nudges)

---

## 4. Database Schema (Supabase / Postgres)

### 4.1 Core Tables

```sql
-- Users are handled by Supabase Auth (auth.users). All tables below reference auth.users(id).

-- 1. State Audits — the core check-in record
create table state_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  energy smallint not null check (energy between 1 and 5),
  clarity smallint not null check (clarity between 1 and 5),
  emotional_stability smallint not null check (emotional_stability between 1 and 5),
  identity_alignment smallint not null check (identity_alignment between 1 and 5),
  environmental_match smallint not null check (environmental_match between 1 and 5),
  composite_score numeric generated always as (
    (energy + clarity + emotional_stability + identity_alignment + environmental_match) / 5.0
  ) stored,
  drift_flag boolean generated always as (
    energy >= 4 or clarity >= 4 or emotional_stability >= 4
    or identity_alignment >= 4 or environmental_match >= 4
  ) stored,
  note text,
  created_at timestamptz not null default now()
);

-- 2. Drift Events — a logged disruption, opens a Recovery Window
create table drift_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state_audit_id uuid references state_audits(id) on delete set null,
  trigger_source text check (trigger_source in
    ('environment','perception','internal_state','identity','behavior','unspecified')),
  trigger_note text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  recovery_window_seconds integer generated always as (
    extract(epoch from (resolved_at - detected_at))::integer
  ) stored,
  recovery_tier text generated always as (
    case
      when resolved_at is null then null
      when extract(epoch from (resolved_at - detected_at)) <= 60 then 'instant'
      when extract(epoch from (resolved_at - detected_at)) <= 300 then 'rapid'
      when extract(epoch from (resolved_at - detected_at)) <= 1800 then 'standard'
      when extract(epoch from (resolved_at - detected_at)) <= 7200 then 'delayed'
      else 'extended'
    end
  ) stored
);

-- 3. Protocols — static reference table, seeded once, editable via admin only
create table protocols (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- e.g. '33-second-reset'
  name text not null,
  purpose text not null,
  mechanism text not null,              -- e.g. 'vagal_activation', 'hrv_coherence', 'dmn_deactivation'
  duration_seconds integer not null,
  steps jsonb not null,                 -- [{ "order":1, "label":"Spinal Alignment", "duration":10, "instruction":"..." }]
  framework_node text not null check (framework_node in
    ('environment','perception','internal_state','identity','decision','behavior','feedback')),
  science_tier text not null check (science_tier in ('established','working_model')),
  created_at timestamptz not null default now()
);

-- 4. Protocol Sessions — a single timed run of a protocol, links to a drift event if applicable
create table protocol_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid not null references protocols(id),
  drift_event_id uuid references drift_events(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  completed boolean not null default false,
  pre_state_rating smallint check (pre_state_rating between 1 and 10),
  post_state_rating smallint check (post_state_rating between 1 and 10)
);

-- 5. Identity Anchors — user-authored reference points for Signature Identity
create table identity_anchors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,               -- e.g. "the word I use", "the gesture"
  anchor_type text check (anchor_type in ('word','gesture','breath_pattern','memory','voice_note')),
  description text not null,
  audio_url text,                    -- optional Supabase Storage reference for voice notes
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Daily Architecture Logs — morning / afternoon / evening completion tracking
create table daily_architecture_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  morning_completed boolean not null default false,
  afternoon_completed boolean not null default false,
  evening_completed boolean not null default false,
  morning_completed_at timestamptz,
  afternoon_completed_at timestamptz,
  evening_completed_at timestamptz,
  unique(user_id, log_date)
);

-- 7. Diagnostic Sessions — records a run through the Framework Diagnostic decision tree
create table diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drift_event_id uuid references drift_events(id) on delete set null,
  answers jsonb not null,          -- [{ "step":1, "question":"...", "answer":"yes|no|not_sure" }]
  resolved_node text,              -- final diagnosed node
  recommended_protocol_id uuid references protocols(id),
  created_at timestamptz not null default now()
);

-- 8. User Preferences
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminder_morning_time time default '07:00',
  reminder_afternoon_time time default '13:00',
  reminder_evening_time time default '21:00',
  reminders_enabled boolean not null default true,
  preferred_units text not null default 'metric',
  timezone text not null default 'UTC'
);
```

### 4.2 Row-Level Security (applied to every user-scoped table)

```sql
alter table state_audits enable row level security;
alter table drift_events enable row level security;
alter table protocol_sessions enable row level security;
alter table identity_anchors enable row level security;
alter table daily_architecture_logs enable row level security;
alter table diagnostic_sessions enable row level security;
alter table user_preferences enable row level security;

-- Repeat this pattern per table (example shown for state_audits):
create policy "Users can CRUD their own state audits"
  on state_audits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- protocols table is read-only for all authenticated users, write-restricted to service role
alter table protocols enable row level security;
create policy "Anyone authenticated can read protocols"
  on protocols for select
  using (auth.role() = 'authenticated');
```

### 4.3 Indexes

```sql
create index idx_state_audits_user_created on state_audits(user_id, created_at desc);
create index idx_drift_events_user_detected on drift_events(user_id, detected_at desc);
create index idx_drift_events_unresolved on drift_events(user_id) where resolved_at is null;
create index idx_protocol_sessions_user on protocol_sessions(user_id, started_at desc);
create index idx_daily_architecture_user_date on daily_architecture_logs(user_id, log_date desc);
```

---

## 5. Edge Functions (Supabase)

| Function | Trigger | Purpose |
|---|---|---|
| `diagnose-drift` | Called by client | Takes current + recent State Audit + free-text trigger note → runs Framework Diagnostic tree (deterministic first, Gemini-assisted for ambiguous free-text classification) → returns `resolved_node` + `recommended_protocol_id` |
| `identity-anchor-reflect` | Called by client | Gemini API proxy: takes a voice-note transcript or text description of an Identity Anchor memory, returns 2–3 reflective follow-up prompts (non-prescriptive) |
| `daily-reminder-cron` | Scheduled (cron, per-user local time) | Reads `user_preferences`, sends Web Push for morning/afternoon/evening sessions not yet marked complete |
| `recovery-window-digest` | Scheduled (weekly) | Aggregates `drift_events` for the week, computes average Recovery Window + tier distribution, pushes a summary notification |
| `gemini-proxy` | Called by client | Generic authenticated proxy to the Gemini API — API key lives only in Edge Function environment variables, never sent to or read by the client |

> **Cross-reference note:** Two additional Edge Functions — `export-user-data` and `delete-account` — are defined in `stateOS_Settings_Profile_Plan.md` (§5 and §4.5 respectively). They were introduced after this document's initial draft and are not re-detailed here to avoid duplication; see that companion doc for their full implementation notes.

### 5.1 `gemini-proxy` implementation sketch

```ts
// supabase/functions/gemini-proxy/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL = "gemini-2.5-flash"; // swap to gemini-2.5-pro for reflective prompts

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  // Verify Supabase JWT before proceeding (reject unauthenticated calls)
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const { prompt, responseSchema } = await req.json();

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  // For structured classification tasks (e.g. diagnose-drift), force JSON output
  if (responseSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema,
    };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 5.2 `diagnose-drift` logic sketch

```ts
// supabase/functions/diagnose-drift/index.ts
// Deterministic tree first (fast, free, no API call needed for common cases):
// Step 1: environmental? -> if trigger_note mentions a place/person change -> 'environment'
// Step 2: perceptual? -> if State Audit shows high clarity distortion but low emotional score -> 'perception'
// Step 3: internal? -> if energy + clarity both >=4 regardless of context -> 'internal_state'
// Step 4: identity? -> if identity_alignment >= 4 -> 'identity'
// Step 5: behavioral? -> if user reports already having reacted/decided -> 'behavior'
//
// If free-text trigger_note is present and the deterministic tree is ambiguous
// (ties between nodes), call gemini-proxy with Gemini's structured-output mode
// (responseSchema forcing a single enum field) rather than free-form JSON parsing:
//
// responseSchema: {
//   type: "object",
//   properties: {
//     node: { type: "string", enum: ["environment","perception","internal_state","identity","behavior"] }
//   },
//   required: ["node"]
// }
//
// This keeps the common path fast/offline-capable and reserves the API call
// for genuinely ambiguous cases, with Gemini's native schema enforcement
// removing the need for manual JSON-fence stripping or parse retries.
//
// Exact question wording and full branching logic: see
// `stateOS_Diagnostic_Question_Bank.md`.
```

---

## 6. Frontend Architecture

### 6.1 Route Structure (App Router)

```
/app
  /(auth)
    /login
    /onboarding          -- captures baseline State Audit + first Identity Anchor
  /(app)
    /today                -- home: current Daily Architecture status, quick State Audit
    /audit
      /new                -- 5-dimension check-in flow
      /history             -- trend charts
    /diagnose              -- Framework Diagnostic flow, entry point for "something's off"
    /protocols
      /[slug]              -- individual protocol player (timer + steps)
    /recovery
      /history              -- Recovery Window trendline, tier distribution
    /identity
      /anchors              -- Identity Anchor library, create/edit
      /compass               -- quick "which identity is active" check
    /settings
      /reminders
      /preferences
```

> **Cross-reference note:** `/profile` and the four `/settings` sub-routes (`/account`, `/reminders`, `/preferences`, `/privacy`) are detailed in `stateOS_Settings_Profile_Plan.md` §4, which supersedes the flatter `/settings` structure implied above.

### 6.2 Key Components

- `StateAuditSlider` — 5x labeled 1-5 sliders, submits to `state_audits`, computes drift_flag client-side for instant feedback before server round-trip.
- `RecoveryWindowTimer` — starts on `drift_events.detected_at`, live-updating elapsed time, visually shifts color as it crosses tier thresholds (instant → rapid → standard → delayed → extended), matches the framework's own tier language.
- `ProtocolPlayer` — step-by-step timed sequence renderer, driven by `protocols.steps` JSONB; handles audio cue on step transitions; on completion, prompts optional pre/post state rating (1–10) and writes `protocol_sessions`.
- `DiagnosticFlow` — conversational decision-tree UI (5 yes/no-style questions max), calls `diagnose-drift` Edge Function, ends by launching the recommended `ProtocolPlayer`.
- `DailyArchitectureCard` — three-segment progress card (morning/afternoon/evening) on `/today`, taps mark complete + timestamp.
- `TierBadge` — reusable label component (Instant/Rapid/Standard/Delayed/Extended) with consistent color coding across history views.
- `ScienceTierLabel` — small inline badge ("Established" vs "Practice Framework") rendered anywhere protocol mechanism copy appears, enforcing §1.4's content policy at the component level so it can't be silently dropped by a future content edit.

### 6.3 State Management

- **Zustand**: active protocol session (timer state, current step), active diagnostic flow answers, in-progress State Audit draft.
- **TanStack Query**: all Supabase reads (audits, history, protocols list), with optimistic writes for check-ins and protocol completions so the UI never blocks on network round-trip.

### 6.4 UI Content Structure — Established / Working Model / Practice
Every protocol detail screen and every diagnostic explanation reuses the source material's own three-layer structure as a UI pattern, not just narrative text:
- Collapsed by default: **"Why this works"** → Established Knowledge, with citation.
- Expandable: **"The model"** → Working Model framing (frequency/signature language lives here, clearly marked).
- Always visible: **"Do this"** → Personal Practice, the actual steps.

This keeps the app's tone consistent with the source material while structurally preventing metaphor from being read as clinical claim. Per-protocol copy for this pattern is written out in full in `stateOS_Protocol_Content_Library.md` §8.

---

## 7. Core User Flows

### 7.1 "Something feels off" (primary flow)
1. User taps **Diagnose** from anywhere (persistent quick-action).
2. Optional: quick State Audit (5 sliders) if not done recently.
3. `drift_events` row created (`detected_at = now()`), Recovery Window timer starts silently.
4. `DiagnosticFlow` asks up to 5 questions → `diagnose-drift` Edge Function returns node + recommended protocol.
5. `ProtocolPlayer` launches automatically.
6. On completion → `resolved_at` set, `recovery_window_seconds` + `recovery_tier` computed automatically (generated column, no client math needed) → result screen shows Recovery Window with tier badge and trend vs. personal average.

### 7.2 Daily Architecture
- Morning: push notification at `user_preferences.reminder_morning_time` → deep-links to a 3-minute guided flow (Heart Placement → Timeline Lock-In → 3 breath cycles → Identity Activation statement, pulling from active `identity_anchors`).
- Afternoon: 1-minute IRP nudge.
- Evening: 2–3 minute Emotional Detox + Heart Coherence Switch, logs to `daily_architecture_logs`.

### 7.3 Onboarding
1. Baseline State Audit (establishes Day-1 scores per the source framework's own "Progress Marker" pattern).
2. Baseline Recovery Window self-report (subjective, "how long does it usually take you to feel like yourself again?") stored as a starting `drift_events` row with `trigger_source = 'unspecified'` and manually-entered historical duration, so the trendline has a Day-0 reference point.
3. First Identity Anchor capture (guided prompt, matches the source framework's "Identity Anchor Exercise").

Full screen-by-screen copy for this flow: see `stateOS_Onboarding_Script.md`.

---

## 8. Analytics & Progress Views

- **Recovery Window trendline** — line chart, 7/30/90-day toggles, target line at 60s (Instant tier) per the framework's stated mastery goal.
- **Tier distribution** — bar chart of drift_events by recovery_tier over selected period.
- **Drift source breakdown** — which `trigger_source` fires most often, surfaced as "your most common entry point."
- **Daily Architecture adherence** — 21-day and 90-day completion streaks, matching the source framework's Stage 2 (21 days) / Stage 3 (90 days) embodiment curve milestones.
- **Protocol effectiveness** — average `post_state_rating − pre_state_rating` per protocol, per user, surfaced privately to help the user learn which protocol actually works best for them (not gamed/aggregated across users in MVP — no comparative leaderboard, this is personal data).

---

## 9. Seed Data — Protocols Table

Six MVP protocols to seed at launch, mapped from the source material. Durations below are final and reconciled against the full scripts in `stateOS_Protocol_Content_Library.md` — earlier drafts of this table used rough ranges (e.g. "30–60") pending exact timing; those have been replaced with the precise per-step totals from the finished scripts.

| slug | name | duration_seconds | framework_node | science_tier |
|---|---|---|---|---|
| `33-second-reset` | The 33-Second Reset | 33 | perception | working_model |
| `heart-coherence-switch` | The Heart Coherence Switch | 45 | internal_state | established |
| `irp` | Instant Realignment Protocol | 50 | internal_state | working_model |
| `full-body-flush` | Full-Body Frequency Flush | 150 | internal_state | working_model |
| `timeline-lock-in` | The Highest Timeline Lock-In | 75 | decision | working_model |
| `micro-alignment-cues` | Five Micro-Alignment Cues | 15 | perception | established |

(Heart Coherence Switch and Micro-Alignment Cues are tagged `established` because their underlying mechanism — paced breathing / vagal stimulation — has direct peer-reviewed backing per Thayer & Lane and related HRV literature; the others lean on Working Model framing even where a real physiological mechanism plausibly contributes, per the science-tier policy in §1.4.)

---

## 10. Build Sequence (Supabase Scaffolding Order)

1. New Supabase project init, Auth setup (email + Google OAuth)
2. Provision Gemini API key (Google AI Studio or Vertex AI), store as Edge Function secret — never in client env vars
3. Run schema migration (§4.1) + RLS policies (§4.2) + indexes (§4.3), plus the `profiles` table addition from `stateOS_Settings_Profile_Plan.md` §2
4. Seed `protocols` table using the JSON blocks in `stateOS_Protocol_Content_Library.md`
5. Scaffold Drizzle schema matching SQL above, generate TypeScript types
6. Build `gemini-proxy` and `diagnose-drift` Edge Functions, test independently via Supabase CLI before wiring to frontend
7. Onboarding flow → State Audit component → Today screen (get the core loop working end-to-end before building history/analytics views)
8. Protocol Player + Recovery Window timer (the emotional core of the product — get this feeling *fast* and satisfying before anything else)
9. Diagnostic flow wiring, using exact question wording from `stateOS_Diagnostic_Question_Bank.md`
10. Daily Architecture + cron reminders
11. History/analytics views
12. Identity Anchors + Compass
13. Profile and Settings surfaces per `stateOS_Settings_Profile_Plan.md`
14. Polish pass: `ScienceTierLabel` audit across every screen, confirm no Tier 2 content is presented as clinical fact anywhere in copy

---

## 11. Notes on the Gemini API Choice

- **Structured output**: Gemini's `responseSchema` + `responseMimeType: "application/json"` gives native JSON-schema enforcement, which is a cleaner fit for `diagnose-drift`'s classification task than manual prompt-and-parse — worth leaning on this rather than replicating a "return JSON only" prompt convention.
- **Model choice**: `gemini-2.5-flash` for the diagnostic classification (low latency, cheap, structured-output task); `gemini-2.5-pro` for `identity-anchor-reflect` (higher-quality reflective language matters more than speed there).
- **Free tier**: Gemini API has a genuinely usable free tier for early development/testing, which may reduce cost risk during MVP build compared to always-paid alternatives — worth checking current limits in Google's docs before committing, since these change.
- **No SDK lock-in assumed**: the sketch above uses raw `fetch` against the REST endpoint rather than the `@google/genai` SDK, keeping the Edge Function dependency-light; swap to the SDK later if the surface area grows (e.g., multi-turn chat state for `identity-anchor-reflect`).

## 12. Open Questions for Next Pass

- Should Recovery Window ever auto-close (e.g., after 2 hours of inactivity, assume resolved) or must the user always explicitly mark resolution? Auto-closing risks polluting the metric; explicit-only risks users forgetting and losing data. Recommend explicit-only for MVP, revisit with a gentle "still drifting?" nudge at the 2-hour mark.
- Voice-note Identity Anchors: transcription pipeline (Gemini's native audio understanding can likely handle transcription + reflection in a single call — worth prototyping before adding a separate speech-to-text step)?
- Rate limits and quota management on the Gemini free/paid tier at scale — worth a fallback path (deterministic-tree-only, no AI assist) if quota is exhausted mid-session, so `diagnose-drift` never hard-fails.
