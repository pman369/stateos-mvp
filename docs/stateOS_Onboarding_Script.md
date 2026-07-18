# stateOS — Onboarding Script

Screen-by-screen copy for the first-run flow. Covers the 3 steps outlined in `stateOS_Technical_Specification_v2.md` §7.3.

---

## 1. Design Principles

- **Ask for the minimum before showing value.** Don't front-load account creation before the user has felt the product do something.
- **The Identity Anchor step is the most sensitive screen in onboarding.** It asks a stranger to recall a vulnerable personal memory in their first five minutes. It needs an explicit skip path, no pressure copy, and no implication that skipping means they're doing it wrong.
- **No score-shaming.** A high (bad) baseline State Audit score is data, not a problem to react to. Copy should never imply the user's baseline is concerning.
- **Every screen has a visible "why."** One line explaining what this step is for and what happens to the data — builds trust before asking for anything personal.

---

## 2. Screen 0 — Welcome

**Headline:** "stateOS"
**Body:** "A way to notice when you've drifted, and get back faster."
**CTA:** "Get started"
**Secondary:** "Already have an account? Sign in"

---

## 3. Screen 1 — Account Creation

Standard Supabase Auth email/OAuth screen. No custom copy needed beyond:
**Headline:** "Create your account"
**Sub:** "Your data stays private to you. You can export or delete it anytime in Settings."

---

## 4. Screen 2 — Baseline State Audit

**Headline:** "Let's get a starting point."
**Sub:** "Five quick questions. There's no right answer — this is just where you are today."

Five sliders (1–5 each), matching `state_audits` schema:

1. **Energy** — "How's your energy right now?" (1 = energized · 5 = exhausted)
2. **Clarity** — "How's your mental clarity?" (1 = crystal clear · 5 = foggy)
3. **Emotional Stability** — "How reactive do you feel?" (1 = steady · 5 = on edge)
4. **Identity Alignment** — "Does this feel like you at your best?" (1 = yes, fully · 5 = not really)
5. **Environmental Match** — "Does your current environment feel supportive right now?" (1 = very · 5 = not at all)

**Footer note (small text, always visible):** "You'll see this exact check-in again later — this is just your Day 1 marker."

**CTA:** "Continue"

---

## 5. Screen 3 — Recovery Window Baseline

**Headline:** "One more thing — a rough estimate."
**Body:** "When something throws you off, how long does it usually take before you feel like yourself again?"

Single-select, not a precise time input (precision here would be false precision — nobody tracks this before using the app):
- "Usually within a few minutes"
- "Usually within an hour"
- "Usually takes most of the day"
- "Sometimes it lingers for days"
- "I'm honestly not sure"

**Footer note:** "This becomes your Day 1 mark on the Recovery Window chart — so you can actually see it change."

**CTA:** "Continue"

*(Maps to a manually-entered `drift_events` row with `trigger_source = 'unspecified'` per technical spec §7.3 — "a few minutes" → ~180s, "within an hour" → ~1800s, "most of the day" → ~14400s, "days" → ~172800s, "not sure" → skip the row entirely rather than fabricate a number.)*

---

## 6. Screen 4 — Identity Anchor (optional, explicitly skippable)

**Headline:** "Last one — and this one's optional."
**Body:** "Think of a moment when you felt fully, unmistakably like yourself. Not your most successful moment — your most *you* moment."
**Sub:** "If nothing comes to mind right now, that's completely fine — you can add this anytime from your Profile."

Input: single text field (or voice note if that ships in MVP).
**Placeholder text:** "A word, a memory, a feeling — whatever comes to mind."

**Primary CTA:** "Save this"
**Secondary CTA (equal visual weight, not a smaller/grayed link):** "Skip for now"

*(Equal visual weight matters here — a de-emphasized skip button subtly pressures the user to complete a screen that's asking for something genuinely personal on first contact with the app.)*

---

## 7. Screen 5 — Ready

**Headline:** "You're set up."
**Body:** "From here: check in whenever you want on the Today screen, or tap Diagnose the moment something feels off."
**CTA:** "Go to Today"

---

## 8. Open Questions

- Should the Recovery Window baseline (Screen 3) be skippable too, given it's asking someone to self-assess something they may never have consciously tracked before? Recommend keeping it required but framing it as an estimate, not a measurement — already reflected in the single-select (vs. precise time entry) design above.
- Voice note support for the Identity Anchor screen — if it's not ready for MVP, this screen should only offer text, with voice added later as an enhancement to an existing entry rather than blocking onboarding on infrastructure that isn't done yet.
