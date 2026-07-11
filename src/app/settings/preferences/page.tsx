"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Globe, Palette, Scaling } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, UserPreferences } from "../../../components/utils/db";

export default function PreferencesSettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleUpdate = async (key: keyof UserPreferences, value: any) => {
    if (!prefs) return;
    try {
      const updated = await db.updatePreferences({ [key]: value });
      setPrefs(updated);
      
      // If theme updated, trigger theme class on html document if needed (MVP system defaults)
      if (key === "theme") {
        alert(`Theme set to ${value}.`);
      }
    } catch (e) {
      alert("Failed to save preference.");
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
          <h1 className="font-serif text-2xl font-bold text-paper">Preferences</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Configure system themes and timezone formats
          </p>
        </div>

        {/* Configurations List */}
        <div className="bg-ink-raised border border-white/5 rounded-xl p-6 space-y-6 shadow-md">
          {/* Theme Selector */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center text-xs font-mono text-ash uppercase tracking-wider">
              <Palette size={14} className="text-signal" />
              Interface Theme
            </div>
            <div className="grid grid-cols-3 gap-2 bg-ink p-1 rounded-lg border border-white/5">
              {["system", "light", "dark"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleUpdate("theme", t)}
                  className={`py-2 text-xs font-mono font-medium rounded capitalize transition-all ${
                    prefs.theme === t
                      ? "bg-signal text-ink shadow font-semibold"
                      : "text-ash hover:text-paper"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone Selector */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center text-xs font-mono text-ash uppercase tracking-wider">
              <Globe size={14} className="text-signal" />
              Active Timezone
            </div>
            <div className="flex items-center gap-4 bg-ink p-3 rounded-lg border border-white/5">
              <input
                type="text"
                value={prefs.timezone}
                onChange={(e) => handleUpdate("timezone", e.target.value)}
                className="flex-1 bg-ink-raised border border-white/5 text-xs text-paper rounded p-2 focus:outline-none focus:border-signal/50 font-mono"
              />
            </div>
            <p className="text-[10px] text-ash/80 leading-normal">
              Used to align push notifications and cron job distributions to your local time. Timezones auto-detect on client launch.
            </p>
          </div>

          {/* Units Selector */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center text-xs font-mono text-ash uppercase tracking-wider">
              <Scaling size={14} className="text-signal" />
              Measurement Units
            </div>
            <div className="grid grid-cols-2 gap-2 bg-ink p-1 rounded-lg border border-white/5">
              {[
                { label: "Metric (celsius, km)", value: "metric" },
                { label: "Imperial (fahrenheit, mi)", value: "imperial" }
              ].map((unit) => (
                <button
                  key={unit.value}
                  onClick={() => handleUpdate("preferred_units", unit.value)}
                  className={`py-2 text-xs font-mono font-medium rounded transition-all ${
                    prefs.preferred_units === unit.value
                      ? "bg-signal text-ink shadow font-semibold"
                      : "text-ash hover:text-paper"
                  }`}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
