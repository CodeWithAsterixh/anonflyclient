/**
 * @file useAuth.ts
 * @description Custom hook for authentication logic, including login, registration, and token management.
 */

import { useState, useEffect, useCallback } from 'react';
import { performHandshake } from '../../lib/controllers/authController';
import { getIdentity, getAllIdentities, switchIdentity as switchLocalIdentity, generateIdentity, clearIdentity } from '../../lib/helpers/identityManager';
import type { User } from '../../types/User';
import { getSessionUser, setSessionUser, clearSessionUser } from '../../lib/helpers/authStorage';
import type { AuthState } from './types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    isInitialCheck: true,
    error: null,
    identities: [],
    retryCountdown: null,
  });

  const [retryKey, setRetryKey] = useState(0);

  const logout = useCallback(() => {
    // We only clear the ephemeral session, NOT the IndexedDB identity
    clearSessionUser();
    setAuthState(prev => ({
      ...prev,
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      retryCountdown: null,
    }));
    window.location.href = '/login';
  }, []);

  const switchAccount = useCallback(async (aid: string) => {
    setAuthState(prev => ({ ...prev, loading: true, retryCountdown: null }));
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
          
          // Force a full page reload to clear all states and reconnect WebSockets
          window.location.reload();
        } catch (handshakeError) {
          // If handshake fails (bad network), we still "switch" but without a token
          // This prevents being locked out
          const user: User = { userId: identity.aid, username: identity.username };
          setSessionUser(user, ""); // Empty token for offline mode
          
          // Force a full page reload to clear all states and reconnect WebSockets
          window.location.reload();
        }
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to switch account' }));
    }
  }, []);

  const deleteAccount = useCallback(async (aid: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await clearIdentity(aid);
      
      // If we deleted the currently active account, we must logout
      const currentSession = getSessionUser();
      if (currentSession?.user?.userId === aid) {
        clearSessionUser();
        window.location.href = '/login';
      } else {
        // Just refresh the identity list
        const allIdentities = await getAllIdentities();
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          identities: allIdentities 
        }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to delete account' }));
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    // Load all stored identities first
    const allIdentities = await getAllIdentities();

    // 1. Check for ephemeral session
    const session = getSessionUser();
    if (session && session.user) {
      setAuthState({
        user: session.user,
        token: session.token || null,
        isAuthenticated: true,
        loading: false,
        isInitialCheck: false,
        error: session.token ? null : 'Network issue: Working in offline mode.',
        identities: allIdentities,
        retryCountdown: null,
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
            isInitialCheck: false,
            error: null,
            identities: allIdentities,
            retryCountdown: null,
          });
        } catch (handshakeError) {
          // HANDSHAKE FAILED (e.g. Bad Network)
          // Start retry countdown
          setAuthState(prev => ({
            ...prev,
            loading: false,
            isInitialCheck: false,
            error: 'Authentication failed. Retrying...',
            identities: allIdentities,
            retryCountdown: 5,
          }));
        }
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          isInitialCheck: false,
          isAuthenticated: false,
          identities: allIdentities,
          retryCountdown: null,
        }));
      }
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        isInitialCheck: false,
        isAuthenticated: false,
        identities: allIdentities,
        error: 'Failed to access stored identity',
        retryCountdown: null,
      }));
    }
  }, [retryKey]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (authState.retryCountdown === null) return;

    if (authState.retryCountdown > 0) {
      const timer = setTimeout(() => {
        setAuthState(prev => ({
          ...prev,
          retryCountdown: (prev.retryCountdown || 1) - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0, trigger retry
      setRetryKey(prev => prev + 1);
    }
  }, [authState.retryCountdown]);

  /**
   * Joins the app anonymously by generating an identity and performing a handshake.
   */
  const joinAnonymously = async (username: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null, retryCountdown: null }));
    try {
      const identity = await generateIdentity(username);
      const sessionData = await performHandshake(identity);
      const user: User = { userId: sessionData.aid, username: sessionData.username };
      
      // Store session
      setSessionUser(user, sessionData.token);
      
      // Force a full page reload to clear all states and redirect to home
      window.location.href = '/';
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to join anonymously',
        retryCountdown: null,
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
    deleteAccount,
    logout,
    isLoading: authState.loading,
    isInitialCheck: authState.isInitialCheck,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    retryCountdown: authState.retryCountdown,
  };
};
