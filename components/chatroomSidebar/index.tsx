import React, { useState } from "react";
import { 
  Info,
} from "lucide-react";
import type { ChatroomSidebarProps } from "./types";
import { FEATURES } from "../../lib/constants/features";
import RoomInfo from "./parts/RoomInfo";
import RoomActions from "./parts/RoomActions";
import ParticipantItem from "./parts/ParticipantItem";

const ChatroomSidebar: React.FC<ChatroomSidebarProps> = ({
  participants,
  isHost,
  hostAid,
  creatorAid,
  currentUserId,
  roomName,
  roomDescription,
  isPrivate,
  allowedFeatures = [],
  onRemoveParticipant,
  onBanParticipant,
  onUnbanParticipant,
  onLeaveRoom,
  onEditRoom,
  onDeleteRoom,
  onGenerateShareLink,
  isConnected,
  hideHeader = false,
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCreator = currentUserId === creatorAid;
  const canRemoveUsers = true; // Now free for host/creator
  const canBanUsers = allowedFeatures.includes(FEATURES.BAN_USER);

  const handleRemove = async (userAid: string) => {
    if (userAid === creatorAid) return;

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

  const handleBan = async (userAid: string) => {
    if (!canBanUsers) {
      setError("Ban feature is premium only. Upgrade to use.");
      return;
    }
    if (userAid === creatorAid) return;

    try {
      setBanningId(userAid);
      setError(null);
      await onBanParticipant(userAid);
    } catch (error: any) {
      console.error("Failed to ban participant:", error);
      setError(error.message || "Failed to ban participant.");
    } finally {
      setBanningId(null);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shrink-0 overflow-hidden transition-colors duration-300 ${hideHeader ? 'w-full' : 'w-80 border-l'}`}>
      {/* Sidebar Header */}
      {!hideHeader && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Info size={18} className="text-primary" />
            Room Details
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <RoomInfo roomName={roomName} roomDescription={roomDescription} isPrivate={isPrivate} />

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />

        <RoomActions 
          isHost={isHost}
          onLeaveRoom={onLeaveRoom}
          onEditRoom={onEditRoom}
          onDeleteRoom={onDeleteRoom}
          onGenerateShareLink={onGenerateShareLink}
        />

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
              <ParticipantItem
                key={participant.userAid}
                participant={participant}
                isHost={isHost}
                isCreator={isCreator}
                hostAid={hostAid}
                creatorAid={creatorAid}
                currentUserId={currentUserId}
                canRemoveUsers={canRemoveUsers}
                canBanUsers={canBanUsers}
                removingId={removingId}
                banningId={banningId}
                onRemove={handleRemove}
                onBan={handleBan}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t border-gray-100 rounded-md md:rounded-none dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
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
