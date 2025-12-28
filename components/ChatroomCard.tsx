import { User, Lock } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { getUserAvatar } from '../lib/controllers/colorsProcessors/userAvatar';

interface ChatroomCardProps {
  id: string;
  roomname: string;
  description: string;
  participantCount: number;
  lastMessage: string | null;
  isLocked?: boolean;
  onClick?: () => void;
}

const ChatroomCard: React.FC<ChatroomCardProps> = ({
  id,
  roomname,
  description,
  participantCount,
  lastMessage,
  isLocked,
  onClick,
}) => {
  const avatarUrl = useMemo(() => getUserAvatar(roomname, id, 48), [roomname, id]);

  return (
    <Link
      className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
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
          className="w-12 h-12 rounded-full border border-gray-100 shadow-sm"
        />
        {isLocked && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <Lock size={12} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Name and description */}
      <div className="flex-1 mx-3 max-w-[calc(100%-80px)] overflow-hidden">
        <h2 className="text-lg font-semibold truncate">{roomname}</h2>
        <p className="text-gray-600 text-sm truncate">{description || 'No description'}</p>
      </div>

      {/* Users */}
      <div className="flex items-center space-x-1 text-gray-500 text-sm flex-shrink-0">
        <User className="h-5 w-5" />
        <span>{participantCount}</span>
      </div>
    </Link>
  );
};

export default ChatroomCard;
