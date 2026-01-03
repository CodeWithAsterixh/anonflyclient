import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code, Eraser, MoreHorizontal, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type FormattingAction = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'clear';

interface FormattingContextMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  onAction: (action: FormattingAction) => void;
  onClose: () => void;
  isMobile: boolean;
}

const FormattingContextMenu: React.FC<FormattingContextMenuProps> = ({
  isOpen,
  position,
  onAction,
  onClose,
  isMobile
}) => {
  const [showOverflow, setShowOverflow] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Focus the first button when menu opens
      setTimeout(() => {
        const firstButton = menuRef.current?.querySelector('button');
        if (firstButton instanceof HTMLElement) {
          firstButton.focus();
        }
      }, 50);
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
        setShowOverflow(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const buttons = Array.from(menuRef.current?.querySelectorAll('button') || []);
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === 'ArrowDown') {
        const next = buttons[(index + 1) % buttons.length];
        if (next instanceof HTMLElement) next.focus();
      } else {
        const prev = buttons[(index - 1 + buttons.length) % buttons.length];
        if (prev instanceof HTMLElement) prev.focus();
      }
    }
  };

  if (!isRendered) return null;

  const actions = [
    { id: 'bold', icon: Bold, label: 'Bold' },
    { id: 'italic', icon: Italic, label: 'Italic' },
    { id: 'underline', icon: Underline, label: 'Underline' },
    { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'clear', icon: Eraser, label: 'Clear' },
  ] as const;

  const handleAction = (id: FormattingAction) => {
    onAction(id);
    onClose();
  };

  const desktopMenu = (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Text formatting menu"
      onKeyDown={handleKeyDown}
      className={`fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px] transition-all duration-100 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{
        top: Math.max(10, position.top),
        left: Math.max(10, position.left),
      }}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          role="menuitem"
          onClick={() => handleAction(action.id)}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:bg-gray-100 dark:focus:bg-gray-700 outline-none"
        >
          <action.icon className="w-4 h-4 mr-3" />
          {action.label}
        </button>
      ))}
    </div>
  );

  const mobileMenu = (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Text formatting tools"
      onKeyDown={handleKeyDown}
      className={`fixed z-[9999] flex flex-col items-center transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{
        top: position.top,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      {/* Horizontal Bar */}
      <div className="flex items-center bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-2xl border border-white/10 dark:border-black/10">
        {actions.slice(0, 3).map((action) => (
          <button
            key={action.id}
            aria-label={action.label}
            onClick={() => handleAction(action.id)}
            className="p-3 text-white dark:text-gray-900 active:bg-white/20 dark:active:bg-black/20 rounded-full transition-colors focus:bg-white/20 dark:focus:bg-black/20 outline-none"
          >
            <action.icon className="w-5 h-5" />
          </button>
        ))}
        <button
          aria-label="More options"
          aria-expanded={showOverflow}
          onClick={() => setShowOverflow(!showOverflow)}
          className={`p-3 text-white dark:text-gray-900 active:bg-white/20 dark:active:bg-black/20 rounded-full transition-colors focus:bg-white/20 dark:focus:bg-black/20 outline-none ${showOverflow ? 'bg-white/20 dark:bg-black/20' : ''}`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Overflow Menu */}
      {showOverflow && (
        <div 
          role="menu"
          className="mt-2 bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 dark:border-black/10 py-2 min-w-[200px] max-h-[40vh] overflow-y-auto transition-all duration-200"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              role="menuitem"
              onClick={() => handleAction(action.id)}
              className="w-full flex items-center px-4 py-3 text-white dark:text-gray-900 active:bg-white/10 dark:active:bg-black/10 transition-colors border-b border-white/5 last:border-0 focus:bg-white/10 dark:focus:bg-black/10 outline-none"
            >
              <action.icon className="w-5 h-5 mr-4" />
              <span className="text-base font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return createPortal(
    isMobile ? mobileMenu : desktopMenu,
    document.body
  );
};

export default FormattingContextMenu;
