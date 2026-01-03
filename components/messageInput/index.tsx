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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; isContextMenu?: boolean } | null>(null);
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
      
      // If it's already a context menu, don't override with selection menu
      if (menuPosition?.isContextMenu) return;

      // On mobile, we place the menu at a fixed position relative to the input container
      // to avoid being covered by the native selection menu which floats near the text.
      if (isMobileDevice) {
        setMenuPosition({ top: -200, left: 0 }); 
      } else {
        setMenuPosition({ top: -160, left: 12 });
      }
    } else {
      // Only clear if not a context menu
      if (!menuPosition?.isContextMenu) {
        setSelection(null);
        setMenuPosition(null);
      }
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = () => {
    // Small delay to allow clicking the menu before it disappears
    setTimeout(() => {
      if (!menuPosition?.isContextMenu) {
        setSelection(null);
        setMenuPosition(null);
      }
    }, 200);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const { selectionStart, selectionEnd } = target;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuPosition({ 
        top: e.clientY - rect.top - 10, // Slightly above the cursor
        left: e.clientX - rect.left, 
        isContextMenu: true 
      });
    }
    
    // Ensure selection state is updated if something is selected
    if (selectionStart !== selectionEnd) {
      setSelection({ start: selectionStart, end: selectionEnd });
    }
  };

  const handleMenuAction = (action: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    switch (action) {
      case 'copy':
        if (selection) {
          const text = messageInput.substring(selection.start, selection.end);
          navigator.clipboard.writeText(text);
        }
        break;
      case 'cut':
        if (selection) {
          const text = messageInput.substring(selection.start, selection.end);
          navigator.clipboard.writeText(text);
          const newValue = messageInput.substring(0, selection.start) + messageInput.substring(selection.end);
          setMessageInput(newValue);
        }
        break;
      case 'selectall':
        textarea.focus();
        textarea.setSelectionRange(0, messageInput.length);
        setSelection({ start: 0, end: messageInput.length });
        break;
      case 'paste':
        navigator.clipboard.readText().then(text => {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = messageInput.substring(0, start) + text + messageInput.substring(end);
          setMessageInput(newValue);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + text.length, start + text.length);
          }, 0);
        }).catch(err => console.error('Paste failed:', err));
        break;
    }
    
    setMenuPosition(null);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuPosition && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuPosition(null);
        setSelection(null);
      }
    };

    if (menuPosition) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuPosition]);

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

  const formattingOptions = [
    { type: 'bold' as const, label: 'Bold' },
    { type: 'italic' as const, label: 'Italic' },
    { type: 'underline' as const, label: 'Underline' },
    { type: 'strikethrough' as const, label: 'Strikethrough' },
    { type: 'code' as const, label: 'Code' },
    { type: 'link' as const, label: 'Link' }
  ];

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
        {/* Contextual Formatting Menu */}
        {menuPosition && (
          <div 
            className={`absolute z-[100] bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col min-w-[160px] py-1 transition-all duration-200 animate-in fade-in zoom-in slide-in-from-bottom-2 ${isMobileDevice && !menuPosition.isContextMenu ? 'w-full left-0 bottom-full mb-2' : ''}`}
            style={{ 
              top: menuPosition.isContextMenu ? 'auto' : (isMobileDevice ? 'auto' : `${menuPosition.top}px`), 
              bottom: menuPosition.isContextMenu ? `calc(100% - ${menuPosition.top}px)` : (isMobileDevice && !menuPosition.isContextMenu ? '100%' : 'auto'),
              left: isMobileDevice && !menuPosition.isContextMenu ? '0' : `${menuPosition.left}px`,
            }}
          >
            {/* Standard Edit Options */}
            <div className="flex flex-col border-b border-gray-100 dark:border-gray-700 pb-1 mb-1">
              {[
                { label: 'Copy', action: 'copy', disabled: !selection },
                { label: 'Cut', action: 'cut', disabled: !selection },
                { label: 'Paste', action: 'paste' },
                { label: 'Select All', action: 'selectall' }
              ].map(({ label, action, disabled }) => (
                <button
                  key={action}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!disabled) handleMenuAction(action);
                  }}
                  disabled={disabled}
                  className={`px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${disabled ? 'opacity-30 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Formatting Options */}
            <div className="flex flex-col">
              {formattingOptions.map(({ type, label }) => (
                <button
                  key={type}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (selection) {
                      applyFormatting(type);
                      setMenuPosition(null);
                    }
                  }}
                  disabled={!selection}
                  className={`px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${!selection ? 'opacity-30 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 font-medium'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <InlineFormattedInput
          ref={textareaRef}
          value={messageInput}
          onChange={setMessageInput}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onBlur={handleBlur}
          onContextMenu={handleContextMenu}
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
