import { useEffect, type RefObject } from 'react';

interface UseAutoHeightProps {
  ref: RefObject<HTMLTextAreaElement | null>;
  value: string;
  maxHeight?: number;
}

export const useAutoHeight = ({ ref, value, maxHeight = 200 }: UseAutoHeightProps) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      const scrollHeight = ref.current.scrollHeight;
      ref.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      
      // Auto-scroll to bottom when typing
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [value, ref, maxHeight]);

  const resetHeight = () => {
    if (ref.current) {
      ref.current.style.height = 'auto';
    }
  };

  return { resetHeight };
};
