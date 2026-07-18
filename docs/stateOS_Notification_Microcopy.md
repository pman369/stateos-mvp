# stateOS — Notification & Micro-copy Doc

Every push notification, result screen, empty state, and error message in one place, so tone stays consistent instead of being improvised screen by screen.

---

## 1. Tone Rules (recap, applies everywhere below)

- Second person, present tense, short sentences — same rules as the Protocol Content Library.
- Never shame a bad reading (high drift score, long Recovery Window, broken streak). These are data points, not failures.
- Notifications invite, they don't guilt. No "You missed your practice" — reframe as an open door, not a scolding.
- Error copy tells the user what to do next, not just what went wrong.

---

## 2. Daily Architecture Push Notifications

Three per day, each with 3 rotating variants (cycles so copy doesn't go stale). Rotation logic: pick based on `log_date` modulo 3, or randomly — either is fine, just don't always show variant 1.

### Morning (fires at `reminder_morning_time`)
1. "Three minutes. Set the tone before the day sets it for you."
2. "Morning check-in's ready when you are."
3. "A short one to start — heart, timeline, identity."

### Afternoon (fires at `reminder_afternoon_time`)
1. "Quick reset — one minute, whenever you get a second."
2. "Halfway through the day. Worth a sixty-second check-in."
3. "One minute to clear whatever's built up since morning."

### Evening (fires at `reminder_evening_time`)
1. "Before you wind down — a short close-out."
2. "Two minutes to let the day settle before sleep."
3. "Evening check-in's here. No pressure, just a close."

**Deep link behavior:** all three route directly into the relevant Daily Architecture segment, not to the Today screen with an extra tap required.

---

## 3. Recovery Window Result Screen (per tier)

Shown immediately after a protocol completes and closes a `drift_event`. Tone shifts slightly by tier — not to praise or penalize, but because a 40-second recovery and a 3-hour recovery are different experiences and identical copy would feel tone-deaf on one end or the other.

**Instant (≤60s)**
> "That was fast. Back to baseline in [X] seconds."

**Rapid (1–5 min)**
> "Back to baseline in [X] minutes. That counts."

**Standard (5–30 min)**
> "That took [X] minutes. You got there."

**Delayed (30 min–2 hr)**
> "That one took a while — [X] minutes. Some days are like that."

**Extended (2+ hr)**
> "That was a longer one. You made it back to baseline — that's what matters."

**Always shown below, regardless of tier:**
> "See how this compares → [link to Recovery History]"

---

## 4. Protocol Player — In-Session Copy

- **Start screen:** "[Protocol name] — about [duration]. Ready?"
  - CTA: "Start" / Secondary: "Not now"
- **Mid-session (if user tries to exit early):** "Stop here? You can always come back to this."
  - CTA: "Stop" / Secondary: "Keep going"
- **Completion screen (before rating prompt):** "Done. Take a second before you rate how that felt."

---

## 5. Empty States

**No drift events logged yet (Recovery History screen):**
> "Nothing logged yet. When something throws you off, tap Diagnose — this is where you'll see how fast you're getting back."

**No Identity Anchors yet:**
> "You don't have any Identity Anchors saved. These are quick reference points — a word, a memory, a feeling — for when you need to find your way back to yourself fast. Add one whenever you're ready."

**No protocol sessions completed yet:**
> "You haven't run a protocol yet. They're short — most take under a minute. Try one from the Protocol Library whenever you like."

**Recovery Window chart with insufficient data (<3 data points):**
> "A few more check-ins and this'll start showing a real trend."

---

## 6. Error & Offline States

**Generic network error:**
> "Couldn't connect. Your check-in is saved locally — we'll sync it once you're back online."
*(Requires local-first write behavior in the client per TanStack Query optimistic updates already specced in the technical spec §6.3 — this copy makes a promise the implementation needs to keep.)*

**Diagnostic flow — Gemini call fails/times out:**
No visible error at all. Silently fall back to the deterministic default (`internal_state` → `irp`) per the Diagnostic Question Bank §3. The user should never see an AI failure message mid-disruption — that's the worst possible moment to surface a technical error.

**Account deletion — re-authentication required:**
> "For your security, confirm your password to continue."

**Account deletion — final confirmation:**
> "This deletes everything — your check-ins, your history, your Identity Anchors. This can't be undone after [14] days. Type DELETE to confirm."
*(Bracketed number pending the soft-delete grace period decision — see `stateOS_Settings_Profile_Plan.md` §8.)*

**Export data — success:**
> "Your data's on its way. Check your email in the next few minutes."

---

## 7. Settings Toggle Descriptions (one-liners under each toggle)

- **Reminders enabled:** "Morning, afternoon, and evening nudges for your Daily Architecture."
- **Analytics opt-in:** "Helps us understand which parts of the app are actually useful. Never includes your check-in content or notes."
- **Research data sharing:** "Off by default. If this ever changes, we'll ask again explicitly — this toggle doesn't do anything yet."

---

## 8. Open Question

Recovery Window result screen (§3) shows exact seconds/minutes for Instant/Rapid tiers but rounds for longer tiers — worth confirming that's the right precision cutoff, or whether showing an exact number even at the Extended tier ("187 minutes") reads as more honest than a vague "a while."
