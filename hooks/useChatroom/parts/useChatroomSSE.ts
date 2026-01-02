import { useState, useEffect, useRef } from "react";
import { getAPIBaseURL } from "../../../lib/constants/api";
import type { ChatroomDetail } from "../../../lib/types/chat";

export const useChatroomSSE = (currentChatroomId: string | null, token: string | null) => {
  const [chatroomDetail, setChatroomDetail] = useState<ChatroomDetail | null>(null);
  const chatroomDetailRef = useRef<ChatroomDetail | null>(null);

  useEffect(() => {
    chatroomDetailRef.current = chatroomDetail;
  }, [chatroomDetail]);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const isRemovedRef = useRef<boolean>(false);
  const activeSSERef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentChatroomId || !token) {
      if (chatroomDetail !== null) setChatroomDetail(null);
      activeSSERef.current = null;
      return;
    }

    const sseUrl = `${getAPIBaseURL()}/chatroom/${currentChatroomId}/details/sse?token=${token}`;
    
    if (activeSSERef.current === sseUrl) {
      return;
    }
    
    console.log(`[useChatroom] [SSE] Connecting to: ${sseUrl.substring(0, 50)}...`);
    activeSSERef.current = sseUrl;
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log(`[useChatroom] [SSE] Connection opened for room: ${currentChatroomId}`);
    };

    eventSource.addEventListener("removed", () => {
      console.log("[useChatroom] [SSE] User removed event received");
      isRemovedRef.current = true;
      setIsRemoved(true);
      eventSource.close();
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setChatroomDetail((prev) => ({
          ...(prev || {}),
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
      console.log(`[useChatroom] [SSE] Cleaning up connection for room: ${currentChatroomId}`);
      if (activeSSERef.current === sseUrl) {
        activeSSERef.current = null;
      }
      eventSource.close();
    };
  }, [currentChatroomId, token]);

  return { chatroomDetail, setChatroomDetail, chatroomDetailRef, isRemoved, setIsRemoved, isRemovedRef };
};
