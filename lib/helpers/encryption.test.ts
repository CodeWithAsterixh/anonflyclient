import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateRoomKey,
  exportKey,
  importRoomKey,
  encryptMessage,
  decryptMessage,
  deriveSharedSecret,
} from './encryption';

describe('PFS and Encryption Logic', () => {
  
  it('should generate a valid room key', async () => {
    const key = await generateRoomKey();
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
    expect((key.algorithm as any).length).toBe(256);
  });

  it('should export and import a room key correctly', async () => {
    const originalKey = await generateRoomKey();
    const exported = await exportKey(originalKey);
    
    expect(typeof exported).toBe('string');
    
    const importedKey = await importRoomKey(exported);
    expect(importedKey).toBeDefined();
    expect(importedKey.algorithm.name).toBe('AES-GCM');
  });

  it('should encrypt and decrypt a message using a room key', async () => {
    const key = await generateRoomKey();
    const message = "Hello, PFS!";
    
    const { ciphertext, iv } = await encryptMessage(message, key);
    expect(ciphertext).toBeDefined();
    expect(iv).toBeDefined();
    
    const decrypted = await decryptMessage(ciphertext, iv, key);
    expect(decrypted).toBe(message);
  });

  it('should perform key exchange (derive shared secret) and decrypt room key', async () => {
    // Simulate User A (Host) and User B (Participant)
    const userA = await generateKeyPair();
    const userB = await generateKeyPair();

    // User A derives shared secret using A's Private + B's Public
    const sharedSecretA = await deriveSharedSecret(userA.privateKey, userB.publicKey);
    
    // User B derives shared secret using B's Private + A's Public
    const sharedSecretB = await deriveSharedSecret(userB.privateKey, userA.publicKey);

    // Shared secrets (AES-GCM keys) should be exportable to same raw bytes? 
    // Or at least functionally equivalent.
    
    const roomKey = await generateRoomKey();
    const roomKeyString = await exportKey(roomKey);

    // User A encrypts the room key for User B
    const encryptedKeyPacket = await encryptMessage(roomKeyString, sharedSecretA);

    // User B decrypts the packet using their shared secret
    const decryptedKeyString = await decryptMessage(
      encryptedKeyPacket.ciphertext, 
      encryptedKeyPacket.iv, 
      sharedSecretB
    );

    expect(decryptedKeyString).toBe(roomKeyString);
  });
});
