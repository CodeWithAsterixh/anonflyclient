import React, { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  Settings2, 
  LogOut, 
  Trash2, 
  UserMinus, 
  Info,
  ChevronRight
} from "lucide-react";
import type { ChatroomSidebarProps } from "./types";
import { FEATURES } from "../../lib/constants/features";

const ChatroomSidebar: React.FC<ChatroomSidebarProps> = ({
  participants,
  isHost,
  hostAid,
  roomName,
  roomDescription,
  allowedFeatures = [],
  onRemoveParticipant,
  onLeaveRoom,
  onEditRoom,
  onDeleteRoom,
  isConnected,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRemoveUsers = allowedFeatures.includes(FEATURES.REMOVE_USER);

  const handleRemove = async (userAid: string) => {
    if (!canRemoveUsers) return;
    if (userAid === hostAid) return;

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 w-80 shrink-0 overflow-hidden transition-colors duration-300">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Info size={18} className="text-blue-500" />
          Room Details
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Room Info Section */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Room Name
            </h3>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
              {roomName}
            </p>
          </div>
          
          {roomDescription && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-words leading-relaxed">
                {roomDescription}
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />

        {/* Room Actions Section */}
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <LogOut size={16} />
              <span>Leave Room</span>
            </button>

            {isHost && (
              <>
                <button
                  onClick={onEditRoom}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <Settings2 size={16} />
                  <span>Room Settings</span>
                </button>
                <button
                  onClick={onDeleteRoom}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                  <span>Delete Room</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />

        {/* Participants Section */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Participants ({participants.length})
            </h3>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.userAid}
                className="group flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 text-sm">
                    {participant.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {participant.username}
                      </p>
                      {participant.userAid === hostAid && (
                        <ShieldCheck size={12} className="text-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
                      {participant.userAid.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {isHost && participant.userAid !== hostAid && (
                  <button
                    onClick={() => handleRemove(participant.userAid)}
                    disabled={!canRemoveUsers || removingId === participant.userAid}
                    className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                      !canRemoveUsers
                        ? "text-gray-300 cursor-not-allowed"
                        : removingId === participant.userAid
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-800"
                        : "text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                    title={canRemoveUsers ? "Remove participant" : "Feature locked"}
                  >
                    {removingId === participant.userAid ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserMinus size={14} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {isConnected ? 'Live Connection' : 'Reconnecting...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatroomSidebar;
