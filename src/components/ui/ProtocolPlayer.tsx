import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronRight, ChevronLeft, Check, Volume2, VolumeX } from "lucide-react";
import { playChime, startPacingTone, stopPacingTone } from "../utils/audio";
import { STATIC_PROTOCOLS } from "../utils/db";
import ScienceTierLabel from "../shared/ScienceTierLabel";
import BreathPulse from "./BreathPulse";

interface Step {
  order: number;
  label: string;
  duration: number;
  instruction: string;
}

interface Protocol {
  slug: string;
  name: string;
  purpose: string;
  mechanism: string;
  duration_seconds: number;
  framework_node: string;
  science_tier: "established" | "working_model";
  steps: Step[];
}

interface ProtocolPlayerProps {
  protocol: Protocol;
  preRatingInitiallyProvided?: number | null;
  onComplete: (preRating: number | null, postRating: number | null) => void;
  onCancel: () => void;
}

export default function ProtocolPlayer({
  protocol,
  preRatingInitiallyProvided = null,
  onComplete,
  onCancel
}: ProtocolPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Flow control states
  const [showPreRating, setShowPreRating] = useState(preRatingInitiallyProvided === null && protocol.slug !== "micro-alignment-cues");
  const [showPostRating, setShowPostRating] = useState(false);
  
  // Rating states
  const [preRating, setPreRating] = useState<number>(preRatingInitiallyProvided || 5);
  const [postRating, setPostRating] = useState<number>(5);

  const steps = protocol.steps;
  const currentStep = steps[currentStepIndex];

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize first step duration
  useEffect(() => {
    if (steps.length > 0) {
      setTimeRemaining(steps[0].duration);
    }
  }, [steps]);

  // Handle breathing audio chimes / cues
  const triggerAudioCues = (stepIndex: number, secondsLeft: number, stepDuration: number) => {
    if (!audioEnabled) return;

    // Heart Coherence Switch pacing tones (10s cycles: 5s inhale, 5s exhale)
    if (protocol.slug === "heart-coherence-switch" && stepIndex >= 1 && stepIndex <= 3) {
      const elapsedInStep = stepDuration - secondsLeft;
      if (elapsedInStep === 0) {
        // Start Inhale (first 5 seconds of the cycle)
        startPacingTone("inhale", 5);
      } else if (elapsedInStep === 5) {
        // Start Exhale (last 5 seconds of the cycle)
        startPacingTone("exhale", 5);
      }
    }
  };

  // Play chime on step transition
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length && !showPreRating && !showPostRating) {
      if (audioEnabled) {
        playChime(880, 0.6); // Soft chime
      }
      triggerAudioCues(currentStepIndex, currentStep.duration, currentStep.duration);
    }
  }, [currentStepIndex, isPlaying, showPreRating, showPostRating]);

  // Timer tick effect
  useEffect(() => {
    if (isPlaying && !showPreRating && !showPostRating) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const next = prev - 1;
          
          // Triggers pacing changes inside steps
          if (next > 0) {
            triggerAudioCues(currentStepIndex, next, currentStep.duration);
          }

          if (next <= 0) {
            // Step complete
            stopPacingTone();
            if (currentStepIndex < steps.length - 1) {
              const nextIndex = currentStepIndex + 1;
              setCurrentStepIndex(nextIndex);
              return steps[nextIndex].duration;
            } else {
              // Protocol complete
              setIsPlaying(false);
              clearInterval(intervalRef.current!);
              if (audioEnabled) {
                playChime(1100, 1.2); // Soft ending double chime
              }
              if (protocol.slug === "micro-alignment-cues") {
                // Skip rating for micro cues
                onComplete(null, null);
              } else {
                setShowPostRating(true);
              }
              return 0;
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopPacingTone();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopPacingTone();
    };
  }, [isPlaying, currentStepIndex, showPreRating, showPostRating]);

  const handleStart = () => {
    setShowPreRating(false);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    stopPacingTone();
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeRemaining(steps[nextIndex].duration);
    } else {
      setIsPlaying(false);
      if (protocol.slug === "micro-alignment-cues") {
        onComplete(null, null);
      } else {
        setShowPostRating(true);
      }
    }
  };

  const handlePrev = () => {
    stopPacingTone();
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setTimeRemaining(steps[prevIndex].duration);
    }
  };

  const handleRatingSubmit = () => {
    onComplete(showPreRating ? null : preRating, postRating);
  };

  // 1. PRE-RATING STATE
  if (showPreRating) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-ink-raised border border-white/5 rounded-xl space-y-6 text-center">
        <h2 className="font-serif text-2xl text-paper font-semibold">Ready to begin?</h2>
        <p className="text-sm text-ash leading-relaxed">
          Before starting {protocol.name}, please rate your current emotional/energetic state.
        </p>

        <div className="space-y-4">
          <div className="flex justify-between font-mono text-sm">
            <span className="text-ash">1 = Low stability / Off baseline</span>
            <span className="text-signal font-semibold">{preRating} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={preRating}
            onChange={(e) => setPreRating(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-signal outline-none"
          />
          <div className="flex justify-between text-[10px] text-ash font-mono uppercase tracking-wider">
            <span>Highly disrupted</span>
            <span>Fully centered</span>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-lg border border-white/10 hover:border-white/20 text-sm font-mono text-ash"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="w-1/2 py-2.5 rounded-lg bg-signal text-ink font-semibold text-sm font-mono"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  // 2. POST-RATING STATE
  if (showPostRating) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-ink-raised border border-white/5 rounded-xl space-y-6 text-center">
        <h2 className="font-serif text-2xl text-paper font-semibold">Done.</h2>
        <p className="text-sm text-ash leading-relaxed">
          Take a second before you rate how that felt. Let your breath settle.
        </p>

        <div className="space-y-4">
          <div className="flex justify-between font-mono text-sm">
            <span className="text-ash">How do you feel now? (1–10)</span>
            <span className="text-signal font-semibold">{postRating} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={postRating}
            onChange={(e) => setPostRating(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-signal outline-none"
          />
          <div className="flex justify-between text-[10px] text-ash font-mono uppercase tracking-wider">
            <span>Still off</span>
            <span>Fully centered</span>
          </div>
        </div>

        <button
          onClick={handleRatingSubmit}
          className="w-full py-3 rounded-lg bg-signal text-ink font-semibold text-sm font-mono"
        >
          Save & Close
        </button>
      </div>
    );
  }

  // 3. TIMER PLAYBACK SCREEN
  const isBreathingStep = 
    protocol.slug === "heart-coherence-switch" && 
    currentStepIndex >= 1 && 
    currentStepIndex <= 3;

  return (
    <div className="w-full max-w-lg mx-auto p-6 flex flex-col justify-between min-h-[500px]">
      
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl text-paper font-bold leading-tight">{protocol.name}</h1>
          <p className="text-[10px] font-mono text-ash uppercase tracking-widest">{protocol.purpose}</p>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-2 rounded-full border border-white/5 bg-ink-raised text-ash hover:text-paper hover:border-white/10 transition-colors"
          title={audioEnabled ? "Mute audio cues" : "Unmute audio cues"}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Rhythmic Breathing Glow Visualizer */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[200px] mb-8">
        <BreathPulse 
          type={isBreathingStep ? "both" : "glow"} 
          isActive={isPlaying} 
          className="absolute inset-0 z-0" 
        />
        
        {/* Countdown overlay */}
        <div className="z-10 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-ash uppercase tracking-widest mb-1">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="font-mono text-6xl md:text-7xl font-semibold tracking-tighter text-paper select-none mb-2">
            {timeRemaining}
          </div>
          <span className="font-serif text-lg font-medium text-signal select-none italic text-center px-4 max-w-xs">
            {currentStep.label}
          </span>
        </div>
      </div>

      {/* Instructions & Controls */}
      <div className="space-y-6 z-10">
        <div className="p-4 bg-ink-raised border border-white/5 rounded-lg text-center shadow-inner">
          <p className="text-paper text-sm leading-relaxed min-h-[48px] flex items-center justify-center">
            {currentStep.instruction}
          </p>
        </div>

        {/* Step dots navigation */}
        <div className="flex justify-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.order}
              onClick={() => {
                stopPacingTone();
                setCurrentStepIndex(idx);
                setTimeRemaining(s.duration);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex 
                  ? "w-6 bg-signal" 
                  : idx < currentStepIndex 
                    ? "w-2 bg-signal/30" 
                    : "w-2 bg-white/10"
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Player controls */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex-1 py-3 rounded-lg border border-white/5 bg-ink-raised hover:border-white/10 text-ash hover:text-paper disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center gap-1 font-mono text-xs"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? "bg-ink-raised border border-white/10 hover:bg-white/5 text-paper" 
                : "bg-signal text-ink hover:scale-105"
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-lg border border-white/5 bg-ink-raised hover:border-white/10 text-ash hover:text-paper transition-all flex items-center justify-center gap-1 font-mono text-xs"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                Finish
                <Check size={16} />
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        <div className="pt-2">
          <ScienceTierLabel slug={protocol.slug} tier={protocol.science_tier} />
        </div>

        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-xs text-ash hover:text-paper font-mono transition-colors"
          >
            Exit Protocol
          </button>
        </div>
      </div>

    </div>
  );
}
