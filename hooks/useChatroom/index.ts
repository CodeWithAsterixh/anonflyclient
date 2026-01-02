import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../useAuth";
import { getIdentity } from "../../lib/helpers/identityManager";
import { type Emoji } from "../../lib/assets/emojis";
import type { UseChatroomReturn } from "./types";
import { useChatroomSSE } from "./parts/useChatroomSSE";
import { useChatroomEncryption } from "./parts/useChatroomEncryption";
import { useChatroomMessages } from "./parts/useChatroomMessages";
import { useChatroomParticipants } from "./parts/useChatroomParticipants";
import { useChatroomConnection } from "./parts/useChatroomConnection/index";

/**
 * Custom hook for managing chatroom state and WebSocket communication.
 * Orchestrates specialized hooks for SSE, encryption, messages, participants, and connection.
 *
 * @returns {UseChatroomReturn} An object containing chatroom state and functions.
 */
export const useChatroom = (initialChatroomId?: string | null, deferConnection: boolean = false): UseChatroomReturn => {
  const { user, token, isLoading: loading, logout, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(initialChatroomId || null);

  // Initialize room ID if provided
  useEffect(() => {
    if (initialChatroomId && initialChatroomId !== currentChatroomId) {
      setCurrentChatroomId(initialChatroomId);
    }
  }, [initialChatroomId, currentChatroomId]);

  // SSE for Chatroom Details
  const { 
    chatroomDetail, 
    setChatroomDetail, 
    chatroomDetailRef, 
    isRemoved, 
    setIsRemoved, 
    isRemovedRef 
  } = useChatroomSSE(currentChatroomId, token);

  // Encryption logic
  const { 
    hasRoomKey, 
    setHasRoomKey, 
    roomKeyRef, 
    decryptStoredMessages, 
    clearRoomKey 
  } = useChatroomEncryption();

  // Participant state
  const { 
    participants, 
    setParticipants, 
    participantsRef 
  } = useChatroomParticipants();

  // Message state and actions
  const { 
    messages, 
    setMessages, 
    messagesRef, 
    sendMessage: sendMessageAction,
    editMessage: editMessageAction,
    deleteMessage: deleteMessageAction,
    sendReaction: sendReactionAction
  } = useChatroomMessages(currentChatroomId, user);

  // WebSocket lifecycle and connection
  const { 
    isConnected, 
    isJoined, 
    ws, 
    connect, 
    reconnect,
    joiningRef
  } = useChatroomConnection({
    token,
    user,
    isAuthenticated,
    loading,
    logout,
    currentChatroomId,
    setCurrentChatroomId,
    isRemovedRef,
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
  });

  useEffect(() => {
    if (!deferConnection) {
      connect();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect, deferConnection, ws]);

  const joinChatroom = useCallback(
    async (chatroomId: string, password?: string) => {
      if (!user && !loading) {
        setError("Cannot join chatroom: User not authenticated.");
        return;
      }

      if (joiningRef.current === `${chatroomId}:${password || ''}` && ws?.readyState === WebSocket.OPEN) {
        return;
      }

      setError(null);
      setCurrentChatroomId(chatroomId);

      if (ws?.readyState === WebSocket.OPEN && user) {
        try {
          const identity = await getIdentity();
          if (identity) {
            joiningRef.current = `${chatroomId}:${password || ''}`;
            ws.send(
              JSON.stringify({
                type: "joinChatroom",
                chatroomId,
                token,
                userAid: identity.aid,
                username: identity.username,
                publicKey: identity.publicKey,
                exchangePublicKey: identity.exchangePublicKey,
                password,
              })
            );
          } else {
            setError("Failed to join chatroom: Identity not found. Please try logging in again.");
          }
        } catch (err) {
          setError("Failed to join chatroom: Identity error.");
        }
      }
    },
    [user, token, loading, ws, joiningRef]
  );

  const sendMessage = useCallback(
    async (content: string, replyTo?: any) => {
      try {
        await sendMessageAction(ws, content, roomKeyRef.current, replyTo);
      } catch (err) {
        setError("Failed to secure message");
      }
    },
    [ws, sendMessageAction, roomKeyRef]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        await editMessageAction(ws, messageId, newContent, roomKeyRef.current);
      } catch (err) {
        setError("Failed to secure edited message");
      }
    },
    [ws, editMessageAction, roomKeyRef]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessageAction(ws, messageId);
      } catch (err) {
        setError("Failed to delete message");
      }
    },
    [ws, deleteMessageAction]
  );

  const sendReaction = useCallback(
    (messageId: string, emoji: Emoji) => {
      sendReactionAction(ws, messageId, emoji);
    },
    [ws, sendReactionAction]
  );

  const leaveChatroom = useCallback(async () => {
    if (ws?.readyState === WebSocket.OPEN && currentChatroomId) {
      ws.send(JSON.stringify({ type: "leaveChatroom", chatroomId: currentChatroomId }));
    }

    setCurrentChatroomId(null);
    joiningRef.current = null;
    clearRoomKey();
    setMessages([]);
    setParticipants(new Map());
  }, [ws, currentChatroomId, clearRoomKey, setMessages, setParticipants, joiningRef]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    participants,
    chatroomDetail,
    sendMessage,
    editMessage,
    deleteMessage,
    sendReaction,
    joinChatroom,
    leaveChatroom,
    reconnect,
    clearError,
    isConnected,
    isJoined,
    isRemoved,
    setIsRemoved,
    hasRoomKey,
    error,
    currentChatroomId,
    ws
  };
};
