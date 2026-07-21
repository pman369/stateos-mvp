# Database Schema & Supabase Reference

**Migration**: `supabase/migrations/20260711000000_init_schema.sql`
**Seed**: `supabase/seed.sql`

---

## Entity Relationship Diagram

```
auth.users
    │
    ├── profiles (1:1)
    ├── user_preferences (1:1)
    ├── state_audits (1:many)
    │       └── drift_events (many:1, optional)
    │               ├── protocol_sessions (1:many, optional)
    │               └── diagnostic_sessions (1:many, optional)
    ├── protocol_sessions (1:many)
    │       └── protocols (many:1, optional)
    ├── identity_anchors (1:many)
    ├── daily_architecture_logs (1:many)
    └── diagnostic_sessions (1:many)
            └── protocols (many:1, optional)

protocols (reference table, seeded, no user ownership)
```

---

## Table Reference

### 1. profiles

User identity-facing data. One row per `auth.users` entry.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `user_id` | `uuid` | — | PK, FK → `auth.users(id) ON DELETE CASCADE` |
| `display_name` | `text` | `null` | — |
| `avatar_url` | `text` | `null` | Supabase Storage reference |
| `signature_statement` | `text` | `null` | "I am ___" statement |
| `bio` | `text` | `null` | Short personal regulation intent |
| `member_since` | `timestamptz` | `now()` | `NOT NULL` |
| `updated_at` | `timestamptz` | `now()` | `NOT NULL` |

### 2. user_preferences

Behavioral settings. One row per user.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `user_id` | `uuid` | — | PK, FK → `auth.users(id) ON DELETE CASCADE` |
| `reminder_morning_time` | `time` | `'07:00'` | — |
| `reminder_afternoon_time` | `time` | `'13:00'` | — |
| `reminder_evening_time` | `time` | `'21:00'` | — |
| `reminders_enabled` | `boolean` | `true` | `NOT NULL` |
| `preferred_units` | `text` | `'metric'` | `NOT NULL` |
| `timezone` | `text` | `'UTC'` | `NOT NULL` |
| `theme` | `text` | `'system'` | `NOT NULL`, CHECK: `system`, `light`, `dark` |
| `analytics_opt_in` | `boolean` | `true` | `NOT NULL` |
| `data_sharing_research` | `boolean` | `false` | `NOT NULL` |

### 3. state_audits

Core check-in record. Users rate 5 dimensions on a 1-5 scale.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `energy` | `smallint` | — | CHECK: 1-5 |
| `clarity` | `smallint` | — | CHECK: 1-5 |
| `emotional_stability` | `smallint` | — | CHECK: 1-5 |
| `identity_alignment` | `smallint` | — | CHECK: 1-5 |
| `environmental_match` | `smallint` | — | CHECK: 1-5 |
| `composite_score` | `numeric` | GENERATED | `GENERATED ALWAYS AS (avg of 5 dims) STORED` |
| `drift_flag` | `boolean` | GENERATED | `GENERATED ALWAYS AS (any dim >= 4) STORED` |
| `note` | `text` | `null` | — |
| `created_at` | `timestamptz` | `now()` | `NOT NULL` |

### 4. drift_events

Logged autonomic disruptions. Opens a Recovery Window.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `state_audit_id` | `uuid` | `null` | FK → `state_audits(id) ON DELETE SET NULL` |
| `trigger_source` | `text` | `null` | CHECK: `environment`, `perception`, `internal_state`, `identity`, `behavior`, `unspecified` |
| `trigger_note` | `text` | `null` | — |
| `detected_at` | `timestamptz` | `now()` | `NOT NULL` |
| `resolved_at` | `timestamptz` | `null` | — |
| `recovery_window_seconds` | `integer` | GENERATED | `GENERATED ALWAYS AS (epoch diff) STORED` |
| `recovery_tier` | `text` | GENERATED | `GENERATED ALWAYS AS (case on seconds) STORED` |

**Recovery Tier Logic** (Postgres generated column):
```sql
CASE
  WHEN resolved_at IS NULL THEN NULL
  WHEN epoch <= 60 THEN 'instant'
  WHEN epoch <= 300 THEN 'rapid'
  WHEN epoch <= 1800 THEN 'standard'
  WHEN epoch <= 7200 THEN 'delayed'
  ELSE 'extended'
END
```

### 5. protocols

Static reference table. Seeded with 6 protocols.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `slug` | `text` | — | UNIQUE, NOT NULL |
| `name` | `text` | — | NOT NULL |
| `purpose` | `text` | — | NOT NULL |
| `mechanism` | `text` | — | NOT NULL |
| `duration_seconds` | `integer` | — | NOT NULL |
| `steps` | `jsonb` | — | NOT NULL |
| `framework_node` | `text` | — | NOT NULL, CHECK: `environment`, `perception`, `internal_state`, `identity`, `decision`, `behavior`, `feedback` |
| `science_tier` | `text` | — | NOT NULL, CHECK: `established`, `working_model` |
| `created_at` | `timestamptz` | `now()` | `NOT NULL` |

### 6. protocol_sessions

A single timed run of a protocol.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `protocol_id` | `uuid` | `null` | FK → `protocols(id) ON DELETE CASCADE` |
| `drift_event_id` | `uuid` | `null` | FK → `drift_events(id) ON DELETE SET NULL` |
| `started_at` | `timestamptz` | `now()` | `NOT NULL` |
| `completed_at` | `timestamptz` | `null` | — |
| `completed` | `boolean` | `false` | `NOT NULL` |
| `pre_state_rating` | `smallint` | `null` | CHECK: 1-10 |
| `post_state_rating` | `smallint` | `null` | CHECK: 1-10 |

