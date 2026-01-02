import { useState, useRef, useCallback } from "react";
import type { Message } from "../../../lib/types/chat";
import {
  decryptMessage,
  importRoomKey,
} from "../../../lib/helpers/encryption";
import { saveRoomKey } from "../../../lib/helpers/identityManager";

export const useChatroomEncryption = () => {
  const [hasRoomKey, setHasRoomKey] = useState<boolean>(false);
  const roomKeyRef = useRef<CryptoKey | null>(null);

  const decryptStoredMessages = useCallback(async (key: CryptoKey, messages: Message[]) => {
    const updatedMessages = await Promise.all(
      messages.map(async (msg) => {
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
