import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isDisabled: boolean;
  replyingTo?: {
    messageId: string;
    senderUsername: string;
    content: string;
  } | null;
  onCancelReply?: () => void;
}

/**
 * MessageInput component provides an auto-expanding textarea and a send button for chat messages.
 * Styled to look like WhatsApp's input area.
 */
const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isDisabled, 
  replyingTo,
  onCancelReply 
}) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const isMobileDevice = useIsMobile();
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

  // Focus input when replyingTo changes
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

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
    // On mobile devices, Enter should always create a new line
    // On desktop, Enter sends the message unless Shift is held
    if (e.key === 'Enter') {
      if (!isMobileDevice && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      // If mobile, or shift+enter on desktop, default behavior (new line) happens
    }
  };

  return (
    <div className="bg-white/80 sticky bottom-0 left-0 backdrop-blur-sm p-3 border-t border-gray-200 flex flex-col gap-2 z-10">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-blue-500 p-2 rounded-r-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-600 truncate">
              Replying to {replyingTo.senderUsername}
            </p>
            <p className="text-xs text-gray-500 truncate line-clamp-2 whitespace-pre-wrap">
              {replyingTo.content}
            </p>
          </div>
          <button 
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Cancel reply"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
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
            aria-label="Message input"
          />
        </div>
        <button
          onClick={() => handleSubmit()}
          className="p-3 text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 transition-colors flex-shrink-0"
          disabled={isDisabled || !messageInput.trim()}
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
