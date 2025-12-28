import { User, Lock } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';

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

  return (
    <Link
      className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
      to={`/${id}`}
      onClick={(e) => {
        if (onClick) {
          onClick();
        }
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold">
          {roomname ? roomname.charAt(0).toUpperCase() : 'R'}
        </div>
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
