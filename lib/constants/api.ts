import { selectBestServer } from '../helpers/serverSelector';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Resolve the chat WebSocket URL at runtime.
 * - If `VITE_CHAT_WS_URL` is provided, use it but upgrade to `wss://` when the page is served over HTTPS.
 * - Otherwise derive from `API_BASE_URL` (http -> ws, https -> wss).
 */
export function getChatWSURL(): string {
  const envWs = import.meta.env.VITE_CHAT_WS_URL as string | undefined;

  // Prefer explicit env value when present
  if (envWs) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      return envWs.startsWith('ws://') ? envWs.replace(/^ws:\/\//i, 'wss://') : envWs;
    }
    return envWs;
  }

  // Derive from API_BASE_URL
  if (API_BASE_URL.startsWith('https://')) return API_BASE_URL.replace(/^https?:\/\//i, 'wss://');
  if (API_BASE_URL.startsWith('http://')) return API_BASE_URL.replace(/^https?:\/\//i, 'ws://');

  // Fallback
  return 'ws://localhost:3000';
}

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
