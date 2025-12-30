import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../useAuth";
import { getChatWSURL, getAPIBaseURL } from "../../lib/constants/api";
import { getIdentity, saveRoomKey, getRoomKey } from "../../lib/helpers/identityManager";
import { type Emoji } from "../../lib/assets/emojis";
import { type Message, type Participant, type ChatroomDetail } from "../../lib/types/chat";
import {
  encryptMessage,
  signBlob,
  deriveSharedSecret,
  decryptMessage,
  verifyBlobSignature,
  generateRoomKey,
  exportKey,
  importRoomKey,
} from "../../lib/helpers/encryption";
import type { UseChatroomReturn } from "./types";

/**
 * Custom hook for managing chatroom state and WebSocket communication.
 * Integrates with websocketController.ts for joining, leaving, and sending messages.
 * Handles real-time message updates and connection status.
 *
 * @returns {UseChatroomReturn} An object containing chatroom state and functions.
 */
export const useChatroom = (initialChatroomId?: string | null, deferConnection: boolean = false): UseChatroomReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const participantsRef = useRef(participants);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const [chatroomDetail, setChatroomDetail] = useState<ChatroomDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(
    initialChatroomId || null
  );
  const roomKeyRef = useRef<CryptoKey | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user, token, isLoading: loading, logout, isAuthenticated } = useAuth();
  const joiningRef = useRef<string | null>(null);

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

      // If we are already joining this room with the same password, don't send another request
      // We use a ref to track the last join attempt to avoid duplicates
      if (joiningRef.current === `${chatroomId}:${password || ''}` && ws.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setError(null);
      setIsJoined(false);
      // Set the current chatroom ID immediately
      setCurrentChatroomId(chatroomId);
      currentChatroomIdRef.current = chatroomId; // Update ref too

      if (ws.current?.readyState === WebSocket.OPEN && user) {
        try {
          const identity = await getIdentity();
          if (identity) {
            joiningRef.current = `${chatroomId}:${password || ''}`;
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
    }
  }, [initialChatroomId, currentChatroomId]);

  const connect = useCallback(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      setError("Authentication session has expired or is invalid.");
      return;
    }

    if (!token) {
      setError("Working in offline mode. Reconnecting when network is available...");
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
          joiningRef.current = null;
          setIsJoined(true);
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
            const key = await importRoomKey(message.encryptedRoomKey);
            
            // Sync local storage
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          } 
          // 2. Fallback: Local IndexedDB (if server was offline or key missing)
          else if (existingKeyBase64) {
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
                const sharedSecret = await deriveSharedSecret(
                  identity.exchangeKeyPair.privateKey,
                  requester.exchangePublicKey
                );
                const exportedKey = await exportKey(roomKeyRef.current);
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
              break;
            }

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
                
                // Decrypt any messages that were received before the key arrived
                await decryptStoredMessages(key);
            }
          }
          break;

        case "masterKeyUpdate":
          if (message.encryptedRoomKey) {
            const key = await importRoomKey(message.encryptedRoomKey);
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            await decryptStoredMessages(key);
          }
          break;

        case "chatMessage":
          const messageId = message.messageId || `msg-${message.timestamp || Date.now()}-${message.senderAid}`;
          
          // Prevent duplicates early
          if (messagesRef.current.some((m) => m.id === messageId)) {
            break;
          }

          let chatContent = message.content;
          let isMsgEncrypted = false;


          try {
            // Try to parse content as an E2EE blob
            const blob = typeof chatContent === 'string' ? JSON.parse(chatContent) : chatContent;
            if (blob && blob.ciphertext && blob.iv) {
              if (roomKeyRef.current) {
                chatContent = await decryptMessage(
                  blob.ciphertext,
                  blob.iv,
                  roomKeyRef.current
                );
                isMsgEncrypted = true;
              } else {
                chatContent = JSON.stringify(blob);
              }
            }
          } catch (e) {
            if (e instanceof Error && e.name === 'OperationError') {
              console.error(`[useChatroom] Decryption failed (OperationError) for message: ${messageId}. This usually means the room key is incorrect.`);
            }
          }

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: messageId,
              senderAid: message.senderAid,
              senderUsername: message.senderUsername,
              content: chatContent,
              signature: message.signature,
              timestamp: message.timestamp || new Date().toISOString(),
              type: "message",
              isEncrypted: isMsgEncrypted,
              reactions: message.reactions || [],
              replyTo: message.replyTo ? {
                messageId: message.replyTo.messageId,
                senderUsername: message.replyTo.senderUsername || message.replyTo.username,
                content: message.replyTo.content,
                userAid: message.replyTo.userAid
              } : undefined,
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

          const joinMsgId = `system-join-${message.userAid}-${message.timestamp || Date.now()}`;
          setMessages((prevMessages) => {
            if (prevMessages.some(m => m.id === joinMsgId)) return prevMessages;
            
            const newMessage: Message = {
              id: joinMsgId,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} just joined`,
              timestamp: message.timestamp || new Date().toISOString(),
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

          const leftMsgId = `system-leave-${message.userAid}-${message.timestamp || Date.now()}`;
          setMessages((prevMessages) => {
            if (prevMessages.some(m => m.id === leftMsgId)) return prevMessages;

            const newMessage: Message = {
              id: leftMsgId,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} left the chat`,
              timestamp: message.timestamp || new Date().toISOString(),
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

        // case "messageDeleted":
        //   setMessages((prevMessages) =>
        //     prevMessages.map((msg) => {
        //       if (msg.id === message.messageId) {
        //         return { ...msg, content: "[This message was deleted]", type: "system" as const, isDeleted: true };
        //       }
        //       if (msg.replyTo && msg.replyTo.messageId === message.messageId) {
        //         return { ...msg, replyTo: { ...msg.replyTo, content: "[This message was deleted]" } };
        //       }
        //       return msg;
        //     })
        //   );
        //   break;

        case "messageEdited":
          const updatedMessages = await Promise.all(
            messagesRef.current.map(async (msg) => {
              // Update the message itself
              if (msg.id === message.messageId) {
                let newContent = message.newContent;
                if (msg.isEncrypted && roomKeyRef.current) {
                  try {
                    const blob = typeof message.newContent === 'string' ? JSON.parse(message.newContent) : message.newContent;
                    if (blob && blob.ciphertext && blob.iv) {
                      newContent = await decryptMessage(
                        blob.ciphertext,
                        blob.iv,
                        roomKeyRef.current
                      );
                    }
                  } catch (e) {
                    console.error("[useChatroom] Failed to decrypt edited message:", e);
                  }
                }
                return { ...msg, content: newContent, isEdited: true };
              }
              
              // Update messages that are replies to this message
              if (msg.replyTo && msg.replyTo.messageId === message.messageId) {
                let newReplyContent = message.newContent;
                if (msg.isEncrypted && roomKeyRef.current) {
                   try {
                    const blob = typeof message.newContent === 'string' ? JSON.parse(message.newContent) : message.newContent;
                    if (blob && blob.ciphertext && blob.iv) {
                      newReplyContent = await decryptMessage(
                        blob.ciphertext,
                        blob.iv,
                        roomKeyRef.current
                      );
                    }
                  } catch (e) {
                    // Fallback to the raw content if decryption fails
                  }
                }
                return { ...msg, replyTo: { ...msg.replyTo, content: newReplyContent } };
              }
              
              return msg;
            })
          );
          setMessages(updatedMessages);
          break;

        case "reactionUpdate":
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === message.messageId
                ? { ...msg, reactions: message.reactions }
                : msg
            )
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
      setIsJoined(false);
      joiningRef.current = null;
      
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
    // We only auto-connect if we have a room ID and it's not a password-protected flow
    // The ChatroomPage will call reconnect() if a manual connection is needed
    if (!deferConnection) {
      connect();
    }
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect, deferConnection]);

  const sendMessage = useCallback(
    async (content: string, replyTo?: { messageId: string; senderUsername: string; content: string; senderAid: string }) => {
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
              replyTo: replyTo ? {
                messageId: replyTo.messageId,
                username: replyTo.senderUsername,
                content: replyTo.content,
                userAid: replyTo.senderAid
              } : undefined,
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

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (
        ws.current?.readyState === WebSocket.OPEN &&
        currentChatroomId &&
        user
      ) {
        try {
          let finalContent = newContent;
          if (roomKeyRef.current) {
            const encrypted = await encryptMessage(newContent, roomKeyRef.current);
            finalContent = JSON.stringify(encrypted);
          }

          ws.current.send(
            JSON.stringify({
              type: "editMessage",
              chatroomId: currentChatroomId,
              messageId,
              newContent: finalContent,
            })
          );

          // Optimistic UI update for the sender
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: newContent, isEdited: true }
                : msg
            ).map((msg) =>
              msg.replyTo && msg.replyTo.messageId === messageId
                ? { ...msg, replyTo: { ...msg.replyTo, content: newContent } }
                : msg
            )
          );
        } catch (err: any) {
          setError("Failed to secure edited message");
        }
      }
    },
    [currentChatroomId, user]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !currentChatroomId) {
      setError("WebSocket not connected or not in a chatroom.");
      return;
    }

    // Optimistic UI update for the sender
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: "[This message was deleted]", isDeleted: true, type: "system" as const }
          : msg
      ).map((msg) =>
        msg.replyTo && msg.replyTo.messageId === messageId
          ? { ...msg, replyTo: { ...msg.replyTo, content: "[This message was deleted]" } }
          : msg
      )
    );

    ws.current.send(
      JSON.stringify({
        type: "deleteMessage",
        chatroomId: currentChatroomId,
        messageId,
      })
    );
  }, [ws.current, currentChatroomId]);

  const sendReaction = useCallback(
    (messageId: string, emoji: Emoji) => {
      if (
        ws.current?.readyState === WebSocket.OPEN &&
        currentChatroomId &&
        user
      ) {
        ws.current.send(
          JSON.stringify({
            type: "reaction",
            chatroomId: currentChatroomId,
            messageId,
            emojiId: emoji.id,
            emojiValue: emoji.value,
            emojiType: emoji.type,
            userAid: user.userId,
            username: user.username,
          })
        );
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
    }
    setCurrentChatroomId(null);
      currentChatroomIdRef.current = null;
      joiningRef.current = null;
      setIsJoined(false);
    setHasRoomKey(false);
    setMessages([]);
    setParticipants(new Map());
    roomKeyRef.current = null;
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
    editMessage,
    deleteMessage,
    sendReaction,
    joinChatroom,
    leaveChatroom,
    reconnect,
    clearError,
    isConnected,
    isJoined,
    hasRoomKey,
    error,
    currentChatroomId,
  };
};