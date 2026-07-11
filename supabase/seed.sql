-- Seed file to populate static protocols table
-- Mapped from stateOS_Protocol_Content_Library.md definitions

insert into public.protocols (slug, name, purpose, mechanism, duration_seconds, steps, framework_node, science_tier)
values
  (
    '33-second-reset',
    'The 33-Second Reset',
    'Fast state restoration when you notice drift and need to act immediately.',
    'dmn_deactivation',
    33,
    '[
      { "order": 1, "label": "Spinal Alignment", "duration": 10, "instruction": "Bring attention to your spine. Feel it as one line, base to crown. Sit or stand a little taller." },
      { "order": 2, "label": "Identity Differentiation", "duration": 10, "instruction": "Notice what''s yours and what isn''t. This feeling — is it your reaction, or the room''s? Let what isn''t yours stay outside you." },
      { "order": 3, "label": "Re-establish", "duration": 13, "instruction": "Let your own baseline come back into focus. The situation hasn''t changed. Your relationship to it has." }
    ]'::jsonb,
    'perception',
    'working_model'
  ),
  (
    'heart-coherence-switch',
    'The Heart Coherence Switch',
    'Emergency grounding when a situation feels like too much to process at once.',
    'hrv_coherence',
    45,
    '[
      { "order": 1, "label": "Settle", "duration": 5, "instruction": "Bring your attention to the center of your chest." },
      { "order": 2, "label": "Breathe: Cycle 1", "duration": 10, "instruction": "Inhale slowly. Silently think: I return. Exhale slowly. Silently think: I align." },
      { "order": 3, "label": "Breathe: Cycle 2", "duration": 10, "instruction": "Inhale. I return. Exhale. I align." },
      { "order": 4, "label": "Breathe: Cycle 3", "duration": 10, "instruction": "Inhale. I return. Exhale. I align." },
      { "order": 5, "label": "Close", "duration": 10, "instruction": "Let your breath return to normal. Notice anything that''s shifted, even slightly." }
    ]'::jsonb,
    'internal_state',
    'established'
  ),
  (
    'irp',
    'Instant Realignment Protocol',
    'Your foundational reset. Learn this one first — it underlies most of the others.',
    'vagal_activation',
    50,
    '[
      { "order": 1, "label": "Heart Center", "duration": 5, "instruction": "Place a hand behind your sternum, or just bring attention there." },
      { "order": 2, "label": "Slow the Field", "duration": 10, "instruction": "Let whatever feels fast or scattered inside settle. No need to force it — just let it slow." },
      { "order": 3, "label": "Breathe Upward", "duration": 25, "instruction": "Take three deep breaths. On each inhale, imagine the breath rising from your chest toward the top of your head." },
      { "order": 4, "label": "State Command", "duration": 10, "instruction": "Say, silently or aloud: back to baseline. This is an instruction to yourself, not a hope." }
    ]'::jsonb,
    'internal_state',
    'working_model'
  ),
  (
    'full-body-flush',
    'Full-Body Frequency Flush',
    'Release accumulated tension after an intense stretch — a hard conversation, a draining day, back-to-back meetings.',
    'vagal_activation',
    150,
    '[
      { "order": 1, "label": "Heart Center", "duration": 10, "instruction": "Place a hand on your chest. Take one breath here before starting the scan." },
      { "order": 2, "label": "Body Scan", "duration": 40, "instruction": "Move your attention from the top of your head down to your feet. Notice anywhere that feels tight, heavy, or tense. No need to fix it yet — just notice." },
      { "order": 3, "label": "Breathe Into It", "duration": 50, "instruction": "Return to the tightest spot you noticed. Breathe into it a few times, like you''re sending the breath there directly." },
      { "order": 4, "label": "Hands on Heart", "duration": 30, "instruction": "Place both hands over your heart. Take five slow, deep breaths." },
      { "order": 5, "label": "Close", "duration": 20, "instruction": "Let your hands drop. Take one more breath. Notice what''s different from when you started." }
    ]'::jsonb,
    'internal_state',
    'working_model'
  ),
  (
    'timeline-lock-in',
    'The Highest Timeline Lock-In',
    'Set direction for the day, or reset direction mid-day after it''s gone sideways.',
    'dmn_deactivation',
    75,
    '[
      { "order": 1, "label": "Posture", "duration": 5, "instruction": "Sit or stand upright. Let your spine lengthen slightly." },
      { "order": 2, "label": "Heart Field", "duration": 10, "instruction": "Bring attention to your chest. Take a few slow breaths here." },
      { "order": 3, "label": "Choose", "duration": 15, "instruction": "Ask yourself: what kind of day do I want this to be? Not what will happen — how do I want to show up?" },
      { "order": 4, "label": "Picture It", "duration": 20, "instruction": "Picture yourself moving through today at your best. Notice how you''re speaking, moving, responding to friction." },
      { "order": 5, "label": "Step In", "duration": 15, "instruction": "Let that version feel less like an image and more like a state you''re already in." },
      { "order": 6, "label": "Hold", "duration": 10, "instruction": "Hold this for a few more seconds before you move on." }
    ]'::jsonb,
    'decision',
    'working_model'
  ),
  (
    'micro-alignment-cues',
    'Five Micro-Alignment Cues',
    'The fastest tools you have. Use any one of these in the middle of anything.',
    'vagal_activation',
    15,
    '[
      { "order": 1, "label": "Sternum Touch", "duration": 3, "instruction": "Touch your sternum briefly. That''s it." },
      { "order": 2, "label": "Spinal Extension", "duration": 3, "instruction": "Lengthen your spine, like a string is pulling the crown of your head up." },
      { "order": 3, "label": "Sharp Inhale", "duration": 3, "instruction": "Take one deliberate, deep breath in through your nose." },
      { "order": 4, "label": "Tongue Release", "duration": 3, "instruction": "Notice if your tongue is pressed to the roof of your mouth. Let it drop." },
      { "order": 5, "label": "Shoulder Release", "duration": 3, "instruction": "Drop your shoulders away from your ears." }
    ]'::jsonb,
    'perception',
    'established'
  )
on conflict(slug) do update
set
  name = excluded.name,
  purpose = excluded.purpose,
  mechanism = excluded.mechanism,
  duration_seconds = excluded.duration_seconds,
  steps = excluded.steps,
  framework_node = excluded.framework_node,
  science_tier = excluded.science_tier;
