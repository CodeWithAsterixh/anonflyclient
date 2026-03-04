import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    theme: 'light' | 'dark';
    colorScheme: string;
    notificationsEnabled: boolean;

    setTheme: (theme: 'light' | 'dark') => void;
    setColorScheme: (scheme: string) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
}

/**
 * Zustand store for user settings and preferences.
 * Persists to localStorage.
 */
export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            colorScheme: 'purple',
            notificationsEnabled: true,

            setTheme: (theme) => set({ theme }),
            setColorScheme: (colorScheme) => set({ colorScheme }),
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
        }),
        {
            name: 'anonfly-settings-storage',
        }
    )
);
