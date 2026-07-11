import React, { useEffect, useState } from "react";
import { Check, Edit3, Loader2 } from "lucide-react";
import { db } from "../utils/db";

interface SignatureStatementEditorProps {
  onSaved?: (statement: string) => void;
}

export default function SignatureStatementEditor({ onSaved }: SignatureStatementEditorProps) {
  const [statement, setStatement] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadStatement() {
      try {
        setIsLoading(true);
        const profile = await db.getProfile();
        setStatement(profile.signature_statement || "");
      } catch (e) {
        // console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStatement();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      await db.updateProfile({ signature_statement: statement });
      setIsEditing(false);
      if (onSaved) onSaved(statement);
    } catch (e) {
      // console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-20 bg-ink-raised border border-white/5 rounded-xl p-4 animate-pulse flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-ink-raised border border-white/5 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-baseline">
        <h3 className="text-xs font-mono text-ash uppercase tracking-wider">Signature Statement</h3>
        <span className="text-[9px] font-mono text-ash/60">Feeds Morning Flow</span>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-signal">I am</span>
            <input
              type="text"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="centered, deliberate, and clear"
              className="flex-1 bg-ink border border-white/5 p-2 rounded text-sm text-paper focus:outline-none focus:border-signal/50"
              maxLength={120}
              required
              autoFocus
            />
          </div>
          <p className="text-[10px] text-ash italic">
            Complete this phrase with the active identity state you wish to anchor. Keep it to 3-5 words.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded border border-white/10 hover:border-white/20 text-xs font-mono text-ash transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1.5 rounded bg-signal text-ink font-semibold text-xs font-mono flex items-center gap-1 hover:bg-signal/90 transition-colors"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            {statement ? (
              <p className="font-serif text-lg font-semibold text-paper leading-tight">
                "I am <span className="text-signal">{statement}</span>"
              </p>
            ) : (
              <p className="text-sm text-ash italic leading-tight">
                No signature statement set. Add one to activate in your morning alignment.
              </p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded border border-white/5 bg-ink text-ash hover:text-paper hover:border-white/10 transition-colors shrink-0"
            title="Edit Statement"
          >
            <Edit3 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
