import React, { useState } from "react";
import { UserMinus, ShieldCheck, Lock } from "lucide-react";
import Drawer from "../ui/drawer";
import type { ManageUsersDrawerProps } from "./types";
import { FEATURES } from "../../lib/constants/features";

const ManageUsersDrawer: React.FC<ManageUsersDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  isHost,
  hostAid,
  allowedFeatures = [],
  onRemoveParticipant,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRemoveUsers = allowedFeatures.includes(FEATURES.REMOVE_USER);

  const handleRemove = async (userAid: string) => {
    if (!canRemoveUsers) return;
    if (userAid === hostAid) return; // Cannot remove host

    try {
      setRemovingId(userAid);
      setError(null);
      await onRemoveParticipant(userAid);
    } catch (error: any) {
      console.error("Failed to remove participant:", error);
      setError(error.message || "Failed to remove participant.");
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {participants.length} user{participants.length !== 1 ? "s" : ""} in this room
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

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
                    onClick={() => handleRemove(participant.userAid)}
                    disabled={!canRemoveUsers || removingId === participant.userAid}
                    className={`p-2 rounded-lg transition-all ${
                      !canRemoveUsers
                        ? "text-gray-300 cursor-not-allowed"
                        : removingId === participant.userAid
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800"
                        : "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                    title={canRemoveUsers ? "Remove from room" : "Feature locked: Upgrade required"}
                  >
                    {removingId === participant.userAid ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : canRemoveUsers ? (
                      <UserMinus size={18} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ManageUsersDrawer;
