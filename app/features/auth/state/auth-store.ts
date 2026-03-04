import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type User } from '~/shared/types/User';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

/**
 * Global authentication state management using Zustand.
 * Persists basic user info to sessionStorage, but security tokens should be handled via httpOnly cookies in production.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (user, token) => set({ user, token, isAuthenticated: true, error: null }),
            clearAuth: () => set({ user: null, token: null, isAuthenticated: false, error: null }),
            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
        }),
        {
            name: 'anonfly-auth-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
