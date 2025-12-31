import React, { useState } from "react";
import { UserMinus, ShieldCheck, Key } from "lucide-react";
import Drawer from "../ui/drawer";
import Input from "../ui/input";
import type { ManageUsersDrawerProps } from "./types";

const ManageUsersDrawer: React.FC<ManageUsersDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  isHost,
  hostAid,
  onRemoveParticipant,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removalToken, setRemovalToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState<string | null>(null);

  const handleRemove = async (userAid: string) => {
    if (userAid === hostAid) return; // Cannot remove host
    
    if (!removalToken || removalToken.length !== 6) {
      setTokenError("Please enter a valid 6-digit removal token.");
      return;
    }

    try {
      setRemovingId(userAid);
      setTokenError(null);
      await onRemoveParticipant(userAid); // We might need to pass token to API later
      setShowTokenInput(null);
      setRemovalToken("");
    } catch (error: any) {
      console.error("Failed to remove participant:", error);
      setTokenError(error.message || "Failed to remove participant. Invalid token?");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="bottom"
      title="Room Participants"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {participants.length} user{participants.length !== 1 ? "s" : ""} in this room
        </p>

        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.userAid} className="space-y-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    {participant.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {participant.username}
                      </p>
                      {participant.userAid === hostAid && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">
                          <ShieldCheck size={10} />
                          <span>HOST</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
                      AID: {participant.userAid}
                    </p>
                  </div>
                </div>

                {isHost && participant.userAid !== hostAid && (
                  <button
                    onClick={() => {
                      if (showTokenInput === participant.userAid) {
                        setShowTokenInput(null);
                      } else {
                        setShowTokenInput(participant.userAid);
                        setTokenError(null);
                      }
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      showTokenInput === participant.userAid
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                        : "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                    title="Remove from room"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>

              {/* Token Input Section */}
              {showTokenInput === participant.userAid && (
                <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-semibold">
                      <Key size={14} />
                      <span>Removal Authorization Required</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit removal token"
                      value={removalToken}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setRemovalToken(val);
                      }}
                      className="text-center tracking-[0.5em] font-mono text-lg"
                      error={tokenError || undefined}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRemove(participant.userAid)}
                        disabled={removingId === participant.userAid || removalToken.length !== 6}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        {removingId === participant.userAid ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Confirm Removal"
                        )}
                      </button>
                      <button
                        onClick={() => setShowTokenInput(null)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ManageUsersDrawer;
