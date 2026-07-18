# stateOS — Protocol Content Library

Full instruction scripts for the 6 MVP protocols. Each block is seed-ready for the `protocols` table (`stateOS_Technical_Specification_v2.md` §4.1, §9).

---

## 1. Tone Guidelines

Applies to every protocol script below:

- **Second person, present tense.** "You feel" not "one feels," "Breathe in" not "You should breathe in."
- **Short sentences.** This is read mid-disruption — a user with low clarity or high emotional activation cannot parse a complex sentence. One instruction per line.
- **Instructional, not affirmational.** Say what to do, not what to believe. "Place your hand on your sternum" — not "Feel your heart opening to infinite possibility."
- **No unearned certainty.** Avoid promising a specific outcome ("this will fix it"). Describe the action; let the result speak for itself in the post-session rating.
- **No stacked metaphor.** Working Model language (frequency, signature, alignment) is allowed once per step at most, and never in the same sentence as a physiological instruction. Keep the two registers separate so a skeptical user isn't asked to accept a metaphor in order to follow a breathing instruction.
- **Silence has value.** Steps with holds or breathing counts should say the instruction once, then let the timer run — don't fill dead air with repeated text.

---

## 2. The 33-Second Reset

```json
{
  "slug": "33-second-reset",
  "name": "The 33-Second Reset",
  "purpose": "Fast state restoration when you notice drift and need to act immediately.",
  "mechanism": "dmn_deactivation",
  "duration_seconds": 33,
  "framework_node": "perception",
  "science_tier": "working_model",
  "steps": [
    {
      "order": 1,
      "label": "Spinal Alignment",
      "duration": 10,
      "instruction": "Bring attention to your spine. Feel it as one line, base to crown. Sit or stand a little taller."
    },
    {
      "order": 2,
      "label": "Identity Differentiation",
      "duration": 10,
      "instruction": "Notice what's yours and what isn't. This feeling — is it your reaction, or the room's? Let what isn't yours stay outside you."
    },
    {
      "order": 3,
      "label": "Re-establish",
      "duration": 13,
      "instruction": "Let your own baseline come back into focus. The situation hasn't changed. Your relationship to it has."
    }
  ]
}
```

**Pre-session prompt (optional):** "Rate how you feel right now, 1–10."
**Post-session prompt:** "Rate how you feel now, 1–10."
**Audio cue:** Soft single chime at the start of each of the 3 steps (not just at the end) — this protocol is fast enough that a visual timer alone can go unnoticed.

---

## 3. The Heart Coherence Switch

```json
{
  "slug": "heart-coherence-switch",
  "name": "The Heart Coherence Switch",
  "purpose": "Emergency grounding when a situation feels like too much to process at once.",
  "mechanism": "hrv_coherence",
  "duration_seconds": 45,
  "framework_node": "internal_state",
  "science_tier": "established",
  "steps": [
    {
      "order": 1,
      "label": "Settle",
      "duration": 5,
      "instruction": "Bring your attention to the center of your chest."
    },
    {
      "order": 2,
      "label": "Breathe: Cycle 1",
      "duration": 10,
      "instruction": "Inhale slowly. Silently think: I return. Exhale slowly. Silently think: I align."
    },
    {
      "order": 3,
      "label": "Breathe: Cycle 2",
      "duration": 10,
      "instruction": "Inhale. I return. Exhale. I align."
    },
    {
      "order": 4,
      "label": "Breathe: Cycle 3",
      "duration": 10,
      "instruction": "Inhale. I return. Exhale. I align."
    },
    {
      "order": 5,
      "label": "Close",
      "duration": 10,
      "instruction": "Let your breath return to normal. Notice anything that's shifted, even slightly."
    }
  ]
}
```

**Audio cue:** A low tone on each inhale, slightly lower tone on each exhale — reinforces the pacing without requiring the user to read every word if their eyes are closed.
**Note:** This is the one protocol tagged `established` where the phrase pairing itself ("I return" / "I align") is Working Model — flag this distinction in the `ScienceTierLabel` copy: the breathing mechanism is established, the specific words are a practice choice, not a scientific requirement. Users should feel free to substitute their own words eventually (v2 feature — not in MVP).

---

## 4. Instant Realignment Protocol (IRP)

