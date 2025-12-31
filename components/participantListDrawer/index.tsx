import React from "react";
import { Users, ShieldCheck, Settings2 } from "lucide-react";
import Drawer from "../ui/drawer";
import type { ParticipantListDrawerProps } from "./types";

const ParticipantListDrawer: React.FC<ParticipantListDrawerProps> = ({
  isOpen,
  onClose,
  participants,
  isHost,
  hostAid,
  onOpenManageUsers,
}) => {
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
            {participants.length} user{participants.length !== 1 ? "s" : ""} currently in this room
          </p>
          {isHost && (
            <button
              onClick={() => {
                onClose();
                onOpenManageUsers();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Settings2 size={14} />
              <span>Manage Users</span>
            </button>
          )}
        </div>

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
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default ParticipantListDrawer;
