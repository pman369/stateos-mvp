import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Activity, Bookmark, User, LogOut } from "lucide-react";
import { db } from "../utils/db";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Today", path: "/today", icon: <Home size={18} /> },
    { label: "Diagnose", path: "/diagnose", icon: <Compass size={18} /> },
    { label: "Recovery", path: "/recovery/history", icon: <Activity size={18} /> },
    { label: "Anchors", path: "/identity/anchors", icon: <Bookmark size={18} /> },
    { label: "Profile", path: "/profile", icon: <User size={18} /> },
  ];

  const handleLogout = async () => {
    // In Local Mode, redirect to login
    // In Cloud Mode, trigger supabase signout
    if (db.isCloudMode()) {
      await db.supabase!.auth.signOut();
    }
    router.push("/login");
  };

  return (
    <>
      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-raised border-t border-white/5 z-50 px-4 py-2 flex justify-around items-center select-none shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-colors ${
                isActive ? "text-signal" : "text-ash hover:text-paper"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-mono tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-ink-raised border-r border-white/5 fixed top-0 bottom-0 left-0 p-6 z-50">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-paper">stateOS</span>
            <span className="text-[9px] font-mono text-signal uppercase tracking-widest mt-0.5">
              Nervous System Instrument
            </span>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-mono text-xs ${
                      isActive
                        ? "bg-white/[0.03] text-signal border-l-2 border-signal"
                        : "text-ash hover:text-paper hover:bg-white/[0.01]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-ash hover:text-red-400 hover:bg-red-950/10 transition-all font-mono text-xs"
          >
            <LogOut size={16} />
            Sign Out
          </button>
          
          <div className="text-center">
            <span className="text-[9px] font-mono text-ash/40">
              {db.isCloudMode() ? "Cloud Mode (Supabase)" : "Local Mode (Offline)"}
            </span>
          </div>
        </div>
      </aside>

      {/* Spacer to push content above mobile navbar */}
      <div className="h-16 md:hidden" />
      {/* Spacer to pad desktop layout */}
      <div className="hidden md:block pl-64" />
    </>
  );
}
