import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getChatWSURL } from '../lib/constants/api';
import { getIdentity } from '../lib/helpers/identityManager';
import { encryptMessage, signBlob, deriveSharedSecret, decryptMessage, verifyBlobSignature, generateRoomKey, exportKey, importRoomKey } from '../lib/helpers/encryption';

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
  type?: 'message' | 'system';
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
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const participantsRef = useRef(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatroomId, setCurrentChatroomId] = useState<string | null>(null);
  const roomKeyRef = useRef<CryptoKey | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user, token, loading } = useAuth();

  const currentChatroomIdRef = useRef(currentChatroomId);
  useEffect(() => {
    currentChatroomIdRef.current = currentChatroomId;
  }, [currentChatroomId]);

  const connect = useCallback(() => {
    if (!token || loading) { // Only connect if token is available and auth is not loading
      if (!loading) { // Only set error if not loading, otherwise it's a transient state
        setError('Authentication token not found or still loading.');
      }
      return;
    }

    // Ensure previous WebSocket connection is closed before opening a new one
    if (ws.current) {
      ws.current.close();
    }

    const baseWs = getChatWSURL();
    const websocketUrl = `${baseWs}?token=${encodeURIComponent(token)}`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('WebSocket connected.');
    };

    ws.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'joinSuccess':
          console.log(`Successfully joined chatroom: ${message.chatroomId}`);
          setCurrentChatroomId(message.chatroomId);
          setMessages([]); // Clear messages on joining a new room
          
          // Populate participants
          const participantMap = new Map<string, Participant>();
          if (message.participants) {
            message.participants.forEach((p: Participant) => {
              participantMap.set(p.userAid, p);
            });
            setParticipants(participantMap);
          }

          // If I'm the first one, generate a room key
          if (participantMap.size <= 1) {
            console.log('First participant, generating room key...');
            const key = await generateRoomKey();
            roomKeyRef.current = key;
            setHasRoomKey(true);
          } else {
            // Request room key from others
            console.log('Requesting room key from participants...');
            ws.current?.send(JSON.stringify({
              type: 'roomKeyRequest',
              chatroomId: message.chatroomId,
            }));
          }
          break;

        case 'roomKeyRequest':
          if (roomKeyRef.current && user) {
            console.log(`Received roomKeyRequest from ${message.senderAid}`);
            const requester = participantsRef.current.get(message.senderAid);
            if (requester && requester.exchangePublicKey) {
              const identity = await getIdentity();
              if (identity) {
                const sharedSecret = await deriveSharedSecret(identity.exchangeKeyPair.privateKey, requester.exchangePublicKey);
                const exportedKey = await exportKey(roomKeyRef.current);
                const encryptedKey = await encryptMessage(exportedKey, sharedSecret);
                
                ws.current?.send(JSON.stringify({
                  type: 'roomKeyShare',
                  chatroomId: message.chatroomId,
                  targetAid: message.senderAid,
                  encryptedKey: encryptedKey.ciphertext,
                  iv: encryptedKey.iv,
                }));
              }
            }
          }
          break;

        case 'roomKeyShare':
          const identityForShare = await getIdentity();
          if (identityForShare && message.targetAid === identityForShare.aid) {
            console.log(`Received roomKeyShare from ${message.senderAid}`);
            const sender = participantsRef.current.get(message.senderAid);
            if (sender && sender.exchangePublicKey) {
              const sharedSecret = await deriveSharedSecret(identityForShare.exchangeKeyPair.privateKey, sender.exchangePublicKey);
              const decryptedKeyBase64 = await decryptMessage(message.encryptedKey, message.iv, sharedSecret);
              const key = await importRoomKey(decryptedKeyBase64);
              roomKeyRef.current = key;
              setHasRoomKey(true);
              console.log('Successfully decrypted and imported room key.');
            }
          }
          break;

        case 'chatMessage':
          let content = message.content;
          let isEncrypted = false;
          
          try {
            // Try to parse content as an E2EE blob
            const blob = JSON.parse(content);
            if (blob.ciphertext && blob.iv && roomKeyRef.current) {
              content = await decryptMessage(blob.ciphertext, blob.iv, roomKeyRef.current);
              isEncrypted = true;
            }
          } catch (e) {
            // Not a JSON blob or decryption failed, treat as plaintext
          }

          setMessages((prevMessages) => [...prevMessages, {
            id: message.messageId,
            senderAid: message.senderAid,
            senderUsername: message.senderUsername,
            content: content,
            signature: message.signature,
            timestamp: message.timestamp,
            type: 'message',
            isEncrypted,
          }]);
          break;

        case 'userJoined':
          console.log('Received userJoined message:', message);
          
          // Add to participants map
          setParticipants((prev) => {
            const next = new Map(prev);
            next.set(message.userAid, {
              userAid: message.userAid,
              username: message.username,
              publicKey: message.publicKey,
              exchangePublicKey: message.exchangePublicKey
            });
            return next;
          });

          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: `system-${Date.now()}`,
              senderAid: 'system',
              senderUsername: 'System',
              content: `${message.username} just joined`,
              timestamp: new Date().toISOString(),
              type: 'system',
            };
            return [...prevMessages, newMessage];
          });
          break;

        case 'userLeft':
          // Remove from participants map
          setParticipants((prev) => {
            const next = new Map(prev);
            next.delete(message.userAid);
            return next;
          });

          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: `system-${Date.now()}`,
              senderAid: 'system',
              senderUsername: 'System',
              content: `${message.username} left the chat`,
              timestamp: new Date().toISOString(),
              type: 'system',
            };
            return [...prevMessages, newMessage];
          });
          break;

        case 'leaveSuccess':
          console.log(`Successfully left chatroom: ${message.chatroomId}`);
          setCurrentChatroomId(null);
          setMessages([]); // Clear messages on leaving a room
          roomKeyRef.current = null;
          setHasRoomKey(false);
          setParticipants(new Map());
          break;

        case 'messageDeleted':
          setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== message.messageId));
          break;

        case 'error':
          setError(message.message);
          console.error('WebSocket error from server:', message.message);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    };
    console.log('WebSocket onmessage handler set.');

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected. Event:', event);
      setIsConnected(false);
      if (currentChatroomIdRef.current) {
        console.log('Attempting to reconnect...');
        setTimeout(connect, 3000);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error.');
    };

    return () => {
      ws.current?.close();
    };
  }, [token, user]);

  useEffect(() => {
    connect();
  }, [connect]);

  const sendMessage = useCallback(async (content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && currentChatroomId && user) {
      try {
        const identity = await getIdentity();
        if (!identity) throw new Error('Identity not found');

        let finalContent = content;
        if (roomKeyRef.current) {
          const encrypted = await encryptMessage(content, roomKeyRef.current);
          finalContent = JSON.stringify(encrypted);
        }
        
        const signature = await signBlob(btoa(finalContent), identity.identityKeyPair.privateKey);

        ws.current.send(JSON.stringify({
          type: 'message',
          chatroomId: currentChatroomId,
          content: finalContent,
          signature,
          userAid: identity.aid,
        }));
      } catch (err: any) {
        console.error('Failed to secure message:', err);
        setError('Failed to secure message');
      }
    } else {
      setError('Cannot send message: Not connected or not in a chatroom.');
    }
  }, [currentChatroomId, user]);

  const joinChatroom = useCallback(async (chatroomId: string) => {
    if (!user && !loading) {
      setError('Cannot join chatroom: User not authenticated.');
      return;
    }
    if (ws.current?.readyState === WebSocket.OPEN && user) {
      const identity = await getIdentity();
      if (identity) {
        ws.current.send(JSON.stringify({
          type: 'joinChatroom',
          chatroomId,
          userAid: identity.aid,
          username: identity.username,
        }));
      }
    }
  }, [user]);

  const leaveChatroom = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN && currentChatroomId) {
      ws.current.send(JSON.stringify({
        type: 'leaveChatroom',
        chatroomId: currentChatroomId,
      }));
    } else {
      setError('Cannot leave chatroom: Not connected or not in a chatroom.');
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

