"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, TrendingUp, Calendar, ShieldAlert, Award } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import TierBadge, { RecoveryTier } from "../../../components/shared/TierBadge";
import { db, DriftEvent } from "../../../components/utils/db";

export default function RecoveryHistoryPage() {
  const router = useRouter();
  const [drifts, setDrifts] = useState<DriftEvent[]>([]);
  const [filterDays, setFilterDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDrifts() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }
        const allDrifts = await db.getDriftEvents();
        setDrifts(allDrifts);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDrifts();
  }, [router]);

  // Filter drifts based on date range
  const getFilteredDrifts = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    return drifts.filter(
      (d) => new Date(d.detected_at) >= cutoffDate && d.resolved_at
    );
  };

  const filteredDrifts = getFilteredDrifts();

  // 1. Calculate average recovery time
  const getAverageRecoveryTime = () => {
    if (filteredDrifts.length === 0) return "—";
    const total = filteredDrifts.reduce((acc, d) => acc + (d.recovery_window_seconds || 0), 0);
    const avg = total / filteredDrifts.length;
    if (avg <= 60) return `${Math.round(avg)}s`;
    return `${Math.round(avg / 60)} mins`;
  };

  // 2. Count tiers
  const getTierCounts = () => {
    const counts: Record<RecoveryTier, number> = {
      instant: 0,
      rapid: 0,
      standard: 0,
      delayed: 0,
      extended: 0
    };
    filteredDrifts.forEach((d) => {
      if (d.recovery_tier) {
        counts[d.recovery_tier] = (counts[d.recovery_tier] || 0) + 1;
      }
    });
    return counts;
  };

  // 3. Count triggers
  const getTriggerBreakdown = () => {
    const counts: Record<string, number> = {};
    filteredDrifts.forEach((d) => {
      if (d.trigger_source) {
        counts[d.trigger_source] = (counts[d.trigger_source] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const tierCounts = getTierCounts();
  const triggerBreakdown = getTriggerBreakdown();
  const totalResolved = filteredDrifts.length;

  // Custom SVG Line Chart Generator
  const renderSVGChart = () => {
    if (filteredDrifts.length < 2) {
      return (
        <div className="h-48 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-xs text-ash/80">
          A few more check-ins and this'll start showing a real trend.
        </div>
      );
    }

    // Sort chronologically ascending for line plot
    const chronoDrifts = [...filteredDrifts].sort(
      (a, b) => new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime()
    );

    const width = 500;
    const height = 150;
    const padding = 20;

    const maxVal = Math.max(...chronoDrifts.map((d) => d.recovery_window_seconds || 60), 60);

    const points = chronoDrifts.map((d, index) => {
      const x = padding + (index / (chronoDrifts.length - 1)) * (width - padding * 2);
      // logarithmic scale is much better for durations (60s vs 2hr) so smaller times don't compress
      const logY = Math.log(d.recovery_window_seconds || 1);
      const logMax = Math.log(maxVal);
      const y = height - padding - (logY / logMax) * (height - padding * 2);
      return { x, y, duration: d.recovery_window_seconds };
    });

    const pathData = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div className="w-full bg-ink border border-white/5 rounded-lg p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          {/* Target mastery gridline: 60s (Instant Recovery target) */}
          <line
            x1={padding}
            y1={height - padding - (Math.log(60) / Math.log(maxVal)) * (height - padding * 2)}
            x2={width - padding}
            y2={height - padding - (Math.log(60) / Math.log(maxVal)) * (height - padding * 2)}
            stroke="#E8C77A"
            strokeDasharray="4 4"
            strokeWidth="0.5"
            opacity="0.5"
          />
          <text
            x={padding}
            y={height - padding - (Math.log(60) / Math.log(maxVal)) * (height - padding * 2) - 4}
            fill="#E8C77A"
            fontSize="6"
            fontFamily="monospace"
            opacity="0.7"
          >
            60s Mastery Target
          </text>

          {/* Core trendline path */}
          <path d={pathData} fill="none" stroke="#8B8F9C" strokeWidth="1.5" />

          {/* Dots on data points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="3"
              fill={p.duration! <= 60 ? "#E8C77A" : "#9C9284"}
              stroke="#0F1116"
              strokeWidth="1"
              className="cursor-pointer hover:r-4 transition-all"
            >
              <title>{`Recovery time: ${Math.round(p.duration! / 60)} mins`}</title>
            </circle>
          ))}
        </svg>
        <div className="flex justify-between text-[8px] font-mono text-ash/60 px-2">
          <span>{new Date(chronoDrifts[0].detected_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
          <span>Recovery Trend Scope ({filterDays}d)</span>
          <span>{new Date(chronoDrifts[chronoDrifts.length - 1].detected_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
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
          <h1 className="font-serif text-3xl font-bold text-paper">Recovery Analytics</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Review history and trends of closed Recovery Windows
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="p-5 bg-ink-raised border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider block">Average Recovery</span>
            <div className="font-mono text-3xl font-semibold text-signal">{getAverageRecoveryTime()}</div>
            <p className="text-[10px] text-ash">Rolling average for selected period</p>
          </div>
          <div className="p-5 bg-ink-raised border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider block">Total Interventions</span>
            <div className="font-mono text-3xl font-semibold text-paper">{totalResolved} sessions</div>
            <p className="text-[10px] text-ash">Resolved drift events in selected period</p>
          </div>
          <div className="p-5 bg-ink-raised border border-white/5 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider block">Top Origin Node</span>
            <div className="font-mono text-3xl font-semibold text-paper">
              {triggerBreakdown[0]?.[0] ? triggerBreakdown[0][0].toUpperCase() : "—"}
            </div>
            <p className="text-[10px] text-ash">Most frequent source of logged drift</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-ink-raised border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Recovery Window Trendline</h3>
          {renderSVGChart()}
        </div>

        {/* Distribution Tiers & Triggers row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tier Distribution bar list */}
          <div className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Recovery Tier Distribution</h3>
            
            <div className="space-y-3">
              {(["instant", "rapid", "standard", "delayed", "extended"] as RecoveryTier[]).map((tier) => {
                const count = tierCounts[tier] || 0;
                const percent = totalResolved > 0 ? (count / totalResolved) * 100 : 0;
                
                const tierColorMap: Record<RecoveryTier, string> = {
                  instant: "bg-[#E8C77A]",
                  rapid: "bg-[#C9B48A]",
                  standard: "bg-[#9C9284]",
                  delayed: "bg-[#736B72]",
                  extended: "bg-[#4A4550]"
                };

                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span className="capitalize">{tier}</span>
                      <span className="text-ash">{count} events ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${tierColorMap[tier]} rounded-full`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Origins bar list */}
          <div className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4">
            <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Disruption Source Origin</h3>
            
            {triggerBreakdown.length === 0 ? (
              <p className="text-xs text-ash italic text-center py-10">No triggers recorded.</p>
            ) : (
              <div className="space-y-3">
                {triggerBreakdown.map(([source, count]) => {
                  const percent = totalResolved > 0 ? (count / totalResolved) * 100 : 0;

                  return (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="capitalize">{source}</span>
                        <span className="text-ash">{count} events ({Math.round(percent)}%)</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-signal/60 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Complete Drift Log Directory */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-paper font-semibold">Drift Log Directory</h3>
          
          {drifts.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-xs text-ash leading-relaxed">
              Nothing logged yet. When something throws you off, tap Diagnose — this is where you'll see how fast you're getting back.
            </div>
          ) : (
            <div className="bg-ink-raised border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {drifts.map((d) => (
                <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-paper font-semibold capitalize">
                        {d.trigger_source} drift
                      </span>
                      <span className="text-[10px] font-mono text-ash/60">
                        {new Date(d.detected_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    {d.trigger_note && (
                      <p className="text-xs text-ash leading-relaxed italic max-w-lg">
                        "{d.trigger_note}"
                      </p>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    {d.resolved_at ? (
                      <>
                        <TierBadge tier={d.recovery_tier!} />
                        <span className="text-xs font-mono text-paper font-medium min-w-[60px] text-right">
                          {Math.round((d.recovery_window_seconds || 0) / 60)} mins
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-signal font-semibold uppercase animate-pulse">
                        Unresolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
