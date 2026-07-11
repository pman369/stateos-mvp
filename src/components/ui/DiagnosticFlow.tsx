import React, { useState } from "react";
import { ArrowRight, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { DriftEvent, db, STATIC_PROTOCOLS } from "../utils/db";

interface DiagnosticFlowProps {
  driftEvent: DriftEvent;
  onRecommended: (node: string, protocolSlug: string) => void;
  onCancel: () => void;
}

interface Question {
  id: number;
  node: string;
  question: string;
}

const DIAGNOSTIC_QUESTIONS: Question[] = [
  {
    id: 1,
    node: "environment",
    question: "Has something changed in your physical environment, or have you recently changed locations (e.g., entered a crowded space, bright lighting, temperature shift)?"
  },
  {
    id: 2,
    node: "perception",
    question: "Are you feeling mentally fogged, overwhelmed by details, or finding yourself misinterpreting comments from others?"
  },
  {
    id: 3,
    node: "internal_state",
    question: "Is your physical energy depleted, or do you feel a physical buzz/jitter, muscle tension, or rapid breathing?"
  },
  {
    id: 4,
    node: "identity",
    question: "Do you feel disconnected from your values, or like you are reacting to please others rather than acting as yourself?"
  },
  {
    id: 5,
    node: "behavior",
    question: "Have you already reacted impulsively (snapped at someone, scrolled mindlessly, made a choice you are second-guessing)?"
  }
];

// Node-to-protocol mapping
const NODE_RECOMMENDATIONS: Record<string, { slug: string; explanation: string }> = {
  environment: {
    slug: "33-second-reset",
    explanation: "Environmental disruption often distorts immediate perception. The 33-Second Reset helps you differentiate what is yours from what belongs to the room."
  },
  perception: {
    slug: "micro-alignment-cues",
    explanation: "Perceptual fog is best met with direct somatic cues. Five Micro-Alignment Cues target interoception to ground your visual/spatial processing."
  },
  internal_state: {
    slug: "heart-coherence-switch",
    explanation: "Physiological buzz or energy drain is directly regulated by cardiac pacing. The Heart Coherence Switch increases heart rate variability (HRV) to balance the autonomic nervous system."
  },
  identity: {
    slug: "irp",
    explanation: "Identity drift (feeling off baseline/disconnected) responds to baseline statements. The Instant Realignment Protocol anchors your ventral-vagal stability."
  },
  behavior: {
    slug: "timeline-lock-in",
    explanation: "Impulsive behavior indicates Default Mode Network dominance. The Highest Timeline Lock-In primes your prefrontal cortex to choose aligned actions."
  }
};

export default function DiagnosticFlow({
  driftEvent,
  onRecommended,
  onCancel
}: DiagnosticFlowProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = Note entry, 1..5 = Questions, 6 = Resolving/Diagnosed
  const [triggerNote, setTriggerNote] = useState(driftEvent.trigger_note || "");
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosedNode, setDiagnosedNode] = useState<string | null>(null);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(1); // Proceed to first question
  };

  const handleAnswer = (node: string, answer: "yes" | "no") => {
    const newAnswers = { ...answers, [node]: answer };
    setAnswers(newAnswers);

    if (answer === "yes") {
      // Deterministic tree shortcut: first YES immediately diagnoses that node
      triggerDiagnosis(node, newAnswers);
    } else {
      // Continue to next question
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        // All NOs -> default to internal_state
        triggerDiagnosis("internal_state", newAnswers);
      }
    }
  };

  const triggerDiagnosis = async (finalNode: string, finalAnswers: Record<string, "yes" | "no">) => {
    setCurrentStep(6); // Go to analysis screen
    setIsAnalyzing(true);

    // Call API proxy if cloud mode is active, otherwise simulate local AI diagnosis
    try {
      if (db.isCloudMode()) {
        const response = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            drift_event_id: driftEvent.id,
            answers: Object.entries(finalAnswers).map(([node, ans]) => ({ node, answer: ans })),
            trigger_note: triggerNote,
            fallback_node: finalNode
          })
        });

        if (response.ok) {
          const data = await response.json();
          setDiagnosedNode(data.resolved_node);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (e) {
      // Silently swallow errors and use local deterministic resolution
    }

    // Simulate analysis delay for premium instrument feel
    setTimeout(() => {
      // Run deterministic evaluation on trigger note:
      // If note contains "room", "light", "noise", "place" -> environment
      // If note contains "fog", "think", "confused", "mind" -> perception
      // If note contains "tired", "heart", "breath", "stress" -> internal_state
      // If note contains "values", "fake", "myself" -> identity
      // If note contains "snapped", "scroll", "phone", "acted" -> behavior
      const noteLower = triggerNote.toLowerCase();
      let matchedNode = finalNode;

      if (finalNode === "internal_state") { // If answers were all 'no', inspect text note
        if (noteLower.includes("room") || noteLower.includes("light") || noteLower.includes("crowd") || noteLower.includes("office")) {
          matchedNode = "environment";
        } else if (noteLower.includes("fog") || noteLower.includes("think") || noteLower.includes("understand")) {
          matchedNode = "perception";
        } else if (noteLower.includes("tired") || noteLower.includes("breath") || noteLower.includes("exhausted")) {
          matchedNode = "internal_state";
        } else if (noteLower.includes("values") || noteLower.includes("mask") || noteLower.includes("role")) {
          matchedNode = "identity";
        } else if (noteLower.includes("phone") || noteLower.includes("scroll") || noteLower.includes("react")) {
          matchedNode = "behavior";
        }
      }

      // Save note back to DB for this event
      db.resolveDriftEvent(driftEvent.id).then(() => {
        // Re-saving is done as unresolved, wait! The actual drift event stays unresolved until protocol finishes.
        // We will just update trigger_note in localStorage
        const events = JSON.parse(localStorage.getItem("stateos_db_drift_events") || "[]");
        const idx = events.findIndex((e: any) => e.id === driftEvent.id);
        if (idx !== -1) {
          events[idx].trigger_note = triggerNote;
          events[idx].trigger_source = matchedNode;
          localStorage.setItem("stateos_db_drift_events", JSON.stringify(events));
        }
      });

      setDiagnosedNode(matchedNode);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleLaunchProtocol = () => {
    if (!diagnosedNode) return;
    const rec = NODE_RECOMMENDATIONS[diagnosedNode] || NODE_RECOMMENDATIONS.internal_state;
    onRecommended(diagnosedNode, rec.slug);
  };

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentStep - 1];
  const progressPercent = currentStep > 0 && currentStep <= 5 ? (currentStep / 5) * 100 : 0;

  // 1. NOTES INPUT SCREEN
  if (currentStep === 0) {
    return (
      <form onSubmit={handleNoteSubmit} className="w-full max-w-md mx-auto p-6 bg-ink-raised border border-white/5 rounded-xl space-y-6">
        <div className="flex gap-3 items-center">
          <HelpCircle className="text-signal" size={24} />
          <h2 className="font-serif text-xl text-paper font-semibold">What triggered this?</h2>
        </div>

        <p className="text-xs text-ash leading-relaxed">
          Describe the moment you noticed drift. Your note is stored locally and analyzed on-device to isolate the disruption origin.
        </p>

        <textarea
          rows={4}
          value={triggerNote}
          onChange={(e) => setTriggerNote(e.target.value)}
          placeholder="I just got out of a meeting and felt my heart racing..."
          className="w-full p-3 rounded-lg bg-ink border border-white/5 text-sm text-paper placeholder:text-ash/40 focus:border-signal/50 focus:outline-none transition-colors"
          required
        />

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-mono text-ash"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 rounded-lg bg-signal text-ink font-semibold text-xs font-mono flex items-center justify-center gap-1"
          >
            Identify Origin
            <ArrowRight size={14} />
          </button>
        </div>
      </form>
    );
  }

  // 2. QUESTION CARDS
  if (currentStep >= 1 && currentStep <= 5) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-ink-raised border border-white/5 rounded-xl space-y-6">
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-signal h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-ash uppercase tracking-wider">
          <span>Diagnostic Engine</span>
          <span>Question {currentStep} of 5</span>
        </div>

        <p className="font-serif text-lg text-paper leading-relaxed text-center px-2 py-4">
          {currentQuestion.question}
        </p>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => handleAnswer(currentQuestion.node, "no")}
            className="w-1/2 py-3 rounded-lg border border-white/5 bg-ink hover:border-white/15 text-sm font-semibold text-ash hover:text-paper transition-all font-mono"
          >
            No
          </button>
          <button
            onClick={() => handleAnswer(currentQuestion.node, "yes")}
            className="w-1/2 py-3 rounded-lg bg-signal text-ink font-semibold text-sm hover:scale-[1.01] transition-all font-mono"
          >
            Yes
          </button>
        </div>
      </div>
    );
  }

  // 3. ANALYSIS AND RESULTS SCREEN
  const rec = diagnosedNode ? NODE_RECOMMENDATIONS[diagnosedNode] : null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-ink-raised border border-white/5 rounded-xl space-y-6">
      {isAnalyzing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-signal animate-spin" />
          <p className="text-xs text-ash font-mono uppercase tracking-widest animate-pulse">
            Diagnosing autonomic node...
          </p>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="text-signal" size={32} />
            <h2 className="font-serif text-2xl text-paper font-semibold">Diagnosis Complete</h2>
            <span className="text-[10px] font-mono text-ash uppercase tracking-widest">
              Origin identified: {diagnosedNode}
            </span>
          </div>

          <div className="p-4 bg-ink rounded-lg border border-white/5 text-left">
            <h3 className="text-xs font-mono text-signal uppercase tracking-wider mb-2">Recommendation Details</h3>
            <p className="text-paper text-sm leading-relaxed mb-4">
              {rec?.explanation}
            </p>
            <div className="flex justify-between items-center text-xs font-mono text-ash border-t border-white/5 pt-3">
              <span>Target: {diagnosedNode?.toUpperCase()}</span>
              <span>Protocol: {rec?.slug ? STATIC_PROTOCOLS.find(p => p.slug === rec.slug)?.name : ""}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleLaunchProtocol}
              className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-all"
            >
              Launch Protocol
              <ChevronRight size={16} />
            </button>
            <button
              onClick={onCancel}
              className="text-xs text-ash hover:text-paper font-mono transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
