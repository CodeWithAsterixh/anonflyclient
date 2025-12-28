import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
}

/**
 * MessageInput component provides an auto-expanding textarea and a send button for chat messages.
 * Styled to look like WhatsApp's input area.
 */
const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isDisabled }) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-adjust height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
      
      // Auto-scroll to bottom when typing
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [messageInput]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-50 p-3 border-t border-gray-200 flex items-end gap-2">
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <textarea
          ref={textareaRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          rows={1}
          className="w-full text-black p-3 focus:outline-none resize-none bg-transparent block max-h-[200px] overflow-y-auto"
          disabled={isDisabled}
          style={{ minHeight: '44px' }}
        />
      </div>
      <button
        onClick={() => handleSubmit()}
        className="p-3 text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 transition-colors flex-shrink-0"
        disabled={isDisabled || !messageInput.trim()}
        title="Send message"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MessageInput;
