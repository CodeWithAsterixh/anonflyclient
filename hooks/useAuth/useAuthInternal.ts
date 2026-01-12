/**
 * @file useAuthInternal.ts
 * @description Internal hook for authentication logic. Use the exported useAuth from AuthContext instead for shared state.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { performHandshake, fetchPremiumStatus } from '../../lib/controllers/authController';
import { getIdentity, getAllIdentities, switchIdentity as switchLocalIdentity, generateIdentity, clearIdentity, saveIdentity } from '../../lib/helpers/identityManager';
import type { User } from '../../types/User';
import { getSessionUser, setSessionUser, clearSessionUser } from '../../lib/helpers/authStorage';
import type { AuthState } from './types';

export const useAuthInternal = () => {
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
  const [needsPremiumRefresh, setNeedsPremiumRefresh] = useState(false);

  const checkPremiumStatus = useCallback(async () => {
    if (!authState.token) return;

    try {
      const data = await fetchPremiumStatus(authState.token);
      
      // Update IndexDB storage FIRST
      try {
        const identity = await getIdentity();
        if (identity) {
          identity.allowedFeatures = data.allowedFeatures;
          identity.premiumLastChecked = Date.now();
          await saveIdentity(identity);
        }
      } catch (dbError) {
        console.error("[useAuthInternal] Failed to save premium status to IndexDB:", dbError);
      }

      // Update identities list from IndexedDB to ensure we have the latest
      const allIdentities = await getAllIdentities();

      setAuthState(prev => ({
        ...prev,
        allowedFeatures: data.allowedFeatures,
        user: prev.user ? { ...prev.user, allowedFeatures: data.allowedFeatures } : null,
        identities: allIdentities,
      }));
      
      // Update session storage as well
      const session = getSessionUser();
      if (session?.user) {
        setSessionUser({ ...session.user, allowedFeatures: data.allowedFeatures }, session.token);
      }
    } catch (error: any) {
      console.error("[useAuthInternal] Failed to fetch premium status:", error);
    }
  }, [authState.token]);

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
  }, []);

  const switchAccount = useCallback(async (aid: string, redirectTo: string = '/') => {
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
          
          setAuthState(prev => ({
            ...prev,
            user,
            token: sessionData.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          }));
        } catch {
          // If handshake fails (bad network), we still "switch" but without a token
          // This prevents being locked out
          const user: User = { userId: identity.aid, username: identity.username };
          setSessionUser(user, ""); // Empty token for offline mode
          
          setAuthState(prev => ({
            ...prev,
            user,
            token: null,
            isAuthenticated: true,
            loading: false,
            error: 'Handshake failed: Working in offline mode.',
          }));
        }
      }
    } catch {
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
        logout();
      } else {
        // Just refresh the identity list
        const allIdentities = await getAllIdentities();
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          identities: allIdentities 
        }));
      }
    } catch {
      setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to delete account' }));
    }
  }, []);

  const getNeedsPremiumRefresh = (identity: any) => {
    const lastChecked = identity?.premiumLastChecked || 0;
    const fiveHours = 5 * 60 * 60 * 1000;
    return Date.now() - lastChecked > fiveHours;
  };

  const handleHandshake = async (identity: any, allIdentities: any[]) => {
    try {
      const sessionData = await performHandshake(identity);
      const user: User = { 
        userId: sessionData.aid, 
        username: sessionData.username,
        allowedFeatures: sessionData.allowedFeatures 
      };
      setSessionUser(user, sessionData.token);
      
      try {
        identity.allowedFeatures = sessionData.allowedFeatures;
        await saveIdentity(identity);
      } catch (dbError) {
        console.error("[useAuthInternal] Failed to update identity features in IndexDB:", dbError);
      }

      setAuthState({
        user,
        token: sessionData.token,
        isAuthenticated: true,
        loading: false,
        isInitialCheck: false,
        error: null,
        identities: allIdentities,
        retryCountdown: null,
        allowedFeatures: sessionData.allowedFeatures,
      });
    } catch {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        isInitialCheck: false,
        error: 'Authentication failed. Retrying...',
        identities: allIdentities,
        retryCountdown: 5,
      }));
    }
  };

  const initializeAuth = useCallback(async () => {
    let allIdentities: any[] = [];
    try {
      allIdentities = await getAllIdentities();
    } catch (e) {
      console.error("[useAuthInternal] Failed to load identities:", e);
    }

    const session = getSessionUser();
    if (session?.user) {
      const identity = await getIdentity().catch(() => null);
      if (getNeedsPremiumRefresh(identity)) {
        setNeedsPremiumRefresh(true);
      }

      setAuthState({
        user: session.user,
        token: session.token || null,
        isAuthenticated: true,
        loading: false,
        isInitialCheck: false,
        error: session.token ? null : 'Network issue: Working in offline mode.',
        identities: allIdentities,
        retryCountdown: null,
        allowedFeatures: session.user.allowedFeatures,
      });
      return;
    }

    try {
      const identity = await getIdentity();
      if (identity) {
        if (getNeedsPremiumRefresh(identity)) {
          setNeedsPremiumRefresh(true);
        }
        await handleHandshake(identity, allIdentities);
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
    } catch {
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
  }, [retryKey, initializeAuth]);

  // Handle premium status refresh if needed (over 5 hours)
  useEffect(() => {
    if (needsPremiumRefresh && authState.isAuthenticated && authState.token) {
      checkPremiumStatus();
      setNeedsPremiumRefresh(false);
    }
  }, [needsPremiumRefresh, authState.isAuthenticated, authState.token, checkPremiumStatus]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.token && authState.allowedFeatures === undefined && !authState.loading) {
      checkPremiumStatus();
    }
  }, [authState.isAuthenticated, authState.token, authState.allowedFeatures, authState.loading, checkPremiumStatus]);

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
  const joinAnonymously = async (username: string, redirectTo: string = '/') => {
    setAuthState(prev => ({ ...prev, loading: true, error: null, retryCountdown: null }));
    try {
      const identity = await generateIdentity(username);
      const sessionData = await performHandshake(identity);
      const user: User = { userId: sessionData.aid, username: sessionData.username };
      
      // Store session
      setSessionUser(user, sessionData.token);
      
      // Update local state so UI can react immediately if needed
      setAuthState(prev => ({
        ...prev,
        user,
        token: sessionData.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }));
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


  const value = useMemo(() => ({
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
    allowedFeatures: authState.allowedFeatures,
    checkPremiumStatus,
    refreshUserInfo: checkPremiumStatus,
  }), [
    authState,
    joinAnonymously,
    switchAccount,
    deleteAccount,
    logout,
    checkPremiumStatus
  ]);

  return value;
};
