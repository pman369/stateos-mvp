import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";
import { DailyArchitectureLog, db } from "../utils/db";

interface DailyArchitectureCardProps {
  onLaunchProtocol: (slug: string, segment: "morning" | "afternoon" | "evening") => void;
  refreshTrigger?: number;
}

const SEGMENT_METADATA = {
  morning: {
    label: "Morning Architecture",
    timeText: "Best done before 09:00",
    desc: "Set the tone before the day sets it for you. Align spine, practice timeline lock-in, and activate your signature identity statement.",
    protocolSlug: "timeline-lock-in",
    duration: "3 mins"
  },
  afternoon: {
    label: "Afternoon Realignment",
    timeText: "Best done between 13:00 - 15:00",
    desc: "One-minute micro-reset. Release cognitive build-up, anchor center-sternum, and restore neural baseline.",
    protocolSlug: "irp",
    duration: "1 min"
  },
  evening: {
    label: "Evening Closeout",
    timeText: "Best done after 20:00",
    desc: "Unload autonomic tension before sleep. Heart coherence cycles combined with emotional detox and structural release.",
    protocolSlug: "heart-coherence-switch",
    duration: "2 mins"
  }
};

export default function DailyArchitectureCard({
  onLaunchProtocol,
  refreshTrigger = 0
}: DailyArchitectureCardProps) {
  const [log, setLog] = useState<DailyArchitectureLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayLog() {
      try {
        setIsLoading(true);
        const todayStr = new Date().toISOString().split("T")[0];
        const allLogs = await db.getDailyArchitectureLogs();
        const todayLog = allLogs.find((l) => l.log_date === todayStr);
        setLog(todayLog || null);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodayLog();
  }, [refreshTrigger]);

  const handleLaunch = (segment: "morning" | "afternoon" | "evening") => {
    const meta = SEGMENT_METADATA[segment];
    onLaunchProtocol(meta.protocolSlug, segment);
  };

  const getCompletionTimeStr = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-ink-raised border border-white/5 rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-16 bg-white/5 rounded" />
          <div className="h-16 bg-white/5 rounded" />
          <div className="h-16 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  const segments: ("morning" | "afternoon" | "evening")[] = ["morning", "afternoon", "evening"];

  return (
    <div className="w-full bg-ink-raised border border-white/5 rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-baseline">
        <h2 className="font-serif text-lg text-paper font-bold">Daily Architecture</h2>
        <span className="text-[10px] font-mono text-ash uppercase tracking-widest">Today's Alignment</span>
      </div>

      <div className="space-y-4">
        {segments.map((seg) => {
          const meta = SEGMENT_METADATA[seg];
          const isCompleted = log ? !!log[`${seg}_completed` as keyof DailyArchitectureLog] : false;
          const completedAt = log ? (log[`${seg}_completed_at` as keyof DailyArchitectureLog] as string | undefined) : undefined;

          return (
            <div
              key={seg}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isCompleted
                  ? "bg-white/[0.02] border-white/5 opacity-80"
                  : "bg-ink border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <button
                    disabled={isCompleted}
                    onClick={() => handleLaunch(seg)}
                    className={`mt-0.5 rounded-full transition-transform focus:outline-none ${
                      isCompleted ? "text-signal" : "text-ash hover:text-paper"
                    }`}
                    title={isCompleted ? "Completed" : "Start Protocol"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="fill-signal/10" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>

                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-semibold text-paper flex items-center gap-2">
                      {meta.label}
                      <span className="text-[9px] font-mono text-ash/80 bg-white/5 px-1.5 py-0.5 rounded">
                        {meta.duration}
                      </span>
                    </h3>
                    <p className="text-xs text-ash leading-relaxed max-w-sm">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {isCompleted ? (
                    <span className="text-[10px] font-mono text-signal flex items-center gap-1">
                      <Clock size={10} />
                      {getCompletionTimeStr(completedAt)}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleLaunch(seg)}
                      className="py-1 px-2.5 rounded bg-signal/10 text-signal hover:bg-signal text-xs font-mono font-medium hover:text-ink transition-all flex items-center gap-0.5"
                    >
                      Align
                      <ChevronRight size={12} />
                    </button>
                  )}
                  <span className="text-[9px] font-mono text-ash/60">{meta.timeText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
