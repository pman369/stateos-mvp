"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Bookmark, Trash2, Check, Sparkles } from "lucide-react";
import Navbar from "../../../components/layout/Navbar";
import { db, IdentityAnchor } from "../../../components/utils/db";

// Dynamic local reflection prompts mapping
const LOCAL_REFLECTIONS: Record<string, string[]> = {
  memory: [
    "Where in your body do you feel this memory most strongly right now?",
    "What specific colors, shapes, or environmental sounds stand out from this moment?",
    "If you could capture this entire state in a single word, what would it be?"
  ],
  word: [
    "When you say this word silently, how does your breath pace adjust?",
    "What image or physical posture does this word immediately invoke?",
    "Under what specific triggers would speaking this word provide the fastest return to baseline?"
  ],
  gesture: [
    "Feel the pressure points of this gesture. How does it redirect your muscular holding patterns?",
    "Can you couple this gesture with a slow exhale to double the vagal stimulation?",
    "In what public situations can you execute this gesture ambiently without breaking contact?"
  ],
  breath_pattern: [
    "How does the expansion of your lungs in this pattern shift your shoulder position?",
    "Can you notice the transition point between inhale and exhale? What occurs in that gap?",
    "Does this pattern feel easier or harder to execute when cognitive load is high?"
  ]
};

