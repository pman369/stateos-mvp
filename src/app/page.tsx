"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../components/utils/db";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      // If Cloud Mode, check Supabase session
      if (db.isCloudMode()) {
        const { data: { session } } = await db.supabase!.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
      }

      // Check onboarding completion status
      if (typeof window !== "undefined") {
        const isCompleted = localStorage.getItem("stateos_onboarded") === "true";
        if (isCompleted) {
          router.replace("/today");
        } else {
          router.replace("/onboarding");
        }
      }
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-signal animate-spin" />
        <span className="text-xs font-mono text-ash uppercase tracking-widest animate-pulse">
          Calibrating stateOS...
        </span>
      </div>
    </div>
  );
}
