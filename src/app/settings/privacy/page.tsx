"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Shield, Sparkles, Loader2 } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, UserPreferences } from "../../../components/utils/db";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

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

  const handleToggle = async (key: keyof UserPreferences, currentState: boolean) => {
    if (!prefs) return;
    try {
      const updated = await db.updatePreferences({ [key]: !currentState });
      setPrefs(updated);
    } catch (e) {
      alert("Failed to toggle preference.");
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setExportMessage("");

      // Compile data
      const jsonString = await db.getExportData();

      // Trigger client-side blob download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stateos_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Display success message matching microcopy guidelines
      setExportMessage("Your data's on its way. Check your local downloads folder in the next few seconds.");
    } catch (e) {
      alert("Error compiling data export.");
    } finally {
      setIsExporting(false);
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
          <h1 className="font-serif text-2xl font-bold text-paper">Privacy</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Control data sharing and portability logs
          </p>
        </div>

        {/* Toggles */}
        <div className="bg-ink-raised border border-white/5 rounded-xl p-6 space-y-6 shadow-md">
          
          {/* Analytics Opt In */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono text-paper uppercase tracking-wider flex items-center gap-1">
                <Shield size={12} className="text-signal" />
                Usage Analytics
              </h3>
              <p className="text-xs text-ash leading-relaxed">
                Helps us understand which parts of the app are actually useful. Never includes your check-in content, notes, or somatic descriptors.
              </p>
            </div>
            <button
              onClick={() => handleToggle("analytics_opt_in", prefs.analytics_opt_in)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                prefs.analytics_opt_in ? "bg-signal" : "bg-white/10"
              }`}
            >
              <div
                className={`bg-ink w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  prefs.analytics_opt_in ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <hr className="border-white/5" />

          {/* Research Sharing Opt In */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono text-paper uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={12} className="text-signal" />
                Anonymized Research Sharing
              </h3>
              <p className="text-xs text-ash leading-relaxed">
                Off by default. Share anonymized recovery metrics to contribute to polyvagal and cardiac coherence studies. If this ever changes, we'll ask again explicitly.
              </p>
            </div>
            <button
              onClick={() => handleToggle("data_sharing_research", prefs.data_sharing_research)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                prefs.data_sharing_research ? "bg-signal" : "bg-white/10"
              }`}
            >
              <div
                className={`bg-ink w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  prefs.data_sharing_research ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

        </div>

        {/* Data Portability / Export */}
        <div className="bg-ink-raised border border-white/5 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Data Portability</h3>
          <p className="text-xs text-ash leading-relaxed">
            In compliance with GDPR and data ownership principles, you can compile and download your entire StateOS check-in, drift, and session history in standard JSON format.
          </p>

          {exportMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs text-emerald-400 font-mono text-center">
              {exportMessage}
            </div>
          )}

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full py-2.5 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-paper flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export My Data (.json)
          </button>
        </div>

      </main>
    </div>
  );
}
