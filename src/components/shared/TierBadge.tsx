import React from "react";

export type RecoveryTier = "instant" | "rapid" | "standard" | "delayed" | "extended";

interface TierBadgeProps {
  tier: RecoveryTier;
  className?: string;
}

const TIER_METADATA: Record<
  RecoveryTier,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  instant: {
    label: "Instant",
    bg: "bg-[#E8C77A]/10",
    text: "text-[#E8C77A]",
    border: "border-[#E8C77A]/20",
    desc: "≤ 60 seconds (Clear)"
  },
  rapid: {
    label: "Rapid",
    bg: "bg-[#C9B48A]/10",
    text: "text-[#C9B48A]",
    border: "border-[#C9B48A]/20",
    desc: "1–5 minutes (Settling)"
  },
  standard: {
    label: "Standard",
    bg: "bg-[#9C9284]/10",
    text: "text-[#9C9284]",
    border: "border-[#9C9284]/20",
    desc: "5–30 minutes (Neutral)"
  },
  delayed: {
    label: "Delayed",
    bg: "bg-[#736B72]/10",
    text: "text-[#736B72]",
    border: "border-[#736B72]/20",
    desc: "30 min–2 hours (Dense)"
  },
  extended: {
    label: "Extended",
    bg: "bg-[#4A4550]/15",
    text: "text-[#EDEBE6]/70", // Keep it legible
    border: "border-[#4A4550]/30",
    desc: "2+ hours (Heavy)"
  }
};

export default function TierBadge({ tier, className = "" }: TierBadgeProps) {
  const meta = TIER_METADATA[tier] || TIER_METADATA.standard;

  return (
    <span
      className={`inline-flex flex-col items-start gap-0.5 rounded px-2.5 py-1 text-xs font-medium border ${meta.bg} ${meta.text} ${meta.border} ${className}`}
      title={meta.desc}
    >
      <span className="font-semibold uppercase tracking-wider text-[10px]">{meta.label}</span>
      <span className="text-[9px] opacity-75 font-mono leading-none">{meta.desc}</span>
    </span>
  );
}
