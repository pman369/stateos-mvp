# State Architecture — Science-Framing Cheatsheet

Actionable fixes for specific overreach identified in the source PDF (*State Architecture: The Foundational Guide to Human State Engineering*). Use this as either a revision guide for the source book text, or as ground truth when writing any stateOS copy that draws from it (protocols, `ScienceTierLabel` content, etc.).

---

## 1. The Core Problem, in One Line

The book's own three-layer structure (Established Knowledge / Working Model / Personal Practice) is a good idea that isn't consistently followed — several claims sit inside "Established Knowledge" sections or are stated as fact ("this is not metaphor") when they're actually HeartMath Institute material, which isn't peer-reviewed in the way Porges or Thayer & Lane are.

---

## 2. Traffic Light Reference

| Status | Meaning | Examples from the book |
|---|---|---|
| Keep as-is (established) | Mainstream, peer-reviewed, replicated | HRV/vagal tone (Thayer & Lane), Polyvagal Theory (Porges), DMN and meditation (Brewer et al.), interoception/insula (Critchley & Garfinkel), resonant breathing effects |
| Real phenomenon, overstated claim | The underlying science exists but the book extends it further than the citation supports | Heart's electromagnetic field (real, measurable — but "detectable at 3 feet" framed to imply interpersonal energetic transmission, which isn't supported), interpersonal physiological synchrony (real — but "you absorb others' frequencies" overstates it) |
| Should be reframed or removed | Not mainstream science; HeartMath-sourced or unsupported | "Signature frequency" as a literal biophysical signature, "coherent radiance" resisting interference, explicit claims of "this is not metaphor" attached to frequency language |
| Citation itself is shaky | The reference listed doesn't hold up independently of how the book uses it | Carney, Cuddy & Yap 2010 (power posing) — largely failed to replicate; shouldn't sit in the reference list without a caveat even if unused in body text |

---

## 3. Specific Fixes, by Location

### Chapter 3 — "The Heart's Electromagnetic Field"
**Current framing:** States the heart's magnetic field is "more than 100 times stronger than the brain's" and "can be detected up to three feet from the body," citing HeartMath Institute and a PMC bioengineering article.
**What's actually true:** Magnetocardiography (detecting the heart's magnetic field externally) is real, established medical science. The field-strength comparison to the brain is plausible.
**What's not supported:** The implication (developed further in Ch. 5 and Ch. 7) that this field constitutes interpersonal "frequency transmission" or "cardiac synchrony" between people in a meaningful energetic sense, beyond the documented physiological synchrony (heart rate entrainment) that real interpersonal psychophysiology research does support.
**Fix:** Keep the magnetocardiography fact. Move the interpersonal-transmission language explicitly into a Working Model callout, with wording like: *"Some practitioners describe this as one person's field 'influencing' another's — this is a working metaphor for the real, more modest phenomenon of physiological synchrony, not a claim that emotional or informational content transmits electromagnetically."*

### Chapter 3 — "Cortical Facilitation" / Heart Coherence
**Current framing:** "Your brain simply works better when your heart is coherent" — stated as established fact, sourced to HeartMath.
**Fix:** Relabel as Working Model. The underlying mechanism (HRV coherence correlating with prefrontal function) is real and already covered by the Thayer & Lane citations elsewhere in the same chapter — cite *those* for the "brain works better" claim instead of HeartMath, and drop the HeartMath-specific "cortical facilitation" terminology or clearly mark it as their branded term for a real but more modestly-supported effect.

### Chapter 5 — "Environmental Gravity" / Physiological Linkage
**Current framing:** Cites a 2024 *Physiology & Behavior* study (uncited author/title — flag this on its own: a vague journal-year citation without full reference detail isn't verifiable) to support that people's HRV "synchronize or conflict" and that you are "literally entrained" by people around you.
**Fix:** Add the full citation (author, title) so this claim is actually checkable — as written it can't be verified. Interpersonal physiological synchrony is a real, studied phenomenon, but "entrainment" language should be scoped to heart-rate-pattern effects, not extended into the "absorbing frequencies" framing used later in the same chapter.

### Chapter 5 — "Coherent Radiance vs. Defensive Shielding"
**Current framing:** "This is not metaphor. Coherent electromagnetic fields demonstrate measurably different properties than incoherent ones, including resistance to interference."
**This is the single clearest overreach in the book.** The sentence explicitly denies being metaphor while making an unsupported claim about a person's field "resisting interference" from other people's emotional states.
**Fix:** This needs to become explicit Working Model language, not have its metaphor status denied. Suggested rewrite: *"We use 'coherent radiance' as a working model for something real: a person who is physiologically regulated is less reactive to a tense room, and that steadiness is often genuinely visible to others. We're not claiming a measurable field literally blocks incoming energy — we're describing how self-regulation changes your experience of, and effect on, a room."*

### Chapter 7 — Interpersonal Physiological Synchrony (repeat citation)
Same vague 2024 citation issue as Ch. 5. Fix once, applies to both locations — get the full citation or remove the specific "2024, Physiology & Behavior" attribution and replace with a general, honestly-hedged statement if the source can't be tracked down.

### Appendix C — References List
**Carney, Cuddy & Yap (2010), "Power posing"** — this study is one of the most well-known failed replications in social psychology; Cuddy herself has publicly walked back the hormonal-change claims. It appears in the reference list. Search the body text for any place it's actually cited — if used to support any postural claim (e.g., "Spinal Extension" mechanism descriptions), that claim needs a different citation or a caveat. If it's genuinely unused, remove it from the list entirely — a discredited reference sitting in an otherwise solid bibliography undermines the credibility of the real citations next to it.

---

## 4. General Rules to Apply Going Forward

Use these when writing *any* new stateOS content (protocol descriptions, onboarding copy, in-app "why this works" text) that draws on this material — this is the same policy already encoded in `stateOS_Technical_Specification_v2.md` §1.4 and `stateOS_Protocol_Content_Library.md` §8, made into a checklist here:

1. **If the citation is HeartMath Institute alone** (not paired with a mainstream peer-reviewed source), the claim is Working Model, full stop — regardless of how confidently the original text states it.
2. **If a sentence says "this is not metaphor,"** stop and check whether it actually is one. That phrasing is a red flag for the exact kind of overreach found in Ch. 5.
3. **Any citation used in the app's copy needs to be fully checkable** — author, year, and enough detail to find it. A bare "2024, Physiology & Behavior" isn't sufficient; either find the real citation or drop the specific attribution.
4. **Interpersonal/energetic claims (synchrony, entrainment, field transmission) get scoped down** to what's actually measured (heart rate pattern matching in close physical proximity) rather than extended into implied information or emotional transfer.
5. **When in doubt, cite the more conservative, already-present source.** This book already has Porges and Thayer & Lane doing real work in most chapters — where a HeartMath claim and a Thayer & Lane claim could both support similar UI copy, use Thayer & Lane.

---

## 5. Quick Checklist for Reviewing Any New Passage

- [ ] Is the citation mainstream/peer-reviewed, or HeartMath/proprietary-institute sourced?
- [ ] Does the claim's *scope* match what the citation actually supports, or has it been extended?
- [ ] Is metaphor language ("frequency," "radiance," "signature") clearly flagged as such, not asserted as literal?
- [ ] Can I actually find and verify this citation from what's given?
- [ ] Would a skeptical, scientifically literate reader feel misled by how this is framed?

If any answer is concerning, route the claim to the Working Model tier and adjust the wording — don't remove the practice value, just stop asserting it as settled fact.
