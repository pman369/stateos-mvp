# stateOS — Documentation Plan

Status index for all project documentation. Update the table below as new docs are added or existing ones are revised.

---

## 1. Current Status

| Doc | Category | Status |
|---|---|---|
| `stateOS_Technical_Specification_v2.md` | Core | Complete |
| `stateOS_Settings_Profile_Plan.md` | Core | Complete |
| `stateOS_Protocol_Content_Library.md` | Content (build-blocking) | Complete |
| `stateOS_Diagnostic_Question_Bank.md` | Content (build-blocking) | Complete |
| `stateOS_Onboarding_Script.md` | Content | Complete |
| `stateOS_Notification_Microcopy.md` | Content | Complete |
| `stateOS_Visual_Design_System.md` | Design | Complete |
| `StateArchitecture_Science_Framing_Cheatsheet.md` | Source review | Complete — not app-build-blocking, informs ongoing copy decisions |
| Privacy Policy & Terms of Service | Legal | Not started — required before public launch, needs legal review given the sensitivity of Identity Anchor and voice-note data |
| QA / Test Plan | Engineering | Not started — required before public launch |
| Analytics & Instrumentation Plan | Post-MVP | Not started — deferred; `analytics_opt_in` already exists as a schema field with nothing wired to it yet |
| Post-MVP Roadmap | Post-MVP | Not started — deferred until real usage data exists to prioritize against |

All build-blocking content docs (Protocol Content Library, Diagnostic Question Bank) and the remaining Tier 1/2 content and design docs are complete. The two items standing before public launch are the Privacy Policy/Terms of Service and the QA/Test Plan.

---

## 2. Doc Descriptions

**Technical Specification** — Architecture, database schema, Edge Functions, routes, MVP scope. The foundational build reference.

**Settings & Profile Plan** — Profile and Settings surfaces, account deletion flow, privacy toggles. Extends the Technical Specification's schema.

**Protocol Content Library** — Full seed-ready scripts (exact instruction text, timing, audio cue points) for all 6 MVP protocols. Directly unblocks `protocols` table seeding.

**Diagnostic Question Bank** — Exact wording and branching logic for the 5-step Framework Diagnostic. Directly unblocks the `diagnose-drift` Edge Function's deterministic tree.

**Onboarding Script** — Screen-by-screen first-run copy, including the explicitly-skippable Identity Anchor step.

**Notification & Micro-copy Doc** — Every push notification, result screen, empty state, and error message, kept in one place for tone consistency.

**Visual Design System** — Color, typography, layout, and motion direction, grounded in the product's actual mechanism (paced breathing, Recovery Window tiers) rather than generic wellness-app defaults.

**Science-Framing Cheatsheet** — Specific, located fixes for scientific overreach in the source material, plus a standing checklist for tiering any new claim as Established or Working Model.

---

## 3. Build Order (as executed)

1. Protocol Content Library — complete
2. Diagnostic Question Bank — complete
3. Onboarding Script — complete
4. Notification & Micro-copy Doc — complete
5. Visual Design System — complete
6. Privacy Policy & Terms of Service — pending
7. QA / Test Plan — pending
8. Analytics & Instrumentation Plan — pending, post-MVP
9. Post-MVP Roadmap — pending, post-MVP

---

## 4. Remaining Before Public Launch

Two items block public launch:

- **Privacy Policy & Terms of Service** — a hard legal blocker given the sensitivity of what's collected (Identity Anchors, voice notes, drift triggers, signature statements). Requires legal review before publishing, not just internal drafting.
- **QA / Test Plan** — critical-path coverage for the "something feels off" flow end-to-end, the account deletion cascade, cross-timezone reminder delivery, and offline/local-first write behavior.
