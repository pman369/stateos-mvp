"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Compass, CheckCircle2 } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, IdentityAnchor, UserProfile } from "../../../components/utils/db";
import BreathPulse from "../../../components/ui/BreathPulse";

export default function IdentityCompassPage() {
  const router = useRouter();
  const [activeAnchor, setActiveAnchor] = useState<IdentityAnchor | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAligned, setIsAligned] = useState(false);

  useEffect(() => {
    async function loadCompass() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }

        const anchors = await db.getIdentityAnchors();
        const active = anchors.find((a) => a.is_active);
        setActiveAnchor(active || null);

        const prof = await db.getProfile();
        setProfile(prof);

      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCompass();
  }, [router]);

  const handleAlign = () => {
    setIsAligned(true);
    setTimeout(() => {
      router.push("/today");
    }, 1500);
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

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 md:py-12 flex flex-col justify-center w-full min-h-[500px]">
        {/* Back navigation */}
        <div className="absolute top-8 left-4 md:left-72">
          <button
            onClick={() => router.push("/today")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </button>
        </div>

        {isAligned ? (
          <div className="bg-ink-raised border border-white/5 rounded-2xl p-8 text-center space-y-4 shadow-xl animate-fadeIn">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="text-signal animate-bounce" size={40} />
              <h2 className="font-serif text-2xl text-paper font-bold mt-2">Aligned</h2>
              <p className="text-xs text-ash font-mono uppercase tracking-widest">
                Identity Statement Locked In
              </p>
            </div>
            {profile?.signature_statement && (
              <p className="font-serif text-lg text-paper italic">
                "I am {profile.signature_statement}"
              </p>
            )}
          </div>
        ) : (
          <div className="bg-ink-raised border border-white/5 rounded-2xl p-8 space-y-8 text-center shadow-xl relative overflow-hidden">
            {/* Ambient breath pulse */}
            <BreathPulse type="glow" isActive={true} className="absolute inset-0 z-0" />

            <div className="space-y-2 z-10 relative">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-signal/15 bg-signal/5 text-signal">
                <Compass size={20} />
              </div>
              <h1 className="font-serif text-2xl font-bold text-paper">Identity Compass</h1>
              <p className="text-xs text-ash font-mono uppercase tracking-wider">
                Recalibrate active signature baseline
              </p>
            </div>

            {/* Content Display */}
            <div className="space-y-4 z-10 relative py-4">
              {profile?.signature_statement ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-ash uppercase tracking-wider block">
                    Signature Statement
                  </span>
                  <p className="font-serif text-xl font-bold text-paper">
                    "I am <span className="text-signal">{profile.signature_statement}</span>"
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-ash uppercase tracking-wider block">
                    Signature Statement
                  </span>
                  <p className="text-xs text-ash italic">
                    No active statement set. Configure in Profile.
                  </p>
                </div>
              )}

              {activeAnchor ? (
                <div className="p-4 bg-ink border border-white/5 rounded-lg space-y-1.5 text-left">
                  <span className="text-[9px] font-mono text-signal uppercase tracking-wider block">
                    Active Anchor Memory: {activeAnchor.label}
                  </span>
                  <p className="text-xs text-paper leading-relaxed italic">
                    "{activeAnchor.description}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-ash italic">
                  No active somatic anchors saved. Add them in Anchors page.
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3 z-10 relative">
              <button
                onClick={handleAlign}
                className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-xs font-mono hover:scale-[1.01] transition-all"
              >
                Lock In Baseline State
              </button>
              <button
                onClick={() => router.push("/today")}
                className="text-xs text-ash hover:text-paper font-mono transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
