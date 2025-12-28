import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getChatWSURL, getAPIBaseURL } from "../lib/constants/api";
import { getIdentity, saveRoomKey, getRoomKey } from "../lib/helpers/identityManager";
import {
  encryptMessage,
  signBlob,
  deriveSharedSecret,
  decryptMessage,
  verifyBlobSignature,
  generateRoomKey,
  exportKey,
  importRoomKey,
} from "../lib/helpers/encryption";

interface Participant {
  userAid: string;
  username: string;
  publicKey?: string;
  exchangePublicKey?: string;
}

interface Message {
  id?: string;
  senderAid: string;
  senderUsername: string;
  content: string;
  signature?: string;
  timestamp: string;
  type?: "message" | "system";
  isEncrypted?: boolean;
}

export interface ChatroomDetail {
  roomId: string;
  roomname: string;
  description: string;
  hostAid: string;
  isLocked: boolean;
  participants: Participant[];
  participantCount?: number;
}

interface UseChatroomReturn {
  messages: Message[];
  participants: Map<string, Participant>;
  chatroomDetail: ChatroomDetail | null;
  sendMessage: (content: string) => void;
  joinChatroom: (chatroomId: string, password?: string) => void;
  leaveChatroom: () => void;
  reconnect: () => void;
  clearError: () => void;
  isConnected: boolean;
  hasRoomKey: boolean;
  error: string | null;
  currentChatroomId: string | null;
}

/**
 * Custom hook for managing chatroom state and WebSocket communication.
 * Integrates with websocketController.ts for joining, leaving, and sending messages.
 * Handles real-time message updates and connection status.
 *
 * @returns {UseChatroomReturn} An object containing chatroom state and functions.
 */
