import { useAnonflyPresence } from '@anonfly/react';
import { usePresenceStore } from '../state/presence-store';
import { useEffect } from 'react';

/**
 * Feature-specific hook for Presence module.
 * Bridges reusable @anonfly/react logic with app-level Zustand state.
 */
export function usePresence(roomId: string) {
    const { participants: sdkParticipants } = useAnonflyPresence(roomId);
    const { participants: allParticipants, setParticipants } = usePresenceStore();

    const participants = allParticipants[roomId] || [];

    // Sync SDK participants with global store
    useEffect(() => {
        if (sdkParticipants.length > 0) {
            setParticipants(roomId, sdkParticipants);
        }
    }, [sdkParticipants, roomId, setParticipants]);

    return {
        participants,
    };
}
