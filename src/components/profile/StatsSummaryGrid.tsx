import React, { useEffect, useState } from "react";
import { Award, Zap, Activity, ShieldAlert, Award as Compass } from "lucide-react";
import { db, DriftEvent, ProtocolSession, DailyArchitectureLog } from "../utils/db";

interface Stats {
  totalSessions: number;
  averageRecoveryWindow: string;
  currentStreak: number;
  mostCommonTrigger: string;
  mostUsedProtocol: string;
}

export default function StatsSummaryGrid() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);

        const audits = await db.getAudits();
        const driftEvents = await db.getDriftEvents();
        const sessions = await db.getProtocolSessions();
        const dailyLogs = await db.getDailyArchitectureLogs();

        // 1. Total Completed Sessions
        const completedSessions = sessions.filter((s) => s.completed);
        const totalSessions = completedSessions.length;

        // 2. Average Recovery Window (30-day rolling)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const resolvedRecentDrifts = driftEvents.filter(
          (e) => e.resolved_at && new Date(e.detected_at) >= thirtyDaysAgo
        );
        let averageRecoveryWindow = "—";
        if (resolvedRecentDrifts.length > 0) {
          const totalSecs = resolvedRecentDrifts.reduce(
            (acc, curr) => acc + (curr.recovery_window_seconds || 0),
            0
          );
          const avgSecs = totalSecs / resolvedRecentDrifts.length;
          if (avgSecs <= 60) {
            averageRecoveryWindow = `${Math.round(avgSecs)}s (Instant)`;
          } else {
            averageRecoveryWindow = `${Math.round(avgSecs / 60)}m (Rapid)`;
          }
        }

        // 3. Streak Count (consecutive days of morning, afternoon, and evening alignment)
        let currentStreak = 0;
        const sortedLogs = [...dailyLogs].sort(
          (a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
        );

        const todayStr = new Date().toISOString().split("T")[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        // Helper to check if a log date represents complete architecture
        const isComplete = (log?: DailyArchitectureLog) => {
          return log ? log.morning_completed && log.afternoon_completed && log.evening_completed : false;
        };

        const todayLog = sortedLogs.find((l) => l.log_date === todayStr);
        const yesterdayLog = sortedLogs.find((l) => l.log_date === yesterdayStr);

        // A streak is active if either today is complete, or yesterday was complete
        let checkDate = new Date();
        if (!isComplete(todayLog) && isComplete(yesterdayLog)) {
          // If today isn't done yet, but yesterday was, start counting from yesterday
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (!isComplete(todayLog) && !isComplete(yesterdayLog)) {
          // Both today and yesterday are incomplete -> streak is broken/0
          checkDate = new Date(0); // force failure
        }

        if (checkDate.getTime() > 0) {
          while (true) {
            const dateStr = checkDate.toISOString().split("T")[0];
            const logForDate = sortedLogs.find((l) => l.log_date === dateStr);
            if (isComplete(logForDate)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1); // look at previous day
            } else {
              break;
            }
          }
        }

        // 4. Most Common Trigger Source
        const triggers = driftEvents
          .map((e) => e.trigger_source)
          .filter((t) => t && t !== "unspecified");
        const triggerCounts: Record<string, number> = {};
        triggers.forEach((t) => {
          triggerCounts[t] = (triggerCounts[t] || 0) + 1;
        });
        const mostCommonTrigger =
          Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

        // 5. Most Used Protocol
        const protocolSlugs = completedSessions.map((s) => s.protocol_slug);
        const protoCounts: Record<string, number> = {};
        protocolSlugs.forEach((s) => {
          protoCounts[s] = (protoCounts[s] || 0) + 1;
        });
        const topProtoSlug = Object.entries(protoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
        const mostUsedProtocol = topProtoSlug
          ? topProtoSlug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "—";

        setStats({
          totalSessions,
          averageRecoveryWindow,
          currentStreak,
          mostCommonTrigger,
          mostUsedProtocol,
        });
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-ink-raised border border-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Consecutive Streaks",
      value: `${stats?.currentStreak || 0} days`,
      icon: <Zap className="text-signal" size={16} />,
      desc: "Completed morning/afternoon/evening loops",
    },
    {
      label: "Avg Recovery Window",
      value: stats?.averageRecoveryWindow || "—",
      icon: <Activity className="text-signal" size={16} />,
      desc: "30-day rolling recovery baseline",
    },
    {
      label: "Total Resets Completed",
      value: stats?.totalSessions || 0,
      icon: <Award className="text-signal" size={16} />,
      desc: "Nervous system protocols logged",
    },
    {
      label: "Top Drift Trigger",
      value: stats?.mostCommonTrigger ? stats.mostCommonTrigger.toUpperCase() : "—",
      icon: <ShieldAlert className="text-signal" size={16} />,
      desc: "Your most common autonomic entry point",
    },
    {
      label: "Most Used Protocol",
      value: stats?.mostUsedProtocol || "—",
      icon: <Zap className="text-signal" size={16} />,
      desc: "Most frequented alignment mechanism",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="p-5 bg-ink-raised border border-white/5 rounded-xl space-y-2 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-ash uppercase tracking-wider">
              {item.label}
            </span>
            {item.icon}
          </div>
          <div className="font-mono text-2xl font-semibold text-paper tracking-tight">
            {item.value}
          </div>
          <p className="text-[10px] text-ash/85 leading-normal">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
