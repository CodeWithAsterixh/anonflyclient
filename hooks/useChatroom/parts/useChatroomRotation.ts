import { useCallback } from "react";
import { getIdentity, saveRoomKey } from "../../../lib/helpers/identityManager";
import {
  generateRoomKey,
  exportKey,
  encryptMessage,
  deriveSharedSecret,
} from "../../../lib/helpers/encryption";
import type { Participant } from "../../../lib/types/chat";

export const useChatroomRotation = (
  ws: React.RefObject<WebSocket | null>,
  participantsRef: React.RefObject<Map<string, Participant>>,
  chatroomId: string | null,
  setHasRoomKey: (has: boolean) => void,
  roomKeyRef: React.RefObject<CryptoKey | null>
) => {

  const rotateKey = useCallback(async () => {
    if (!chatroomId || !ws.current) return;

    const identity = await getIdentity();
    if (!identity) return;

    // Generate new key
    const newKey = await generateRoomKey();
    const exportedKey = await exportKey(newKey);

    // Prepare keys payload
    const keys: Record<string, { ciphertext: string; iv: string }> = {};

    // Encrypt for each participant
    // Use ref to get latest participants
    const participants = participantsRef.current;
    
    // We need to ensure we include ourselves in the encryption if we want to support multi-device or just consistency
    // But for now, we update local state directly.
    // However, if we have other sessions (multi-device), they need the key.
    // Assuming single device for now.

    for (const [aid, participant] of participants.entries()) {
      if (participant.exchangePublicKey) {
        // Shared secret: My Private Key + Their Public Key
        const sharedSecret = await deriveSharedSecret(
            identity.exchangeKeyPair.privateKey,
            participant.exchangePublicKey
        );
        const encrypted = await encryptMessage(exportedKey, sharedSecret);
        keys[aid] = { ciphertext: encrypted.ciphertext, iv: encrypted.iv };
      }
    }

    // Update local state immediately
    roomKeyRef.current = newKey;
    setHasRoomKey(true);
    await saveRoomKey(chatroomId, exportedKey);

    // Send to backend
    ws.current.send(JSON.stringify({
      type: 'rotateKey',
      chatroomId,
      keys
    }));

  }, [chatroomId, ws, participantsRef, roomKeyRef, setHasRoomKey]);

  return { rotateKey };
};
