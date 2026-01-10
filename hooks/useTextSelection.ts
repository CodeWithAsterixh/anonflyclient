import { useState, useCallback, useEffect, useRef } from 'react';

interface SelectionState {
  start: number;
  end: number;
  text: string;
}

interface Position {
  top: number;
  left: number;
}

export const useTextSelection = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [menuPosition, setMenuPosition] = useState<Position | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getCaretCoordinates = useCallback((index: number) => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const div = document.createElement('div');
    const style = globalThis.window.getComputedStyle(textarea);

    // Copy textarea styles to the mirror div
    const properties = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
      'textAlign', 'textTransform', 'wordSpacing', 'letterSpacing', 'whiteSpace', 'wordBreak', 'tabSize', 'hyphens'
    ];

    properties.forEach(prop => {
      (div.style as any)[prop] = (style as any)[prop];
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';

    const textBefore = textarea.value.substring(0, index);
    div.textContent = textBefore;

    const span = document.createElement('span');
    span.textContent = textarea.value.substring(index) || '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const textareaRect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    // Calculate position relative to the viewport
    const top = textareaRect.top + span.offsetTop - textarea.scrollTop;
    const left = textareaRect.left + span.offsetLeft - textarea.scrollLeft;

    document.body.removeChild(div);

    return { top, left };
  }, [textareaRef]);

  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd, value } = textareaRef.current;

    if (selectionStart !== selectionEnd) {
      const text = value.substring(selectionStart, selectionEnd);
      setSelection({ start: selectionStart, end: selectionEnd, text });

      // Calculate position (center of selection)
      const startCoords = getCaretCoordinates(selectionStart);
      const endCoords = getCaretCoordinates(selectionEnd);
      
      // Place menu above selection
      setMenuPosition({
        top: startCoords.top - 45, // Above the text
        left: (startCoords.left + endCoords.left) / 2
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSelection(null);
    }
  }, [textareaRef, getCaretCoordinates]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    
    // If text is selected, prevent default and show our menu
    if (selectionStart !== selectionEnd) {
      e.preventDefault();
      setMenuPosition({ top: e.clientY, left: e.clientX });
      setIsOpen(true);
    }
  }, [textareaRef]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setSelection(null);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleBlur = () => {
      // Small delay to allow clicking on the menu itself
      setTimeout(() => {
        if (!document.activeElement?.closest('[role="menu"]') && 
            !document.activeElement?.closest('[role="dialog"]')) {
          closeMenu();
        }
      }, 100);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isOpen && 
          !textarea.contains(e.target as Node) && 
          !document.querySelector('[role="menu"]')?.contains(e.target as Node) &&
          !document.querySelector('[role="dialog"]')?.contains(e.target as Node)) {
        closeMenu();
      }
    };

    textarea.addEventListener('blur', handleBlur);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      textarea.removeEventListener('blur', handleBlur);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [textareaRef, isOpen, closeMenu]);

  return {
    selection,
    menuPosition,
    isOpen,
    handleSelect,
    handleContextMenu,
    closeMenu,
  };
};
