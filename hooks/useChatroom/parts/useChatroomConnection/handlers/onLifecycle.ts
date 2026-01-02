import { getRoomKey, saveRoomKey } from "../../../../../lib/helpers/identityManager";

interface LifecycleContext {
  setIsConnected: (val: boolean) => void;
  setIsJoined: (val: boolean) => void;
  setError: (err: string | null) => void;
  setRetryCount: (count: number) => void;
  retryCountRef: React.RefObject<number>;
  joiningRef: React.RefObject<string | null>;
  isRemovedRef: React.RefObject<boolean | 'removed' | 'banned'>;
  currentChatroomIdRef: React.RefObject<string | null>;
  chatroomDetailRef: React.RefObject<any>;
  user: any;
  connect: () => void;
  MAX_RETRIES: number;
}

export const createLifecycleHandlers = (ctx: LifecycleContext) => {
  const {
    setIsConnected,
    setIsJoined,
    setError,
    setRetryCount,
    retryCountRef,
    joiningRef,
    isRemovedRef,
    currentChatroomIdRef,
    chatroomDetailRef,
    user,
    connect,
    MAX_RETRIES,
  } = ctx;

  const onOpen = (socket: WebSocket, heartbeatIntervalRef: React.RefObject<NodeJS.Timeout | null>) => {
    setIsConnected(true);
    setError(null);
    setRetryCount(0);
    retryCountRef.current = 0;
    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  };

  const onClose = async (event: CloseEvent, heartbeatIntervalRef: React.RefObject<NodeJS.Timeout | null>) => {
    setIsConnected(false);
    setIsJoined(false);
    joiningRef.current = null;
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
    const currentRetryCount = retryCountRef.current;
    if (event.code !== 1000 && !isRemovedRef.current) {
      if (currentRetryCount < MAX_RETRIES) {
        setError(`Connection lost. Retrying (${currentRetryCount + 1}/${MAX_RETRIES})...`);
      } else {
        setError("Connection failed after multiple attempts. Please refresh.");
      }
    }

    const activeRoomId = currentChatroomIdRef.current;
    const isHost = chatroomDetailRef.current?.hostAid === user?.userId;
    if (activeRoomId && !isHost) {
      const existingKey = await getRoomKey(activeRoomId);
      if (existingKey) {
        await saveRoomKey(activeRoomId, existingKey, Date.now() + 3600000);
      }
    }

    if (activeRoomId && !isRemovedRef.current && currentRetryCount < MAX_RETRIES) {
      setTimeout(() => {
        if (currentChatroomIdRef.current === activeRoomId) {
          retryCountRef.current += 1;
          setRetryCount(retryCountRef.current);
          connect();
        }
      }, 3000);
    }
  };

  const onError = (heartbeatIntervalRef: React.RefObject<NodeJS.Timeout | null>) => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    setError("Failed to connect to chat server. Please check your connection.");
  };

  return { onOpen, onClose, onError };
};
