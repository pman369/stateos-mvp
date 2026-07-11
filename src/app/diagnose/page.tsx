"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Compass } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import DiagnosticFlow from "../../components/ui/DiagnosticFlow";
import { db, DriftEvent } from "../../components/utils/db";

function DiagnoseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [driftEvent, setDriftEvent] = useState<DriftEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDrift() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }

        const driftId = searchParams.get("drift_id");
        const drifts = await db.getDriftEvents();
        
        let targetDrift = drifts.find(d => d.id === driftId && !d.resolved_at);

        if (!targetDrift) {
          // Find any active unresolved drift event
          targetDrift = drifts.find(d => !d.resolved_at);
        }

        if (!targetDrift) {
          // Create a new drift event if none exists
          targetDrift = await db.createDriftEvent({
            trigger_source: "unspecified",
            trigger_note: "Manual diagnostic start"
          });
        }

        setDriftEvent(targetDrift);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDrift();
  }, [searchParams, router]);

  const handleRecommended = (node: string, protocolSlug: string) => {
    // Navigate to protocol player, link to active drift event
    if (driftEvent) {
      router.push(`/protocols/${protocolSlug}?drift_id=${driftEvent.id}`);
    } else {
      router.push(`/protocols/${protocolSlug}`);
    }
  };

  const handleCancel = () => {
    router.push("/today");
  };

  if (isLoading || !driftEvent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ink">
        <div className="w-6 h-6 border-2 border-white/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-ink flex flex-col md:flex-row pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6 w-full flex flex-col justify-center">
        {/* Back navigation */}
        <div className="absolute top-8 left-4 md:left-72">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </button>
        </div>

        {/* Brand/Indicator */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-signal/15 bg-signal/5 text-signal">
            <Compass size={20} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-paper">Framework Diagnostic</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Locate autonomic drift origin
          </p>
        </div>

        {/* Interactive Flow */}
        <div className="w-full flex justify-center">
          <DiagnosticFlow
            driftEvent={driftEvent}
            onRecommended={handleRecommended}
            onCancel={handleCancel}
          />
        </div>

      </main>
    </div>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen bg-ink flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-signal rounded-full animate-spin" />
        </div>
      }
    >
      <DiagnoseContent />
    </Suspense>
  );
}
