# Protocol Library & Science Policy

---

## Protocol Catalog

All 6 protocols are defined in two places that must be kept in sync:
- **Frontend**: `STATIC_PROTOCOLS` in `src/components/utils/db.ts:4-238`
- **Database**: `supabase/seed.sql` (upsert on `slug`)

### 1. The 33-Second Reset

| Field | Value |
|-------|-------|
| **Slug** | `33-second-reset` |
| **Purpose** | Fast state restoration when you notice drift and need to act immediately |
| **Mechanism** | `dmn_deactivation` |
| **Duration** | 33 seconds |
| **Framework Node** | `perception` |
| **Science Tier** | `working_model` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Spinal Alignment | 10s | Bring attention to your spine. Feel it as one line, base to crown. Sit or stand a little taller. |
| 2 | Identity Differentiation | 10s | Notice what's yours and what isn't. This feeling — is it your reaction, or the room's? Let what isn't yours stay outside you. |
| 3 | Re-establish | 13s | Let your own baseline come back into focus. The situation hasn't changed. Your relationship to it has. |

---

### 2. The Heart Coherence Switch

| Field | Value |
|-------|-------|
| **Slug** | `heart-coherence-switch` |
| **Purpose** | Emergency grounding when a situation feels like too much to process at once |
| **Mechanism** | `hrv_coherence` |
| **Duration** | 45 seconds |
| **Framework Node** | `internal_state` |
| **Science Tier** | `established` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Settle | 5s | Bring your attention to the center of your chest. |
| 2 | Breathe: Cycle 1 | 10s | Inhale slowly. Silently think: I return. Exhale slowly. Silently think: I align. |
| 3 | Breathe: Cycle 2 | 10s | Inhale. I return. Exhale. I align. |
| 4 | Breathe: Cycle 3 | 10s | Inhale. I return. Exhale. I align. |
| 5 | Close | 10s | Let your breath return to normal. Notice anything that's shifted, even slightly. |

---

### 3. Instant Realignment Protocol (IRP)

| Field | Value |
|-------|-------|
| **Slug** | `irp` |
| **Purpose** | Your foundational reset. Learn this one first — it underlies most of the others. |
| **Mechanism** | `vagal_activation` |
| **Duration** | 50 seconds |
| **Framework Node** | `internal_state` |
| **Science Tier** | `working_model` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Heart Center | 5s | Place a hand behind your sternum, or just bring attention there. |
| 2 | Slow the Field | 10s | Let whatever feels fast or scattered inside settle. No need to force it — just let it slow. |
| 3 | Breathe Upward | 25s | Take three deep breaths. On each inhale, imagine the breath rising from your chest toward the top of your head. |
| 4 | State Command | 10s | Say, silently or aloud: back to baseline. This is an instruction to yourself, not a hope. |

---

### 4. Full-Body Frequency Flush

| Field | Value |
|-------|-------|
| **Slug** | `full-body-flush` |
| **Purpose** | Release accumulated tension after an intense stretch — a hard conversation, a draining day, back-to-back meetings. |
| **Mechanism** | `vagal_activation` |
| **Duration** | 150 seconds |
| **Framework Node** | `internal_state` |
| **Science Tier** | `working_model` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Heart Center | 10s | Place a hand on your chest. Take one breath here before starting the scan. |
| 2 | Body Scan | 40s | Move your attention from the top of your head down to your feet. Notice anywhere that feels tight, heavy, or tense. No need to fix it yet — just notice. |
| 3 | Breathe Into It | 50s | Return to the tightest spot you noticed. Breathe into it a few times, like you're sending the breath there directly. |
| 4 | Hands on Heart | 30s | Place both hands over your heart. Take five slow, deep breaths. |
| 5 | Close | 20s | Let your hands drop. Take one more breath. Notice what's different from when you started. |

---

### 5. The Highest Timeline Lock-In

| Field | Value |
|-------|-------|
| **Slug** | `timeline-lock-in` |
| **Purpose** | Set direction for the day, or reset direction mid-day after it's gone sideways. |
| **Mechanism** | `dmn_deactivation` |
| **Duration** | 75 seconds |
| **Framework Node** | `decision` |
| **Science Tier** | `working_model` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Posture | 5s | Sit or stand upright. Let your spine lengthen slightly. |
| 2 | Heart Field | 10s | Bring attention to your chest. Take a few slow breaths here. |
| 3 | Choose | 15s | Ask yourself: what kind of day do I want this to be? Not what will happen — how do I want to show up? |
| 4 | Picture It | 20s | Picture yourself moving through today at your best. Notice how you're speaking, moving, responding to friction. |
| 5 | Step In | 15s | Let that version feel less like an image and more like a state you're already in. |
| 6 | Hold | 10s | Hold this for a few more seconds before you move on. |

---

### 6. Five Micro-Alignment Cues

