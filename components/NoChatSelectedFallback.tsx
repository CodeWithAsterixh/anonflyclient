import React from 'react';

const NoChatSelectedFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full bg-white text-gray-400">
      <div className="text-center">
        <svg
          className="w-20 h-20 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-500 mt-4">
          Select a chat to view the conversation
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Choose a chatroom from the list to get started
        </p>
      </div>
    </div>
  );
};

export default NoChatSelectedFallback;