export const useChatroom = (initialChatroomId?: string | null): UseChatroomReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const participantsRef = useRef(participants);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const [chatroomDetail, setChatroomDetail] = useState<ChatroomDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(
    initialChatroomId || null
  );
  const roomKeyRef = useRef<CryptoKey | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user, token, loading, logout } = useAuth();

  const currentChatroomIdRef = useRef(currentChatroomId);

  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    currentChatroomIdRef.current = currentChatroomId;
  }, [currentChatroomId]);

  // SSE for Chatroom Details
  useEffect(() => {
    if (!currentChatroomId || !token) {
      setChatroomDetail(null);
      return;
    }

    const sseUrl = `${getAPIBaseURL()}/chatroom/${currentChatroomId}/details/sse?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setChatroomDetail((prev) => ({
          ...(prev || {}),
          ...data,
        }));
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentChatroomId, token]);

  const decryptStoredMessages = useCallback(async (key: CryptoKey) => {
    const updatedMessages = await Promise.all(
      messagesRef.current.map(async (msg) => {
        if (msg.type === 'message' && !msg.isEncrypted) {
          try {
            const blob = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
            if (blob && blob.ciphertext && blob.iv) {
              const decrypted = await decryptMessage(blob.ciphertext, blob.iv, key);
              return { ...msg, content: decrypted, isEncrypted: true };
            }
          } catch (e) {
            // Not a blob or decryption failed
          }
        }
        return msg;
      })
    );
    setMessages(updatedMessages);
  }, []);

  useEffect(() => {
    if (hasRoomKey && roomKeyRef.current) {
      decryptStoredMessages(roomKeyRef.current);
    }
  }, [hasRoomKey, decryptStoredMessages]);

  const joinChatroom = useCallback(
    async (chatroomId: string, password?: string) => {
      if (!user && !loading) {
        setError("Cannot join chatroom: User not authenticated.");
        return;
      }

      setError(null);
      // Set the current chatroom ID immediately
      setCurrentChatroomId(chatroomId);
      currentChatroomIdRef.current = chatroomId; // Update ref too

      if (ws.current?.readyState === WebSocket.OPEN && user) {
        try {
          const identity = await getIdentity();
          if (identity) {
            ws.current.send(
              JSON.stringify({
                type: "joinChatroom",
                chatroomId,
                token, // Send token for authentication
                userAid: identity.aid,
                username: identity.username,
                password,
              })
            );
          } else {
            console.error("[useChatroom] Identity not found in joinChatroom");
            setError("Failed to join chatroom: Identity not found. Please try logging in again.");
          }
        } catch (err) {
          console.error("[useChatroom] Error getting identity in joinChatroom:", err);
          setError("Failed to join chatroom: Identity error.");
        }
      }
    },
    [user, token, loading]
  );

  // Initialize room ID if provided
  useEffect(() => {
    if (initialChatroomId && initialChatroomId !== currentChatroomId) {
      setCurrentChatroomId(initialChatroomId);
      currentChatroomIdRef.current = initialChatroomId;
      
      // If already connected, join the new room immediately
      if (ws.current?.readyState === WebSocket.OPEN) {
        joinChatroom(initialChatroomId);
      }
    }
  }, [initialChatroomId, joinChatroom, currentChatroomId]);

  const connect = useCallback(() => {
    if (loading) {
      return;
    }

    if (!token) {
      setError("Authentication session has expired or is invalid.");
      return;
    }

    // Close existing connection if any before creating a new one
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
        return; // Already connected or connecting
      }
      ws.current.close();
    }

    const baseWs = getChatWSURL();
    const websocketUrl = `${baseWs}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(websocketUrl);
    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
      
      const roomIdToJoin = currentChatroomIdRef.current;
      if (roomIdToJoin) {
        joinChatroom(roomIdToJoin);
      }
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "error") {
          if (message.message === "Unauthorized") {
            console.error("[useChatroom] Unauthorized. Logging out.");
            logout();
            return;
          }
          setError(message.message);
          return;
        }

        switch (message.type) {
            case "joinSuccess":
          setCurrentChatroomId(message.chatroomId);
          currentChatroomIdRef.current = message.chatroomId; // Update ref
          setMessages([]); // Clear messages on joining a new room

          // Populate participants
          const participantMap = new Map<string, Participant>();
          if (message.participants) {
            message.participants.forEach((p: Participant) => {
              participantMap.set(p.userAid, p);
            });
            setParticipants(participantMap);
            participantsRef.current = participantMap; // Update ref
          }

          // Try to get identity, but don't break yet as some cases don't need it
          const identity = await getIdentity();

          const existingKeyBase64 = await getRoomKey(message.chatroomId);

          // 1. Source of Truth: Server Master Key
          if (message.encryptedRoomKey) {
            console.log(`[useChatroom] Using Master Room Key from server for ${message.chatroomId}`);
            const key = await importRoomKey(message.encryptedRoomKey);
            
            // Sync local storage
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          } 
          // 2. Fallback: Local IndexedDB (if server was offline or key missing)
          else if (existingKeyBase64) {
            console.log(`[useChatroom] No server key, using local key from IndexedDB`);
            const key = await importRoomKey(existingKeyBase64);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
            
            // Try to back up this local key to server so others can use it
            ws.current?.send(JSON.stringify({
              type: 'saveRoomKey',
              chatroomId: message.chatroomId,
              encryptedKey: existingKeyBase64,
              iv: 'none'
            }));
          }
          // 3. Last Resort: Generate New Key
          else if (participantMap.size <= 1) {
            console.log(`[useChatroom] No key found anywhere. Generating new Master Room Key.`);
            const key = await generateRoomKey();
            const exportedKey = await exportKey(key);
            
            // Save locally
            await saveRoomKey(message.chatroomId, exportedKey);
            
            // Save to server
            ws.current?.send(JSON.stringify({
              type: 'saveRoomKey',
              chatroomId: message.chatroomId,
              encryptedKey: exportedKey,
              iv: 'none'
            }));

            roomKeyRef.current = key;
            setHasRoomKey(true);
          } 
          // 4. Request from others (if multiple people are in but no master key on server yet)
          else {
            console.log(`[useChatroom] Requesting key from active participants...`);
            ws.current?.send(
              JSON.stringify({
                type: "roomKeyRequest",
                chatroomId: message.chatroomId,
              })
            );
          }
          break;

        case "roomKeyRequest":
          if (roomKeyRef.current && user) {
            const requester = participantsRef.current.get(message.senderAid);
            if (requester && requester.exchangePublicKey) {
              const identity = await getIdentity();
              if (identity) {
                console.log(`[useChatroom] Sharing room key with ${message.senderAid}`);
                const sharedSecret = await deriveSharedSecret(
                  identity.exchangeKeyPair.privateKey,
                  requester.exchangePublicKey
                );
                const exportedKey = await exportKey(roomKeyRef.current);
                console.log(`[useChatroom] Sharing room key with ${message.senderAid}. Key starts with: ${exportedKey.substring(0, 10)}`);
                const encryptedKey = await encryptMessage(
                  exportedKey,
                  sharedSecret
                );

                ws.current?.send(
                  JSON.stringify({
                    type: "roomKeyShare",
                    chatroomId: message.chatroomId,
                    targetAid: message.senderAid,
                    encryptedKey: encryptedKey.ciphertext,
                    iv: encryptedKey.iv,
                  })
                );
              }
            }
          }
          break;

        case "roomKeyShare":
          const identityForShare = await getIdentity();
          if (identityForShare && message.targetAid === identityForShare.aid) {
            // If we already have a master key from the server, ignore peer shares 
            // unless we are specifically looking for one.
            const serverKey = await getRoomKey(message.chatroomId);
            if (serverKey && roomKeyRef.current) {
              console.log(`[useChatroom] Already have a master key for ${message.chatroomId}, ignoring peer share.`);
              break;
            }

            console.log(`[useChatroom] Received roomKeyShare from ${message.senderAid}`);
            const sender = participantsRef.current.get(message.senderAid);
            if (sender && sender.exchangePublicKey) {
              const sharedSecret = await deriveSharedSecret(
                identityForShare.exchangeKeyPair.privateKey,
                sender.exchangePublicKey
              );
              const decryptedKeyBase64 = await decryptMessage(
                message.encryptedKey,
                message.iv,
                sharedSecret
              );
              const key = await importRoomKey(decryptedKeyBase64);
                
                // Save to IndexedDB so it survives refreshes
                await saveRoomKey(message.chatroomId, decryptedKeyBase64);
                
                roomKeyRef.current = key;
                setHasRoomKey(true);
                console.log(`[useChatroom] Room key successfully imported and saved for ${message.chatroomId}. Key starts with: ${decryptedKeyBase64.substring(0, 10)}`);
                
                // Decrypt any messages that were received before the key arrived
                await decryptStoredMessages(key);
            }
          }
          break;

        case "masterKeyUpdate":
          if (message.encryptedRoomKey) {
            console.log(`[useChatroom] Received Master Key Update from server`);
            const key = await importRoomKey(message.encryptedRoomKey);
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          }
          break;

        case "chatMessage":
          let content = message.content;
          let isEncrypted = false;

          console.log(`[useChatroom] Received message: ${message.messageId || 'no-id'}, roomKey available: ${!!roomKeyRef.current}`);

          try {
            // Try to parse content as an E2EE blob
            const blob = typeof content === 'string' ? JSON.parse(content) : content;
            if (blob && blob.ciphertext && blob.iv) {
              if (roomKeyRef.current) {
                console.log(`[useChatroom] Attempting decryption for message: ${message.messageId || 'no-id'}`);
                content = await decryptMessage(
                  blob.ciphertext,
                  blob.iv,
                  roomKeyRef.current
                );
                isEncrypted = true;
                console.log(`[useChatroom] Decryption successful for message: ${message.messageId || 'no-id'}`);
              } else {
                console.log(`[useChatroom] Room key not yet available for message: ${message.messageId || 'no-id'}. Storing as blob.`);
                content = JSON.stringify(blob);
              }
            }
          } catch (e) {
            if (e instanceof Error && e.name === 'OperationError') {
              console.error(`[useChatroom] Decryption failed (OperationError) for message: ${message.messageId || 'no-id'}. This usually means the room key is incorrect.`);
            } else {
              // Not a JSON blob or other error
            }
          }

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: message.messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              senderAid: message.senderAid,
              senderUsername: message.senderUsername,
              content: content,
              signature: message.signature,
              timestamp: message.timestamp,
              type: "message",
              isEncrypted,
            },
          ]);
          break;

        case "userJoined":
          // Add to participants map
          setParticipants((prev) => {
            const next = new Map(prev);
            next.set(message.userAid, {
              userAid: message.userAid,
              username: message.username,
              publicKey: message.publicKey,
              exchangePublicKey: message.exchangePublicKey,
            });
            participantsRef.current = next; // Update ref
            return next;
          });

          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: `system-${Date.now()}`,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} just joined`,
              timestamp: new Date().toISOString(),
              type: "system",
            };
            return [...prevMessages, newMessage];
          });
          break;

        case "userLeft":
          // Remove from participants map
          setParticipants((prev) => {
            const next = new Map(prev);
            next.delete(message.userAid);
            participantsRef.current = next; // Update ref
            return next;
          });

          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: `system-${Date.now()}`,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} left the chat`,
              timestamp: new Date().toISOString(),
              type: "system",
            };
            return [...prevMessages, newMessage];
          });
          break;

        case "leaveSuccess":
          setCurrentChatroomId(null);
          currentChatroomIdRef.current = null; // Update ref
          setMessages([]); // Clear messages on leaving a room
          roomKeyRef.current = null;
          setHasRoomKey(false);
          participantsRef.current = new Map(); // Update ref
          setParticipants(new Map());
          break;

        case "messageDeleted":
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== message.messageId)
          );
          break;

        case "error":
          setError(message.message);
          break;

        default:
          break;
      }
    } catch (e) {
      setError("Failed to process message");
    }
  };

    socket.onclose = (event) => {
      setIsConnected(false);
      
      if (event.code !== 1000) {
        setError("Connection lost. Retrying in 3 seconds...");
      }

      const activeRoomId = currentChatroomIdRef.current;
      if (activeRoomId) {
        setTimeout(() => {
          // Re-check if we still need to connect to this room
          if (currentChatroomIdRef.current === activeRoomId) {
            connect();
          }
        }, 3000);
      }
    };

    socket.onerror = (event) => {
      console.error("[useChatroom] WebSocket error:", event);
      setError("Failed to connect to chat server. Please check your connection.");
    };

  }, [token, user, loading, joinChatroom, logout]);


  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        console.log("[useChatroom] Cleaning up WebSocket on unmount");
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (
        ws.current?.readyState === WebSocket.OPEN &&
        currentChatroomId &&
        user
      ) {
        try {
          const identity = await getIdentity();
          if (!identity) throw new Error("Identity not found");

          let finalContent = content;
          if (roomKeyRef.current) {
            const encrypted = await encryptMessage(content, roomKeyRef.current);
            finalContent = JSON.stringify(encrypted);
          }

          const signature = await signBlob(
            btoa(finalContent),
            identity.identityKeyPair.privateKey
          );

          ws.current.send(
            JSON.stringify({
              type: "message",
              chatroomId: currentChatroomId,
              content: finalContent,
              signature,
              userAid: identity.aid,
            })
          );
        } catch (err: any) {
          setError("Failed to secure message");
        }
      } else {
        setError("Cannot send message: Not connected or not in a chatroom.");
      }
    },
    [currentChatroomId, user]
  );

  const leaveChatroom = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN && currentChatroomId) {
      ws.current.send(
        JSON.stringify({
          type: "leaveChatroom",
          chatroomId: currentChatroomId,
        })
      );
    } else {
      setError("Cannot leave chatroom: Not connected or not in a chatroom.");
    }
  }, [currentChatroomId]);

  const reconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setError(null);
    connect();
  }, [connect]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    participants,
    chatroomDetail,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    reconnect,
    clearError,
    isConnected,
    hasRoomKey,
    error,
    currentChatroomId,
  };
};
