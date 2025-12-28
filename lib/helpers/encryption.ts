/**
 * Encryption utilities for End-to-End Encryption in Anonfly.
 * Uses X25519 for key exchange and AES-GCM for symmetric encryption.
 */

// Import from identityManager if needed, or keep utilities here
import { type Identity } from './identityManager';

/**
 * Derives a shared secret between the local user and a remote user.
 */
export async function deriveSharedSecret(localPrivateKeyBase64: string, remotePublicKeyBase64: string): Promise<CryptoKey> {
  const privateKeyBuffer = Uint8Array.from(atob(localPrivateKeyBase64), c => c.charCodeAt(0));
  const publicKeyBuffer = Uint8Array.from(atob(remotePublicKeyBase64), c => c.charCodeAt(0));

  const localPrivateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'X25519' },
    false,
    ['deriveKey']
  );

  const remotePublicKey = await window.crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'X25519' },
    false,
    []
  );

  return window.crypto.subtle.deriveKey(
    { name: 'X25519', public: remotePublicKey },
    localPrivateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a message using a shared secret.
 */
export async function encryptMessage(content: string, sharedSecret: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedContent = new TextEncoder().encode(content);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedSecret,
    encodedContent
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypts a message using a shared secret.
 */
export async function decryptMessage(ciphertextBase64: string, ivBase64: string, sharedSecret: CryptoKey): Promise<string> {
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sharedSecret,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Generates a new random AES-GCM key for a chatroom.
 */
export async function generateRoomKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to a base64 string.
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Imports a base64 string as an AES-GCM CryptoKey.
 */
export async function importRoomKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Signs a blob using the Identity Private Key.
 */
export async function signBlob(blobBase64: string, privateKeyBase64: string): Promise<string> {
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
  const privateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'Ed25519' },
    false,
    ['sign']
  );

  const blob = Uint8Array.from(atob(blobBase64), c => c.charCodeAt(0));
  const signatureBuffer = await window.crypto.subtle.sign(
    { name: 'Ed25519' },
    privateKey,
    blob
  );

  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
}

/**
 * Verifies a blob signature using the Identity Public Key.
 */
export async function verifyBlobSignature(blobBase64: string, signatureBase64: string, publicKeyBase64: string): Promise<boolean> {
  const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
  const publicKey = await window.crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'Ed25519' },
    false,
    ['verify']
  );

  const blob = Uint8Array.from(atob(blobBase64), c => c.charCodeAt(0));
  const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

  return window.crypto.subtle.verify(
    { name: 'Ed25519' },
    publicKey,
    signature,
    blob
  );
}
