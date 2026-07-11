"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, HelpCircle, Activity } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, StateAudit } from "../../../components/utils/db";

export default function AuditHistoryPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<StateAudit[]>([]);
  const [filterDays, setFilterDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAudits() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }
        const data = await db.getAudits();
        setAudits(data);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAudits();
  }, [router]);

  const getFilteredAudits = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    return audits.filter((a) => new Date(a.created_at) >= cutoffDate);
  };

  const filteredAudits = getFilteredAudits();

  // Get average dimensions
  const getAverage = (key: keyof Omit<StateAudit, "id" | "note" | "created_at" | "composite_score" | "drift_flag">) => {
    if (filteredAudits.length === 0) return 0;
    const total = filteredAudits.reduce((acc, a) => acc + (a[key] as number), 0);
    return parseFloat((total / filteredAudits.length).toFixed(1));
  };

  // Custom SVG Multi-line Chart
  const renderSVGChart = () => {
    if (filteredAudits.length < 2) {
      return (
        <div className="h-56 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-xs text-ash/80">
          A few more check-ins and this'll start showing a real trend.
        </div>
      );
    }

    const chronoAudits = [...filteredAudits].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const width = 500;
    const height = 220;
    const padding = 30;

    // Keys and colors for lines
    const dimensions = [
      { key: "energy", color: "#E8C77A", label: "Energy" }, // gold
      { key: "clarity", color: "#C9B48A", label: "Clarity" },
      { key: "emotional_stability", color: "#9C9284", label: "Stability" },
      { key: "identity_alignment", color: "#736B72", label: "Identity" },
      { key: "environmental_match", color: "#4A4550", label: "Environment" }
    ];

    const gridLines = [1, 2, 3, 4, 5];

    return (
      <div className="w-full bg-ink border border-white/5 rounded-lg p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
          {/* Gridlines (1-5 range) */}
          {gridLines.map((gl) => {
            const y = height - padding - ((gl - 1) / 4) * (height - padding * 2);
            return (
              <g key={gl} opacity="0.15">
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#EDEBE6"
                  strokeWidth="0.5"
                />
                <text
                  x={padding - 12}
                  y={y + 2}
                  fill="#EDEBE6"
                  fontSize="7"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {gl}
                </text>
              </g>
            );
          })}

          {/* Plot Lines */}
          {dimensions.map((dim) => {
            const points = chronoAudits.map((a, index) => {
              const x = padding + (index / (chronoAudits.length - 1)) * (width - padding * 2);
              const val = a[dim.key as keyof StateAudit] as number;
              // 1 is bottom, 5 is top (higher numbers represent more friction/fog/drift in State Audits)
              const y = height - padding - ((val - 1) / 4) * (height - padding * 2);
              return { x, y };
            });

            const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

            return (
              <g key={dim.key}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={dim.color}
                  strokeWidth="1.2"
                  opacity="0.85"
                />
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="2"
                    fill={dim.color}
                    opacity="0.9"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2 border-t border-white/5 pt-3">
          {dimensions.map((dim) => (
            <div key={dim.key} className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dim.color }} />
              <span className="text-ash">{dim.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/today")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            Dashboard
          </button>

          {/* Filter Scopes */}
          <div className="flex bg-ink-raised border border-white/5 rounded-lg p-0.5 font-mono text-[10px]">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setFilterDays(days)}
                className={`py-1 px-3 rounded transition-colors ${
                  filterDays === days ? "bg-signal text-ink font-semibold" : "text-ash hover:text-paper"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-paper">State Trends</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Review longitudinal dimensions of tracked internal state
          </p>
        </div>

        {/* Dimension averages */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
          {[
            { key: "energy", label: "Energy (exhausted)" },
            { key: "clarity", label: "Clarity (foggy)" },
            { key: "emotional_stability", label: "Stability (reactive)" },
            { key: "identity_alignment", label: "Identity (drifted)" },
            { key: "environmental_match", label: "Environment (friction)" }
          ].map((item) => (
            <div key={item.key} className="p-4 bg-ink-raised border border-white/5 rounded-xl text-center space-y-1">
              <span className="text-[8px] font-mono text-ash uppercase tracking-wider block leading-tight">
                {item.label}
              </span>
              <div className="font-mono text-xl font-bold text-signal">
                {getAverage(item.key as any)}
              </div>
              <span className="text-[9px] text-ash/60 font-mono">scale 1–5</span>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="bg-ink-raised border border-white/5 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Historical Dimension Tracking</h3>
            <span className="text-[9px] font-mono text-ash flex items-center gap-1">
              <Info size={10} />
              Higher values indicate more stress/friction
            </span>
          </div>
          {renderSVGChart()}
        </div>

        {/* State Audit History list */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-paper font-semibold">Audit Check-in History</h3>

          {audits.length === 0 ? (
            <p className="text-xs text-ash italic text-center py-10">No audits recorded.</p>
          ) : (
            <div className="bg-ink-raised border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {audits.map((a) => (
                <div key={a.id} className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-paper font-semibold">
                      Composite score: {a.composite_score} / 5.0
                    </span>
                    <span className="text-ash/60">
                      {new Date(a.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  {/* Grid showing individual dimensions */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                    {[
                      { label: "ENE", val: a.energy },
                      { label: "CLA", val: a.clarity },
                      { label: "STA", val: a.emotional_stability },
                      { label: "IDE", val: a.identity_alignment },
                      { label: "ENV", val: a.environmental_match }
                    ].map((dim, idx) => (
                      <div key={idx} className="p-1 rounded bg-ink border border-white/5">
                        <span className="text-ash block text-[8px]">{dim.label}</span>
                        <span className={`font-semibold ${dim.val >= 4 ? "text-signal" : "text-paper"}`}>
                          {dim.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {a.note && (
                    <p className="text-xs text-ash leading-relaxed italic mt-2">
                      "{a.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
