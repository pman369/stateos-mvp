import React, { useState } from "react";

interface AuditValues {
  energy: number;
  clarity: number;
  emotional_stability: number;
  identity_alignment: number;
  environmental_match: number;
}

interface StateAuditSliderProps {
  initialValues?: AuditValues;
  onSubmit: (values: AuditValues, note: string) => void;
  submitLabel?: string;
  showNote?: boolean;
}

const AUDIT_QUESTIONS = [
  {
    key: "energy",
    label: "Energy",
    question: "How's your energy right now?",
    minLabel: "Energized",
    maxLabel: "Exhausted"
  },
  {
    key: "clarity",
    label: "Clarity",
    question: "How's your mental clarity?",
    minLabel: "Crystal clear",
    maxLabel: "Foggy"
  },
  {
    key: "emotional_stability",
    label: "Emotional Stability",
    question: "How reactive do you feel?",
    minLabel: "Steady",
    maxLabel: "On edge"
  },
  {
    key: "identity_alignment",
    label: "Identity Alignment",
    question: "Does this feel like you at your best?",
    minLabel: "Yes, fully",
    maxLabel: "Not really"
  },
  {
    key: "environmental_match",
    label: "Environmental Match",
    question: "Does your current environment feel supportive right now?",
    minLabel: "Very",
    maxLabel: "Not at all"
  }
];

export default function StateAuditSlider({
  initialValues,
  onSubmit,
  submitLabel = "Save Check-in",
  showNote = true
}: StateAuditSliderProps) {
  const [values, setValues] = useState<AuditValues>(
    initialValues || {
      energy: 3,
      clarity: 3,
      emotional_stability: 3,
      identity_alignment: 3,
      environmental_match: 3
    }
  );
  const [note, setNote] = useState("");

  const handleChange = (key: keyof AuditValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const checkDrift = () => {
    return Object.values(values).some((v) => v >= 4);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values, note);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 w-full max-w-xl mx-auto">
      <div className="space-y-6">
        {AUDIT_QUESTIONS.map((q) => {
          const val = values[q.key as keyof AuditValues];
          const isHighDrift = val >= 4;

          return (
            <div key={q.key} className="p-4 rounded-lg bg-ink-raised border border-white/5 transition-all duration-300">
              <div className="flex justify-between items-baseline mb-1">
                <label className="font-serif text-base text-paper font-semibold">
                  {q.label}
                </label>
                <span 
                  className={`font-mono text-sm font-semibold transition-colors duration-200 ${
                    isHighDrift ? "text-signal" : "text-ash"
                  }`}
                >
                  {val} / 5
                </span>
              </div>
              <p className="text-xs text-ash mb-4">{q.question}</p>
              
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={val}
                  onChange={(e) => handleChange(q.key as keyof AuditValues, parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-signal outline-none focus:ring-1 focus:ring-signal/30"
                  id={`audit-slider-${q.key}`}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-ash/80 mt-2 font-mono">
                <span>{q.minLabel}</span>
                <span>{q.maxLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showNote && (
        <div className="space-y-2">
          <label htmlFor="audit-note" className="block text-xs font-mono text-ash uppercase tracking-wider">
            Context note (Optional)
          </label>
          <textarea
            id="audit-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's going on? e.g., back-to-back meetings, poor sleep..."
            className="w-full p-3 rounded-lg bg-ink-raised border border-white/5 text-sm text-paper placeholder:text-ash/50 focus:border-signal/50 focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Real-time drift feedback */}
      {checkDrift() && (
        <div className="p-3 rounded-lg border border-signal/25 bg-signal/5 text-xs text-signal/90 leading-relaxed text-center animate-pulse">
          Drift detected. State engineering protocol recommended.
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 rounded-lg bg-signal hover:bg-signal/95 text-ink font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-signal/50 shadow-md font-mono"
      >
        {submitLabel}
      </button>
    </form>
  );
}