| Field | Value |
|-------|-------|
| **Slug** | `micro-alignment-cues` |
| **Purpose** | The fastest tools you have. Use any one of these in the middle of anything. |
| **Mechanism** | `vagal_activation` |
| **Duration** | 15 seconds |
| **Framework Node** | `perception` |
| **Science Tier** | `established` |

| Step | Label | Duration | Instruction |
|------|-------|----------|-------------|
| 1 | Sternum Touch | 3s | Touch your sternum briefly. That's it. |
| 2 | Spinal Extension | 3s | Lengthen your spine, like a string is pulling the crown of your head up. |
| 3 | Sharp Inhale | 3s | Take one deliberate, deep breath in through your nose. |
| 4 | Tongue Release | 3s | Notice if your tongue is pressed to the roof of your mouth. Let it drop. |
| 5 | Shoulder Release | 3s | Drop your shoulders away from your ears. |

---

## Science Tiering Policy

All protocol claims are explicitly tiered and enforced at the component level via `ScienceTierLabel` (`src/components/shared/ScienceTierLabel.tsx`). This is **not** left to individual copy edits.

### Tier Definitions

| Tier | Label | Definition | Examples |
|------|-------|------------|----------|
| **established** | "Established Science" | Claims backed by peer-reviewed research | HRV coherence, vagal tone, polyvagal states, DMN deactivation, interoception |
| **working_model** | "Working Model" | Explanatory metaphors or practice frameworks not yet validated by research | Frequency, signature frequency, coherent radiance |

### Enforcement

- Every protocol in `STATIC_PROTOCOLS` has a `science_tier` field
- The `ScienceTierLabel` component renders a visual tag next to protocol content
- Protocol instructions themselves may use metaphorical language (e.g., "frequency", "field"), but the tier label makes the distinction explicit
- New protocols **must** include a `science_tier` value

### Mechanism Field Values

| Mechanism | Description |
|-----------|-------------|
| `hrv_coherence` | Heart rate variability coherence training |
| `vagal_activation` | Vagus nerve stimulation techniques |
| `dmn_deactivation` | Default mode network quieting |

---

## Protocol Player Mechanics

**Source**: `src/components/ui/ProtocolPlayer.tsx`

### Session Lifecycle

1. User opens `/protocols/[slug]` → ProtocolPlayer mounts
2. User rates pre-state (1-10 scale)
3. User presses Start → `db.createProtocolSession()` logs session
4. Steps execute sequentially with countdown timers
5. Audio cues (chimes) play on step transitions
6. User rates post-state (1-10 scale)
7. Session completes → `completed_at` set

### Controls

- **Play/Pause**: Toggle timer countdown
- **Skip Forward**: Advance to next step
- **Skip Back**: Return to previous step
- **Step Indicator**: Shows current step, total steps, time remaining per step

### Audio System

**Source**: `src/components/utils/audio.ts`

| Function | Purpose | Default |
|----------|---------|---------|
| `playChime(frequency, duration)` | Sine wave with exponential decay | 880Hz (A5), 0.8s |
| `startPacingTone(type, duration)` | Rhythmic inhale/exhale pacing | Rising (220→277Hz) / Falling (293→220Hz) |
| `stopPacingTone()` | Stop active pacing tone | — |

- Chimes play on step transitions (sine wave, soft envelope, max 0.15 gain to avoid startling)
- Pacing tones are used specifically by the Heart Coherence Switch for breath cycle guidance
- AudioContext is lazily initialized and resumed on first user interaction (browser autoplay policy compliance)

### BreathPulse Visualizer

**Source**: `src/components/ui/BreathPulse.tsx`

Animated breathing visualizer synced to the Heart Coherence Switch. Uses a 10.9-second cycle (~5.5 breaths/min) which aligns with cardiac coherence breathing rates.

---

## Adding a New Protocol

1. **Define the protocol object** in `STATIC_PROTOCOLS` (`src/components/utils/db.ts`):
   ```typescript
   {
     slug: "my-new-protocol",
     name: "My New Protocol",
     purpose: "Clear, one-sentence purpose.",
     mechanism: "vagal_activation", // or hrv_coherence, dmn_deactivation
     duration_seconds: 60,
     framework_node: "perception", // or internal_state, identity, decision, behavior
     science_tier: "working_model", // or established
     steps: [
       { order: 1, label: "Step Name", duration: 30, instruction: "Instruction text." },
       // ...
     ]
   }
   ```

2. **Add to seed.sql** (`supabase/seed.sql`):
   ```sql
   INSERT INTO public.protocols (slug, name, purpose, mechanism, duration_seconds, steps, framework_node, science_tier)
   VALUES ('my-new-protocol', 'My New Protocol', ...)
   ON CONFLICT(slug) DO UPDATE SET ...;
   ```

3. **Verify total duration** matches the sum of all step durations

4. **Assign science tier** — default to `working_model` unless claims are peer-reviewed

5. **Choose framework node** that best matches the protocol's primary intervention target
