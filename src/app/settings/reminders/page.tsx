"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, BellOff, Loader2 } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, UserPreferences } from "../../../components/utils/db";

export default function RemindersSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }
        const data = await db.getPreferences();
        setPrefs(data);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrefs();
  }, [router]);

  const handleToggleReminders = async () => {
    if (!prefs) return;
    try {
      const updated = await db.updatePreferences({ reminders_enabled: !prefs.reminders_enabled });
      setPrefs(updated);
    } catch (e) {
      alert("Failed to toggle reminders.");
    }
  };

  const handleTimeChange = async (key: keyof UserPreferences, value: string) => {
    if (!prefs) return;
    try {
      setIsSaving(true);
      const updated = await db.updatePreferences({ [key]: value });
      setPrefs(updated);
    } catch (e) {
      alert("Failed to update reminder time.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !prefs) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ink">
        <div className="w-6 h-6 border-2 border-white/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-ink flex flex-col md:flex-row pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-8 md:py-12 space-y-6 w-full">
        {/* Navigation */}
        <div>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            System Settings
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-paper">Reminders</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Configure autonomic check-in times
          </p>
        </div>

        {/* Master Toggle Card */}
        <div className="p-5 bg-ink-raised border border-white/5 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-paper">Daily Architecture Notifications</h3>
            <p className="text-xs text-ash">
              Morning, afternoon, and evening nudges for your Daily Architecture.
            </p>
          </div>
          <button
            onClick={handleToggleReminders}
            className={`p-2.5 rounded-full border transition-all ${
              prefs.reminders_enabled
                ? "bg-signal/15 border-signal/30 text-signal hover:bg-signal/20"
                : "bg-ink border-white/5 text-ash hover:text-paper"
            }`}
            title={prefs.reminders_enabled ? "Disable Reminders" : "Enable Reminders"}
          >
            {prefs.reminders_enabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </div>

        {/* Time Pickers */}
        <div className={`p-6 bg-ink-raised border border-white/5 rounded-xl space-y-5 shadow-md transition-opacity duration-300 ${
          prefs.reminders_enabled ? "opacity-100" : "opacity-40 pointer-events-none"
        }`}>
          <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
            <h3 className="text-xs font-mono text-ash uppercase tracking-wider">Daily Segments Schedule</h3>
            {isSaving && (
              <span className="text-[10px] font-mono text-signal flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Saving...
              </span>
            )}
          </div>

          {[
            { key: "reminder_morning_time", label: "Morning check-in time", defaultVal: "07:00" },
            { key: "reminder_afternoon_time", label: "Afternoon check-in time", defaultVal: "13:00" },
            { key: "reminder_evening_time", label: "Evening check-in time", defaultVal: "21:00" }
          ].map((item) => {
            const timeVal = prefs[item.key as keyof UserPreferences] as string || item.defaultVal;

            return (
              <div key={item.key} className="flex justify-between items-center bg-ink p-3 rounded-lg border border-white/5">
                <label htmlFor={`picker-${item.key}`} className="text-xs font-serif font-semibold text-paper">
                  {item.label}
                </label>
                <input
                  id={`picker-${item.key}`}
                  type="time"
                  value={timeVal.substring(0, 5)} // Extract HH:MM if it has seconds
                  onChange={(e) => handleTimeChange(item.key as keyof UserPreferences, e.target.value)}
                  className="bg-ink-raised border border-white/5 text-xs text-paper rounded p-1.5 focus:outline-none focus:border-signal/50 font-mono"
                />
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
