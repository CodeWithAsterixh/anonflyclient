import React from 'react';
import { useNavigate } from 'react-router';
import { User } from 'lucide-react';

interface ChatroomCardProps {
  id: string;
  roomname: string;
  description: string;
  participantCount: number;
  lastMessage: string | null;
}

const ChatroomCard: React.FC<ChatroomCardProps> = ({
  id,
  roomname,
  description,
  participantCount,
  lastMessage,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
      onClick={() => navigate(`/${id}`)}
    >
      {/* Avatar */}
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold flex-shrink-0">
        {roomname ? roomname.charAt(0).toUpperCase() : 'R'}
      </div>

      {/* Name and description */}
      <div className="flex-1 mx-3">
        <h2 className="text-lg font-semibold truncate">{roomname}</h2>
        <p className="text-gray-600 text-sm truncate">{description || 'No description'}</p>
        {lastMessage && (
          <p className="text-gray-500 text-xs truncate mt-1">{lastMessage}</p>
        )}
      </div>

      {/* Users */}
      <div className="flex items-center space-x-1 text-gray-500 text-sm flex-shrink-0">
        <User className="h-5 w-5" />
        <span>{participantCount}</span>
      </div>
    </div>
  );
};

export default ChatroomCard;
