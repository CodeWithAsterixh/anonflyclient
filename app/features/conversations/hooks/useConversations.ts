import { useAnonflyConversations } from '@anonfly/react';
import { useConversationsStore } from '../state/conversations-store';
import { useCallback, useEffect } from 'react';

/**
 * Feature-specific hook for Conversations module.
 * Bridges reusable @anonfly/react logic with app-level Zustand state.
 */
export function useConversations() {
    const { rooms: sdkRooms, fetchRooms: sdkFetch, createRoom: sdkCreate, loading: sdkLoading, error: sdkError } = useAnonflyConversations();
    const { rooms, activeRoomId, setRooms, setActiveRoomId, setLoading, setError } = useConversationsStore();

    // Sync SDK rooms with global store
    useEffect(() => {
        if (sdkRooms.length > 0) {
            setRooms(sdkRooms);
        }
    }, [sdkRooms, setRooms]);

    const fetchRooms = useCallback(async (region?: string) => {
        setLoading(true);
        try {
            await sdkFetch(region);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sdkFetch, setLoading, setError]);

    const createRoom = useCallback(async (data: { roomname: string; isPrivate?: boolean; description?: string; password?: string }) => {
        return sdkCreate(data);
    }, [sdkCreate]);

    return {
        rooms,
        activeRoomId,
        setActiveRoomId,
        isLoading: sdkLoading,
        error: sdkError?.message || null,
        fetchRooms,
        createRoom,
    };
}
