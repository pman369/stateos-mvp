"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import StateAuditSlider from "../../../components/ui/StateAuditSlider";
import { db } from "../../../components/utils/db";

export default function NewAuditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
      if (!loggedIn) {
        router.replace("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleAuditSubmit = async (values: any, note: string) => {
    try {
      const audit = await db.createAudit(values);

      // If drift detected, open a drift event
      if (audit.drift_flag) {
        await db.createDriftEvent({
          state_audit_id: audit.id,
          trigger_source: "unspecified",
          trigger_note: note || "State Audit check-in triggered drift"
        });
        alert("Drift detected. Redirecting to Instrument Panel to resolve.");
      } else {
        alert("Check-in saved. State is stable.");
      }
      router.push("/today");
    } catch (e) {
      alert("Error saving check-in.");
    }
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

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6 w-full">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => router.push("/today")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Dashboard
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-paper">State Audit</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Calibrate your current nervous system baseline
          </p>
        </div>

        {/* Slider form */}
        <div className="bg-ink-raised border border-white/5 rounded-2xl p-6 shadow-xl">
          <StateAuditSlider onSubmit={handleAuditSubmit} />
        </div>

      </main>
    </div>
  );
}
