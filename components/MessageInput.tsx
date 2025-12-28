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
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect actual mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      // Detailed mobile check (phone/tablet)
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobileDevice(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

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
    <div className="bg-white/80 backdrop-blur-sm p-3 border-t border-gray-200 flex items-end gap-2 z-10">
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
  );
};

export default MessageInput;
