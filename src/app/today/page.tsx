"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, AlertCircle, Sparkles, Plus, ChevronRight, Activity, Bookmark } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import DailyArchitectureCard from "../../components/ui/DailyArchitectureCard";
import RecoveryWindowTimer from "../../components/ui/RecoveryWindowTimer";
import StateAuditSlider from "../../components/ui/StateAuditSlider";
import { db, DriftEvent, StateAudit, IdentityAnchor } from "../../components/utils/db";

export default function TodayPage() {
  const router = useRouter();
  const [activeDrift, setActiveDrift] = useState<DriftEvent | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<IdentityAnchor | null>(null);
  const [lastAudit, setLastAudit] = useState<StateAudit | null>(null);
  
  const [showQuickAudit, setShowQuickAudit] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTodayData() {
      try {
        setIsLoading(true);
        // Check login first
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }

        // 1. Get active drift event (unresolved)
        const drifts = await db.getDriftEvents();
        const unresolved = drifts.find((d) => !d.resolved_at);
        setActiveDrift(unresolved || null);

        // 2. Get active identity anchor
        const anchors = await db.getIdentityAnchors();
        const active = anchors.find((a) => a.is_active);
        setActiveAnchor(active || null);

        // 3. Get last state audit
        const audits = await db.getAudits();
        setLastAudit(audits[0] || null);

      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTodayData();
  }, [refreshTrigger, router]);

  const handleLaunchProtocol = (slug: string, segment?: string) => {
    // Navigate to protocol screen
    let url = `/protocols/${slug}`;
    if (segment) {
      url += `?segment=${segment}`;
    }
    router.push(url);
  };

  const handleNewAuditSubmit = async (values: any, note: string) => {
    try {
      const newAudit = await db.createAudit(values);
      setLastAudit(newAudit);
      setShowQuickAudit(false);

      // If drift detected and no active drift exists, open a new drift event
      if (newAudit.drift_flag && !activeDrift) {
        const newDrift = await db.createDriftEvent({
          state_audit_id: newAudit.id,
          trigger_source: "unspecified",
          trigger_note: note || "State Audit triggered drift"
        });
        setActiveDrift(newDrift);
        // Trigger page refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert("Check-in saved. State is stable.");
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (e) {
      alert("Error saving check-in.");
    }
  };

  const handleLaunchDiagnostic = async () => {
    // If no active drift event exists, open one first
    if (!activeDrift) {
      try {
        const newDrift = await db.createDriftEvent({
          trigger_source: "unspecified",
          trigger_note: "User requested diagnostic"
        });
        setActiveDrift(newDrift);
        router.push(`/diagnose?drift_id=${newDrift.id}`);
      } catch (e) {
        router.push("/diagnose");
      }
    } else {
      router.push(`/diagnose?drift_id=${activeDrift.id}`);
    }
  };

  const formatLastAuditTime = () => {
    if (!lastAudit) return "Never";
    const date = new Date(lastAudit.created_at);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ink">
        <div className="w-6 h-6 border-2 border-white/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-ink flex flex-col md:flex-row pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        
        {/* Header Greeting */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-paper">Instrument Panel</h1>
            <p className="text-xs text-ash font-mono uppercase tracking-wider">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          
          <button
            onClick={() => setShowQuickAudit(!showQuickAudit)}
            className="py-2 px-4 rounded-lg bg-signal text-ink font-semibold text-xs font-mono flex items-center gap-1.5 shadow hover:bg-signal/90 transition-colors"
          >
            <Plus size={14} />
            State Audit
          </button>
        </div>

        {/* ACTIVE DRIFT ALERT CARD (AUTONOMIC NUDGE) */}
        {activeDrift && (
          <div className="w-full bg-[#1F171A] border border-red-950/40 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_12px_32px_rgba(0,0,0,0.3)] animate-fadeIn">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-800/20 flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-paper font-semibold">Nervous System Drift</h3>
                <p className="text-xs text-ash leading-relaxed max-w-sm">
                  Drift logged at {new Date(activeDrift.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Let's intervene and close this Recovery Window.
                </p>
              </div>
            </div>

            {/* Live active timer */}
            <div className="flex flex-col items-center gap-2 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto">
              <RecoveryWindowTimer detectedAt={activeDrift.detected_at} isActive={true} />
              
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleLaunchDiagnostic}
                  className="flex-1 py-2 px-3 rounded bg-signal text-ink font-semibold text-xs font-mono text-center hover:bg-signal/95 transition-all"
                >
                  Diagnose Node
                </button>
                <button
                  onClick={() => handleLaunchProtocol("irp")}
                  className="py-2 px-3 rounded border border-white/10 hover:border-white/20 text-xs font-mono text-paper"
                >
                  Quick IRP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK STATE AUDIT OVERLAY */}
        {showQuickAudit && (
          <div className="p-6 bg-ink-raised border border-white/5 rounded-2xl space-y-6">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
              <h3 className="font-serif text-lg text-paper font-bold">State Audit Check-in</h3>
              <button 
                onClick={() => setShowQuickAudit(false)} 
                className="text-xs font-mono text-ash hover:text-paper"
              >
                Close
              </button>
            </div>
            <StateAuditSlider onSubmit={handleNewAuditSubmit} />
          </div>
        )}

        {/* PRIMARY LAYOUT ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Architecture (2/3 width on desktop) */}
          <div className="md:col-span-2 space-y-6">
            <DailyArchitectureCard 
              onLaunchProtocol={handleLaunchProtocol} 
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Sidebar prompts (1/3 width on desktop) */}
          <div className="space-y-6">
            
            {/* Active Identity Anchor */}
            <div className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-ash uppercase tracking-wider">Identity Anchor</span>
                <Bookmark size={14} className="text-signal" />
              </div>
              
              {activeAnchor ? (
                <div className="space-y-2">
                  <h4 className="font-serif text-sm font-semibold text-paper leading-tight">
                    {activeAnchor.label}
                  </h4>
                  <p className="text-xs text-ash leading-relaxed italic">
                    "{activeAnchor.description}"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ash leading-relaxed">
                    You don't have any Identity Anchors saved. Anchors help you realign fast in moments of drift.
                  </p>
                  <button
                    onClick={() => router.push("/identity/anchors")}
                    className="w-full py-2 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-paper transition-all flex items-center justify-center gap-1"
                  >
                    Add Baseline Anchor
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Last check-in stats */}
            <div className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-ash uppercase tracking-wider">Last Audit</span>
                <Activity size={14} className="text-signal" />
              </div>
              
              {lastAudit ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-ash">Last recorded:</span>
                    <span className="text-paper">{formatLastAuditTime()}</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-ash">Composite score:</span>
                    <span className="text-signal font-semibold">{lastAudit.composite_score} / 5.0</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-ash">Status:</span>
                    <span className={lastAudit.drift_flag ? "text-red-400" : "text-emerald-400"}>
                      {lastAudit.drift_flag ? "Drifting" : "Stable"}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/audit/history")}
                    className="w-full text-center text-[10px] font-mono text-ash hover:text-paper transition-colors block pt-2 border-t border-white/5"
                  >
                    View audit history trends →
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ash italic leading-relaxed">
                  No check-ins logged. Log your first State Audit using the button above.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Global Diagnose Quick CTA floating/persistent at bottom right for mobile */}
        {!activeDrift && (
          <div className="md:hidden fixed bottom-20 right-6 z-40">
            <button
              onClick={handleLaunchDiagnostic}
              className="p-4 rounded-full bg-signal text-ink shadow-[0_4px_24px_rgba(232,199,122,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              title="Diagnose Drift"
            >
              <Compass size={24} />
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
