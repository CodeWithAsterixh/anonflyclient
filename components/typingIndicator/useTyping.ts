import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { TypingUser } from './types';
import { getUserAvatar } from '../../lib/controllers/colorsProcessors/userAvatar';

/**
 * Hook to manage typing indicator state.
 * Handles incoming typing events and provides a function to send typing status.
 */
export const useTyping = (chatroomId: string | undefined, wsRef: React.RefObject<WebSocket | null>) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleTypingEvent = useCallback((eventData: any) => {
    if (eventData.type === 'userTyping' && eventData.chatroomId === chatroomId) {
      const { userAid, username, isTyping } = eventData;

      if (isTyping) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userAid === userAid)) return prev;
          return [...prev, { 
            userAid, 
            username, 
            avatarUrl: getUserAvatar(username, userAid) 
          }];
        });

        // Clear existing timeout
        if (typingTimeouts.current.has(userAid)) {
          clearTimeout(typingTimeouts.current.get(userAid));
        }

        // Set new timeout to automatically remove user if they stop typing 
        // without sending an explicit 'stop' event (e.g. they closed the tab)
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userAid !== userAid));
          typingTimeouts.current.delete(userAid);
        }, 5000);

        typingTimeouts.current.set(userAid, timeout);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.userAid !== userAid));
        if (typingTimeouts.current.has(userAid)) {
          clearTimeout(typingTimeouts.current.get(userAid));
          typingTimeouts.current.delete(userAid);
        }
      }
    }
  }, [chatroomId]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && chatroomId) {
      ws.send(JSON.stringify({
        type: 'typing',
        chatroomId,
        isTyping
      }));
    }
  }, [wsRef, chatroomId]);

  // Listen for typing events from useChatroom
  useEffect(() => {
    const handleCustomEvent = (e: any) => {
      handleTypingEvent(e.detail);
    };

    globalThis.window.addEventListener('chatroom-typing', handleCustomEvent);
    return () => {
      globalThis.window.removeEventListener('chatroom-typing', handleCustomEvent);
    };
  }, [handleTypingEvent]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  return {
    typingUsers,
    handleTypingEvent,
    sendTypingStatus
  };
};
