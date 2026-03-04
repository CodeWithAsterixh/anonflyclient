import { useCallback } from 'react';
import { type FormattingAction } from '~/shared/components/common/FormattingContextMenu/FormattingContextMenu';

interface UseFormattingProps {
  value: string;
  onChange: (value: string) => void;
  selection: { start: number; end: number } | null;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const useFormatting = ({ value, onChange, selection, textareaRef }: UseFormattingProps) => {
  const applyFormatting = useCallback((type: FormattingAction) => {
    if (!selection || !textareaRef.current) return;

    const { start, end } = selection;
    const selectedText = value.substring(start, end);
    let newValue = '';
    let cursorOffsetStart = 0;
    let cursorOffsetEnd = 0;

    const formats: Record<Exclude<FormattingAction, 'clear'>, { prefix: string; suffix: string }> = {
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '*', suffix: '*' },
      underline: { prefix: '__', suffix: '__' },
      strikethrough: { prefix: '~~', suffix: '~~' },
      code: { prefix: '`', suffix: '`' },
    };

    if (type === 'clear') {
      // Simple clear: remove all common markdown tags
      newValue =
        value.substring(0, start) +
        selectedText.replaceAll(/(\*\*|\*|__|~~|`|\[|\]\(.*?\))/g, '') +
        value.substring(end);

      const removedCount = selectedText.length - selectedText.replaceAll(/(\*\*|\*|__|~~|`|\[|\]\(.*?\))/g, '').length;
      cursorOffsetEnd = -removedCount;
    } else {
      const { prefix, suffix } = formats[type];

      // Check if already formatted to toggle it off
      if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix)) {
        newValue =
          value.substring(0, start) +
          selectedText.substring(prefix.length, selectedText.length - suffix.length) +
          value.substring(end);
        cursorOffsetEnd = -(prefix.length + suffix.length);
      } else {
        newValue =
          value.substring(0, start) +
          prefix + selectedText + suffix +
          value.substring(end);
        cursorOffsetStart = 0; // Keep start at same position
        cursorOffsetEnd = prefix.length + suffix.length;
      }
    }

    onChange(newValue);

    // Refocus and set selection after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + cursorOffsetStart, end + cursorOffsetEnd);
      }
    }, 0);
  }, [value, onChange, selection, textareaRef]);

  return { applyFormatting };
};
