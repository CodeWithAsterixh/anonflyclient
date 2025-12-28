import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Lock } from 'lucide-react';

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
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm">{message.senderUsername}</p>
            {message.isEncrypted && (
              <ShieldCheck className="w-3 h-3 text-green-500" xlinkTitle="End-to-End Encrypted" />
            )}
          </div>
        )}
        {isCurrentUser && message.isEncrypted && (
          <div className="flex justify-end mb-1">
            <ShieldCheck className="w-3 h-3 text-green-200" xlinkTitle="End-to-End Encrypted" />
          </div>
        )}
        <p className="break-words">{message.content}</p>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span
            className={`text-xs opacity-70 ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-700'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.isEncrypted && (
            <span className={`text-[10px] uppercase font-bold tracking-wider opacity-50 ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-700'
            }`}>
              E2EE
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;
