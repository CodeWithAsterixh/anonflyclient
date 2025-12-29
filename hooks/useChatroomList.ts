import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getChatroomAPIURL } from '../lib/constants/api';
import { useAuth } from './useAuth';

interface Chatroom {
  id: string;
  roomname: string;
  description: string;
  hostAid: string;
  participantCount: number;
  lastMessage: string | null;
  isLocked: boolean;
}

interface UseChatroomListReturn {
  chatrooms: Chatroom[];
  loading: boolean;
  error: string | null;
  retryCountdown: number | null;
}

/**
 * Custom hook to fetch and manage the list of chatrooms using Server-Sent Events (SSE).
 * It provides real-time updates to the chatroom list.
 *
 * @returns {UseChatroomListReturn} An object containing the list of chatrooms, loading state, and error state.
 */
export const useChatroomList = (): UseChatroomListReturn => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retryKey, setRetryKey] = useState<number>(0);
  const { token, isLoading: loadingAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !loadingAuth) {
      setError("Authentication token not found.");
      setLoading(false);
      navigate("/login");
      return;
    }

    if (loadingAuth) return;
    
    // If we are authenticated but have no token, we are in offline mode
    if (!token) {
      setError("Working in offline mode. Please check your connection to see chatrooms.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setRetryCountdown(null);

    // Append token as query parameter since standard EventSource doesn't support custom headers
    const baseUrl = getChatroomAPIURL();
    const url = new URL(baseUrl);
    if (token) {
      url.searchParams.append('token', token);
    }

    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setChatrooms(data);
      setLoading(false);
      setRetryCountdown(null);
    };

    eventSource.onerror = (err) => {
      setError("Failed to load chatrooms. Retrying...");
      setLoading(false);
      eventSource.close();
      
      // Start 5-second countdown
      setRetryCountdown(5);
    };

    return () => {
      eventSource.close();
    };
  }, [token, loadingAuth, isAuthenticated, retryKey]);

  useEffect(() => {
    if (retryCountdown === null) return;

    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0, trigger retry
      setRetryKey(prev => prev + 1);
    }
  }, [retryCountdown]);

  return { chatrooms, loading, error, retryCountdown };
};