```json
{
  "slug": "irp",
  "name": "Instant Realignment Protocol",
  "purpose": "Your foundational reset. Learn this one first — it underlies most of the others.",
  "mechanism": "vagal_activation",
  "duration_seconds": 50,
  "framework_node": "internal_state",
  "science_tier": "working_model",
  "steps": [
    {
      "order": 1,
      "label": "Heart Center",
      "duration": 5,
      "instruction": "Place a hand behind your sternum, or just bring attention there."
    },
    {
      "order": 2,
      "label": "Slow the Field",
      "duration": 10,
      "instruction": "Let whatever feels fast or scattered inside settle. No need to force it — just let it slow."
    },
    {
      "order": 3,
      "label": "Breathe Upward",
      "duration": 25,
      "instruction": "Take three deep breaths. On each inhale, imagine the breath rising from your chest toward the top of your head."
    },
    {
      "order": 4,
      "label": "State Command",
      "duration": 10,
      "instruction": "Say, silently or aloud: back to baseline. This is an instruction to yourself, not a hope."
    }
  ]
}
```

**Post-session prompt:** Standard pre/post 1–10 rating.
**Note:** Duration is 50s in the seed data — three deep breaths at a natural pace runs closer to 25s than the source book's rougher estimate; timed and tested against an actual read-through rather than assumed.

---

## 5. Full-Body Frequency Flush

```json
{
  "slug": "full-body-flush",
  "name": "Full-Body Frequency Flush",
  "purpose": "Release accumulated tension after an intense stretch — a hard conversation, a draining day, back-to-back meetings.",
  "mechanism": "vagal_activation",
  "duration_seconds": 150,
  "framework_node": "internal_state",
  "science_tier": "working_model",
  "steps": [
    {
      "order": 1,
      "label": "Heart Center",
      "duration": 10,
      "instruction": "Place a hand on your chest. Take one breath here before starting the scan."
    },
    {
      "order": 2,
      "label": "Body Scan",
      "duration": 40,
      "instruction": "Move your attention from the top of your head down to your feet. Notice anywhere that feels tight, heavy, or tense. No need to fix it yet — just notice."
    },
    {
      "order": 3,
      "label": "Breathe Into It",
      "duration": 50,
      "instruction": "Return to the tightest spot you noticed. Breathe into it a few times, like you're sending the breath there directly."
    },
    {
      "order": 4,
      "label": "Hands on Heart",
      "duration": 30,
      "instruction": "Place both hands over your heart. Take five slow, deep breaths."
    },
    {
      "order": 5,
      "label": "Close",
      "duration": 20,
      "instruction": "Let your hands drop. Take one more breath. Notice what's different from when you started."
    }
  ]
}
```

**Audio cue:** Gentle ambient tone throughout (optional, toggleable) rather than discrete chimes — this is the longest protocol and a continuous soft tone supports sustained attention better than repeated pings.

---

## 6. The Highest Timeline Lock-In

```json
{
  "slug": "timeline-lock-in",
  "name": "The Highest Timeline Lock-In",
  "purpose": "Set direction for the day, or reset direction mid-day after it's gone sideways.",
  "mechanism": "dmn_deactivation",
  "duration_seconds": 75,
  "framework_node": "decision",
  "science_tier": "working_model",
  "steps": [
    {
      "order": 1,
      "label": "Posture",
      "duration": 5,
      "instruction": "Sit or stand upright. Let your spine lengthen slightly."
    },
    {
      "order": 2,
      "label": "Heart Field",
      "duration": 10,
      "instruction": "Bring attention to your chest. Take a few slow breaths here."
    },
    {
      "order": 3,
      "label": "Choose",
      "duration": 15,
      "instruction": "Ask yourself: what kind of day do I want this to be? Not what will happen — how do I want to show up?"
    },
    {
      "order": 4,
      "label": "Picture It",
      "duration": 20,
      "instruction": "Picture yourself moving through today at your best. Notice how you're speaking, moving, responding to friction."
    },
    {
      "order": 5,
      "label": "Step In",
      "duration": 15,
      "instruction": "Let that version feel less like an image and more like a state you're already in."
    },
    {
      "order": 6,
      "label": "Hold",
      "duration": 10,
      "instruction": "Hold this for a few more seconds before you move on."
    }
  ]
}
```

