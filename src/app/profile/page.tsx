"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Calendar, Settings } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import SignatureStatementEditor from "../../components/profile/SignatureStatementEditor";
import StatsSummaryGrid from "../../components/profile/StatsSummaryGrid";
import { db, UserProfile } from "../../components/utils/db";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }
        const data = await db.getProfile();
        setProfile(data);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleProfileUpdate = async (name: string, bio: string) => {
    try {
      const updated = await db.updateProfile({ display_name: name, bio });
      setProfile(updated);
      alert("Profile updated.");
    } catch (e) {
      alert("Error saving profile details.");
    }
  };

  const getMemberSinceStr = () => {
    if (!profile?.member_since) return "";
    try {
      const date = new Date(profile.member_since);
      return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  };

  if (isLoading || !profile) {
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
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-full border border-white/5 bg-ink-raised text-ash hover:text-paper hover:border-white/10 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 bg-ink-raised border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-md">
          <div className="w-20 h-20 rounded-full border border-signal/30 bg-signal/5 flex items-center justify-center text-signal shrink-0">
            <User size={36} />
          </div>
          
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <h2 className="font-serif text-2xl font-bold text-paper">
                {profile.display_name || "Seeker"}
              </h2>
              <span className="text-[10px] font-mono text-ash flex items-center gap-1 justify-center sm:justify-start">
                <Calendar size={10} />
                Joined {getMemberSinceStr()}
              </span>
            </div>
            
            <EditableBio 
              initialBio={profile.bio || ""} 
              initialName={profile.display_name || ""} 
              onSave={handleProfileUpdate} 
            />
          </div>
        </div>

        {/* Signature statement editor */}
        <SignatureStatementEditor />

        {/* Stats view */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-paper font-semibold">Regulatory Analysis</h3>
          <StatsSummaryGrid />
        </div>

      </main>
    </div>
  );
}

// Subcomponent to handle bio and name edits locally
function EditableBio({
  initialName,
  initialBio,
  onSave
}: {
  initialName: string;
  initialBio: string;
  onSave: (name: string, bio: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, bio);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3 w-full">
        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 bg-ink border border-white/5 rounded text-xs text-paper focus:outline-none focus:border-signal/50"
            required
          />
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce your focus, context, or nervous system regulation intentions..."
            className="w-full p-2 bg-ink border border-white/5 rounded text-xs text-paper focus:outline-none focus:border-signal/50 leading-relaxed"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-2.5 py-1 rounded border border-white/10 text-[10px] font-mono text-ash hover:border-white/20"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-signal text-ink font-semibold text-[10px] font-mono hover:bg-signal/90"
          >
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-ash leading-relaxed">
        {initialBio || "Add a short personal biography or regulation intent in your profile."}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        className="text-[10px] font-mono text-signal hover:underline"
      >
        Edit profile details
      </button>
    </div>
  );
}
