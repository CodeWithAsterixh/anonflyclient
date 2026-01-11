import React from 'react';
import { UserMinus, Hammer, Crown } from 'lucide-react';
import { type Participant } from '../../../lib/types/chat';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import Card from '../../ui/card';

interface ParticipantItemProps {
  participant: Participant;
  isHost: boolean;
  isCreator: boolean;
  hostAid: string;
  creatorAid: string;
  currentUserId?: string | null;
  canRemoveUsers: boolean;
  canBanUsers: boolean;
  removingId: string | null;
  banningId: string | null;
  onRemove: (userAid: string) => void;
  onBan: (userAid: string) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isHost,
  isCreator,
  hostAid,
  creatorAid,
  currentUserId,
  canRemoveUsers,
  canBanUsers,
  removingId,
  banningId,
  onRemove,
  onBan,
}) => {
  const isMe = participant.userAid === currentUserId;
  const isParticipantHost = participant.userAid === hostAid;
  const isParticipantCreator = participant.userAid === creatorAid;
  const isRemoving = removingId === participant.userAid;
  const isBanning = banningId === participant.userAid;
  const isPremium = participant.allowedFeatures?.includes('CREATE_PRIVATE_ROOM');

  // Permitted roles for removal: Host + Creator
  const canPerformRemoval = (isHost || isCreator) && !isParticipantCreator && !isMe;
  
  // Permitted roles for ban: Creator ONLY
  const canPerformBan = isCreator && !isParticipantCreator && !isMe;

  return (
    <Card className="group p-2.5 bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={participant.username} userAid={participant.userAid} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm flex items-center gap-1">
                {participant.username}
                {isPremium && (
                  <Crown size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                )}
                {isMe && <span className="ml-1 text-gray-400 font-normal shrink-0">(You)</span>}
              </span>
            </div>
            <div className="flex gap-1 mt-0.5">
              {isParticipantHost && <Badge variant="primary">Host</Badge>}
              {isParticipantCreator && <Badge variant="amber">Creator</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canPerformBan && (
            <button
              onClick={() => onBan(participant.userAid)}
              disabled={!canBanUsers || isBanning}
              className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                isBanning 
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                  : "text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              }`}
              title={canBanUsers ? "Ban from room" : "Ban feature (Premium)"}
            >
              {isBanning ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Hammer size={16} />
              )}
            </button>
          )}

          {canPerformRemoval && (
            <button
              onClick={() => onRemove(participant.userAid)}
              disabled={isRemoving}
              className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                isRemoving 
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                  : "text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
              }`}
              title="Remove from room"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserMinus size={16} />
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ParticipantItem;
