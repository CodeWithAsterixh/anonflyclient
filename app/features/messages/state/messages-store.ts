import { create } from 'zustand';
import { Message } from '@anonfly/sdk';

interface MessagesState {
    messages: Record<string, Message[]>; // roomId -> messages
    isLoading: boolean;
    error: string | null;

    addMessage: (roomId: string, message: Message) => void;
    setMessages: (roomId: string, messages: Message[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

/**
 * Zustand store for managing message history per room.
 * Supports optimistic updates and reconciliation.
 */
export const useMessagesStore = create<MessagesState>((set) => ({
    messages: {},
    isLoading: false,
    error: null,

    addMessage: (roomId, message) => set((state) => {
        const roomMessages = state.messages[roomId] || [];
        // Prevent duplicates
        if (roomMessages.find((m) => m.id === message.id)) return state;
        return {
            messages: {
                ...state.messages,
                [roomId]: [...roomMessages, message].sort((a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                ),
            },
        };
    }),

    setMessages: (roomId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [roomId]: messages,
        },
        error: null,
    })),

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
