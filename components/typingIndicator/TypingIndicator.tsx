import React from 'react';
import type { TypingIndicatorProps } from './types';

/**
 * TypingIndicator component shows which users are currently typing.
 * Displays up to 3 avatars and a count for additional users.
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const displayUsers = typingUsers.slice(0, 3);
  const remainingCount = typingUsers.length > 3 ? typingUsers.length - 3 : 0;

  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatars Stack */}
      <div className="flex -space-x-2 overflow-hidden">
        {displayUsers.map((user) => (
          <img
            key={user.userAid}
            src={user.avatarUrl}
            alt={user.username}
            title={user.username}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-sm"
          />
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 shadow-sm">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Typing Dots Animation */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-2xl rounded-bl-none shadow-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
          {typingUsers.length === 1 
            ? `${typingUsers[0].username} is typing...` 
            : 'Multiple users are typing...'}
        </span>
      </div>
    </div>
  );
};
