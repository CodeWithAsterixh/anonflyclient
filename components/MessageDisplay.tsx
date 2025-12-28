import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock } from 'lucide-react';
import { getUserAvatar, getUserBubbleColors } from '../lib/controllers/colorsProcessors/userAvatar';

interface Message {
  id?: string;
  senderAid: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type?: 'message' | 'system';
  isEncrypted?: boolean;
}

interface MessageDisplayProps {
  message: Message;
}

/**
 * MessageDisplay component is a presentational component for displaying a single chat message.
 * It styles messages differently based on whether the current user is the sender.
 * System messages (like user join notifications) are displayed as centered notifications.
 *
 * @param {MessageDisplayProps} props The props for the component.
 * @param {Message} props.message The message object to display.
 * @returns {React.FC} A React functional component.
 */
const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const { user } = useAuth();
  const isCurrentUser = user && user.userId === message.senderAid;
  const isSystemMessage = message.type === 'system';

  const avatarUrl = useMemo(() => 
    getUserAvatar(message.senderUsername, message.senderAid, 32),
    [message.senderUsername, message.senderAid]
  );

  const bubbleColors = useMemo(() => 
    getUserBubbleColors(message.senderAid),
    [message.senderAid]
  );

  // Render system messages (like user join notifications)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm italic">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        <img 
          src={avatarUrl} 
          alt={message.senderUsername} 
          className="w-8 h-8 rounded-full shadow-sm border border-gray-100"
        />
      </div>

      <div
        style={{ 
          backgroundColor: bubbleColors.primary,
          color: bubbleColors.text
        }}
        className={`max-w-[75%] lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isCurrentUser
            ? 'rounded-br-none'
            : 'rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center justify-between mb-1 gap-2">
            <p className="font-bold text-xs truncate" style={{ color: bubbleColors.text }}>
              {message.senderUsername}
            </p>
            {message.isEncrypted && (
              <ShieldCheck className="w-3 h-3 opacity-70" />
            )}
          </div>
        )}
        


        <p className="break-words text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
        
        <div className="flex items-center justify-between mt-1 gap-3">
          <span className="text-[10px] opacity-60 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
