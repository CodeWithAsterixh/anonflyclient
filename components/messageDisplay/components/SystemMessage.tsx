import React from 'react';

interface SystemMessageProps {
  id: string;
  content: string;
  highlight?: boolean;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ id, content, highlight }) => {
  return (
    <div 
      id={`message-${id}`} 
      data-message-id={id}
      className={`flex justify-center my-4 transition-all duration-500 ${
        highlight ? "bg-blue-400/20 dark:bg-blue-900/40 rounded-lg p-1" : ""
      }`}
    >
      <div className="bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-full text-sm italic backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        {content}
      </div>
    </div>
  );
};

export default SystemMessage;
