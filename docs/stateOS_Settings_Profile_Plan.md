# stateOS — Settings & Profile Plan

Extends `stateOS_Technical_Specification_v2.md`. Covers the `/profile` and `/settings` surfaces: schema additions, routes, components, and flows.

---

## 1. Scope

Two distinct surfaces, often conflated but kept separate here:

- **Profile** — who the user is inside stateOS: identity, stats, signature statement. Outward-facing (to future features like sharing a Recovery Window milestone), reflects progress.
- **Settings** — how the app behaves: reminders, units, privacy, account/data control. Functional, not reflective.

---

## 2. Schema Additions

`user_preferences` (already in spec) stays focused on **behavioral** settings. A new `profiles` table holds **identity** data, kept separate so profile edits don't touch reminder/notification logic and vice versa.

```sql
-- 9. Profiles — identity-facing data, one row per user
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,                    -- Supabase Storage reference
  signature_statement text,           -- "I am ___" from Daily Architecture Identity Activation
  bio text,                           -- optional short personal intention/context
  member_since timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view and edit their own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create a blank profile row on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, member_since)
  values (new.id, now());
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Extend `user_preferences` with a few settings fields not yet covered:

```sql
alter table user_preferences
  add column theme text not null default 'system' check (theme in ('system','light','dark')),
  add column analytics_opt_in boolean not null default true,
  add column data_sharing_research boolean not null default false; -- explicit opt-in, off by default
```

---

## 3. Profile Surface

### 3.1 Route
```
/(app)/profile
```

### 3.2 Content
- **Header**: avatar, display name (editable inline), member-since date.
- **Signature Statement**: the "I am ___" line from Daily Architecture Identity Activation — editable here, and this is the single source of truth the morning flow pulls from (avoids duplicate data entry between onboarding, profile, and daily practice).
- **Stats Summary** (read-only, computed):
  - Current Daily Architecture streak (days)
  - Average Recovery Window (30-day rolling)
  - Total protocol sessions completed
  - Most-used protocol
  - Most common drift trigger source
- **Identity Anchors** — shortcut link into `/identity/anchors`, not duplicated here.

### 3.3 Components
- `ProfileHeader` — avatar upload (Supabase Storage, client-side crop before upload), inline-editable display name.
- `SignatureStatementEditor` — single text field, saves to `profiles.signature_statement`, shown read-only inside the Daily Architecture morning flow.
- `StatsSummaryGrid` — pulls from existing `drift_events`, `protocol_sessions`, `daily_architecture_logs` tables via a single aggregated query (see §3.4); no new tables needed, this is a read view over existing data.

### 3.4 Stats Query (single round-trip, avoid N+1)

```sql
-- supabase view: profile_stats
create view profile_stats as
select
  p.user_id,
  coalesce(streak.current_streak, 0) as current_streak,
  coalesce(rw.avg_recovery_window_30d, null) as avg_recovery_window_30d,
  coalesce(ps.total_sessions, 0) as total_sessions,
  ps.top_protocol_slug,
  de.top_trigger_source
from profiles p
left join lateral (
  select count(*) as current_streak
  from daily_architecture_logs d
  where d.user_id = p.user_id
    and d.morning_completed and d.afternoon_completed and d.evening_completed
    and d.log_date >= current_date - interval '90 days'
    -- streak calculation logic: consecutive days back from today, break on gap
) streak on true
left join lateral (
  select avg(recovery_window_seconds) as avg_recovery_window_30d
  from drift_events de2
  where de2.user_id = p.user_id
    and de2.resolved_at is not null
    and de2.detected_at >= now() - interval '30 days'
) rw on true
left join lateral (
  select count(*) as total_sessions,
    (select pr.slug from protocol_sessions ps2
     join protocols pr on pr.id = ps2.protocol_id
     where ps2.user_id = p.user_id and ps2.completed
     group by pr.slug order by count(*) desc limit 1) as top_protocol_slug
  from protocol_sessions ps2
  where ps2.user_id = p.user_id and ps2.completed
) ps on true
left join lateral (
  select trigger_source as top_trigger_source
  from drift_events de3
  where de3.user_id = p.user_id and trigger_source is not null
  group by trigger_source order by count(*) desc limit 1
) de on true;
```
(Streak logic shown simplified — implement actual consecutive-day-break detection in the Edge Function or a Postgres function rather than the view if it needs to be exact; the view above is a reasonable v1 approximation for MVP.)

---

## 4. Settings Surface

### 4.1 Route Structure
```
/(app)/settings
  /account          -- email, password, delete account
  /reminders          -- Daily Architecture notification times, on/off
  /preferences         -- theme, units, timezone
  /privacy              -- data export, analytics opt-in, research sharing opt-in
