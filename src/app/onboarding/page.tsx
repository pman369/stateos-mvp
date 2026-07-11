"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { db } from "../../components/utils/db";

const ESTIMATE_OPTIONS = [
  { label: "Usually within a few minutes", value: 180 },
  { label: "Usually within an hour", value: 1800 },
  { label: "Usually takes most of the day", value: 14400 },
  { label: "Sometimes it lingers for days", value: 172800 },
  { label: "I'm honestly not sure", value: 0 } // skip logging
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Welcome, 1: Baseline Audit, 2: Recovery Estimate, 3: Identity Anchor, 4: Ready

  // State audit scores
  const [audit, setAudit] = useState({
    energy: 3,
    clarity: 3,
    emotional_stability: 3,
    identity_alignment: 3,
    environmental_match: 3
  });

  // Recovery window estimate
  const [recoveryEstimate, setRecoveryEstimate] = useState<number | null>(null);

  // Identity Anchor
  const [anchorText, setAnchorText] = useState("");

  const handleAuditChange = (key: string, val: number) => {
    setAudit(prev => ({ ...prev, [key]: val }));
  };

  const handleCompleteOnboarding = async () => {
    try {
      // 1. Save baseline state audit
      await db.createAudit({
        energy: audit.energy,
        clarity: audit.clarity,
        emotional_stability: audit.emotional_stability,
        identity_alignment: audit.identity_alignment,
        environmental_match: audit.environmental_match,
        note: "Baseline Day-1 check-in"
      });

      // 2. Save baseline Recovery Window if estimated
      if (recoveryEstimate && recoveryEstimate > 0) {
        const drift = await db.createDriftEvent({
          trigger_source: "unspecified",
          trigger_note: "Historical Day-0 estimated Recovery Window baseline"
        });
        
        // Resolve immediately with historical duration estimate
        const resolvedAt = new Date(new Date(drift.detected_at).getTime() + recoveryEstimate * 1000).toISOString();
        await db.resolveDriftEvent(drift.id, resolvedAt);
      }

      // 3. Save Identity Anchor if written
      if (anchorText.trim().length > 0) {
        await db.createIdentityAnchor({
          label: "Onboarding Anchor",
          anchor_type: "memory",
          description: anchorText
        });
      }

      // 4. Set onboarded flags
      localStorage.setItem("stateos_onboarded", "true");
      router.push("/today");
    } catch (e) {
      // console.error(e);
      localStorage.setItem("stateos_onboarded", "true");
      router.push("/today");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-ink py-10">
      <div className="w-full max-w-lg bg-ink-raised border border-white/5 rounded-2xl p-8 shadow-xl space-y-6">
        
        {/* ProgressBar */}
        {step > 0 && step < 4 && (
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-signal h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}

        {/* SCREEN 0 — WELCOME */}
        {step === 0 && (
          <div className="text-center space-y-6 py-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full border border-signal/30 flex items-center justify-center bg-signal/5">
                <Compass className="text-signal" size={28} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-paper mt-3">stateOS</h1>
              <p className="text-sm text-ash leading-relaxed">
                A way to notice when you've drifted, and get back faster.
              </p>
            </div>
            
            <button
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono flex items-center justify-center gap-1 hover:bg-signal/90 transition-colors"
            >
              Get Started
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* SCREEN 1 — BASELINE STATE AUDIT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl text-paper font-semibold">Let's get a starting point.</h2>
              <p className="text-xs text-ash leading-relaxed">
                Five quick questions. There's no right answer — this is just where you are today.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { key: "energy", label: "Energy", min: "Energized", max: "Exhausted", q: "How's your energy right now?" },
                { key: "clarity", label: "Clarity", min: "Crystal clear", max: "Foggy", q: "How's your mental clarity?" },
                { key: "emotional_stability", label: "Emotional Stability", min: "Steady", max: "On edge", q: "How reactive do you feel?" },
                { key: "identity_alignment", label: "Identity Alignment", min: "Yes, fully", max: "Not really", q: "Does this feel like you at your best?" },
                { key: "environmental_match", label: "Environmental Match", min: "Very", max: "Not at all", q: "Does your current environment feel supportive right now?" }
              ].map(item => {
                const val = audit[item.key as keyof typeof audit];
                return (
                  <div key={item.key} className="space-y-1.5 p-3 rounded-lg bg-ink border border-white/5">
                    <div className="flex justify-between text-xs font-serif font-semibold text-paper">
                      <span>{item.label}</span>
                      <span className="font-mono text-signal">{val} / 5</span>
                    </div>
                    <p className="text-[10px] text-ash/80 mb-1">{item.q}</p>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={val}
                      onChange={(e) => handleAuditChange(item.key, parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-signal outline-none"
                    />
                    <div className="flex justify-between text-[9px] text-ash/70 font-mono mt-1">
                      <span>{item.min}</span>
                      <span>{item.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[10px] font-mono text-ash/50 block mb-4">
                You'll see this exact check-in again later — this is just your Day 1 marker.
              </span>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono flex items-center justify-center gap-1.5 hover:bg-signal/90 transition-colors"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2 — RECOVERY WINDOW BASELINE */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl text-paper font-semibold">One more thing — a rough estimate.</h2>
              <p className="text-xs text-ash leading-relaxed">
                When something throws you off, how long does it usually take before you feel like yourself again?
              </p>
            </div>

            <div className="space-y-3">
              {ESTIMATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRecoveryEstimate(opt.value)}
                  className={`w-full p-4 rounded-lg border text-left text-xs font-mono transition-all ${
                    recoveryEstimate === opt.value
                      ? "bg-white/[0.03] border-signal text-signal"
                      : "bg-ink border-white/5 text-ash hover:border-white/10 hover:text-paper"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[10px] font-mono text-ash/50 block mb-4">
                This becomes your Day 1 mark on the Recovery Window chart — so you can actually see it change.
              </span>
              <button
                onClick={() => setStep(3)}
                disabled={recoveryEstimate === null}
                className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono flex items-center justify-center gap-1.5 hover:bg-signal/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3 — IDENTITY ANCHOR */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl text-paper font-semibold">Last one — and this one's optional.</h2>
              <p className="text-xs text-ash leading-relaxed">
                Think of a moment when you felt fully, unmistakably like yourself. Not your most successful moment — your most <span className="italic text-signal">you</span> moment.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="anchor-input" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
                Identity Anchor Memory
              </label>
              <textarea
                id="anchor-input"
                rows={4}
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder="A word, a memory, a feeling — whatever comes to mind."
                className="w-full p-3 bg-ink border border-white/5 rounded text-sm text-paper placeholder:text-ash/40 focus:outline-none focus:border-signal/50 leading-relaxed"
              />
              <p className="text-[10px] text-ash/70 leading-normal">
                If nothing comes to mind right now, that's completely fine — you can add this anytime from your Profile.
              </p>
            </div>

            {/* CTA Buttons must have EQUAL VISUAL WEIGHT to prevent pressuring user */}
            <div className="pt-2 flex gap-4">
              <button
                onClick={() => {
                  setAnchorText("");
                  setStep(4);
                }}
                className="w-1/2 py-3 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono text-ash transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-1/2 py-3 rounded-lg bg-signal text-ink font-semibold text-xs font-mono transition-colors hover:bg-signal/90"
              >
                Save this
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4 — READY */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="text-signal" size={40} />
              <h2 className="font-serif text-2xl text-paper font-semibold mt-2">You're set up.</h2>
              <p className="text-sm text-ash leading-relaxed max-w-sm">
                From here: check in whenever you want on the Today screen, or tap <span className="text-signal font-semibold">Diagnose</span> the moment something feels off.
              </p>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono flex items-center justify-center gap-1.5 hover:bg-signal/90 transition-colors"
            >
              Go to Today
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
