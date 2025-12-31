import { useState, useCallback } from 'react';

export const useClipboard = (timeout = 2000) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), timeout);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  }, [timeout]);

  return { copy, hasCopied };
};
