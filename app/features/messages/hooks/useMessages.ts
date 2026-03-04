import { useAnonflyMessages } from '@anonfly/react';
import { useMessagesStore } from '../state/messages-store';
import { useCallback, useEffect } from 'react';

/**
 * Feature-specific hook for Messages module.
 * Bridges reusable @anonfly/react logic with app-level Zustand state and handles optimistic updates.
 */
export function useMessages(roomId: string) {
    const { messages: sdkMessages, fetchMessages: sdkFetch, sendMessage: sdkSend, loading: sdkLoading, error: sdkError } = useAnonflyMessages(roomId);
    const { messages: allMessages, addMessage, setMessages, setLoading, setError } = useMessagesStore();

    const messages = allMessages[roomId] || [];

    // Sync SDK messages with global store
    useEffect(() => {
        if (sdkMessages.length > 0) {
            setMessages(roomId, sdkMessages);
        }
    }, [sdkMessages, roomId, setMessages]);

    const fetchMessages = useCallback(async (options?: { limit?: number; before?: string }) => {
        setLoading(true);
        try {
            await sdkFetch(options);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdkFetch, setLoading, setError]);

    const sendMessage = useCallback(async (content: string) => {
        // Generate optimistic message
        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMessage = {
            id: optimisticId,
            roomId,
            content,
            senderId: 'me', // TODO: use actual user ID from auth store
            timestamp: new Date().toISOString(),
            isOptimistic: true,
        };

        addMessage(roomId, optimisticMessage as any);

        try {
            const realMessage = await sdkSend(content);
            // addMessage handles duplicate checking by ID (if SDK returns same ID)
            // but here we might need a more complex reconciliation if IDs differ.
            // For now, assume SDK returns the message which we add.
            addMessage(roomId, realMessage);
        } catch (err: any) {
            setError(err.message);
            // TODO: remove optimistic message on failure
        }
    }, [roomId, sdkSend, addMessage, setError]);

    return {
        messages,
        isLoading: sdkLoading,
        error: sdkError?.message || null,
        fetchMessages,
        sendMessage,
    };
}
