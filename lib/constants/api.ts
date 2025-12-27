import { selectBestServer } from '../helpers/serverSelector';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:3000';

/**
 * Initialize API configuration with geolocation-based server selection
 * Call this function once on app startup to detect user location and select best server
 */
export async function initializeAPI(): Promise<void> {
  const useGeolocation = import.meta.env.VITE_USE_GEOLOCATION === 'true';

  if (useGeolocation) {
    try {
      API_BASE_URL = await selectBestServer();
    } catch (error) {
      console.error('Failed to select server based on location, using default', error);
      API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    }
  }
}

/**
 * Get the current API base URL
 */
export function getAPIBaseURL(): string {
  return API_BASE_URL;
}

/**
 * Get the chatroom API URL
 */
export function getChatroomAPIURL(): string {
  return `${API_BASE_URL}/chatrooms`;
}

// For backward compatibility with existing code
export const API_BASE_URL_STATIC = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const CHATROOM_API_BASE_URL = `${API_BASE_URL_STATIC}/chatrooms`;
