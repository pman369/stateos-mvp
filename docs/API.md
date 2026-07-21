# API & Data Layer Reference

## Route Handlers

### POST /api/reflect

**Purpose**: Generate somatic reflection prompts for identity anchor creation.

**Source**: `src/app/api/reflect/route.ts`

**Request Body**:
```json
{
  "description": "string — sensory description of the anchor",
  "anchor_type": "word | gesture | breath_pattern | memory | voice_note"
}
```

**Response**:
```json
{
  "prompts": ["string — open-ended somatic reflection prompt", "..."]
}
```

**Behavior**:
- If `GEMINI_API_KEY` is not set → returns `{ prompts: [] }`
- If set → sends structured prompt to `gemini-2.5-pro` requesting 2-3 somatic reflection questions
- Response is constrained via `responseSchema` to JSON with a `prompts` string array
- On any API error → returns `{ prompts: [] }` silently

**System Prompt Constraints**:
- Prompts must be 12-18 words max
- Must invite sensory/body awareness
- Must avoid promising outcomes or suggesting feelings
- Must read as gentle inquiry, not command

---

### POST /api/diagnose

**Purpose**: Classify a free-text trigger note into one of five autonomic drift origins.

**Source**: `src/app/api/diagnose/route.ts`

**Request Body**:
```json
{
  "answers": [{ "question": "string", "answer": "yes" | "no" }],
  "trigger_note": "string — free-text description of what caused the drift",
  "fallback_node": "string — node determined by local decision tree"
}
```

**Response**:
```json
{
  "resolved_node": "environment | perception | internal_state | identity | behavior"
}
```

**Behavior**:
- If `GEMINI_API_KEY` is not set → returns `{ resolved_node: fallback_node }`
- If set → sends trigger note + survey answers to `gemini-2.5-flash` for classification
- Response constrained to one of five enum values
- On error → falls back to `"internal_state"` (hardcoded default)

**Five Autonomic Origins**:

| Node | Description |
|------|-------------|
| `environment` | Physical location changes, ambient conditions (lighting, temperature, noise, crowds) |
| `perception` | Mental fog, cognitive overload, misinterpreting comments, overwhelmed by details |
| `internal_state` | Somatic exhaustion, rapid heart rate, nervous jitters, muscle tension |
| `identity` | Disconnected from values, people-pleasing, acting a role |
| `behavior` | Mindless scrolling, snapping at others, impulsive reactions, second-guessing decisions |

---

## db.ts Data Layer

**Source**: `src/components/utils/db.ts` (807 lines)

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `STATIC_PROTOCOLS` | Array of 6 protocol objects | Hardcoded protocol definitions |
| `supabase` | `SupabaseClient \| null` | Initialized client if cloud mode, null otherwise |
| `db` | Object | All data access methods |

### Interface Definitions

#### `StateAudit`
```typescript
{
  id: string;
  energy: number;           // 1-5
  clarity: number;          // 1-5
  emotional_stability: number; // 1-5
  identity_alignment: number;  // 1-5
  environmental_match: number; // 1-5
  composite_score: number;  // auto-computed average
  drift_flag: boolean;      // true if any dimension >= 4
  note?: string;
  created_at: string;       // ISO timestamp
}
```

#### `DriftEvent`
```typescript
{
  id: string;
  state_audit_id?: string;
  trigger_source: "environment" | "perception" | "internal_state" | "identity" | "behavior" | "unspecified";
  trigger_note?: string;
  detected_at: string;
  resolved_at?: string;
  recovery_window_seconds?: number;
  recovery_tier?: "instant" | "rapid" | "standard" | "delayed" | "extended";
}
```

#### `ProtocolSession`
```typescript
{
  id: string;
  protocol_id: string;
  protocol_slug: string;
  drift_event_id?: string;
  started_at: string;
  completed_at?: string;
  completed: boolean;
  pre_state_rating?: number;  // 1-10
  post_state_rating?: number; // 1-10
}
```

#### `IdentityAnchor`
```typescript
{
  id: string;
  label: string;
  anchor_type: "word" | "gesture" | "breath_pattern" | "memory" | "voice_note";
  description: string;
  audio_url?: string;
  is_active: boolean;
  created_at: string;
}
```

#### `DailyArchitectureLog`
```typescript
{
  id: string;
  log_date: string;            // YYYY-MM-DD
  morning_completed: boolean;
  afternoon_completed: boolean;
  evening_completed: boolean;
  morning_completed_at?: string;
  afternoon_completed_at?: string;
  evening_completed_at?: string;
}
```

