import React, { useEffect, useState } from "react";

interface RecoveryWindowTimerProps {
  detectedAt: string; // ISO String
  isActive: boolean;
  onTick?: (seconds: number) => void;
  className?: string;
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

// Map seconds to color and label tokens
function getTimerMetadata(seconds: number) {
  if (seconds <= 60) {
    return {
      tier: "Instant",
      colorClass: "text-[#E8C77A] drop-shadow-[0_0_12px_rgba(232,199,122,0.3)]",
      bgColorClass: "bg-[#E8C77A]/10",
      borderColorClass: "border-[#E8C77A]/20"
    };
  }
  if (seconds <= 300) {
    return {
      tier: "Rapid",
      colorClass: "text-[#C9B48A] drop-shadow-[0_0_12px_rgba(201,180,138,0.2)]",
      bgColorClass: "bg-[#C9B48A]/10",
      borderColorClass: "border-[#C9B48A]/20"
    };
  }
  if (seconds <= 1800) {
    return {
      tier: "Standard",
      colorClass: "text-[#9C9284]",
      bgColorClass: "bg-[#9C9284]/10",
      borderColorClass: "border-[#9C9284]/20"
    };
  }
  if (seconds <= 7200) {
    return {
      tier: "Delayed",
      colorClass: "text-[#736B72]",
      bgColorClass: "bg-[#736B72]/10",
      borderColorClass: "border-[#736B72]/20"
    };
  }
  return {
    tier: "Extended",
    colorClass: "text-[#EDEBE6]/70",
    bgColorClass: "bg-[#4A4550]/15",
    borderColorClass: "border-[#4A4550]/30"
  };
}

export default function RecoveryWindowTimer({
  detectedAt,
  isActive,
  onTick,
  className = ""
}: RecoveryWindowTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(detectedAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((now - start) / 1000));
    };

    // Set initial
    const initialElapsed = calculateElapsed();
    setElapsedSeconds(initialElapsed);
    if (onTick) onTick(initialElapsed);

    if (!isActive) return;

    const interval = setInterval(() => {
      const nextElapsed = calculateElapsed();
      setElapsedSeconds(nextElapsed);
      if (onTick) onTick(nextElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [detectedAt, isActive, onTick]);

  const meta = getTimerMetadata(elapsedSeconds);

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {/* Small Eyebrow: Current Tier */}
      <span className="text-[10px] font-mono text-ash uppercase tracking-widest mb-1">
        Recovery Window · {meta.tier} State
      </span>

      {/* Huge Monospace Timer */}
      <div 
        className={`font-mono text-5xl md:text-6xl font-medium tracking-tight transition-all duration-500 ${meta.colorClass}`}
      >
        {formatDuration(elapsedSeconds)}
      </div>

      {/* Sub-label explaining thresholds */}
      <div className="mt-3 flex gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${meta.bgColorClass} ${meta.colorClass} ${meta.borderColorClass}`}>
          {meta.tier === "Instant" && "Optimal Re-regulation"}
          {meta.tier === "Rapid" && "Slowing Autonomic Load"}
          {meta.tier === "Standard" && "Baseline Restoring"}
          {meta.tier === "Delayed" && "Persistent Autonomic Load"}
          {meta.tier === "Extended" && "High Drift Persistence"}
        </span>
      </div>
    </div>
  );
}
