# stateOS — Diagnostic Flow Question Bank

Exact wording and branching logic for the Framework Diagnostic (`DiagnosticFlow` component, `diagnose-drift` Edge Function). Referenced in `stateOS_Technical_Specification_v2.md` §5.2, §7.1.

---

## 1. Design Principles

- **Max 5 questions, often fewer.** The moment a question resolves the node, stop — don't run the full tree for completeness.
- **Yes/No/Not sure — three options, not two.** Forcing a binary choice mid-disruption produces noise. "Not sure" is a valid, logged answer that routes to a default rather than guessing.
- **Each question stands alone.** No question should require remembering the answer to a previous one — user is likely at reduced cognitive clarity.
- **No diagnostic language in the questions themselves.** Never ask "is this a Perception-node issue?" Ask about the lived experience; the app does the mapping.
- **Every branch ends somewhere.** No dead ends, no "none of the above."

---

## 2. The Tree

### Step 1 — Environment
**Question:** "Did this start right when you entered a specific place, or around a specific person?"
- **Yes** → resolve `environment` → recommend `33-second-reset` (fastest environmental reset)
- **No** → continue to Step 2
- **Not sure** → continue to Step 2 (don't resolve on an unsure answer)

### Step 2 — Perception
**Question:** "Does this feel more like your mind is racing or foggy, than like a strong emotion?"
- **Yes** → resolve `perception` → recommend `micro-alignment-cues`
- **No** → continue to Step 3
- **Not sure** → continue to Step 3

### Step 3 — Internal State
**Question:** "Right now, does your body feel keyed up, or does everything feel heavy and slow?"
- **Yes (either keyed up or heavy/slow — both count)** → resolve `internal_state` → recommend `heart-coherence-switch` if keyed up, `irp` if heavy/slow (sub-branch, see §2.1)
- **No** → continue to Step 4
- **Not sure** → resolve `internal_state` → recommend `irp` (safest general-purpose default)

### Step 4 — Identity
**Question:** "Do you feel like you're acting like an older, less-evolved version of yourself right now?"
- **Yes** → resolve `identity` → recommend `timeline-lock-in`
- **No** → continue to Step 5
- **Not sure** → continue to Step 5

### Step 5 — Behavior
**Question:** "Have you already said or done something in the last few minutes that you're worried about?"
- **Yes** → resolve `behavior` → recommend `full-body-flush`
- **No / Not sure** → resolve `internal_state` (fallback) → recommend `irp`

### 2.1 Step 3 Sub-branch
If Step 3 is answered "Yes," a follow-up micro-question fires before resolving:
**Question:** "Keyed up, or heavy and slow?"
- **Keyed up** → `heart-coherence-switch`
- **Heavy/slow** → `irp`
- **Not sure** → `irp` (default)

---

## 3. Free-Text Fallback

If the user skips the structured flow and instead types a free-text trigger note (e.g. "ugh I just got off a call with my mom"), the deterministic tree above still runs first against any available State Audit data. Only if the tree is genuinely ambiguous (a tie between two nodes) does the Edge Function call Gemini with the note, using structured output to return one of the five node enums — never freeform text. Fallback default if the API call fails or times out: `internal_state` → `irp`.

---

## 4. Result Screen Copy

Shown after the diagnostic resolves, before the protocol launches:
> "This looks like it's coming from **[node label]**. Starting **[protocol name]** — about **[duration]**."

Node labels for display (not the internal enum):
- `environment` → "your surroundings"
- `perception` → "how you're reading the situation"
- `internal_state` → "your nervous system"
- `identity` → "which version of you is active"
- `behavior` → "something that already happened"

---

## 5. Open Question

Should "Not sure" answers be logged differently from "No" in `diagnostic_sessions.answers`, so the data can later reveal which questions are consistently confusing? Recommend yes — store the literal three-state answer, not a collapsed boolean, even though the branching logic above treats "No" and "Not sure" the same in most steps.