#### `UserPreferences`
```typescript
{
  reminder_morning_time: string;   // "HH:MM"
  reminder_afternoon_time: string;
  reminder_evening_time: string;
  reminders_enabled: boolean;
  preferred_units: "metric" | "imperial";
  timezone: string;
  theme: "system" | "light" | "dark";
  analytics_opt_in: boolean;
  data_sharing_research: boolean;
}
```

#### `UserProfile`
```typescript
{
  display_name: string;
  avatar_url?: string;
  signature_statement: string;
  bio?: string;
  member_since: string;
}
```

---

### Method Reference

#### State Audits

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getAudits()` | `() → Promise<StateAudit[]>` | Fetch all audits, newest first |
| `db.createAudit()` | `(audit) → Promise<StateAudit>` | Create audit, auto-compute `composite_score` and `drift_flag` |

#### Drift Events

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getDriftEvents()` | `() → Promise<DriftEvent[]>` | Fetch all drift events, newest first |
| `db.createDriftEvent()` | `(event) → Promise<DriftEvent>` | Create drift event with auto-set `detected_at` |
| `db.resolveDriftEvent()` | `(id, resolvedAt?) → Promise<DriftEvent>` | Set `resolved_at`, compute tier and window seconds |

#### Protocol Sessions

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getProtocolSessions()` | `() → Promise<ProtocolSession[]>` | Fetch all sessions, newest first |
| `db.createProtocolSession()` | `(session) → Promise<ProtocolSession>` | Create session with auto-set `started_at` |

#### Identity Anchors

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getIdentityAnchors()` | `() → Promise<IdentityAnchor[]>` | Fetch all anchors |
| `db.createIdentityAnchor()` | `(anchor) → Promise<IdentityAnchor>` | Create anchor, auto-set `is_active: true` |
| `db.updateIdentityAnchor()` | `(id, updates) → Promise<IdentityAnchor>` | Partial update of anchor fields |
| `db.deleteIdentityAnchor()` | `(id) → Promise<boolean>` | Delete anchor by id |

#### Daily Architecture

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getDailyArchitectureLogs()` | `() → Promise<DailyArchitectureLog[]>` | Fetch all logs, newest first |
| `db.logDailyArchitecture()` | `(segment, dateStr?) → Promise<DailyArchitectureLog>` | Upsert: mark segment complete for date |

#### User Preferences & Profile

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.getPreferences()` | `() → Promise<UserPreferences>` | Fetch preferences (returns defaults if missing) |
| `db.updatePreferences()` | `(updates) → Promise<UserPreferences>` | Merge partial updates |
| `db.getProfile()` | `() → Promise<UserProfile>` | Fetch profile (returns defaults if missing) |
| `db.updateProfile()` | `(updates) → Promise<UserProfile>` | Merge partial updates |

#### Data Administration

| Method | Signature | Description |
|--------|-----------|-------------|
| `db.clearAllData()` | `() → Promise<boolean>` | Local: remove all `stateos_db_*` keys. Cloud: returns `false` (handled server-side) |
| `db.getExportData()` | `() → Promise<string>` | Returns JSON string of all user data |

---

## Data Flow Diagrams

### Audit → Drift → Recovery → Session

```
User rates 5 dimensions
        │
        ▼
  db.createAudit()
        │
        ├─ composite_score computed
        └─ drift_flag set if any dimension >= 4
                │
                ▼ (if drift detected)
        db.createDriftEvent()
                │
                ├─ detected_at = now()
                └─ Recovery Window opens
                        │
                        ▼ (user completes protocol)
                db.resolveDriftEvent()
                        │
                        ├─ resolved_at = now()
                        ├─ recovery_window_seconds computed
                        └─ recovery_tier classified
                                │
                                ▼
                        db.createProtocolSession()
                                │
                                ├─ pre_state_rating (before)
                                └─ post_state_rating (after)
```

### Identity Anchor Reflection

```
User creates anchor with label + description
        │
        ▼
  POST /api/reflect
        │
        ├─ (Gemini) → 2-3 somatic prompts
        └─ (local fallback) → empty prompts
                │
                ▼
  db.createIdentityAnchor()
```

### Diagnostic Classification

```
User answers 5 yes/no questions
        │
        ▼
  Local decision tree resolves node
        │
        ▼
  POST /api/diagnose
        │
        ├─ (Gemini) → classified node
        └─ (local fallback) → fallback_node
                │
                ▼
  db.createDriftEvent({ trigger_source: resolved_node })
```
