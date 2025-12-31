import React, { useState } from "react";
import { UserMinus, ShieldCheck } from "lucide-react";
import Drawer from "../ui/drawer";
import type { ManageUsersDrawerProps } from "./types";

const ManageUsersDrawer: React.FC<ManageUsersDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  isHost,
  onRemoveParticipant,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (userAid: string) => {
    try {
      setRemovingId(userAid);
      await onRemoveParticipant(userAid);
    } catch (error) {
      console.error("Failed to remove participant:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title="Room Participants"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {participants.length} user{participants.length !== 1 ? "s" : ""} in this room
        </p>

        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.userAid}
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
                    {/* Add a host badge if possible (we might need hostAid from parent) */}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
                    AID: {participant.userAid}
                  </p>
                </div>
              </div>

              {isHost && (
                <button
                  onClick={() => handleRemove(participant.userAid)}
                  disabled={removingId === participant.userAid}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                  title="Remove from room"
                >
                  {removingId === participant.userAid ? (
                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <UserMinus size={18} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ManageUsersDrawer;
