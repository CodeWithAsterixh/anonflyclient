import React, { useState, useRef, useEffect } from 'react';
import Input from '../ui/input';
import { Send, Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile/index';
import { MessagePreview } from './components/MessagePreview';
import type { MessageInputProps } from './types';
import { useTypingStatus } from './hooks/useTypingStatus';
import { useAutoHeight } from './hooks/useAutoHeight';
import { formatMessage } from '../../lib/helpers/markdown';

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
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
  const isMobileDevice = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { clearTypingStatus } = useTypingStatus({ messageInput, onTyping });
  const { resetHeight } = useAutoHeight({ ref: textareaRef, value: messageInput });

  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;

    if (start !== end) {
      setSelection({ start, end });
      
      // Calculate position
      const textarea = textareaRef.current;
      const { offsetLeft, offsetTop } = textarea;
      
      // We'll show it centered above the textarea for now
      // as getting exact character coordinates in a textarea is very complex
      setMenuPosition({
        top: -45, 
        left: 20 // Default left
      });
    } else {
      setSelection(null);
      setMenuPosition(null);
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking the menu buttons
    setTimeout(() => {
      setSelection(null);
      setMenuPosition(null);
    }, 200);
  };

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const start = selection?.start ?? textareaRef.current.selectionStart;
    const end = selection?.end ?? textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const selectedText = text.substring(start, end);
    
    // Check if formatting is already applied (simple toggle)
    const hasPrefix = text.substring(start - prefix.length, start) === prefix;
    const hasSuffix = text.substring(end, end + suffix.length) === suffix;

    let newText: string;
    let newCursorPos: number;

    if (hasPrefix && hasSuffix) {
      // Remove formatting
      newText = text.substring(0, start - prefix.length) + 
                selectedText + 
                text.substring(end + suffix.length);
      newCursorPos = start - prefix.length + selectedText.length;
    } else {
      // Add formatting
      newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    }

    setMessageInput(newText);
    setSelection(null);
    setMenuPosition(null);
    
    // Set focus back and adjust selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('[', `](${url})`);
    }
  };

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
    // Keyboard shortcuts for formatting
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        applyFormatting('**');
      } else if (e.key === 'i') {
        e.preventDefault();
        applyFormatting('*');
      } else if (e.key === 'u') {
        e.preventDefault();
        applyFormatting('__');
      }
    }

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
    <div ref={containerRef} className="bg-white/80 dark:bg-gray-900/80 sticky bottom-0 left-0 backdrop-blur-md p-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-2 z-10 transition-colors duration-300">
      {/* Contextual Formatting Menu */}
      {selection && menuPosition && (
        <div 
          className="absolute z-20 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-1 flex items-center gap-0.5 animate-in fade-in zoom-in duration-200"
          style={{ 
            top: `${menuPosition.top}px`, 
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <button 
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('**'); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('*'); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('__'); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('~~'); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button 
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('`'); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button 
            onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Live Preview */}
      {showLivePreview && messageInput.trim() && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-1 animate-in fade-in slide-in-from-bottom-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Preview</p>
          <div className="text-sm break-words whitespace-pre-wrap text-black dark:text-white">
            {formatMessage(messageInput)}
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 px-1 mb-1 overflow-x-auto no-scrollbar">
        <button 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('**'); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('*'); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('__'); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('~~'); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); applyFormatting('`'); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }} 
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-600 dark:text-gray-400"
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:border-gray-700 mx-1" />
        <button 
          onClick={() => setShowLivePreview(!showLivePreview)} 
          className={`p-1.5 rounded transition-colors ${showLivePreview ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          title={showLivePreview ? "Hide Preview" : "Show Preview"}
        >
          {showLivePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-end gap-2">
        <Input
          ref={textareaRef as any}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown as any}
          onSelect={handleSelect}
          onBlur={handleBlur}
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
