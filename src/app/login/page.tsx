"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Loader2 } from "lucide-react";
import { db } from "../../components/utils/db";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (db.isCloudMode()) {
        if (isSignUp) {
          const { error } = await db.supabase!.auth.signUp({ email, password });
          if (error) throw error;
          alert("Account created. Please verify your email.");
        } else {
          const { error } = await db.supabase!.auth.signInWithPassword({ email, password });
          if (error) throw error;
          router.push("/");
        }
      } else {
        // Local Mode login simulation
        localStorage.setItem("stateos_logged_in", "true");
        localStorage.setItem("stateos_user_email", email);
        
        const isOnboarded = localStorage.getItem("stateos_onboarded") === "true";
        if (isOnboarded) {
          router.push("/today");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineDemo = () => {
    localStorage.setItem("stateos_logged_in", "true");
    localStorage.setItem("stateos_user_email", "demo@stateos.local");
    
    const isOnboarded = localStorage.getItem("stateos_onboarded") === "true";
    if (isOnboarded) {
      router.push("/today");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-ink">
      <div className="w-full max-w-md space-y-8 p-8 bg-ink-raised border border-white/5 rounded-2xl shadow-xl text-center">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border border-signal/30 flex items-center justify-center bg-signal/5">
            <Compass className="text-signal" size={24} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-paper mt-2">stateOS</h1>
          <p className="text-[10px] font-mono text-ash uppercase tracking-widest">
            Nervous System Regulation Platform
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-400 font-mono text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label htmlFor="email-input" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full p-2.5 bg-ink border border-white/5 rounded text-sm text-paper placeholder:text-ash/35 focus:outline-none focus:border-signal/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password-input" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 bg-ink border border-white/5 rounded text-sm text-paper placeholder:text-ash/35 focus:outline-none focus:border-signal/50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-signal text-ink font-semibold text-xs font-mono flex items-center justify-center gap-1 hover:bg-signal/95 transition-colors focus:ring-1 focus:ring-signal/30 mt-2"
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {isSignUp ? "Create Account" : "Access Console"}
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative px-3 bg-ink-raised text-[9px] font-mono text-ash/60 uppercase">Or</span>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleOfflineDemo}
            className="w-full py-2.5 rounded border border-white/5 hover:border-white/10 text-xs font-mono text-paper transition-all"
          >
            Enter Offline Demo Console
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-ash hover:text-paper font-mono underline transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>

        <div className="text-[9px] font-mono text-ash/40 pt-4 leading-normal">
          {db.isCloudMode() 
            ? "Cloud active: authenticating via Supabase database."
            : "No cloud credentials detected. Running in Local-First Demo Mode."}
        </div>

      </div>
    </div>
  );
}
