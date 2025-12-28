/**
 * @file useAuth.ts
 * @description Custom hook for authentication logic, including login, registration, and token management.
 */

import { useState, useEffect, useCallback } from 'react';
import { performHandshake } from '../lib/controllers/authController';
import { getIdentity, generateIdentity } from '../lib/helpers/identityManager';
import type { User } from '../types/User';
import { getSessionUser, setSessionUser, clearSessionUser } from '../lib/helpers/authStorage';



interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  joinAnonymously: (username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing authentication state and actions.
 * Provides functions for joining anonymously and logging out.
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const initializeAuth = useCallback(async () => {
    // 1. Check for ephemeral session
    const session = getSessionUser();
    if (session && session.token && session.user) {
      setAuthState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return;
    }

    // 2. Check for persistent identity
    try {
      const identity = await getIdentity();
      if (identity) {
        // If identity exists, perform handshake to get a session
        const sessionData = await performHandshake(identity);
        const user: User = { userId: sessionData.aid, username: sessionData.username };
        setAuthState({
          user,
          token: sessionData.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
      }
    } catch (error: any) {
      console.error("Failed to perform handshake on initialization:", error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        isAuthenticated: false,
        error: 'Failed to establish secure session'
      }));
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Joins the app anonymously by generating an identity and performing a handshake.
   */
  const joinAnonymously = async (username: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const identity = await generateIdentity(username);
      const sessionData = await performHandshake(identity);
      const user: User = { userId: sessionData.aid, username: sessionData.username };
      
      setAuthState({
        user,
        token: sessionData.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to join anonymously',
      }));
      throw error;
    }
  };

  /**
   * Logs the user out by clearing the session storage.
   * Persistent identity remains in IndexedDB.
   */
  const logout = useCallback(() => {
    clearSessionUser();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...authState,
    isLoading: authState.loading,
    joinAnonymously,
    logout,
  };
};
