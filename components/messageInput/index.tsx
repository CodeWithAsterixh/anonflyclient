import React, { useState, useRef, useEffect } from 'react';
import Input from '../ui/input';
import { Send } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile/index';
import { MessagePreview } from './components/MessagePreview';
import type { MessageInputProps } from './types';
import { useTypingStatus } from './hooks/useTypingStatus';
import { useAutoHeight } from './hooks/useAutoHeight';

/**
 * MessageInput component provides an auto-expanding textarea and a send button for chat messages.
 * Styled to look like WhatsApp's input area.
 */
const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onEditMessage,
  isDisabled, 
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onTyping
}) => {
  const [messageInput, setMessageInput] = useState<string>('');
  const isMobileDevice = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { clearTypingStatus } = useTypingStatus({ messageInput, onTyping });
  const { resetHeight } = useAutoHeight({ ref: textareaRef, value: messageInput });

  // Sync input with editingMessage content
  useEffect(() => {
    if (editingMessage) {
      setMessageInput(editingMessage.content);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      setMessageInput('');
    }
  }, [editingMessage]);

  // Focus input when replyingTo changes
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (messageInput.trim()) {
      if (editingMessage) {
        onEditMessage?.(messageInput);
      } else {
        onSendMessage(messageInput);
      }
      setMessageInput('');
      
      clearTypingStatus();
      resetHeight();
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
    <div className="bg-white/80 dark:bg-gray-900/80 sticky bottom-0 left-0 backdrop-blur-md p-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 z-10 transition-colors duration-300">
      {/* Editing Preview */}
      {editingMessage && onCancelEdit && (
        <MessagePreview 
          content={editingMessage.content}
          title="Editing Message"
          onCancel={onCancelEdit}
          isEdit={true}
        />
      )}

      {/* Reply Preview */}
      {replyingTo && onCancelReply && (
        <MessagePreview 
          content={replyingTo.content}
          title={`Replying to ${replyingTo.senderUsername}`}
          onCancel={onCancelReply}
        />
      )}

      <div className="flex items-end gap-2">
        <Input
          ref={textareaRef as any}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown as any}
          placeholder={editingMessage ? "Edit your message..." : "Type a message"}
          multiline
          rows={1}
          className="w-full text-black dark:text-white p-3 focus:outline-none resize-none bg-transparent block max-h-[200px] overflow-y-auto placeholder:text-gray-400 dark:placeholder:text-gray-500 border-none ring-0 focus:ring-0"
          containerClassName="flex-1"
          disabled={isDisabled}
          style={{ minHeight: '44px' }}
          aria-label="Message input"
        />
        <button
          onClick={() => handleSubmit()}
          className="p-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none disabled:opacity-50 transition-colors flex-shrink-0"
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
