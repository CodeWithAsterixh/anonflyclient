import React from 'react';
import { UserMinus } from 'lucide-react';
import { type Participant } from '../../../lib/types/chat';
import Avatar from '../../ui/avatar';
import Badge from '../../ui/badge';
import Card from '../../ui/card';

interface ParticipantItemProps {
  participant: Participant;
  isHost: boolean;
  hostAid: string;
  creatorAid: string;
  currentUserId?: string | null;
  canRemoveUsers: boolean;
  removingId: string | null;
  onRemove: (userAid: string) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isHost,
  hostAid,
  creatorAid,
  currentUserId,
  canRemoveUsers,
  removingId,
  onRemove,
}) => {
  const isMe = participant.userAid === currentUserId;
  const isParticipantHost = participant.userAid === hostAid;
  const isParticipantCreator = participant.userAid === creatorAid;
  const isRemoving = removingId === participant.userAid;

  return (
    <Card className="group p-2.5 bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={participant.username} userAid={participant.userAid} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                {participant.username}
                {isMe && <span className="ml-1 text-gray-400 font-normal">(You)</span>}
              </span>
            </div>
            <div className="flex gap-1 mt-0.5">
              {isParticipantHost && <Badge variant="blue">Host</Badge>}
              {isParticipantCreator && <Badge variant="amber">Creator</Badge>}
            </div>
          </div>
        </div>

        {isHost && !isParticipantHost && (
          <button
            onClick={() => onRemove(participant.userAid)}
            disabled={!canRemoveUsers || isRemoving}
            className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
              isRemoving 
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800" 
                : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            }`}
            title={canRemoveUsers ? "Remove from room" : "Removal disabled"}
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserMinus size={16} />
            )}
          </button>
        )}
      </div>
    </Card>
  );
};

export default ParticipantItem;