```

Top-level `/settings` is a simple list linking to the four sub-pages — no need for a mega-form on one screen.

### 4.2 `/settings/account`
- Change email (Supabase Auth flow, requires re-verification)
- Change password
- Connected OAuth providers (view only in MVP)
- **Danger zone**: Delete account — see §5

### 4.3 `/settings/reminders`
- Three time pickers (morning/afternoon/evening), bound to `user_preferences.reminder_*_time`
- Master toggle: `reminders_enabled`
- Timezone selector (auto-detected on first load via `Intl.DateTimeFormat().resolvedOptions().timeZone`, editable)

### 4.4 `/settings/preferences`
- Theme: system / light / dark (`user_preferences.theme`)
- Units: metric / imperial (`user_preferences.preferred_units`) — mostly unused in MVP but kept for future biometric integrations (§2 deferred scope in main spec)

### 4.5 `/settings/privacy`
- **Export my data**: triggers `export-user-data` Edge Function, emails a JSON download link (Supabase Storage signed URL, expires in 24h)
- **Analytics opt-in** toggle (`analytics_opt_in`) — product usage analytics, off does not affect core app function
- **Research data sharing** toggle (`data_sharing_research`) — explicit, off by default, separate from analytics; only relevant if/when aggregated anonymized research use is ever built, but the opt-in field should exist from day one rather than being retrofitted
- Link to privacy policy / terms (static pages, not covered in this plan)

---

## 5. Account Deletion Flow

Given how much personal reflective data this app holds (Identity Anchors, drift triggers, signature statements), deletion needs to be real, not soft.

```
supabase/functions/delete-account/index.ts
```
1. Require re-authentication (password confirm or re-login) before this function accepts the request — never allow deletion off a stale session token alone.
2. Delete Storage objects first (avatars, voice notes) — `identity_anchors.audio_url`, `profiles.avatar_url`.
3. Delete `auth.users` row — all tables in §4.1 of the main spec cascade automatically via `on delete cascade`, so no manual table-by-table deletion needed as long as every FK is correctly set to cascade (double-check this at migration time; a missing cascade is the most common way deletion flows silently leave orphaned rows).
4. Send confirmation email.

UI: two-step confirmation (type "delete" to confirm), not a single button — this is genuinely destructive and the data is sensitive.

---

## 6. Components Summary

| Component | Purpose |
|---|---|
| `ProfileHeader` | Avatar + display name, inline edit |
| `SignatureStatementEditor` | Single source of truth for "I am ___", feeds Daily Architecture |
| `StatsSummaryGrid` | Read-only stat cards from `profile_stats` view |
| `SettingsListItem` | Reusable row for the `/settings` index (icon, label, chevron) |
| `TimePickerField` | Used in `/settings/reminders`, three instances |
| `ThemeToggle` | System/light/dark segmented control |
| `DangerZoneCard` | Delete account, styled distinctly (red border, requires confirmation modal) |
| `ExportDataButton` | Triggers export function, shows loading + "check your email" state |

---

## 7. Build Order

1. `profiles` table + trigger + RLS (§2)
2. `user_preferences` column additions (§2)
3. `profile_stats` view (§3.4) — validate streak logic against seeded test data before trusting it in UI
4. `/profile` route + `ProfileHeader` + `StatsSummaryGrid`
5. `/settings` index + four sub-routes, wire to existing `user_preferences` fields first (reminders, preferences already had a table — this is mostly UI at this point)
6. `export-user-data` Edge Function
7. `delete-account` Edge Function + two-step confirmation UI — test cascade deletion thoroughly against a seeded throwaway account before shipping
8. Wire `SignatureStatementEditor` into the existing Daily Architecture morning flow so it reads from `profiles.signature_statement` instead of any separate onboarding-only copy

---

## 8. Open Questions

- Should avatar upload support be in MVP, or is a generated initial-based avatar (no upload, no Storage dependency) good enough for v1? Cutting upload removes a Storage/RLS surface to secure and is a reasonable MVP trim.
- Does "Research data sharing" need actual downstream infrastructure before MVP, or is it fine to add the toggle now (defaulted off, doing nothing) and build the pipeline later once there's a real reason to collect it?
- Account deletion grace period: immediate hard-delete, or a 14-day soft-delete window (common pattern, gives users a recovery path from accidental deletion) — recommend soft-delete with a scheduled hard-delete cron given the sensitivity of the data, worth the added complexity. (This decision also determines the bracketed grace-period figure referenced in `stateOS_Notification_Microcopy.md` §6.)
