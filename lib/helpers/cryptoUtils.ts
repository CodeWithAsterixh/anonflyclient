import CryptoJS from 'crypto-js';

const APP_SALT = import.meta.env.VITE_ROOM_SECRET_KEY_SALT;

/**
 * Encrypts data using a value-specific salt and the application-wide salt.
 */
export function encryptData(value: string, contextSalt: string): string {
  const key = `${APP_SALT}:${contextSalt}`;
  return CryptoJS.AES.encrypt(value, key).toString();
}

/**
 * Decrypts data using a value-specific salt and the application-wide salt.
 */
export function decryptData(encryptedValue: string, contextSalt: string): string {
  const key = `${APP_SALT}:${contextSalt}`;
  const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
