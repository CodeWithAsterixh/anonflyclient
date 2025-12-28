import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getChatWSURL } from "../lib/constants/api";
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

interface UseChatroomReturn {
  messages: Message[];
  participants: Map<string, Participant>;
  sendMessage: (content: string) => void;
  joinChatroom: (chatroomId: string) => void;
  leaveChatroom: () => void;
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
export const useChatroom = (): UseChatroomReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const participantsRef = useRef(participants);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(
    null
  );
  const roomKeyRef = useRef<CryptoKey | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user, token, loading } = useAuth();

  const currentChatroomIdRef = useRef(currentChatroomId);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    currentChatroomIdRef.current = currentChatroomId;
  }, [currentChatroomId]);

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
    async (chatroomId: string) => {
      if (!user && !loading) {
        setError("Cannot join chatroom: User not authenticated.");
        return;
      }

      // Set the current chatroom ID immediately
      setCurrentChatroomId(chatroomId);
      currentChatroomIdRef.current = chatroomId; // Update ref too

      if (ws.current?.readyState === WebSocket.OPEN && user) {
        const identity = await getIdentity();
        if (identity) {
          ws.current.send(
            JSON.stringify({
              type: "joinChatroom",
              chatroomId,
              userAid: identity.aid,
              username: identity.username,
            })
          );
        }
      }
    },
    [user, loading]
  );

  const connect = useCallback(() => {
    if (!token || loading) {
      if (!loading) {
        setError("Authentication token not found or still loading.");
      }
      return;
    }

    // Reuse existing WebSocket if it's already open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    const baseWs = getChatWSURL();
    const websocketUrl = `${baseWs}?token=${encodeURIComponent(token)}`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
      // Re-join current chatroom if we have one
      if (currentChatroomIdRef.current) {
        joinChatroom(currentChatroomIdRef.current);
      }
    };

    ws.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

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

          const identity = await getIdentity();
          if (!identity) break;

          // 1. Try to load existing room key from IndexedDB
          const existingKeyBase64 = await getRoomKey(message.chatroomId);
          if (existingKeyBase64) {
            console.log(`[useChatroom] Found existing room key in IndexedDB for ${message.chatroomId}`);
            const key = await importRoomKey(existingKeyBase64);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          } 
          // 2. If no local key but server has an encrypted one, and I am the host
          else if (message.encryptedRoomKey && message.hostAid === identity.aid) {
            console.log(`[useChatroom] Recovering room key from server (I am the host)`);
            // For now, we are storing it raw for the host to simplify sync
            const key = await importRoomKey(message.encryptedRoomKey);
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          } 
          // 2.5 If no local key but server has one and I'm not the host, still try to request it
          else if (message.encryptedRoomKey && message.hostAid !== identity.aid) {
            console.log(`[useChatroom] Room has a master key on server. Requesting decryption from host...`);
            ws.current?.send(
              JSON.stringify({
                type: "roomKeyRequest",
                chatroomId: message.chatroomId,
              })
            );
          }
          // 3. If I am the first participant, generate a new key
          else if (participantMap.size <= 1) {
            console.log(`[useChatroom] First participant. Generating new master room key.`);
            const key = await generateRoomKey();
            const exportedKey = await exportKey(key);
            await saveRoomKey(message.chatroomId, exportedKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);

            // If I am the host, also back it up to the server (encrypted with my identity)
            if (message.hostAid === identity.aid) {
              // For now, we'll store it raw on the server for debugging, but in production this MUST be encrypted
              // so only the host can recover it.
              ws.current?.send(JSON.stringify({
                type: 'saveRoomKey',
                chatroomId: message.chatroomId,
                encryptedKey: exportedKey, // Temporary: raw for easier sync
                iv: 'none'
              }));
            }
          } 
          // 4. Otherwise, request it from others
          else {
            console.log(`[useChatroom] Requesting room key from participants...`);
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
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
      if (currentChatroomIdRef.current) {
        setTimeout(connect, 3000);
      }
    };

    ws.current.onerror = (error) => {
      setError("WebSocket connection error.");
    };

    return () => {
      // Don't close WebSocket on unmount to keep multi-room/persistent connection
      // We only close it if we explicitly leave or go offline
    };
  }, [token, user, joinChatroom]);

  useEffect(() => {
    connect();
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

  return {
    messages,
    participants,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    isConnected,
    hasRoomKey,
    error,
    currentChatroomId,
  };
};

interface ChatroomParticipant {
  userId: string;
  username: string;
}

export interface ChatroomDetail {
  roomId: string;
  roomname: string;
  description: string;
  hostAid: string;
  participants: ChatroomParticipant[];
}
