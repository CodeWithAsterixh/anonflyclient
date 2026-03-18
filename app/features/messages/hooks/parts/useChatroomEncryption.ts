import { useState, useRef, useCallback } from "react";
import type { Message } from '~/shared/types/chat';
import {
  decryptMessage,
  importRoomKey,
} from '~/shared/utils/encryption';
import { saveRoomKey } from '~/shared/utils/identityManager';

export const useChatroomEncryption = () => {
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const roomKeyRef = useRef<CryptoKey | null>(null);

  const decryptSingleMessage = useCallback(async (key: CryptoKey, msg: Message) => {
    let updatedMsg = { ...msg };

    // Handle both 'message' and 'chatMessage' types, and allow for missing type (default to message)
    const isMsg = !updatedMsg.type || updatedMsg.type === 'message';
    if (isMsg && !updatedMsg.isEncrypted) {
      try {
        const content = updatedMsg.content;
        if (typeof content === 'string') {
          let blob;
          try {
            blob = JSON.parse(content);
          } catch {
            // Not a JSON string
          }

          if (blob?.ciphertext && blob.iv) {
            const decrypted = await decryptMessage(blob.ciphertext, blob.iv, key);
            updatedMsg = { ...updatedMsg, content: decrypted, isEncrypted: true };
          }
        }
      } catch (e) {
        console.debug("Failed to decrypt stored message:", e);
      }
    }

    // Decrypt replyTo content if it exists
    if (updatedMsg.replyTo?.content) {
      try {
        const replyContent = updatedMsg.replyTo.content;
        if (typeof replyContent === 'string') {
          let replyBlob;
          try {
            replyBlob = JSON.parse(replyContent);
          } catch {
            // Not a JSON string
          }

          if (replyBlob?.ciphertext && replyBlob.iv) {
            const decryptedReply = await decryptMessage(replyBlob.ciphertext, replyBlob.iv, key);
            updatedMsg.replyTo = { ...updatedMsg.replyTo, content: decryptedReply };
          }
        }
      } catch (e) {
        console.debug("Failed to decrypt stored reply content:", e);
      }
    }

    return updatedMsg;
  }, []);

  const decryptStoredMessages = useCallback(async (key: CryptoKey, messages: Message[]) => {
    return await Promise.all(messages.map(msg => decryptSingleMessage(key, msg)));
  }, [decryptSingleMessage]);

  const updateRoomKey = useCallback(async (chatroomId: string, encryptedKey: string, expiration?: number) => {
    const key = await importRoomKey(encryptedKey);
    await saveRoomKey(chatroomId, encryptedKey, expiration);
    roomKeyRef.current = key;
    setHasRoomKey(true);
    return key;
  }, []);

  const clearRoomKey = useCallback(() => {
    roomKeyRef.current = null;
    setHasRoomKey(false);
  }, []);

  return {
    hasRoomKey,
    setHasRoomKey,
    roomKeyRef,
    decryptStoredMessages,
    updateRoomKey,
    clearRoomKey
  };
};
