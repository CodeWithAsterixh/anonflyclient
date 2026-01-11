import { encryptData, decryptData } from './cryptoUtils';

/**
 * Session storage controller with encryption support.
 * Works like the standard sessionStorage but encrypts/decrypts values.
 */
export const cryptSessionStorage = {
  /**
   * Sets an encrypted item in sessionStorage.
   * @param key The key to store the data under.
   * @param value The value to store (will be stringified).
   * @param contextSalt A value-specific salt (e.g., chatroomId) for encryption.
   */
  setItem: (key: string, value: any, contextSalt: string): void => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encryptedValue = encryptData(stringValue, contextSalt);
      sessionStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('[cryptSessionStorage] Error setting item:', error);
    }
  },

  /**
   * Gets and decrypts an item from sessionStorage.
   * @param key The key to retrieve.
   * @param contextSalt A value-specific salt (e.g., chatroomId) for decryption.
   * @returns The decrypted value, or null if not found or decryption fails.
   */
  getItem: <T = any>(key: string, contextSalt: string): T | null => {
    try {
      const encryptedValue = sessionStorage.getItem(key);
      if (!encryptedValue) return null;

      const decryptedValue = decryptData(encryptedValue, contextSalt);
      if (!decryptedValue) return null;

      try {
        return JSON.parse(decryptedValue) as T;
      } catch {
        return decryptedValue as unknown as T;
      }
    } catch (error) {
      console.error('[cryptSessionStorage] Error getting item:', error);
      return null;
    }
  },

  /**
   * Removes an item from sessionStorage.
   * @param key The key to remove.
   */
  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  /**
   * Clears all items from sessionStorage.
   */
  clear: (): void => {
    sessionStorage.clear();
  }
};
