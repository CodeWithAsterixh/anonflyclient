import React from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/User';

interface Message {
  id?: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
  type?: 'message' | 'system';
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
  const isCurrentUser = user && user.userId === message.senderId;
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
        {!isCurrentUser && <p className="font-semibold text-sm">{message.senderUsername}</p>}
        <p className="break-words">{message.content}</p>
        <span
          className={`text-xs mt-1 block opacity-70 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-700'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageDisplay;
