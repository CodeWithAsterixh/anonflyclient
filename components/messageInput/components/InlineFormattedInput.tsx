import React, { useRef, useEffect, useState } from 'react';
import { formatInline } from '../../../lib/helpers/markdown';

interface InlineFormattedInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  maxHeight?: number;
}

/**
 * A custom input component that renders formatted text inline.
 * Uses the mirroring technique: a transparent textarea over a formatted div.
 */
export const InlineFormattedInput = React.forwardRef<HTMLTextAreaElement, InlineFormattedInputProps>(
  ({ value, onChange, onKeyDown, onSelect, onBlur, onContextMenu, placeholder, disabled, className, autoFocus, maxHeight = 200 }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    // Expose the internal textarea ref correctly
    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    // Sync scroll between textarea and mirror
    const handleScroll = () => {
      if (internalRef.current && mirrorRef.current) {
        mirrorRef.current.scrollTop = internalRef.current.scrollTop;
      }
    };

    // Ensure scroll sync when value changes (e.g., after typing or pasting)
    React.useEffect(() => {
      handleScroll();
    }, [value]);

    // Focus handling
    React.useEffect(() => {
      if (autoFocus && internalRef.current) {
        internalRef.current.focus();
      }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    // Shared styles for textarea and mirror to ensure alignment
    const sharedStyles: React.CSSProperties = {
      padding: '8px 14px',
      fontSize: '15px',
      lineHeight: '1.4',
      fontFamily: 'inherit',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      width: '100%',
      maxHeight: `${maxHeight}px`,
      border: 'none',
      outline: 'none',
      margin: 0,
      boxSizing: 'border-box',
    };

    return (
      <div className={`relative w-full rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-800/50 border ${isFocused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        {/* Mirror Div (Behind) */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            ...sharedStyles,
            color: 'inherit',
            position: 'relative',
            pointerEvents: 'none',
            overflowY: 'auto',
            zIndex: 0,
          }}
          className="text-gray-900 dark:text-gray-100"
        >
          {value ? formatInline(value) : (
            <span className="text-gray-400 dark:text-gray-500 absolute left-[14px] top-[8px] pointer-events-none">{placeholder}</span>
          )}
          {/* Extra space for the cursor at the end of text */}
          {value.endsWith('\n') ? '\n ' : ''}
        </div>

        {/* Real Textarea (Front) */}
        <textarea
          ref={internalRef}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
          onScroll={handleScroll}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          disabled={disabled}
          placeholder="" // Placeholder is handled by mirror div
          style={{
            ...sharedStyles,
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            color: 'transparent',
            caretColor: '#3b82f6', // Bright blue cursor for visibility
            background: 'transparent',
            resize: 'none',
            zIndex: 1,
            overflowY: 'auto',
          }}
          className="placeholder-transparent dark:text-white"
        />
      </div>
    );
  }
);

InlineFormattedInput.displayName = 'InlineFormattedInput';
