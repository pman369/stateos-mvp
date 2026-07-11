-- stateOS — Initial Database Schema Migration
-- Matches §4.1, §4.2, §4.3 of stateOS_Technical_Specification_v2.md
-- Incorporates profiles table and theme additions from stateOS_Settings_Profile_Plan.md

-- 1. Profiles Table (user identity-facing data, one row per auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,                    -- Supabase Storage reference
  signature_statement text,           -- "I am ___" statement
  bio text,                           -- short personal regulation intent
  member_since timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. User Preferences (behavioral settings)
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminder_morning_time time default '07:00',
  reminder_afternoon_time time default '13:00',
  reminder_evening_time time default '21:00',
  reminders_enabled boolean not null default true,
  preferred_units text not null default 'metric',
  timezone text not null default 'UTC',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  analytics_opt_in boolean not null default true,
  data_sharing_research boolean not null default false
);

-- 3. State Audits (the core check-in record)
create table public.state_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  energy smallint not null check (energy between 1 and 5),
  clarity smallint not null check (clarity between 1 and 5),
  emotional_stability smallint not null check (emotional_stability between 1 and 5),
  identity_alignment smallint not null check (identity_alignment between 1 and 5),
  environmental_match smallint not null check (environmental_match between 1 and 5),
  composite_score numeric generated always as (
    (energy + clarity + emotional_stability + identity_alignment + environmental_match) / 5.0
  ) stored,
  drift_flag boolean generated always as (
    energy >= 4 or clarity >= 4 or emotional_stability >= 4
    or identity_alignment >= 4 or environmental_match >= 4
  ) stored,
  note text,
  created_at timestamptz not null default now()
);

-- 4. Drift Events (logged autonomic disruptions, opens a Recovery Window)
create table public.drift_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state_audit_id uuid references public.state_audits(id) on delete set null,
  trigger_source text check (trigger_source in
    ('environment', 'perception', 'internal_state', 'identity', 'behavior', 'unspecified')),
  trigger_note text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  recovery_window_seconds integer generated always as (
    extract(epoch from (resolved_at - detected_at))::integer
  ) stored,
  recovery_tier text generated always as (
    case
      when resolved_at is null then null
      when extract(epoch from (resolved_at - detected_at)) <= 60 then 'instant'
      when extract(epoch from (resolved_at - detected_at)) <= 300 then 'rapid'
      when extract(epoch from (resolved_at - detected_at)) <= 1800 then 'standard'
      when extract(epoch from (resolved_at - detected_at)) <= 7200 then 'delayed'
      else 'extended'
    end
  ) stored
);

-- 5. Protocols Reference Table (static reference table seeded at launch)
create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  purpose text not null,
  mechanism text not null,
  duration_seconds integer not null,
  steps jsonb not null,
  framework_node text not null check (framework_node in
    ('environment', 'perception', 'internal_state', 'identity', 'decision', 'behavior', 'feedback')),
  science_tier text not null check (science_tier in ('established', 'working_model')),
  created_at timestamptz not null default now()
);

-- 6. Protocol Sessions (a single timed run of a protocol)
create table public.protocol_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  protocol_id uuid references public.protocols(id) on delete cascade,
  drift_event_id uuid references public.drift_events(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  completed boolean not null default false,
  pre_state_rating smallint check (pre_state_rating between 1 and 10),
  post_state_rating smallint check (post_state_rating between 1 and 10)
);

-- 7. Identity Anchors (sensory reference points for signature identity alignment)
create table public.identity_anchors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  anchor_type text check (anchor_type in ('word', 'gesture', 'breath_pattern', 'memory', 'voice_note')),
  description text not null,
  audio_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. Daily Architecture Logs (morning / afternoon / evening completion logs)
create table public.daily_architecture_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  morning_completed boolean not null default false,
  afternoon_completed boolean not null default false,
  evening_completed boolean not null default false,
  morning_completed_at timestamptz,
  afternoon_completed_at timestamptz,
  evening_completed_at timestamptz,
  unique(user_id, log_date)
);

-- 9. Diagnostic Sessions (decision tree answering flow logs)
create table public.diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drift_event_id uuid references public.drift_events(id) on delete set null,
  answers jsonb not null,
  resolved_node text,
  recommended_protocol_id uuid references public.protocols(id),
  created_at timestamptz not null default now()
);


-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.state_audits enable row level security;
alter table public.drift_events enable row level security;
alter table public.protocol_sessions enable row level security;
alter table public.identity_anchors enable row level security;
alter table public.daily_architecture_logs enable row level security;
alter table public.diagnostic_sessions enable row level security;

-- Protocols are readable by all authenticated users, modifications restricted
alter table public.protocols enable row level security;
create policy "Anyone authenticated can read protocols"
  on public.protocols for select
  using (auth.role() = 'authenticated');

-- User tables are restricted to rows where auth.uid() = user_id
create policy "Users can CRUD their own profile"
  on public.profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own audits"
  on public.state_audits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own drift events"
  on public.drift_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own protocol sessions"
  on public.protocol_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own anchors"
  on public.identity_anchors for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own daily architecture logs"
  on public.daily_architecture_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD their own diagnostic sessions"
  on public.diagnostic_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- PERFORMANCE INDEXES
create index idx_state_audits_user_created on public.state_audits(user_id, created_at desc);
create index idx_drift_events_user_detected on public.drift_events(user_id, detected_at desc);
create index idx_drift_events_unresolved on public.drift_events(user_id) where resolved_at is null;
create index idx_protocol_sessions_user on public.protocol_sessions(user_id, started_at desc);
create index idx_daily_architecture_user_date on public.daily_architecture_logs(user_id, log_date desc);


-- TRIGGERS FOR NEW USER SIGNUP
create or replace function public.handle_new_user()
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
