import { createClient } from "@supabase/supabase-js";

// Static reference data for protocols, from stateOS_Protocol_Content_Library.md
export const STATIC_PROTOCOLS = [
  {
    slug: "33-second-reset",
    name: "The 33-Second Reset",
    purpose: "Fast state restoration when you notice drift and need to act immediately.",
    mechanism: "dmn_deactivation",
    duration_seconds: 33,
    framework_node: "perception",
    science_tier: "working_model",
    steps: [
      {
        order: 1,
        label: "Spinal Alignment",
        duration: 10,
        instruction: "Bring attention to your spine. Feel it as one line, base to crown. Sit or stand a little taller."
      },
      {
        order: 2,
        label: "Identity Differentiation",
        duration: 10,
        instruction: "Notice what's yours and what isn't. This feeling — is it your reaction, or the room's? Let what isn't yours stay outside you."
      },
      {
        order: 3,
        label: "Re-establish",
        duration: 13,
        instruction: "Let your own baseline come back into focus. The situation hasn't changed. Your relationship to it has."
      }
    ]
  },
  {
    slug: "heart-coherence-switch",
    name: "The Heart Coherence Switch",
    purpose: "Emergency grounding when a situation feels like too much to process at once.",
    mechanism: "hrv_coherence",
    duration_seconds: 45,
    framework_node: "internal_state",
    science_tier: "established",
    steps: [
      {
        order: 1,
        label: "Settle",
        duration: 5,
        instruction: "Bring your attention to the center of your chest."
      },
      {
        order: 2,
        label: "Breathe: Cycle 1",
        duration: 10,
        instruction: "Inhale slowly. Silently think: I return. Exhale slowly. Silently think: I align."
      },
      {
        order: 3,
        label: "Breathe: Cycle 2",
        duration: 10,
        instruction: "Inhale. I return. Exhale. I align."
      },
      {
        order: 4,
        label: "Breathe: Cycle 3",
        duration: 10,
        instruction: "Inhale. I return. Exhale. I align."
      },
      {
        order: 5,
        label: "Close",
        duration: 10,
        instruction: "Let your breath return to normal. Notice anything that's shifted, even slightly."
      }
    ]
  },
  {
    slug: "irp",
    name: "Instant Realignment Protocol",
    purpose: "Your foundational reset. Learn this one first — it underlies most of the others.",
    mechanism: "vagal_activation",
    duration_seconds: 50,
    framework_node: "internal_state",
    science_tier: "working_model",
    steps: [
      {
        order: 1,
        label: "Heart Center",
        duration: 5,
        instruction: "Place a hand behind your sternum, or just bring attention there."
      },
      {
        order: 2,
        label: "Slow the Field",
        duration: 10,
        instruction: "Let whatever feels fast or scattered inside settle. No need to force it — just let it slow."
      },
      {
        order: 3,
        label: "Breathe Upward",
        duration: 25,
        instruction: "Take three deep breaths. On each inhale, imagine the breath rising from your chest toward the top of your head."
      },
      {
        order: 4,
        label: "State Command",
        duration: 10,
        instruction: "Say, silently or aloud: back to baseline. This is an instruction to yourself, not a hope."
      }
    ]
  },
  {
    slug: "full-body-flush",
    name: "Full-Body Frequency Flush",
    purpose: "Release accumulated tension after an intense stretch — a hard conversation, a draining day, back-to-back meetings.",
    mechanism: "vagal_activation",
    duration_seconds: 150,
    framework_node: "internal_state",
    science_tier: "working_model",
    steps: [
      {
        order: 1,
        label: "Heart Center",
        duration: 10,
        instruction: "Place a hand on your chest. Take one breath here before starting the scan."
      },
      {
        order: 2,
        label: "Body Scan",
        duration: 40,
        instruction: "Move your attention from the top of your head down to your feet. Notice anywhere that feels tight, heavy, or tense. No need to fix it yet — just notice."
      },
      {
        order: 3,
        label: "Breathe Into It",
        duration: 50,
        instruction: "Return to the tightest spot you noticed. Breathe into it a few times, like you're sending the breath there directly."
      },
      {
        order: 4,
        label: "Hands on Heart",
        duration: 30,
        instruction: "Place both hands over your heart. Take five slow, deep breaths."
      },
      {
        order: 5,
        label: "Close",
        duration: 20,
        instruction: "Let your hands drop. Take one more breath. Notice what's different from when you started."
      }
    ]
  },
  {
    slug: "timeline-lock-in",
    name: "The Highest Timeline Lock-In",
    purpose: "Set direction for the day, or reset direction mid-day after it's gone sideways.",
    mechanism: "dmn_deactivation",
    duration_seconds: 75,
    framework_node: "decision",
    science_tier: "working_model",
    steps: [
      {
        order: 1,
        label: "Posture",
        duration: 5,
        instruction: "Sit or stand upright. Let your spine lengthen slightly."
      },
      {
        order: 2,
        label: "Heart Field",
        duration: 10,
        instruction: "Bring attention to your chest. Take a few slow breaths here."
      },
      {
        order: 3,
        label: "Choose",
        duration: 15,
        instruction: "Ask yourself: what kind of day do I want this to be? Not what will happen — how do I want to show up?"
      },
      {
        order: 4,
        label: "Picture It",
        duration: 20,
        instruction: "Picture yourself moving through today at your best. Notice how you're speaking, moving, responding to friction."
      },
      {
        order: 5,
        label: "Step In",
        duration: 15,
        instruction: "Let that version feel less like an image and more like a state you're already in."
      },
      {
        order: 6,
        label: "Hold",
        duration: 10,
        instruction: "Hold this for a few more seconds before you move on."
      }
    ]
  },
  {
    slug: "micro-alignment-cues",
    name: "Five Micro-Alignment Cues",
    purpose: "The fastest tools you have. Use any one of these in the middle of anything.",
    mechanism: "vagal_activation",
    duration_seconds: 15,
    framework_node: "perception",
    science_tier: "established",
    steps: [
      {
        order: 1,
        label: "Sternum Touch",
        duration: 3,
        instruction: "Touch your sternum briefly. That's it."
      },
      {
        order: 2,
        label: "Spinal Extension",
        duration: 3,
        instruction: "Lengthen your spine, like a string is pulling the crown of your head up."
      },
      {
        order: 3,
        label: "Sharp Inhale",
        duration: 3,
        instruction: "Take one deliberate, deep breath in through your nose."
      },
      {
        order: 4,
        label: "Tongue Release",
        duration: 3,
        instruction: "Notice if your tongue is pressed to the roof of your mouth. Let it drop."
      },
      {
        order: 5,
        label: "Shoulder Release",
        duration: 3,
        instruction: "Drop your shoulders away from your ears."
      }
    ]
  }
];

