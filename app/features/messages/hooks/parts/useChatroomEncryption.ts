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

  const decryptStoredMessages = useCallback(async (key: CryptoKey, messages: Message[]) => {
    const updatedMessages = await Promise.all(
      messages.map(async (msg) => {
        // Handle both 'message' and 'chatMessage' types, and allow for missing type (default to message)
        const isMsg = !msg.type || msg.type === 'message';
        if (isMsg && !msg.isEncrypted) {
          try {
            const content = msg.content;
            if (typeof content !== 'string') return msg;

            let blob;
            try {
              blob = JSON.parse(content);
            } catch {
              return msg; // Not a JSON string
            }

            if (blob?.ciphertext && blob.iv) {
              const decrypted = await decryptMessage(blob.ciphertext, blob.iv, key);
              return { ...msg, content: decrypted, isEncrypted: true };
            }
          } catch (e) {
            console.debug("Failed to decrypt stored message:", e);
          }
        }
        return msg;
      })
    );
    return updatedMessages;
  }, []);

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
