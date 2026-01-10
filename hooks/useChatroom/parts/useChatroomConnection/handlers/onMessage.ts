import type { MessageHandlerContext } from "../types";
import { getIdentity, getRoomKey, saveRoomKey } from "../../../../../lib/helpers/identityManager";
import { 
  decryptMessage, 
  deriveSharedSecret, 
  encryptMessage, 
  exportKey, 
  generateRoomKey, 
  importRoomKey 
} from "../../../../../lib/helpers/encryption";
import type { Participant } from "../../../../../lib/types/chat";

export const createOnMessageHandler = (ctx: MessageHandlerContext) => {
  const {
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
  } = ctx;

  return async (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "pong") return;

      if (message.type === "error") {
        if (message.message === "Unauthorized") {
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
          setMessages([]);
          setChatroomDetail((prev: any) => ({
            ...prev,
            hostAid: message.hostAid,
            creatorAid: message.creatorAid,
            isCreatorOnline: message.isCreatorOnline
          }));
          const participantMap = new Map<string, Participant>();
          if (message.participants) {
            message.participants.forEach((p: Participant) => {
              participantMap.set(p.userAid, p);
            });
            setParticipants(participantMap);
          }

          const existingKeyBase64 = await getRoomKey(message.chatroomId);
          if (message.encryptedRoomKey) {
            const key = await importRoomKey(message.encryptedRoomKey);
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            const updated = await decryptStoredMessages(key, messagesRef.current);
            setMessages(updated);
          } else if (existingKeyBase64) {
            const key = await importRoomKey(existingKeyBase64);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            const updated = await decryptStoredMessages(key, messagesRef.current);
            setMessages(updated);
            ws.current?.send(JSON.stringify({
              type: 'saveRoomKey',
              chatroomId: message.chatroomId,
              encryptedKey: existingKeyBase64,
              iv: 'none'
            }));
          } else if (participantMap.size <= 1) {
            const key = await generateRoomKey();
            const exportedKey = await exportKey(key);
            await saveRoomKey(message.chatroomId, exportedKey);
            ws.current?.send(JSON.stringify({
              type: 'saveRoomKey',
              chatroomId: message.chatroomId,
              encryptedKey: exportedKey,
              iv: 'none'
            }));
            roomKeyRef.current = key;
            setHasRoomKey(true);
          } else {
            ws.current?.send(JSON.stringify({
              type: "roomKeyRequest",
              chatroomId: message.chatroomId,
            }));
          }
          break;
          
        case "forceDisconnect":
          // console.log(`[useChatroom] [WS] Force disconnect received: ${message.reason}`);
          setIsRemoved(message.reason || true);
          ws.current?.close();
          break;

        case "roomKeyRequest":
          if (roomKeyRef.current && user) {
            const requester = participantsRef.current.get(message.senderAid);
            if (requester?.exchangePublicKey) {
              const identity = await getIdentity();
              if (identity) {
                const sharedSecret = await deriveSharedSecret(
                  identity.exchangeKeyPair.privateKey,
                  requester.exchangePublicKey
                );
                const exportedKey = await exportKey(roomKeyRef.current);
                const encryptedKey = await encryptMessage(exportedKey, sharedSecret);
                ws.current?.send(JSON.stringify({
                  type: "roomKeyShare",
                  chatroomId: message.chatroomId,
                  targetAid: message.senderAid,
                  encryptedKey: encryptedKey.ciphertext,
                  iv: encryptedKey.iv,
                }));
              }
            }
          }
          break;

        case "roomKeyShare":
          const identityForShare = await getIdentity();
          if (identityForShare && message.targetAid === identityForShare.aid) {
            const serverKey = await getRoomKey(message.chatroomId);
            if (serverKey && roomKeyRef.current) break;
            const sender = participantsRef.current.get(message.senderAid);
            if (sender?.exchangePublicKey) {
              const sharedSecret = await deriveSharedSecret(
                identityForShare.exchangeKeyPair.privateKey,
                sender.exchangePublicKey
              );
              const decryptedKeyBase64 = await decryptMessage(message.encryptedKey, message.iv, sharedSecret);
              const key = await importRoomKey(decryptedKeyBase64);
              await saveRoomKey(message.chatroomId, decryptedKeyBase64);
              roomKeyRef.current = key;
              setHasRoomKey(true);
              const updated = await decryptStoredMessages(key, messagesRef.current);
              setMessages(updated);
            }
          }
          break;

        case "masterKeyUpdate":
          if (message.encryptedRoomKey) {
            const key = await importRoomKey(message.encryptedRoomKey);
            await saveRoomKey(message.chatroomId, message.encryptedRoomKey);
            roomKeyRef.current = key;
            setHasRoomKey(true);
            const updated = await decryptStoredMessages(key, messagesRef.current);
            setMessages(updated);
          }
          break;

        case "chatMessage":
          const messageId = message.messageId || `msg-${message.timestamp || Date.now()}-${message.senderAid}`;
          if (messagesRef.current.some((m) => m.id === messageId)) break;
          let chatContent = message.content;
          let isMsgEncrypted = false;
          try {
            const blob = typeof chatContent === 'string' ? JSON.parse(chatContent) : chatContent;
            if (blob?.ciphertext && blob?.iv) {
              if (roomKeyRef.current) {
                chatContent = await decryptMessage(blob.ciphertext, blob.iv, roomKeyRef.current);
                isMsgEncrypted = true;
              } else {
                chatContent = JSON.stringify(blob);
              }
            }
          } catch (e) {}
          setMessages((prev) => [...prev, {
            id: messageId,
            senderAid: message.senderAid,
            senderUsername: message.senderUsername,
            content: chatContent,
            signature: message.signature,
            timestamp: message.timestamp || new Date().toISOString(),
            type: message.isDeleted ? "system" : "message",
            isEncrypted: isMsgEncrypted,
            isEdited: message.isEdited || false,
            isDeleted: message.isDeleted || false,
            reactions: message.reactions || [],
            replyTo: message.replyTo ? {
              messageId: message.replyTo.messageId,
              senderUsername: message.replyTo.senderUsername || message.replyTo.username,
              content: message.replyTo.content,
              userAid: message.replyTo.userAid
            } : undefined,
          }]);
          break;

        case "userJoined":
          if (message.isCreator) {
            setChatroomDetail((prev: any) => ({ ...prev, isCreatorOnline: true }));
          }
          setParticipants((prev) => {
            if (prev.has(message.userAid)) return prev;
            const next = new Map(prev);
            next.set(message.userAid, {
              userAid: message.userAid,
              username: message.username,
              publicKey: message.publicKey,
              exchangePublicKey: message.exchangePublicKey,
              allowedFeatures: message.allowedFeatures,
            });
            return next;
          });
          const joinMsgId = `system-join-${message.userAid}-${message.timestamp || Date.now()}`;
          setMessages((prev) => {
            if (prev.some(m => m.id === joinMsgId)) return prev;
            return [...prev, {
              id: joinMsgId,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} just joined`,
              timestamp: message.timestamp || new Date().toISOString(),
              type: "system",
            }];
          });
          break;

        case "userLeft":
          if (message.isCreator) {
            setChatroomDetail((prev: any) => ({ ...prev, isCreatorOnline: false }));
          }
          setParticipants((prev) => {
            if (!prev.has(message.userAid)) return prev;
            const next = new Map(prev);
            next.delete(message.userAid);
            return next;
          });
          const leftMsgId = `system-leave-${message.userAid}-${message.timestamp || Date.now()}`;
          setMessages((prev) => {
            if (prev.some(m => m.id === leftMsgId)) return prev;
            return [...prev, {
              id: leftMsgId,
              senderAid: "system",
              senderUsername: "System",
              content: `${message.username} left the chat`,
              timestamp: message.timestamp || new Date().toISOString(),
              type: "system",
            }];
          });
          break;

        case "hostUpdated":
          setChatroomDetail((prev: any) => ({
            ...prev,
            hostAid: message.hostAid
          }));
          break;

        case "leaveSuccess":
          setCurrentChatroomId(null);
          setMessages([]);
          roomKeyRef.current = null;
          setHasRoomKey(false);
          setParticipants(new Map());
          break;

        case "messageDeleted":
          setMessages((prev) => prev.map((msg) => {
            if (msg.id === message.messageId) {
              return { ...msg, content: "[This message was deleted]", isDeleted: true };
            }
            if (msg.replyTo && msg.replyTo.messageId === message.messageId) {
              return { ...msg, replyTo: { ...msg.replyTo, content: "[This message was deleted]" } };
            }
            return msg;
          }));
          break;

        case "messageEdited":
          (async () => {
            let decryptedContent = message.newContent;
            if (roomKeyRef.current) {
              try {
                const blob = typeof message.newContent === 'string' ? JSON.parse(message.newContent) : message.newContent;
                if (blob?.ciphertext && blob?.iv) {
                  decryptedContent = await decryptMessage(blob.ciphertext, blob.iv, roomKeyRef.current);
                }
              } catch (e) {
                console.error("Failed to decrypt edited message", e);
              }
            }

            setMessages((prev) => prev.map((msg) => {
              if (msg.id === message.messageId) {
                return { ...msg, content: decryptedContent, isEdited: true };
              }
              if (msg.replyTo && msg.replyTo.messageId === message.messageId) {
                return { ...msg, replyTo: { ...msg.replyTo, content: decryptedContent } };
              }
              return msg;
            }));
          })();
          break;

        case "reactionUpdate":
          setMessages((prev) => prev.map((msg) => msg.id === message.messageId ? { ...msg, reactions: message.reactions } : msg));
          break;

        case "userTyping":
          globalThis.window.dispatchEvent(new CustomEvent('chatroom-typing', { detail: message }));
          break;
      }
    } catch (e) {
      setError("Failed to process message");
    }
  };
};