### 7. identity_anchors

Sensory reference points for identity alignment.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `label` | `text` | — | NOT NULL |
| `anchor_type` | `text` | `null` | CHECK: `word`, `gesture`, `breath_pattern`, `memory`, `voice_note` |
| `description` | `text` | — | NOT NULL |
| `audio_url` | `text` | `null` | — |
| `is_active` | `boolean` | `true` | `NOT NULL` |
| `created_at` | `timestamptz` | `now()` | `NOT NULL` |

### 8. daily_architecture_logs

Morning/afternoon/evening completion tracking.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `log_date` | `date` | `current_date` | NOT NULL |
| `morning_completed` | `boolean` | `false` | `NOT NULL` |
| `afternoon_completed` | `boolean` | `false` | `NOT NULL` |
| `evening_completed` | `boolean` | `false` | `NOT NULL` |
| `morning_completed_at` | `timestamptz` | `null` | — |
| `afternoon_completed_at` | `timestamptz` | `null` | — |
| `evening_completed_at` | `timestamptz` | `null` | — |
| — | — | — | UNIQUE(`user_id`, `log_date`) |

### 9. diagnostic_sessions

Decision tree answering flow logs.

| Column | Type | Default | Constraints |
|--------|------|---------|-------------|
| `id` | `uuid` | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | — | NOT NULL, FK → `auth.users(id) ON DELETE CASCADE` |
| `drift_event_id` | `uuid` | `null` | FK → `drift_events(id) ON DELETE SET NULL` |
| `answers` | `jsonb` | — | NOT NULL |
| `resolved_node` | `text` | `null` | — |
| `recommended_protocol_id` | `uuid` | `null` | FK → `protocols(id)` |
| `created_at` | `timestamptz` | `now()` | `NOT NULL` |

---

## Row-Level Security (RLS)

All 9 tables have RLS enabled. Policies:

| Table | Policy | Rule |
|-------|--------|------|
| `protocols` | Read | `auth.role() = 'authenticated'` — all authenticated users can read |
| `profiles` | CRUD | `auth.uid() = user_id` — owner only |
| `user_preferences` | CRUD | `auth.uid() = user_id` — owner only |
| `state_audits` | CRUD | `auth.uid() = user_id` — owner only |
| `drift_events` | CRUD | `auth.uid() = user_id` — owner only |
| `protocol_sessions` | CRUD | `auth.uid() = user_id` — owner only |
| `identity_anchors` | CRUD | `auth.uid() = user_id` — owner only |
| `daily_architecture_logs` | CRUD | `auth.uid() = user_id` — owner only |
| `diagnostic_sessions` | CRUD | `auth.uid() = user_id` — owner only |

**Pattern**: Each user-facing table uses identical `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` policies, enforcing complete data isolation.

---

## Performance Indexes

| Index | Table | Columns | Notes |
|-------|-------|---------|-------|
| `idx_state_audits_user_created` | `state_audits` | `(user_id, created_at DESC)` | Primary query pattern: user's audits newest first |
| `idx_drift_events_user_detected` | `drift_events` | `(user_id, detected_at DESC)` | Primary query pattern: user's drift events newest first |
| `idx_drift_events_unresolved` | `drift_events` | `(user_id)` | Partial index: `WHERE resolved_at IS NULL` — active drift lookup |
| `idx_protocol_sessions_user` | `protocol_sessions` | `(user_id, started_at DESC)` | Session history per user |
| `idx_daily_architecture_user_date` | `daily_architecture_logs` | `(user_id, log_date DESC)` | Daily log lookup |

---

## Triggers & Functions

### handle_new_user()

Fired after `INSERT` on `auth.users`. Creates default rows:

```sql
-- Creates profile row with member_since = now()
INSERT INTO public.profiles (user_id, member_since)
VALUES (new.id, now());

-- Creates preferences row with all defaults
INSERT INTO public.user_preferences (user_id)
VALUES (new.id);
```

Runs as `SECURITY DEFINER` to bypass RLS during signup.

---

## Seed Data

**Source**: `supabase/seed.sql`

6 protocols seeded via `INSERT ... ON CONFLICT(slug) DO UPDATE`:

| Slug | Name | Duration | Node | Tier |
|------|------|----------|------|------|
| `33-second-reset` | The 33-Second Reset | 33s | perception | working_model |
| `heart-coherence-switch` | The Heart Coherence Switch | 45s | internal_state | established |
| `irp` | Instant Realignment Protocol | 50s | internal_state | working_model |
| `full-body-flush` | Full-Body Frequency Flush | 150s | internal_state | working_model |
| `timeline-lock-in` | The Highest Timeline Lock-In | 75s | decision | working_model |
| `micro-alignment-cues` | Five Micro-Alignment Cues | 15s | perception | established |

The `ON CONFLICT` clause ensures re-running the seed is idempotent.

---

## Migration Management

Currently a single migration: `20260711000000_init_schema.sql`

Naming convention: `YYYYMMDDHHMMSS_description.sql`

To create a new migration:
```bash
supabase migration new <description>
# Edit the generated file in supabase/migrations/
supabase db push  # Apply to remote
# or
supabase db reset  # Reset local and apply all
```
