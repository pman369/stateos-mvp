import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { db } from "../utils/db";

interface DangerZoneCardProps {
  onAccountDeleted: () => void;
}

export default function DangerZoneCard({ onAccountDeleted }: DangerZoneCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "DELETE") return;

    try {
      setIsDeleting(true);
      if (db.isCloudMode()) {
        const response = await fetch("/api/delete-account", { method: "POST" });
        if (!response.ok) throw new Error("Deletion failed on server");
      } else {
        // Purge LocalStorage
        await db.clearAllData();
      }
      onAccountDeleted();
    } catch (e) {
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full bg-ink-raised border border-red-950/40 rounded-xl p-6 space-y-4">
      <div className="flex gap-3 items-center">
        <AlertTriangle className="text-red-500" size={20} />
        <h3 className="font-serif text-base text-paper font-semibold">Danger Zone</h3>
      </div>

      <p className="text-xs text-ash leading-relaxed">
        Deleting your account will immediately purge your State Audits, Recovery Window history, Identity Anchors, and settings. This action is permanent and cannot be undone.
      </p>

      {showConfirm ? (
        <form onSubmit={handleDelete} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="delete-confirm-input" className="block text-[10px] font-mono text-red-400 uppercase tracking-wider">
              Type DELETE to confirm permanent purge
            </label>
            <input
              id="delete-confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full p-2.5 rounded bg-ink border border-red-950/50 text-sm text-paper focus:outline-none focus:border-red-500/50 font-mono tracking-widest text-center"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              className="w-1/2 py-2 rounded border border-white/5 hover:border-white/10 text-xs font-mono text-ash"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmText !== "DELETE" || isDeleting}
              className="w-1/2 py-2 rounded bg-red-650 hover:bg-red-700 text-white font-semibold text-xs font-mono flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
              style={{ backgroundColor: confirmText === "DELETE" ? "#b91c1c" : "" }}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Purging...
                </>
              ) : (
                <>
                  <Trash2 size={12} />
                  Delete Permanently
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-2.5 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-950/50 font-mono text-xs font-semibold transition-all"
        >
          Delete Account & Purge Data
        </button>
      )}
    </div>
  );
}
