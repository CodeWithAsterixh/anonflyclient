import { User, Lock, ShieldCheck } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { getUserAvatar } from '~/shared/utils/controllers/colorsProcessors/userAvatar';
import type { ChatroomCardProps } from './types';

const ChatroomCard: React.FC<ChatroomCardProps> = ({
  id,
  roomname,
  description,
  participantCount,
  lastMessage,
  isLocked,
  isPrivate,
  onClick,
}) => {
  const avatarUrl = useMemo(() => getUserAvatar(roomname, id, 48), [roomname, id]);

  return (
    <Link
      className={`flex items-center p-3 cursor-pointer hover:bg-white/5 rounded-xl transition-colors ${isPrivate ? 'bg-primary/5' : ''}`}
      to={`/${id}`}
      onClick={(e) => {
        if (onClick) {
          onClick();
        }
      }}
      aria-label={`Join chatroom ${roomname}`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={avatarUrl}
          alt={roomname}
          className="w-12 h-12 rounded-full border border-border shadow-sm"
        />
        {isLocked && (
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border">
            {isPrivate ? (
              <ShieldCheck size={12} className="text-primary" />
            ) : (
              <Lock size={12} className="text-muted" />
            )}
          </div>
        )}
      </div>

      {/* Name and description */}
      <div className="flex-1 mx-3 max-w-[calc(100%-80px)] overflow-hidden">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold truncate text-foreground">{roomname}</h2>
          {isPrivate && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded uppercase tracking-wider">
              Private
            </span>
          )}
        </div>
        <p className="text-muted text-sm truncate">{description || 'No description'}</p>
      </div>

      {/* Users */}
      <div className="flex items-center space-x-1 text-muted text-sm shrink-0">
        <User className="h-5 w-5" />
        <span>{participantCount}</span>
      </div>
    </Link>
  );
};

export default ChatroomCard;
