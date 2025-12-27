import React from 'react';

const ChatListSkeleton: React.FC<{count?: number}> = ({ count = 6 }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Chats</h2>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListSkeleton;
