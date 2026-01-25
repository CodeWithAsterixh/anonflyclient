import React from 'react';
import { formatMessage } from '../../../lib/helpers/markdown';

interface SystemMessageProps {
  id: string;
  content: string;
  highlight?: boolean;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ id, content, highlight }) => {
  return (
    <output 
      id={`message-${id}`} 
      data-message-id={id}
      className={`flex justify-center my-4 transition-all duration-500 ${
        highlight ? "bg-primary/20 rounded-lg p-1" : ""
      }`}
      aria-label={`System message: ${content}`}
    >
      <div className="bg-white/5 text-muted px-4 py-2 rounded-full text-sm italic backdrop-blur-sm border border-border/50">
        {formatMessage(content)}
      </div>
    </output>
  );
};

export default SystemMessage;
