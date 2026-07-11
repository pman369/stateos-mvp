"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import DangerZoneCard from "../../../components/settings/DangerZoneCard";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
      if (!loggedIn) {
        router.replace("/login");
      } else {
        const userEmail = localStorage.getItem("stateos_user_email") || "seeker@stateos.local";
        setEmail(userEmail);
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleAccountDeleted = () => {
    // Clear auth flags
    localStorage.removeItem("stateos_logged_in");
    localStorage.removeItem("stateos_user_email");
    localStorage.removeItem("stateos_onboarded");
    
    alert("Account permanently deleted and local storage purged.");
    router.push("/login");
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

      <main className="flex-1 max-w-xl mx-auto px-4 py-8 md:py-12 space-y-6 w-full">
        {/* Navigation */}
        <div>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            System Settings
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-paper">Account</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Manage account credentials and security
          </p>
        </div>

        {/* Profile details */}
        <div className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4 shadow-md">
          <h3 className="text-xs font-mono text-paper uppercase tracking-wider">Account Credentials</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-baseline bg-ink p-3 rounded border border-white/5">
              <span className="text-xs font-serif text-ash">Primary Email:</span>
              <span className="text-xs font-mono text-paper">{email}</span>
            </div>
            
            <div className="flex justify-between items-baseline bg-ink p-3 rounded border border-white/5">
              <span className="text-xs font-serif text-ash">Account Status:</span>
              <span className="text-xs font-mono text-signal font-semibold uppercase">Calibrated</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <DangerZoneCard onAccountDeleted={handleAccountDeleted} />

      </main>
    </div>
  );
}
