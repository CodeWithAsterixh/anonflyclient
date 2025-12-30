import React from 'react';

const ChatroomSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[60%] h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse ${i % 2 === 0 ? 'rounded-bl-none' : 'rounded-br-none'}`} style={{ width: `${Math.random() * 40 + 20}%` }} />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
};

export default ChatroomSkeleton;
