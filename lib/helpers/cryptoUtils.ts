import CryptoJS from 'crypto-js';

const APP_SALT = import.meta.env.VITE_ROOM_SECRET_KEY_SALT;

/**
 * Derives a strong key from the salt and context salt using PBKDF2.
 */
function deriveKey(contextSalt: string): CryptoJS.lib.WordArray {
  const iterations = 10000; // Increased iterations for better security
  const keySize = 256 / 32;
  return CryptoJS.PBKDF2(APP_SALT, contextSalt, {
    keySize,
    iterations
  });
}

/**
 * Encrypts data using a value-specific salt and the application-wide salt.
 * Note: This is used for reversible encryption (e.g. storing room passwords in sessionStorage).
 */
export function encryptData(value: string, contextSalt: string): string {
  const key = deriveKey(contextSalt);
  return CryptoJS.AES.encrypt(value, key).toString();
}

/**
 * Decrypts data using a value-specific salt and the application-wide salt.
 */
export function decryptData(encryptedValue: string, contextSalt: string): string {
  try {
    const key = deriveKey(contextSalt);
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Decryption resulted in empty string');
    return decrypted;
  } catch (error) {
    console.error('[cryptoUtils] Decryption failed:', error);
    return '';
  }
}

/**
 * Hashes a password securely using PBKDF2.
 * Use this for one-way hashing if password verification is needed.
 */
export function hashPassword(password: string, salt: string): string {
  const iterations = 100000; // Much higher for one-way hashing
  const keySize = 512 / 32;
  return CryptoJS.PBKDF2(password, salt, {
    keySize,
    iterations,
    hasher: CryptoJS.algo.SHA512
  }).toString();
}
