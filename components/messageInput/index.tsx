import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useFormatting, useIsMobile, useTextSelection, useTypingStatus } from '../../hooks';
import FormattingContextMenu from '../common/FormattingContextMenu/FormattingContextMenu';
import { InlineFormattedInput } from './components/InlineFormattedInput';
import { MessagePreview } from './components/MessagePreview';
import type { MessageInputProps } from './types';

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

        <InlineFormattedInput
          ref={textareaRef}
          value={messageInput}
          onChange={setMessageInput}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onContextMenu={handleContextMenu}
          placeholder={editingMessage ? "Edit your message..." : "Type a message"}
          disabled={isDisabled}
          className="flex-1"
          maxHeight={200}
        />
        <button
          onClick={() => handleSubmit()}
          className="p-2.5 text-primary hover:opacity-80 focus:outline-none disabled:opacity-50 transition-all shrink-0"
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
