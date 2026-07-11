import React from "react";

interface BreathPulseProps {
  type?: "glow" | "line" | "both";
  isActive?: boolean;
  className?: string;
}

export default function BreathPulse({ type = "both", isActive = true, className = "" }: BreathPulseProps) {
  if (!isActive) {
    // If not active, render a static indicator (the gold dot requested by the spec for static states)
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {type !== "line" && (
          <div className="absolute w-64 h-64 rounded-full bg-signal/5 blur-3xl opacity-30 pointer-events-none" />
        )}
        {type !== "glow" && (
          <div className="w-16 h-0.5 bg-signal/30 rounded-full" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center w-full overflow-hidden pointer-events-none ${className}`}>
      {/* Background radial glow expanding and contracting */}
      {(type === "glow" || type === "both") && (
        <div 
          className="absolute w-72 h-72 rounded-full bg-radial from-signal/20 to-transparent blur-3xl opacity-40 animate-breath-glow" 
          style={{ willChange: "transform, opacity" }}
        />
      )}

      {/* Rhythmic breathing line expanding and contracting horizontally */}
      {(type === "line" || type === "both") && (
        <div className="w-48 flex flex-col items-center gap-1 z-10">
          <div 
            className="w-full h-0.5 bg-signal rounded-full shadow-[0_0_8px_rgba(232,199,122,0.5)] animate-breath-line"
            style={{ transformOrigin: "center", willChange: "transform" }}
          />
          <div className="flex justify-between w-full text-[9px] font-mono text-ash/80 px-1 mt-1">
            <span>Inhale</span>
            <span>Exhale</span>
          </div>
        </div>
      )}
    </div>
  );
}
