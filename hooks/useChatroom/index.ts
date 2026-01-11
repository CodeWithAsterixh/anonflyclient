import { useCallback, useEffect, useState } from "react";
import { type Emoji } from "../../lib/assets/emojis";
import { cryptSessionStorage } from "../../lib/helpers/cryptSessionStorage";
import { getIdentity } from "../../lib/helpers/identityManager";
import { useAuth } from "../useAuth";
import { useChatroomConnection } from "./parts/useChatroomConnection/index";
import { useChatroomEncryption } from "./parts/useChatroomEncryption";
import { useChatroomMessages } from "./parts/useChatroomMessages";
import { useChatroomParticipants } from "./parts/useChatroomParticipants";
import { useChatroomSSE } from "./parts/useChatroomSSE";
import type { UseChatroomReturn } from "./types";

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
  });

  useEffect(() => {
    if (!deferConnection) {
      connect();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect, deferConnection, ws]);

  const joinChatroom = useCallback(
    async (chatroomId: string, password?: string, linkToken?: string) => {
      if (!user && !loading) {
        setError("Cannot join chatroom: User not authenticated.");
        return;
      }

      const joinAuthToken = cryptSessionStorage.getItem(`room_join_auth_${chatroomId}`, chatroomId) || undefined;

      if (joiningRef.current === `${chatroomId}:${password || ''}:${linkToken || ''}:${joinAuthToken || ''}` && ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setError(null);
      setCurrentChatroomId(chatroomId);

      if (ws.current?.readyState === WebSocket.OPEN && user) {
        try {
          const identity = await getIdentity();
          if (identity) {
            joiningRef.current = `${chatroomId}:${password || ''}:${linkToken || ''}:${joinAuthToken || ''}`;
            ws.current.send(
              JSON.stringify({
                type: "joinChatroom",
                chatroomId,
                token,
                userAid: identity.aid,
                username: identity.username,
                publicKey: identity.publicKey,
                exchangePublicKey: identity.exchangePublicKey,
                allowedFeatures: user?.allowedFeatures,
                password,
                linkToken,
                joinAuthToken, // Send the token
              })
            );
          } else {
            setError("Failed to join chatroom: Identity not found. Please try logging in again.");
          }
        } catch {
          setError("Failed to join chatroom: Identity error.");
        }
      }
    },
    [user, token, loading, ws, joiningRef]
  );

  const sendMessage = useCallback(
    async (content: string, replyTo?: any) => {
      try {
        await sendMessageAction(ws.current, content, roomKeyRef.current, replyTo);
      } catch{
        setError("Failed to secure message");
      }
    },
    [ws, sendMessageAction, roomKeyRef]
  );

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      try {
        await editMessageAction(ws.current, messageId, newContent, roomKeyRef.current);
      } catch {
        setError("Failed to secure edited message");
      }
    },
    [ws, editMessageAction, roomKeyRef]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessageAction(ws.current, messageId);
      } catch {
        setError("Failed to delete message");
      }
    },
    [ws, deleteMessageAction]
  );

  const sendReaction = useCallback(
    (messageId: string, emoji: Emoji) => {
      sendReactionAction(ws.current, messageId, emoji);
    },
    [ws, sendReactionAction]
  );

  const leaveChatroom = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN && currentChatroomId) {
      ws.current.send(JSON.stringify({ type: "leaveChatroom", chatroomId: currentChatroomId }));
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
