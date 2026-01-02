import React, { useState, useRef, useEffect } from 'react';
import { Send, Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile/index';
import { MessagePreview } from './components/MessagePreview';
import { InlineFormattedInput } from './components/InlineFormattedInput';
import type { MessageInputProps } from './types';
import { useTypingStatus } from './hooks/useTypingStatus';

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
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const isMobileDevice = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { clearTypingStatus } = useTypingStatus({ messageInput, onTyping });

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

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const { selectionStart, selectionEnd } = target;

    if (selectionStart !== selectionEnd) {
      setSelection({ start: selectionStart, end: selectionEnd });
      
      // Calculate position for the menu
      // In a real textarea, getting the exact coordinates of the text is hard.
      // We'll place it above the textarea relative to the container.
      setMenuPosition({ top: -45, left: 12 });
    } else {
      setSelection(null);
      setMenuPosition(null);
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking the menu before it disappears
    setTimeout(() => {
      setSelection(null);
      setMenuPosition(null);
    }, 200);
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link') => {
    if (!selection || !textareaRef.current) return;

    const { start, end } = selection;
    const selectedText = messageInput.substring(start, end);
    let newText = '';
    let cursorOffset = 0;

    const formats = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '*', suffix: '*' },
      underline: { prefix: '__', suffix: '__' },
      strikethrough: { prefix: '~~', suffix: '~~' },
      code: { prefix: '`', suffix: '`' },
      link: { prefix: '[', suffix: '](url)' }
    };

    const { prefix, suffix } = formats[type];

    // Check if already formatted to toggle it off
    if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix)) {
      newText = 
        messageInput.substring(0, start) + 
        selectedText.substring(prefix.length, selectedText.length - suffix.length) + 
        messageInput.substring(end);
      cursorOffset = -(prefix.length + suffix.length);
    } else {
      newText = 
        messageInput.substring(0, start) + 
        prefix + selectedText + suffix + 
        messageInput.substring(end);
      cursorOffset = prefix.length + suffix.length;
    }

    setMessageInput(newText);
    
    // Refocus and set selection after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, end + cursorOffset);
      }
    }, 0);
  };

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

      <div className="flex items-end gap-2 relative">
        {/* Contextual Formatting Menu */}
        {menuPosition && selection && (
          <div 
            className="absolute z-50 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg flex items-center p-1 gap-1 transition-all duration-200 animate-in fade-in zoom-in slide-in-from-bottom-2"
            style={{ 
              top: `${menuPosition.top}px`, 
              left: `${menuPosition.left}px` 
            }}
          >
            {[
              { type: 'bold' as const, icon: Bold, label: 'Bold' },
              { type: 'italic' as const, icon: Italic, label: 'Italic' },
              { type: 'underline' as const, icon: Underline, label: 'Underline' },
              { type: 'strikethrough' as const, icon: Strikethrough, label: 'Strikethrough' },
              { type: 'code' as const, icon: Code, label: 'Code' },
              { type: 'link' as const, icon: LinkIcon, label: 'Link' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent losing focus from textarea
                  applyFormatting(type);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}

        <InlineFormattedInput
          ref={textareaRef}
          value={messageInput}
          onChange={setMessageInput}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onBlur={handleBlur}
          placeholder={editingMessage ? "Edit your message..." : "Type a message"}
          disabled={isDisabled}
          className="flex-1"
          maxHeight={200}
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
