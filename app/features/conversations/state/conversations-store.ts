import { create } from 'zustand';
import { Room } from '@anonfly/sdk';

interface ConversationsState {
    rooms: Room[];
    activeRoomId: string | null;
    isLoading: boolean;
    error: string | null;

    setRooms: (rooms: Room[]) => void;
    setActiveRoomId: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

/**
 * Zustand store for managing conversation (room) list and current active room.
 */
export const useConversationsStore = create<ConversationsState>((set) => ({
    rooms: [],
    activeRoomId: null,
    isLoading: false,
    error: null,

    setRooms: (rooms) => set({ rooms, error: null }),
    setActiveRoomId: (id) => set({ activeRoomId: id }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
