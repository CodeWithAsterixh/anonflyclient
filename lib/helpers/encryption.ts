/**
 * Encryption utilities for End-to-End Encryption in Anonfly.
 * Uses X25519 for key exchange and AES-GCM for symmetric encryption.
 */

// Import from identityManager if needed, or keep utilities here

/**
 * Safely get the crypto object for browser or node environment
 */
const getCrypto = () => {
  if (globalThis.crypto !== undefined) return globalThis.crypto;
  // @ts-ignore
  if (globalThis?.crypto) return globalThis.crypto;
  throw new Error('Crypto API not available');
};

/**
 * Generates an X25519 key pair for key exchange.
 * Returns Base64 encoded keys (spki for public, pkcs8 for private).
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const crypto = getCrypto();
  const keyPair = await crypto.subtle.generateKey(
    { name: 'X25519' },
    true,
    ['deriveKey', 'deriveBits']
  ) as CryptoKeyPair;

  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: btoa(String.fromCodePoint(...new Uint8Array(publicKeyBuffer))),
    privateKey: btoa(String.fromCodePoint(...new Uint8Array(privateKeyBuffer))),
  };
}

/**
 * Derives a shared secret between the local user and a remote user.
 */
export async function deriveSharedSecret(localPrivateKeyBase64: string, remotePublicKeyBase64: string): Promise<CryptoKey> {
  const crypto = getCrypto();
  const privateKeyBuffer = Uint8Array.from(atob(localPrivateKeyBase64), c => c.codePointAt(0) || 0);
  const publicKeyBuffer = Uint8Array.from(atob(remotePublicKeyBase64), c => c.codePointAt(0) || 0);

  const localPrivateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'X25519' },
    false,
    ['deriveKey']
  );

  const remotePublicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'X25519' },
    false,
    []
  );

  return crypto.subtle.deriveKey(
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
  const crypto = getCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedContent = new TextEncoder().encode(content);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedSecret,
    encodedContent
  );

  return {
    ciphertext: btoa(String.fromCodePoint(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCodePoint(...iv)),
  };
}

/**
 * Decrypts a message using a shared secret.
 */
export async function decryptMessage(ciphertextBase64: string, ivBase64: string, sharedSecret: CryptoKey): Promise<string> {
  const crypto = getCrypto();
  try {
    const ciphertext = Uint8Array.from(atob(ciphertextBase64), c => c.codePointAt(0) || 0);
    const iv = Uint8Array.from(atob(ivBase64), c => c.codePointAt(0) || 0);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      sharedSecret,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('[Encryption] Decryption error details:', {
      error,
      ciphertextLength: ciphertextBase64.length,
      ivLength: ivBase64.length,
      keyAlgorithm: sharedSecret.algorithm,
      keyUsages: sharedSecret.usages
    });
    throw error;
  }
}

/**
 * Generates a new random AES-GCM key for a chatroom.
 */
export async function generateRoomKey(): Promise<CryptoKey> {
  const crypto = getCrypto();
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to a base64 string.
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const crypto = getCrypto();
  const exported = await crypto.subtle.exportKey('raw', key);
  const base64 = btoa(String.fromCodePoint(...new Uint8Array(exported)));
  return base64;
}

/**
 * Imports a base64 string as an AES-GCM CryptoKey.
 */
export async function importRoomKey(keyBase64: string): Promise<CryptoKey> {
  const crypto = getCrypto();
  const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.codePointAt(0) || 0);
  return crypto.subtle.importKey(
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
  const crypto = getCrypto();
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.codePointAt(0) || 0);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'Ed25519' },
    false,
    ['sign']
  );

  const blob = Uint8Array.from(atob(blobBase64), c => c.codePointAt(0) || 0);
  const signatureBuffer = await crypto.subtle.sign(
    { name: 'Ed25519' },
    privateKey,
    blob
  );

  return btoa(String.fromCodePoint(...new Uint8Array(signatureBuffer)));
}

/**
 * Verifies a blob signature using the Identity Public Key.
 */
export async function verifyBlobSignature(blobBase64: string, signatureBase64: string, publicKeyBase64: string): Promise<boolean> {
  const crypto = getCrypto();
  const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), c => c.codePointAt(0) || 0);
  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    { name: 'Ed25519' },
    false,
    ['verify']
  );

  const blob = Uint8Array.from(atob(blobBase64), c => c.codePointAt(0) || 0);
  const signature = Uint8Array.from(atob(signatureBase64), c => c.codePointAt(0) || 0);

  return crypto.subtle.verify(
    { name: 'Ed25519' },
    publicKey,
    signature,
    blob
  );
}