// Helper to determine active mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isCloudMode = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isCloudMode
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// LocalStorage helpers
const LS_PREFIX = "stateos_db_";

function getLocalData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    // console.error(e);
  }
}

// Database Interfaces
export interface StateAudit {
  id: string;
  energy: number;
  clarity: number;
  emotional_stability: number;
  identity_alignment: number;
  environmental_match: number;
  composite_score: number;
  drift_flag: boolean;
  note?: string;
  created_at: string;
}

export interface DriftEvent {
  id: string;
  state_audit_id?: string;
  trigger_source: "environment" | "perception" | "internal_state" | "identity" | "behavior" | "unspecified";
  trigger_note?: string;
  detected_at: string;
  resolved_at?: string;
  recovery_window_seconds?: number;
  recovery_tier?: "instant" | "rapid" | "standard" | "delayed" | "extended";
}

export interface ProtocolSession {
  id: string;
  protocol_id: string;
  protocol_slug: string;
  drift_event_id?: string;
  started_at: string;
  completed_at?: string;
  completed: boolean;
  pre_state_rating?: number;
  post_state_rating?: number;
}

export interface IdentityAnchor {
  id: string;
  label: string;
  anchor_type: "word" | "gesture" | "breath_pattern" | "memory" | "voice_note";
  description: string;
  audio_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyArchitectureLog {
  id: string;
  log_date: string;
  morning_completed: boolean;
  afternoon_completed: boolean;
  evening_completed: boolean;
  morning_completed_at?: string;
  afternoon_completed_at?: string;
  evening_completed_at?: string;
}

export interface UserPreferences {
  reminder_morning_time: string;
  reminder_afternoon_time: string;
  reminder_evening_time: string;
  reminders_enabled: boolean;
  preferred_units: "metric" | "imperial";
  timezone: string;
  theme: "system" | "light" | "dark";
  analytics_opt_in: boolean;
  data_sharing_research: boolean;
}

export interface UserProfile {
  display_name: string;
  avatar_url?: string;
  signature_statement: string;
  bio?: string;
  member_since: string;
}

// Default States
const DEFAULT_PREFS: UserPreferences = {
  reminder_morning_time: "07:00",
  reminder_afternoon_time: "13:00",
  reminder_evening_time: "21:00",
  reminders_enabled: true,
  preferred_units: "metric",
  timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
  theme: "system",
  analytics_opt_in: true,
  data_sharing_research: false,
};

const DEFAULT_PROFILE: UserProfile = {
  display_name: "Seeker",
  signature_statement: "",
  bio: "",
  member_since: new Date().toISOString(),
};

// Core db actions
export const db = {
  isCloudMode: () => isCloudMode,

  // 1. STATE AUDITS
  async getAudits(): Promise<StateAudit[]> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("state_audits")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData<StateAudit[]>("state_audits", []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  },

  async createAudit(audit: Omit<StateAudit, "id" | "composite_score" | "drift_flag" | "created_at">): Promise<StateAudit> {
    const composite = (audit.energy + audit.clarity + audit.emotional_stability + audit.identity_alignment + audit.environmental_match) / 5.0;
    const isDrift = audit.energy >= 4 || audit.clarity >= 4 || audit.emotional_stability >= 4 || audit.identity_alignment >= 4 || audit.environmental_match >= 4;

    const newAudit: StateAudit = {
      ...audit,
      id: crypto.randomUUID(),
      composite_score: parseFloat(composite.toFixed(2)),
      drift_flag: isDrift,
      created_at: new Date().toISOString(),
    };

    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("state_audits")
        .insert(newAudit)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const audits = getLocalData<StateAudit[]>("state_audits", []);
      audits.push(newAudit);
      setLocalData("state_audits", audits);
      return newAudit;
    }
  },

