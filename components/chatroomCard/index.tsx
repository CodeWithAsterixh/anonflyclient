import { User, Lock, ShieldCheck } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { getUserAvatar } from '../../lib/controllers/colorsProcessors/userAvatar';
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
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors ${isPrivate ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
      to={`/${id}`}
      onClick={(e) => {
        if (onClick) {
          onClick();
        }
      }}
      aria-label={`Join chatroom ${roomname}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img 
          src={avatarUrl} 
          alt={roomname} 
          className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm"
        />
        {isLocked && (
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            {isPrivate ? (
              <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Lock size={12} className="text-gray-600 dark:text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Name and description */}
      <div className="flex-1 mx-3 max-w-[calc(100%-80px)] overflow-hidden">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold truncate dark:text-gray-100">{roomname}</h2>
          {isPrivate && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded uppercase tracking-wider">
              Private
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{description || 'No description'}</p>
      </div>

      {/* Users */}
      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
        <User className="h-5 w-5" />
        <span>{participantCount}</span>
      </div>
    </Link>
  );
};

export default ChatroomCard;
