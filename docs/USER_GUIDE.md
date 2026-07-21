# User Guide

---

## What is StateOS?

StateOS is the world's first app that helps you track your internal state, notice when your nervous system is off-balance ("drift"), and intervene with short, guided protocol sessions. Think of it as an instrument panel for your body.

---

## Getting Started

### Creating an Account

1. Go to the login page
2. Enter your email and password
3. Complete the 5-step onboarding:
   - Rate your baseline energy, clarity, stability, identity alignment, and environment match
   - Set your typical recovery estimate
   - Create your first identity anchor

**No account?** Use the offline demo mode to try everything without signing up. Your data stays in the browser.

---

## Core Features

### State Audits

**What**: Rate how you're feeling across 5 dimensions (1-5 scale).

- **Energy** — Physical and mental energy level
- **Clarity** — Mental sharpness and focus
- **Emotional Stability** — Calm and grounded vs. reactive
- **Identity Alignment** — Feeling like yourself vs. performing
- **Environment Match** — How well your surroundings support your state

**Where**: `/audit/new`

**What happens**: If any dimension scores 4 or higher, drift is flagged and a drift event is automatically opened. Your composite score (average of all 5) is computed and stored.

**History**: `/audit/history` shows your trends over time with interactive SVG charts filterable by 7, 30, or 90 days.

---

### Recovery Windows

**What**: A timer that starts when drift is detected and stops when you resolve it.

**Where**: The Recovery Window timer appears on the `/today` dashboard whenever a drift event is active.

**Tiers**:

| Tier | Time | Meaning |
|------|------|---------|
| Instant | Under 1 minute | You caught it fast |
| Rapid | Under 5 minutes | Quick response |
| Standard | Under 30 minutes | Normal recovery |
| Delayed | Under 2 hours | Took a while |
| Extended | Over 2 hours | Prolonged disruption |

**Analytics**: `/recovery/history` shows your recovery trends, tier distribution, and common triggers.

---

### Diagnostic Engine

**What**: A 5-question flow that identifies where your drift originated.

**Where**: `/diagnose`

**How it works**:

1. Answer "yes" or "no" to 5 questions about your current state
2. The first "yes" identifies the drift origin node:
   - **Environment** — Physical space is affecting you
   - **Perception** — Mental fog or cognitive overload
   - **Internal State** — Somatic tension or exhaustion
   - **Identity** — Feeling disconnected from yourself
   - **Behavior** — Reactive or impulsive patterns
3. Optionally, describe what triggered the drift in your own words
4. AI (when available) provides additional classification

**Result**: The resolved node links to a recommended protocol.

---

### Protocol Sessions

**What**: Timed, step-by-step guided interventions (15-150 seconds).

**Where**: `/protocols/[slug]` — choose from 6 protocols:

| Protocol | Duration | Best For |
|----------|----------|----------|
| Five Micro-Alignment Cues | 15s | Quick in-the-moment reset |
| The 33-Second Reset | 33s | Fast state restoration |
| The Heart Coherence Switch | 45s | Emergency grounding |
| Instant Realignment Protocol | 50s | Foundational reset |
| The Highest Timeline Lock-In | 75s | Setting daily direction |
| Full-Body Frequency Flush | 150s | Releasing accumulated tension |

**During a session**:
- Rate your pre-state (1-10)
- Follow step-by-step instructions with countdown timers
- Audio chimes mark step transitions
- Pause, skip, or navigate between steps
- Rate your post-state (1-10)

---

### Daily Architecture

**What**: Track completion of three daily segments — Morning, Afternoon, Evening.

**Where**: `/today` (dashboard card)

**How it works**:
- Each segment launches a specific protocol
- Mark segments complete as you go
- The app tracks your streak (consecutive fully-complete days)

---

### Identity System

#### Identity Anchors

**What**: Sensory reference points — a memory, word, gesture, or breath pattern that connects you to your core state.

**Where**: `/identity/anchors`

**Types**:
- **Memory** — A specific moment you felt unmistakably like yourself
- **Word** — A single word that captures your essence
- **Gesture** — A physical movement or posture
- **Breath Pattern** — A breathing rhythm
- **Voice Note** — An audio recording

**AI Reflection**: When you create an anchor, AI generates somatic reflection prompts to help you connect deeper with that state.

#### Identity Compass

**Where**: `/identity/compass`

**What**: Your signature "I am ___" statement and alignment tracking.

---

### Profile & Stats

**Where**: `/profile`

**Stats include**:
- Current streak (consecutive daily architecture completions)
- Average recovery window
- Total protocol sessions
- Top drift trigger
- Most-used protocol

---

### Settings

**Where**: `/settings`

| Section | What it controls |
|---------|-----------------|
| **Account** | Display name, bio, signature statement, account deletion |
| **Reminders** | Morning/afternoon/evening notification times |
| **Preferences** | Theme (system/light/dark), timezone, units (metric/imperial) |
| **Privacy** | Analytics opt-in, research data sharing, data export (JSON) |

---

## Data & Privacy

- **Cloud mode**: Data stored in Supabase, protected by Row-Level Security (only you can access your data)
- **Offline mode**: Data stored in your browser's localStorage
- **Export**: Download all your data as JSON from Settings → Privacy
- **Deletion**: Permanently delete your account from Settings → Account (requires confirmation)

---

## Offline Demo Mode

No account needed. Click "Try Demo" on the login page. All features work — data persists in your browser only. Switch to a real account anytime without losing your demo data.
