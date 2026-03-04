import { create } from 'zustand';

interface PresenceState {
    participants: Record<string, any[]>; // roomId -> participants

    setParticipants: (roomId: string, participants: any[]) => void;
}

/**
 * Zustand store for tracking participant presence in real-time.
 */
export const usePresenceStore = create<PresenceState>((set) => ({
    participants: {},

    setParticipants: (roomId, participants) => set((state) => ({
        participants: {
            ...state.participants,
            [roomId]: participants,
        },
    })),
}));
