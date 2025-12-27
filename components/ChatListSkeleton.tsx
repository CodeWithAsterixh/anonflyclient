import React from 'react';

const ChatListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center p-3 animate-pulse">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0" />

        {/* Name and description skeleton */}
        <div className="flex-1 mx-3 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/5" />
          <div className="h-3 bg-gray-300 rounded w-4/5" />
          <div className="h-3 bg-gray-300 rounded w-2/3" />
        </div>

        {/* Users skeleton */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
          <div className="h-3 bg-gray-300 rounded w-4" />
        </div>
      </div>
    ))
  );
};

export default ChatListSkeleton;
