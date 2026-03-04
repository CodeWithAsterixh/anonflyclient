import { useEffect, useRef, useState } from "react";
import type { ChatroomDetail } from '~/shared/types/chat';

export const useChatroomSSE = (currentChatroomId: string | null, token: string | null) => {
  const [chatroomDetail, setChatroomDetail] = useState<ChatroomDetail | null>(null);
  const chatroomDetailRef = useRef<ChatroomDetail | null>(null);

  useEffect(() => {
    chatroomDetailRef.current = chatroomDetail;
  }, [chatroomDetail]);
  const [isRemoved, setIsRemoved] = useState<boolean | 'removed' | 'banned'>(false);
  const isRemovedRef = useRef<boolean | 'removed' | 'banned'>(false);
  const activeSSERef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentChatroomId || !token) {
      if (chatroomDetail !== null) setChatroomDetail(null);
      activeSSERef.current = null;
      return;
    }

    const sseUrl = `/proxy/chatroom/${currentChatroomId}/details/sse?token=${token}`;

    if (activeSSERef.current === sseUrl) {
      return;
    }

    activeSSERef.current = sseUrl;

    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
    };

    eventSource.addEventListener("removed", (event: any) => {
      const reason = event.data || 'removed';
      isRemovedRef.current = reason;
      setIsRemoved(reason);
      eventSource.close();
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setChatroomDetail((prev) => ({
          ...prev,
          ...data,
        }));
      } catch (err) {
        console.error("[useChatroom] [SSE] Failed to parse data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[useChatroom] [SSE] Connection error:", err);
      activeSSERef.current = null;
      eventSource.close();
    };

    return () => {
      if (activeSSERef.current === sseUrl) {
        activeSSERef.current = null;
      }
      eventSource.close();
    };
  }, [currentChatroomId, token]);

  return { chatroomDetail, setChatroomDetail, chatroomDetailRef, isRemoved, setIsRemoved, isRemovedRef };
};
