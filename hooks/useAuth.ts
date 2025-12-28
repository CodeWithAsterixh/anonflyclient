/**
 * @file useAuth.ts
 * @description Custom hook for authentication logic, including login, registration, and token management.
 */

import { useState, useEffect, useCallback } from 'react';
import { performHandshake } from '../lib/controllers/authController';
import { getIdentity, getAllIdentities, switchIdentity as switchLocalIdentity, generateIdentity } from '../lib/helpers/identityManager';
import type { User } from '../types/User';
import { getSessionUser, setSessionUser, clearSessionUser } from '../lib/helpers/authStorage';
import type { Identity } from '../lib/helpers/identityManager';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  identities: Identity[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  identities: Identity[];
  joinAnonymously: (username: string) => Promise<void>;
  switchAccount: (aid: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    identities: [],
  });

  const logout = useCallback(() => {
    // We only clear the ephemeral session, NOT the IndexedDB identity
    clearSessionUser();
    setAuthState(prev => ({
      ...prev,
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    }));
    window.location.href = '/login';
  }, []);

  const switchAccount = useCallback(async (aid: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const identity = await switchLocalIdentity(aid);
      if (identity) {
        // Clear old session
        clearSessionUser();
        
        // Try handshake with new identity
        try {
          const sessionData = await performHandshake(identity);
          const user: User = { userId: sessionData.aid, username: sessionData.username };
          setSessionUser(user, sessionData.token);
          setAuthState(prev => ({
            ...prev,
            user,
            token: sessionData.token,
            isAuthenticated: true,
            loading: false,
            error: null
          }));
        } catch (handshakeError) {
          // If handshake fails (bad network), we still "switch" but without a token
          // This prevents being locked out
          const user: User = { userId: identity.aid, username: identity.username };
          setAuthState(prev => ({
            ...prev,
            user,
            token: null,
            isAuthenticated: true,
            loading: false,
            error: 'Switched account, but failed to connect to server. Working in offline mode.'
          }));
        }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to switch account' }));
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    // Load all stored identities first
    const allIdentities = await getAllIdentities();

    // 1. Check for ephemeral session
    const session = getSessionUser();
    if (session && session.token && session.user) {
      setAuthState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        identities: allIdentities,
      });
      return;
    }

    // 2. Check for persistent identity
    try {
      const identity = await getIdentity();
      if (identity) {
        try {
          // If identity exists, perform handshake to get a session
          const sessionData = await performHandshake(identity);
          const user: User = { userId: sessionData.aid, username: sessionData.username };
          setSessionUser(user, sessionData.token);
          setAuthState({
            user,
            token: sessionData.token,
            isAuthenticated: true,
            loading: false,
            error: null,
            identities: allIdentities,
          });
        } catch (handshakeError) {
          // HANDSHAKE FAILED (e.g. Bad Network)
          // DO NOT clear user data. Keep the local identity as the "user".
          const user: User = { userId: identity.aid, username: identity.username };
          setAuthState({
            user,
            token: null, // No token yet
            isAuthenticated: true, // Mark as authenticated locally
            loading: false,
            error: 'Network issue: Working in offline mode.',
            identities: allIdentities,
          });
        }
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          isAuthenticated: false,
          identities: allIdentities 
        }));
      }
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        isAuthenticated: false,
        identities: allIdentities,
        error: 'Failed to access stored identity'
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
      
      const allIdentities = await getAllIdentities();
      
      setAuthState({
        user,
        token: sessionData.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        identities: allIdentities,
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

  return {
    user: authState.user,
    token: authState.token,
    identities: authState.identities,
    joinAnonymously,
    switchAccount,
    logout,
    isLoading: authState.loading,
    error: authState.error,
  };
};