**Usage note:** This is the anchor protocol for the Daily Architecture morning flow (technical spec §7.2) — pulls the user's `profiles.signature_statement` (Settings & Profile plan §3.2) into Step 3's prompt if one exists: *"You said you want to be ___ today. Picture that."*

---

## 7. Five Micro-Alignment Cues

Structurally different from the others — five independent 3-second cues rather than one sequence. Rendered as a single-screen list in the `ProtocolPlayer`, each with its own micro-timer, rather than a forced sequence.

```json
{
  "slug": "micro-alignment-cues",
  "name": "Five Micro-Alignment Cues",
  "purpose": "The fastest tools you have. Use any one of these in the middle of anything.",
  "mechanism": "vagal_activation",
  "duration_seconds": 15,
  "framework_node": "perception",
  "science_tier": "established",
  "steps": [
    {
      "order": 1,
      "label": "Sternum Touch",
      "duration": 3,
      "instruction": "Touch your sternum briefly. That's it."
    },
    {
      "order": 2,
      "label": "Spinal Extension",
      "duration": 3,
      "instruction": "Lengthen your spine, like a string is pulling the crown of your head up."
    },
    {
      "order": 3,
      "label": "Sharp Inhale",
      "duration": 3,
      "instruction": "Take one deliberate, deep breath in through your nose."
    },
    {
      "order": 4,
      "label": "Tongue Release",
      "duration": 3,
      "instruction": "Notice if your tongue is pressed to the roof of your mouth. Let it drop."
    },
    {
      "order": 5,
      "label": "Shoulder Release",
      "duration": 3,
      "instruction": "Drop your shoulders away from your ears."
    }
  ]
}
```

**UI note:** Unlike the other five protocols, this one probably shouldn't force a pre/post rating — it's meant to be used dozens of times a day, and a rating prompt after every 3-second cue would kill adoption. Log completion silently to `protocol_sessions` with `pre_state_rating`/`post_state_rating` left null, and surface aggregate usage count instead ("used 14 times today") rather than an effectiveness score for this one specifically.

---

## 8. Cross-Protocol Notes

- **Timing has been reconciled against natural reading pace**, not copied directly from the source book's rough estimates. Seed migration values now match these final durations exactly (33 / 45 / 50 / 150 / 75 / 15 seconds respectively) — the earlier draft ranges in the technical specification's protocol seed table have been replaced with these precise figures as part of documentation review.
- **`ScienceTierLabel` copy per protocol** (for the "Why this works" / "The model" split in the technical spec §6.4):
  - 33-Second Reset → *Why this works:* brief attention redirection can interrupt a stress-reaction cascade. *The model:* "identity differentiation" and "re-establishing frequency" are practice framing, not measured phenomena.
  - Heart Coherence Switch → *Why this works:* paced breathing at ~5–6 breaths/min is linked to increased HRV coherence (Thayer & Lane, 2009). *The model:* the specific phrases "I return / I align" are a practice choice.
  - IRP → *Why this works:* slow diaphragmatic breathing activates the vagal brake. *The model:* "breathing upward toward the crown" and "signature frequency" are visualization framing.
  - Full-Body Flush → *Why this works:* body scanning combined with directed breath is a recognized somatic technique for tension release. *The model:* "breath dissolving distortion" is metaphor for what's more plainly muscular relaxation plus attention redirection.
  - Timeline Lock-In → *Why this works:* brief visualization of intended behavior has some support in goal-setting literature as a priming mechanism. *The model:* "timeline" and "frequency" language is practice framing, not a claim about parallel realities or measurable fields.
  - Micro-Alignment Cues → *Why this works:* each cue maps to a specific vagal or postural mechanism (sternum touch → interoceptive attention, spinal extension → ventral vagal activation, deep inhale → vagal afferent stimulation). This one needs the least hedging — the individual mechanisms are the most directly established of the six.

---

## 9. Open Question

Should protocol instruction text be static (as scripted here) or eventually personalized (e.g., referencing the user's own Identity Anchor instead of generic language)? Timeline Lock-In already does a light version of this via the signature statement pull (§6). Recommend keeping the other five fully static for MVP — personalization adds real value but also adds a failure mode (what renders if no Identity Anchor exists yet) that's not worth solving before the static versions are validated with real usage.
