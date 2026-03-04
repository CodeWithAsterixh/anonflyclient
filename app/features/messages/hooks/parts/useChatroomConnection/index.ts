import { useState, useRef, useCallback, useEffect } from "react";
import { getChatWSURL } from '~/shared/constants/api';
import type { UseChatroomConnectionProps } from "./types";
import { createOnMessageHandler } from "./handlers/onMessage";
import { createLifecycleHandlers } from "./handlers/onLifecycle";

export const useChatroomConnection = ({
  token,
  user,
  isAuthenticated,
  loading,
  logout,
  currentChatroomId,
  setCurrentChatroomId,
  isRemovedRef,
  setIsRemoved,
  chatroomDetailRef,
  participantsRef,
  messagesRef,
  setMessages,
  setParticipants,
  setHasRoomKey,
  roomKeyRef,
  decryptStoredMessages,
  setError,
  setChatroomDetail,
}: UseChatroomConnectionProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryCountRef = useRef(0);
  const ws = useRef<WebSocket | null>(null);
  const joiningRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RETRIES = 5;

  const currentChatroomIdRef = useRef(currentChatroomId);
  useEffect(() => {
    currentChatroomIdRef.current = currentChatroomId;
  }, [currentChatroomId]);

  const connect = useCallback(() => {
    if (loading || isRemovedRef.current) return;
    if (!isAuthenticated) {
      setError("Authentication session has expired or is invalid.");
      return;
    }
    if (!token) {
      setError("Working in offline mode. Reconnecting when network is available...");
      return;
    }

    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) return;
      ws.current.close();
    }

    const websocketUrl = `${getChatWSURL()}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(websocketUrl);
    ws.current = socket;

    const { onOpen, onClose, onError } = createLifecycleHandlers({
      setIsConnected,
      setIsJoined,
      setError,
      setRetryCount,
      retryCountRef,
      joiningRef,
      isRemovedRef: isRemovedRef,
      currentChatroomIdRef,
      chatroomDetailRef,
      setMessages,
      user,
      connect,
      MAX_RETRIES,
    });

    const onMessage = createOnMessageHandler({
      user,
      token,
      logout,
      currentChatroomId,
      setCurrentChatroomId,
      setMessages,
      setParticipants,
      setHasRoomKey,
      roomKeyRef,
      participantsRef,
      messagesRef,
      decryptStoredMessages,
      setError,
      joiningRef,
      ws,
      setIsJoined,
      setIsRemoved,
      setChatroomDetail,
    });

    socket.onopen = () => onOpen(socket, heartbeatIntervalRef);
    socket.onmessage = onMessage;
    socket.onclose = (event) => onClose(event, heartbeatIntervalRef);
    socket.onerror = () => onError(heartbeatIntervalRef);
  }, [token, user, isAuthenticated, loading, logout, isRemovedRef, chatroomDetailRef, setMessages, setParticipants, setHasRoomKey, roomKeyRef, decryptStoredMessages, setError, setCurrentChatroomId, messagesRef, participantsRef, setChatroomDetail, currentChatroomId]);

  const reconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setError(null);
    connect();
  }, [connect, setError]);

  return { isConnected, isJoined, retryCount, ws, connect, reconnect, joiningRef };
};
