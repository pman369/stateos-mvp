"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, Sliders, ShieldCheck, UserCheck, ChevronRight } from "lucide-react";
import Navbar from "../../components/layout/Navbar";

export default function SettingsPage() {
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

  const settingsLinks = [
    {
      title: "Daily Architecture Reminders",
      description: "Manage morning, afternoon, and evening push notifications",
      path: "/settings/reminders",
      icon: <Bell size={18} className="text-signal" />
    },
    {
      title: "User Preferences",
      description: "Calibrate system theme, measurement units, and timezones",
      path: "/settings/preferences",
      icon: <Sliders size={18} className="text-signal" />
    },
    {
      title: "Privacy & Data Portability",
      description: "Export full nervous system history or opt-in to research",
      path: "/settings/privacy",
      icon: <ShieldCheck size={18} className="text-signal" />
    },
    {
      title: "Account Control & Danger Zone",
      description: "Modify password credentials or permanently purge account logs",
      path: "/settings/account",
      icon: <UserCheck size={18} className="text-signal" />
    }
  ];

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

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors"
          >
            <ChevronLeft size={14} />
            User Profile
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-paper">System Settings</h1>
          <p className="text-xs text-ash font-mono uppercase tracking-wider">
            Configure application variables and autonomic behavior
          </p>
        </div>

        {/* Settings Links List */}
        <div className="bg-ink-raised border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-md">
          {settingsLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => router.push(link.path)}
              className="w-full p-5 text-left hover:bg-white/[0.01] transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-ink border border-white/5 mt-0.5">
                  {link.icon}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-serif text-sm font-semibold text-paper group-hover:text-signal transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-ash">
                    {link.description}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-ash/60 group-hover:text-paper transition-colors shrink-0" />
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}
