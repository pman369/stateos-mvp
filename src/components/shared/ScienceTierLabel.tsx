import React, { useState } from "react";
import { Info, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export interface ScienceMetadata {
  whyWorks: string;
  model: string;
  doThis: string;
}

const SCIENCE_DETAILS: Record<string, ScienceMetadata> = {
  "33-second-reset": {
    whyWorks: "Brief attention redirection can interrupt a stress-reaction cascade, resetting neural firing in the Default Mode Network.",
    model: "Identity differentiation and re-establishing signature frequency are visualization framing designed to structure attention, not clinically measured physical phenomena.",
    doThis: "Align the spine, separate your state from the environment, and let your own baseline return to focus."
  },
  "heart-coherence-switch": {
    whyWorks: "Paced breathing at ~5.5 breaths per minute stimulates the vagus nerve, increases heart rate variability (HRV), and matches cardiorespiratory resonance (Thayer & Lane, 2009).",
    model: "The vocalized rhythm phrases ('I return', 'I align') are practice anchors designed to pace attention, not scientific mandates.",
    doThis: "Focus on the chest and pace three breaths to the 10.9-second cycle using 'I return' on inhale and 'I align' on exhale."
  },
  irp: {
    whyWorks: "Slow diaphragmatic breathing activates the parasympathetic 'vagal brake', slowing down heart rate and reducing adrenal output.",
    model: "Phrases like 'slowing the field', 'breathing upward toward the crown', and 'signature frequency' are visualization metaphors rather than biophysical facts.",
    doThis: "Touch the sternum, let internal pace slow down, take three deep chest-to-crown breaths, and issue the command 'back to baseline'."
  },
  "full-body-flush": {
    whyWorks: "Body scanning combined with focused breathing is a clinically validated somatic mindfulness technique for reducing muscle tension and interoceptive anxiety.",
    model: "Visualizing breath as 'flushing out distortion' is a subjective practice metaphor representing muscular relaxation and attention redirect.",
    doThis: "Conduct a top-down body scan, direct breathing into the tightest spots, and place hands on heart for five deep breaths."
  },
  "timeline-lock-in": {
    whyWorks: "Mental rehearsal and visualization of positive behavioral choices prime the prefrontal cortex, enhancing executive function and goal-directed actions.",
    model: "'Highest timeline' and 'frequency alignment' are visualization tools to orient attention, not claims about physical parallel realities or measurable energy fields.",
    doThis: "Establish posture, direct focus to the heart, choose how you intend to show up, picture your response to friction, and step into that state."
  },
  "micro-alignment-cues": {
    whyWorks: "Each micro-cue triggers specific physiological mechanisms: sternum touch redirects interoceptive attention; spinal extension prompts postural ventral-vagal activation; deep nose inhale activates vagal afferents; tongue/shoulder release reduces somatic stress holding.",
    model: "This protocol relies on direct somatic reflexes and contains no active practice metaphors or working model overlays.",
    doThis: "Perform any of the five brief cues (sternum touch, spinal extension, sharp inhale, tongue drop, shoulder release) in real time."
  }
};

interface ScienceTierLabelProps {
  slug: string;
  tier: "established" | "working_model";
  className?: string;
}

export default function ScienceTierLabel({ slug, tier, className = "" }: ScienceTierLabelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const details = SCIENCE_DETAILS[slug] || {
    whyWorks: "Somatic practices help re-engage fronto-limbic regulatory pathways.",
    model: "This technique uses visualization metaphors to direct sensory focus.",
    doThis: "Follow the steps in sequence."
  };

  const isEstablished = tier === "established";

  return (
    <div className={`rounded-lg border border-white/5 bg-ink-raised/50 p-4 text-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEstablished ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/10 px-2.5 py-0.5 text-xs font-medium text-signal border border-signal/20">
              <CheckCircle2 size={12} />
              Established Science
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ash/10 px-2.5 py-0.5 text-xs font-medium text-ash border border-ash/20">
              <Info size={12} />
              Practice Framework
            </span>
          )}
          <span className="text-[10px] text-ash font-mono uppercase tracking-widest">Content Tier</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs text-ash hover:text-paper transition-colors font-mono"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <>
              <span className="sr-only">Hide Details</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span className="sr-only">Show Details</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {/* Always Visible: Personal Practice */}
      <div className="mt-3">
        <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-1">Personal Practice</span>
        <p className="text-paper leading-relaxed">{details.doThis}</p>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-fadeIn">
          {/* Why this works - Established Science */}
          <div>
            <span className="text-[10px] font-mono text-signal uppercase tracking-wider block mb-1">
              Why This Works (Physiological Mechanism)
            </span>
            <p className="text-paper/90 leading-relaxed">{details.whyWorks}</p>
          </div>

          {/* The model - Working Metaphor */}
          <div>
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider block mb-1">
              The Metaphor (Working Model)
            </span>
            <p className="text-ash leading-relaxed">{details.model}</p>
          </div>
        </div>
      )}
    </div>
  );
}
