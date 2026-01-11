import { useEffect, useRef } from 'react';

interface UseTypingStatusProps {
  messageInput: string;
  onTyping?: (isTyping: boolean) => void;
}

export const useTypingStatus = ({ messageInput, onTyping }: UseTypingStatusProps) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);

  useEffect(() => {
    if (messageInput.trim() && !isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.(true);
    } else if (!messageInput.trim() && isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (messageInput.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTyping?.(false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, onTyping]);

  const clearTypingStatus = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onTyping?.(false);
  };

  return { clearTypingStatus };
};
