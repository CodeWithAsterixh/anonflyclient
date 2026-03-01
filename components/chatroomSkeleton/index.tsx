import React from 'react';

const ChatroomSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 border-b border-border">
        <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => {
          const randomArray = new Uint32Array(1);
          globalThis.window.crypto.getRandomValues(randomArray);
          const width = (randomArray[0] % 40) + 20;
          return (
            <div key={`message-skeleton-${i + 1}`} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[60%] h-12 bg-white/5 rounded-2xl animate-pulse ${i % 2 === 0 ? 'rounded-bl-none' : 'rounded-br-none'}`} style={{ width: `${width}%` }} />
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <div className="h-10 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
};

export default ChatroomSkeleton;
