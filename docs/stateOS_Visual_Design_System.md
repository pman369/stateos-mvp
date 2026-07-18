# stateOS — Visual Design System

Grounds the app's visual identity in its actual subject — nervous system regulation, breath, recovery — rather than generic wellness-app or AI-tool defaults.

---

## 1. Design Thesis

stateOS is not a mood tracker and not a meditation app. Its subject is closer to instrumentation: HRV, vagal tone, recovery time, tiers. The book it's built from explicitly frames state as "an engineering problem, not a character problem." The visual language should hold both halves of that at once — the precision of an instrument panel, and the fact that what's being measured is a person having a hard moment.

Two references to avoid, because they're the default answer for almost any AI-generated interface right now, not a choice made for this brief: (1) warm cream + serif + terracotta — reads as generic "calm wellness app," and the terracotta specifically reads as an AI tell; (2) near-black + single acid-green or vermilion accent — reads as generic "dark technical tool," disconnected from the actual subject matter here (breath, heart rhythm, recovery).

The signature element below is built from the one thing this app actually does that no comparable app does: pace a UI element to real resonant-breathing timing (5.5 breaths/minute — the exact rate cited in the source material's Resonant Breathing protocol). That's grounded in the subject, not decorative.

---

## 2. Color

Dark-based, because the product is used in moments of low clarity and high emotional activation — a bright interface fights the user's actual state at the exact moment they open the app. But the darkness here is warmer and more specific than a generic near-black, and the accent system is built around a **coherence gradient** rather than a single accent color, because the Recovery Window tier scale is the app's real signature UI element and deserves to *be* the palette, not sit on top of it.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0F1116` | Base background — a near-black with a faint blue-violet undertone (nervous system, night, not "tech-tool black") |
| `ink-raised` | `#181B22` | Cards, elevated surfaces |
| `signal` | `#E8C77A` | Primary accent — a low-saturation warm gold. Represents "signal" per the source material's own signal/noise metaphor. Used sparingly: primary CTAs, active states, the breath-pulse signature element |
| `ash` | `#8B8F9C` | Secondary text, muted UI |
| `paper` | `#EDEBE6` | Primary text on dark — warm off-white, not pure white (pure white on near-black is harsh for a low-clarity user to read) |

### Recovery Window Tier Scale (the app's real color signature)
Not a red-to-green traffic light — that reads as pass/fail, which contradicts the "no score-shaming" copy principle established in `stateOS_Notification_Microcopy.md`. Instead, a **coherence-to-noise gradient**: clear and settled at one end, dense and heavy at the other, without implying moral judgment.

| Tier | Hex | Character |
|---|---|---|
| Instant | `#E8C77A` (signal gold) | Clear |
| Rapid | `#C9B48A` | Settling |
| Standard | `#9C9284` | Neutral |
| Delayed | `#736B72` | Dense |
| Extended | `#4A4550` | Heavy — still legible, still dignified, never alarming red |

---

## 3. Typography

Three roles, each doing a distinct job — no reused "any-project" pairing.

- **Display**: A humanist serif with some age to its letterforms — not a high-contrast fashion serif (too close to the cream/terracotta default), something closer to a well-set book face, since this product's entire content library is literally adapted from a book. Suggested: **Fraunces** (variable weight/optical-size axes let headlines feel handset while body-adjacent sizes stay readable) or **Newsreader** if Fraunces reads too decorative at small sizes.
- **Body**: A quiet, highly legible humanist sans for anything read mid-disruption (protocol instructions, diagnostic questions) — legibility under low cognitive load matters more than character here. Suggested: **Inter** or **Public Sans**.
- **Utility/Data**: A monospace for anything numeric — timers, Recovery Window seconds, State Audit scores. Monospace reinforces the "instrument panel" half of the thesis and gives numbers a stable width so a live-updating timer doesn't jitter the layout. Suggested: **IBM Plex Mono**.

Type scale is deliberately restrained — this is not a marketing site with dramatic size jumps. Largest display use (onboarding headlines, result screens) tops out modestly; the emotional weight comes from pacing and space, not size.

---

## 4. Layout Concept

```
+-------------------------------+
|  eyebrow: current tier         |   <- small, ash color, sets context before the number
|                                 |
|        02:47                   |   <- huge, mono, signal gold -- the Recovery Window timer
|                                 |
|  "Back to baseline in..."      |   <- serif, appears only on completion
|                                 |
+-------------------------------+
```

The Protocol Player and Recovery Window Timer are the emotional core of the app (per the technical spec) and get the most generous, quiet layout — mostly empty space, one number, minimal chrome. Everything else (Today, Settings, History) can be denser and more conventional; the restraint is spent where it matters, not spread evenly across every screen.

**No numbered step markers (1/2/3) as decoration.** They're used in the Protocol Player because protocol steps genuinely are a sequence the user needs to track — that's real information. They are *not* used elsewhere (e.g., not decorating the Settings list or onboarding progress) where order isn't the point.

---

## 5. Motion

One orchestrated signature moment, quiet everywhere else:

**Signature element — the Breath Pulse.** A thin horizontal line (or subtle background glow, TBD in implementation) that expands and contracts at exactly 5.5 breaths per minute — a ~10.9-second cycle — visible ambiently behind the Recovery Window Timer and during the Heart Coherence Switch protocol specifically (the one protocol whose mechanism *is* paced breathing). It's not present on every screen; it appears where the product's actual mechanism is paced breath, so it means something rather than decorating everything.

Everywhere else: motion is restrained to functional transitions — a soft crossfade on protocol step changes, a gentle scale on button press. No parallax, no scroll-triggered reveals, no decorative particle/gradient animation. Reduced-motion setting disables the Breath Pulse entirely (replace with a static gold dot) and shortens all transitions to near-instant.

---

## 6. Quality Floor

- Responsive down to mobile — primary usage context is a phone in a moment of disruption, not a desktop.
- Visible keyboard focus states throughout (this app will have real desktop/accessibility users doing State Audits and journaling).
- Reduced motion respected everywhere, not just the Breath Pulse.
- Contrast: `paper` on `ink` and `signal` on `ink` both need verification against WCAG AA at the actual font sizes used before shipping — the muted, low-saturation palette choices here trade some contrast headroom for tone, so this needs an explicit check rather than an assumption.

---

## 7. What This Doc Doesn't Cover

Component-level spacing/sizing tokens, icon set selection, and the actual Tailwind config translation are implementation details for whoever builds the component library — this doc sets direction and rationale, not a full design token JSON. Worth a follow-up pass once the first few screens are built, to confirm the palette and type choices hold up in real UI rather than only in concept.
