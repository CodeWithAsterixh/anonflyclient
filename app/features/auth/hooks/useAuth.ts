import { useAnonflyAuth } from '@anonfly/react';
import { useAuthStore } from '../state/auth-store';
import { useCallback } from 'react';

/**
 * Feature-specific hook for Auth module.
 * Bridges the gap between the reusable @anonfly/react package logic and the app's global state.
 */
export function useAuth() {
    const { login: sdkLogin, logout: sdkLogout, getChallenge, ...sdkAuth } = useAnonflyAuth();
    const { setAuth, clearAuth, user, token, isAuthenticated, isLoading, error } = useAuthStore();

    const login = useCallback(async (params: { aid: string; username: string; challenge: string; signature: string; publicKey: string; exchangePublicKey: string }) => {
        try {
            const session = await sdkLogin(params.aid, params.username, params.challenge, params.signature, params.publicKey, params.exchangePublicKey);
            setAuth({ 
                userId: session.identityAid, 
                username: session.username,
                isPremium: (session as any).isPremium,
                allowedFeatures: (session as any).allowedFeatures
            }, session.token);
        } catch (err: any) {
            console.error('Login failed:', err);
        }
    }, [sdkLogin, setAuth]);

    const logout = useCallback(() => {
        sdkLogout();
        clearAuth();
    }, [sdkLogout, clearAuth]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading: isLoading || sdkAuth.loading,
        error: error || sdkAuth.error?.message,
        login,
        logout,
        getChallenge,
    };
}
