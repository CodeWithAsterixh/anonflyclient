import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { TypingUser } from '~/features/messages/components/typingIndicator/types';
import { getUserAvatar } from '~/shared/utils/controllers/colorsProcessors/userAvatar';

/**
 * Hook to manage typing indicator state.
 * Handles incoming typing events and provides a function to send typing status.
 */
export const useTyping = (chatroomId: string | undefined, wsRef: React.RefObject<WebSocket | null>) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeUser = useCallback((userAid: string) => {
    setTypingUsers((prev) => prev.filter((u) => u.userAid !== userAid));
    const existingTimeout = typingTimeouts.current.get(userAid);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeouts.current.delete(userAid);
    }
  }, []);

  const addUser = useCallback((userAid: string, username: string) => {
    setTypingUsers((prev) => {
      if (prev.some((u) => u.userAid === userAid)) return prev;
      return [...prev, {
        userAid,
        username,
        avatarUrl: getUserAvatar(username, userAid)
      }];
    });
  }, []);

  const handleTypingEvent = useCallback((eventData: any) => {
    if (eventData.type !== 'userTyping' || eventData.chatroomId !== chatroomId) return;

    const { userAid, username, isTyping } = eventData;

    if (isTyping) {
      addUser(userAid, username);

      // Clear existing timeout before setting a new one
      if (typingTimeouts.current.has(userAid)) {
        clearTimeout(typingTimeouts.current.get(userAid));
      }

      const timeout = setTimeout(() => removeUser(userAid), 5000);
      typingTimeouts.current.set(userAid, timeout);
    } else {
      removeUser(userAid);
    }
  }, [chatroomId, addUser, removeUser]);

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
