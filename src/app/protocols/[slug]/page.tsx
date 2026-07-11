"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Compass, CheckCircle2, TrendingUp } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import ProtocolPlayer from "../../../components/ui/ProtocolPlayer";
import TierBadge from "../../../components/shared/TierBadge";
import { db, STATIC_PROTOCOLS, DriftEvent } from "../../../components/utils/db";

export default function ProtocolSlugPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [protocol, setProtocol] = useState<any>(null);
  const [driftEvent, setDriftEvent] = useState<DriftEvent | null>(null);
  const [segment, setSegment] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resolvedDrift, setResolvedDrift] = useState<DriftEvent | null>(null);

  useEffect(() => {
    async function loadProtocolAndData() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }

        // Find protocol in static reference list
        const proto = STATIC_PROTOCOLS.find((p) => p.slug === slug);
        if (!proto) {
          router.replace("/today");
          return;
        }
        setProtocol(proto);

        // Get linked drift event if passed
        const driftId = searchParams.get("drift_id");
        if (driftId) {
          const drifts = await db.getDriftEvents();
          const targetDrift = drifts.find((d) => d.id === driftId);
          if (targetDrift) setDriftEvent(targetDrift);
        }

        // Get linked Daily Architecture segment if passed
        const seg = searchParams.get("segment");
        if (seg) setSegment(seg);

      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProtocolAndData();
  }, [slug, searchParams, router]);

  const handleComplete = async (pre: number | null, post: number | null) => {
    try {
      setIsLoading(true);

      // 1. Create a protocol session log
      await db.createProtocolSession({
        protocol_id: protocol.slug, // using slug as ID for local mode simplicity
        protocol_slug: protocol.slug,
        drift_event_id: driftEvent?.id || undefined,
        completed: true,
        pre_state_rating: pre || undefined,
        post_state_rating: post || undefined
      });

      // 2. If daily architecture segment is linked, log it
      if (segment && (segment === "morning" || segment === "afternoon" || segment === "evening")) {
        await db.logDailyArchitecture(segment);
      }

      // 3. If drift event is linked, resolve it (calculates Recovery Window)
      if (driftEvent) {
        const resolved = await db.resolveDriftEvent(driftEvent.id);
        setResolvedDrift(resolved);
      }

      setIsCompleted(true);
    } catch (e) {
      alert("Error saving protocol completion details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/today");
  };

  // Generate microcopy based on the resolved Recovery Window tier
  const getRecoveryMicrocopy = (d: DriftEvent) => {
    const secs = d.recovery_window_seconds || 0;
    const mins = Math.round(secs / 60);

    switch (d.recovery_tier) {
      case "instant":
        return `That was fast. Back to baseline in ${secs} seconds.`;
      case "rapid":
        return `Back to baseline in ${mins} ${mins === 1 ? 'minute' : 'minutes'}. That counts.`;
      case "standard":
        return `That took ${mins} minutes. You got there.`;
      case "delayed":
        return `That one took a while — ${mins} minutes. Some days are like that.`;
      case "extended":
        return `That was a longer one. You made it back to baseline — that's what matters.`;
      default:
        return `Back to baseline in ${mins} minutes.`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ink">
        <div className="w-6 h-6 border-2 border-white/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  // 1. COMPLETION / RESULT SUMMARY SCREEN
  if (isCompleted) {
    return (
      <div className="flex-1 min-h-screen bg-ink flex flex-col md:flex-row pb-24 md:pb-0">
        <Navbar />

        <main className="flex-1 max-w-md mx-auto px-4 py-12 flex flex-col justify-center w-full">
          <div className="bg-ink-raised border border-white/5 rounded-2xl p-8 space-y-6 text-center shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-signal/15 border border-signal/25 flex items-center justify-center text-signal">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-serif text-2xl text-paper font-bold">Intervention Complete</h2>
              <span className="text-[10px] font-mono text-ash uppercase tracking-widest">
                {protocol.name} Logged
              </span>
            </div>

            {resolvedDrift ? (
              <div className="p-5 bg-ink border border-white/5 rounded-lg space-y-4">
                <div className="flex justify-center">
                  <TierBadge tier={resolvedDrift.recovery_tier!} />
                </div>
                <p className="font-serif text-base text-paper leading-relaxed italic px-2">
                  "{getRecoveryMicrocopy(resolvedDrift)}"
                </p>
                <div className="flex justify-between items-center text-[10px] font-mono text-ash border-t border-white/5 pt-3">
                  <span>Duration: {resolvedDrift.recovery_window_seconds}s</span>
                  <button 
                    onClick={() => router.push("/recovery/history")}
                    className="text-signal hover:underline flex items-center gap-0.5"
                  >
                    <TrendingUp size={10} />
                    Compare trends
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-ink border border-white/5 rounded-lg">
                <p className="text-sm text-ash leading-relaxed">
                  Alignment check completed successfully. Daily architecture recorded.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/today")}
              className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono hover:scale-[1.01] transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 2. ACTIVE PROTOCOL TIMER RUNNER
  return (
    <div className="flex-1 min-h-screen bg-ink flex flex-col md:flex-row pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:py-12 flex flex-col justify-center items-center w-full">
        <ProtocolPlayer
          protocol={protocol}
          preRatingInitiallyProvided={null}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}