  // 2. DRIFT EVENTS
  async getDriftEvents(): Promise<DriftEvent[]> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("drift_events")
        .select("*")
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData<DriftEvent[]>("drift_events", []).sort(
        (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
      );
    }
  },

  async createDriftEvent(event: Omit<DriftEvent, "id" | "detected_at">): Promise<DriftEvent> {
    const newEvent: DriftEvent = {
      ...event,
      id: crypto.randomUUID(),
      detected_at: new Date().toISOString(),
    };

    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("drift_events")
        .insert(newEvent)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const events = getLocalData<DriftEvent[]>("drift_events", []);
      events.push(newEvent);
      setLocalData("drift_events", events);
      return newEvent;
    }
  },

  async resolveDriftEvent(id: string, resolvedAtString?: string): Promise<DriftEvent> {
    const resolved_at = resolvedAtString || new Date().toISOString();

    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("drift_events")
        .update({ resolved_at })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const events = getLocalData<DriftEvent[]>("drift_events", []);
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        const ev = events[idx];
        const detTime = new Date(ev.detected_at).getTime();
        const resTime = new Date(resolved_at).getTime();
        const diffSecs = Math.max(0, Math.floor((resTime - detTime) / 1000));

        let tier: DriftEvent["recovery_tier"] = "extended";
        if (diffSecs <= 60) tier = "instant";
        else if (diffSecs <= 300) tier = "rapid";
        else if (diffSecs <= 1800) tier = "standard";
        else if (diffSecs <= 7200) tier = "delayed";

        const updated: DriftEvent = {
          ...ev,
          resolved_at,
          recovery_window_seconds: diffSecs,
          recovery_tier: tier,
        };

        events[idx] = updated;
        setLocalData("drift_events", events);
        return updated;
      }
      throw new Error("Drift event not found");
    }
  },

  // 3. PROTOCOL SESSIONS
  async getProtocolSessions(): Promise<ProtocolSession[]> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("protocol_sessions")
        .select("*")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData<ProtocolSession[]>("protocol_sessions", []).sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
    }
  },

  async createProtocolSession(session: Omit<ProtocolSession, "id" | "started_at">): Promise<ProtocolSession> {
    const newSession: ProtocolSession = {
      ...session,
      id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
    };

    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("protocol_sessions")
        .insert(newSession)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const sessions = getLocalData<ProtocolSession[]>("protocol_sessions", []);
      sessions.push(newSession);
      setLocalData("protocol_sessions", sessions);
      return newSession;
    }
  },

  // 4. IDENTITY ANCHORS
  async getIdentityAnchors(): Promise<IdentityAnchor[]> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("identity_anchors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData<IdentityAnchor[]>("identity_anchors", []);
    }
  },

  async createIdentityAnchor(anchor: Omit<IdentityAnchor, "id" | "created_at" | "is_active">): Promise<IdentityAnchor> {
    const newAnchor: IdentityAnchor = {
      ...anchor,
      id: crypto.randomUUID(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("identity_anchors")
        .insert(newAnchor)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const anchors = getLocalData<IdentityAnchor[]>("identity_anchors", []);
      anchors.push(newAnchor);
      setLocalData("identity_anchors", anchors);
      return newAnchor;
    }
  },

  async updateIdentityAnchor(id: string, updates: Partial<Omit<IdentityAnchor, "id" | "created_at">>): Promise<IdentityAnchor> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("identity_anchors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const anchors = getLocalData<IdentityAnchor[]>("identity_anchors", []);
      const idx = anchors.findIndex((a) => a.id === id);
      if (idx !== -1) {
        const updated = { ...anchors[idx], ...updates };
        anchors[idx] = updated;
        setLocalData("identity_anchors", anchors);
        return updated;
      }
      throw new Error("Identity anchor not found");
    }
  },

  async deleteIdentityAnchor(id: string): Promise<boolean> {
    if (isCloudMode) {
      const { error } = await supabase!
        .from("identity_anchors")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } else {
      const anchors = getLocalData<IdentityAnchor[]>("identity_anchors", []);
      const filtered = anchors.filter((a) => a.id !== id);
      setLocalData("identity_anchors", filtered);
      return true;
    }
  },

  // 5. DAILY ARCHITECTURE LOGS
  async getDailyArchitectureLogs(): Promise<DailyArchitectureLog[]> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("daily_architecture_logs")
        .select("*")
        .order("log_date", { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocalData<DailyArchitectureLog[]>("daily_architecture_logs", []);
    }
  },

  async logDailyArchitecture(segment: "morning" | "afternoon" | "evening", dateStr?: string): Promise<DailyArchitectureLog> {
    const logDate = dateStr || new Date().toISOString().split("T")[0];
    const timestamp = new Date().toISOString();

    if (isCloudMode) {
      // Supabase upsert logic
      const { data: existing } = await supabase!
        .from("daily_architecture_logs")
        .select("*")
        .eq("log_date", logDate)
        .maybeSingle();

      const updates: any = {
        log_date: logDate,
      };
      updates[`${segment}_completed`] = true;
      updates[`${segment}_completed_at`] = timestamp;

      let result;
      if (existing) {
        const { data, error } = await supabase!
          .from("daily_architecture_logs")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase!
          .from("daily_architecture_logs")
          .insert({
            ...updates,
            id: crypto.randomUUID(),
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      return result;
    } else {
      const logs = getLocalData<DailyArchitectureLog[]>("daily_architecture_logs", []);
      let idx = logs.findIndex((l) => l.log_date === logDate);

      let logRecord: DailyArchitectureLog;

      if (idx !== -1) {
        logRecord = {
          ...logs[idx],
          [`${segment}_completed`]: true,
          [`${segment}_completed_at`]: timestamp,
        };
        logs[idx] = logRecord;
      } else {
        logRecord = {
          id: crypto.randomUUID(),
          log_date: logDate,
          morning_completed: segment === "morning",
          morning_completed_at: segment === "morning" ? timestamp : undefined,
          afternoon_completed: segment === "afternoon",
          afternoon_completed_at: segment === "afternoon" ? timestamp : undefined,
          evening_completed: segment === "evening",
          evening_completed_at: segment === "evening" ? timestamp : undefined,
        };
        logs.push(logRecord);
      }

      setLocalData("daily_architecture_logs", logs);
      return logRecord;
    }
  },

  // 6. USER PREFERENCES
  async getPreferences(): Promise<UserPreferences> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("user_preferences")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data || DEFAULT_PREFS;
    } else {
      return getLocalData<UserPreferences>("user_preferences", DEFAULT_PREFS);
    }
  },

  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("user_preferences")
        .update(updates)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const current = getLocalData<UserPreferences>("user_preferences", DEFAULT_PREFS);
      const updated = { ...current, ...updates };
      setLocalData("user_preferences", updated);
      return updated;
    }
  },

  // 7. PROFILE
  async getProfile(): Promise<UserProfile> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("profiles")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data || DEFAULT_PROFILE;
    } else {
      return getLocalData<UserProfile>("user_profile", DEFAULT_PROFILE);
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isCloudMode) {
      const { data, error } = await supabase!
        .from("profiles")
        .update(updates)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const current = getLocalData<UserProfile>("user_profile", DEFAULT_PROFILE);
      const updated = { ...current, ...updates };
      setLocalData("user_profile", updated);
      return updated;
    }
  },

  // 8. DATA ADMINISTRATION (EXPORT & DELETION)
  async clearAllData(): Promise<boolean> {
    if (isCloudMode) {
      // Handled by API call or server action to delete user cascade
      return false;
    } else {
      if (typeof window !== "undefined") {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(LS_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
      return true;
    }
  },

  async getExportData(): Promise<string> {
    const audits = await this.getAudits();
    const drift = await this.getDriftEvents();
    const sessions = await this.getProtocolSessions();
    const anchors = await this.getIdentityAnchors();
    const logs = await this.getDailyArchitectureLogs();
    const prefs = await this.getPreferences();
    const profile = await this.getProfile();

    const data = {
      exported_at: new Date().toISOString(),
      profile,
      preferences: prefs,
      state_audits: audits,
      drift_events: drift,
      protocol_sessions: sessions,
      identity_anchors: anchors,
      daily_architecture_logs: logs,
    };

    return JSON.stringify(data, null, 2);
  }
};