export default function IdentityAnchorsPage() {
  const router = useRouter();
  const [anchors, setAnchors] = useState<IdentityAnchor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("");
  const [anchorType, setAnchorType] = useState<IdentityAnchor["anchor_type"]>("memory");
  const [description, setDescription] = useState("");

  // Reflection states
  const [activeReflections, setActiveReflections] = useState<string[]>([]);
  const [reflectingAnchorId, setReflectingAnchorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnchors() {
      try {
        setIsLoading(true);
        if (typeof window !== "undefined") {
          const loggedIn = localStorage.getItem("stateos_logged_in") === "true";
          if (!loggedIn) {
            router.replace("/login");
            return;
          }
        }
        const data = await db.getIdentityAnchors();
        setAnchors(data);
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnchors();
  }, [router]);

  const handleAddAnchor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const newAnchor = await db.createIdentityAnchor({
        label,
        anchor_type: anchorType,
        description
      });

      setAnchors(prev => [newAnchor, ...prev]);
      setShowAddForm(false);
      
      // Trigger reflection prompts
      triggerReflections(newAnchor);

      // Reset form
      setLabel("");
      setAnchorType("memory");
      setDescription("");
    } catch (e) {
      alert("Error saving anchor.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerReflections = async (anchor: IdentityAnchor) => {
    setReflectingAnchorId(anchor.id);
    setActiveReflections([]);

    // Call API proxy if cloud mode, otherwise trigger local mock questions
    try {
      if (db.isCloudMode()) {
        const response = await fetch("/api/reflect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: anchor.description,
            anchor_type: anchor.anchor_type
          })
        });
        if (response.ok) {
          const data = await response.json();
          setActiveReflections(data.prompts);
          return;
        }
      }
    } catch (e) {
      // fallback to local
    }

    // Local simulated Gemini reflection prompts
    const prompts = LOCAL_REFLECTIONS[anchor.anchor_type] || LOCAL_REFLECTIONS.memory;
    setTimeout(() => {
      setActiveReflections(prompts);
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this anchor?")) return;
    try {
      await db.deleteIdentityAnchor(id);
      setAnchors(prev => prev.filter(a => a.id !== id));
      if (reflectingAnchorId === id) {
        setReflectingAnchorId(null);
        setActiveReflections([]);
      }
    } catch (e) {
      alert("Error deleting anchor.");
    }
  };

  const handleToggleActive = async (id: string, activeState: boolean) => {
    try {
      // Toggle off all other anchors first
      const updatedList = await Promise.all(
        anchors.map(async (a) => {
          if (a.id === id) {
            return await db.updateIdentityAnchor(id, { is_active: !activeState });
          } else if (activeState) {
            // Keep current
            return a;
          } else {
            // Deactivate others
            return await db.updateIdentityAnchor(a.id, { is_active: false });
          }
        })
      );
      setAnchors(updatedList);
    } catch (e) {
      // console.error(e);
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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 w-full">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <button
              onClick={() => router.push("/today")}
              className="flex items-center gap-1 text-xs font-mono text-ash hover:text-paper transition-colors mb-2"
            >
              <ChevronLeft size={14} />
              Dashboard
            </button>
            <h1 className="font-serif text-3xl font-bold text-paper">Identity Anchors</h1>
            <p className="text-xs text-ash font-mono uppercase tracking-wider">
              Establish sensory anchors for state engineering
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="py-2 px-4 rounded-lg bg-signal text-ink font-semibold text-xs font-mono flex items-center gap-1 hover:bg-signal/90 transition-all shadow"
          >
            <Plus size={14} />
            Add Anchor
          </button>
        </div>

        {/* ADD ANCHOR FORM */}
        {showAddForm && (
          <form onSubmit={handleAddAnchor} className="p-6 bg-ink-raised border border-white/5 rounded-xl space-y-4 animate-fadeIn">
            <h3 className="font-serif text-base text-paper font-semibold">New Identity Anchor</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="anchor-label" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
                  Anchor Title (Name/Label)
                </label>
                <input
                  id="anchor-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Center Gesture, Breath Hold"
                  className="w-full p-2 bg-ink border border-white/5 rounded text-xs text-paper focus:outline-none focus:border-signal/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="anchor-type" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
                  Somatic Anchor Type
                </label>
                <select
                  id="anchor-type"
                  value={anchorType}
                  onChange={(e) => setAnchorType(e.target.value as any)}
                  className="w-full p-2 bg-ink border border-white/5 rounded text-xs text-paper focus:outline-none focus:border-signal/50"
                >
                  <option value="memory">Sensory Memory</option>
                  <option value="word">Anchor Word/Phrase</option>
                  <option value="gesture">Physical Gesture</option>
                  <option value="breath_pattern">Breathing Pattern</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="anchor-desc" className="block text-[10px] font-mono text-ash uppercase tracking-wider">
                Sensory description
              </label>
              <textarea
                id="anchor-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the memory, gesture pressure points, or breathing ratios. Be specific."
                className="w-full p-3 bg-ink border border-white/5 rounded text-xs text-paper placeholder:text-ash/40 focus:outline-none focus:border-signal/50 leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded border border-white/10 text-xs font-mono text-ash hover:border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-3 py-1.5 rounded bg-signal text-ink font-semibold text-xs font-mono hover:bg-signal/90"
              >
                Save Anchor
              </button>
            </div>
          </form>
        )}

        {/* GEMINI DYNAMIC REFLECTION CARD */}
        {reflectingAnchorId && activeReflections.length > 0 && (
          <div className="p-5 bg-signal/5 border border-signal/20 rounded-xl space-y-4 animate-fadeIn">
            <div className="flex gap-2 items-center text-signal text-xs font-mono uppercase tracking-wider">
              <Sparkles size={14} />
              Gemini Reflection Insights
            </div>
            <p className="text-xs text-ash leading-relaxed">
              Reflective inquiries generated from your sensory description to deepen integration:
            </p>
            <ul className="space-y-2 pl-4 list-disc text-xs text-paper leading-relaxed">
              {activeReflections.map((ref, idx) => (
                <li key={idx} className="italic">"{ref}"</li>
              ))}
            </ul>
            <button
              onClick={() => {
                setReflectingAnchorId(null);
                setActiveReflections([]);
              }}
              className="text-[10px] font-mono text-ash hover:text-paper underline"
            >
              Clear reflections
            </button>
          </div>
        )}

        {/* ANCHOR DIRECTORY LISTING */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif text-lg text-paper font-semibold">Anchor Directory</h3>
            <span className="text-[10px] font-mono text-ash uppercase tracking-widest">
              {anchors.length} Saved Anchors
            </span>
          </div>

          {anchors.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-sm text-ash leading-relaxed">
              You don't have any Identity Anchors saved. These are quick reference points — a word, a memory, a feeling — for when you need to find your way back to yourself fast. Add one whenever you're ready.
            </div>
          ) : (
            <div className="space-y-4">
              {anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className={`p-5 rounded-xl border bg-ink-raised transition-all flex flex-col justify-between gap-4 ${
                    anchor.is_active 
                      ? "border-signal/30 shadow-[0_0_12px_rgba(232,199,122,0.05)]" 
                      : "border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bookmark 
                          size={14} 
                          className={anchor.is_active ? "text-signal" : "text-ash"} 
                        />
                        <h4 className="font-serif text-base font-bold text-paper">
                          {anchor.label}
                        </h4>
                        <span className="text-[9px] font-mono text-ash uppercase bg-white/5 px-1.5 py-0.5 rounded ml-2">
                          {anchor.anchor_type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-ash leading-relaxed max-w-2xl mt-1">
                        {anchor.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(anchor.id, anchor.is_active)}
                        className={`py-1 px-2.5 rounded text-[10px] font-mono font-medium border transition-all flex items-center gap-1 ${
                          anchor.is_active
                            ? "bg-signal/15 border-signal/20 text-signal"
                            : "bg-ink border-white/5 text-ash hover:border-white/10 hover:text-paper"
                        }`}
                      >
                        {anchor.is_active ? <Check size={10} /> : null}
                        {anchor.is_active ? "Active" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(anchor.id)}
                        className="p-1.5 rounded border border-white/5 bg-ink text-ash hover:text-red-400 hover:border-red-950/40 transition-colors"
                        title="Delete Anchor"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Trigger reflections explicitly */}
                  {reflectingAnchorId !== anchor.id && (
                    <div className="border-t border-white/5 pt-3">
                      <button
                        onClick={() => triggerReflections(anchor)}
                        className="text-[10px] font-mono text-ash hover:text-signal transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={10} />
                        Run cognitive reflection prompts...
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
