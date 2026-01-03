import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile/index';
import { MessagePreview } from './components/MessagePreview';
import type { MessageInputProps } from './types';
import { useTypingStatus } from './hooks/useTypingStatus';
import FormattingContextMenu, { type FormattingAction } from '../common/FormattingContextMenu/FormattingContextMenu';
import { useFormatting } from '../../hooks/useFormatting';
import { useTextSelection } from '../../hooks/useTextSelection';

/**
 * MessageInput component provides an auto-expanding inline-formatted input 
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
  const containerRef = useRef<HTMLDivElement>(null);

  const { clearTypingStatus } = useTypingStatus({ messageInput, onTyping });

  const {
    selection,
    menuPosition,
    isOpen: isMenuOpen,
    handleSelect,
    handleContextMenu,
    closeMenu,
  } = useTextSelection(textareaRef as React.RefObject<HTMLTextAreaElement>);

  const { applyFormatting } = useFormatting({
    value: messageInput,
    onChange: setMessageInput,
    selection,
    textareaRef:textareaRef as React.RefObject<HTMLTextAreaElement>,
  });

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

      <div ref={containerRef} className="flex items-end gap-2 relative">
        <FormattingContextMenu
          isOpen={isMenuOpen}
          position={menuPosition || { top: 0, left: 0 }}
          onAction={applyFormatting}
          onClose={closeMenu}
          isMobile={isMobileDevice}
        />

        <textarea
          ref={textareaRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onContextMenu={handleContextMenu}
          placeholder={editingMessage ? "Edit your message..." : "Type a message"}
          disabled={isDisabled}
          className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 min-h-[44px] max-h-[200px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none text-gray-900 dark:text-gray-100"
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
