import React from 'react';
import { UserMinus, Hammer, Crown } from 'lucide-react';
import { type Participant } from '~/shared/types/chat';
import Avatar from '~/shared/components/ui/avatar';
import Badge from '~/shared/components/ui/badge';
import Card from '~/shared/components/ui/card';

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
    <Card className="group p-2.5 bg-white/5 border-transparent hover:border-border transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={participant.username} userAid={participant.userAid} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground truncate text-sm flex items-center gap-1">
                {participant.username}
                {isPremium && (
                  <Crown size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                )}
                {isMe && <span className="ml-1 text-muted font-normal shrink-0">(You)</span>}
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
              className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isBanning
                  ? "bg-white/5 text-muted"
                  : "text-muted hover:text-destructive hover:bg-destructive/10"
                }`}
              title={canBanUsers ? "Ban from room" : "Ban feature (Premium)"}
            >
              {isBanning ? (
                <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
              ) : (
                <Hammer size={16} />
              )}
            </button>
          )}

          {canPerformRemoval && (
            <button
              onClick={() => onRemove(participant.userAid)}
              disabled={isRemoving}
              className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isRemoving
                  ? "bg-white/5 text-muted"
                  : "text-muted hover:text-orange-500 hover:bg-orange-500/10"
                }`}
              title="Remove from room"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
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
