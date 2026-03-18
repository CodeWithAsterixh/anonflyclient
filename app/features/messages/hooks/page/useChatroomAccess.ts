import { useState, useEffect, useCallback } from 'react';
import { authorizedFetch } from "~/shared/utils/apiHelper";
import { checkAccess } from "~/shared/utils/controllers/chatroomController";
import { cryptSessionStorage } from "~/shared/utils/cryptSessionStorage";
import type { ChatroomDetail } from "~/shared/types/chat";
import type { User } from '~/shared/types/User';

export interface AccessState {
  status: 'checking' | 'granted' | 'denied';
  message?: string;
  joinRequired?: boolean;
}

export const useChatroomAccess = (
  chatroomId: string | undefined,
  token: string | null,
  user: User | null,
  logout: () => void
) => {
  const [accessState, setAccessState] = useState<AccessState>({ status: 'checking' });
  const [chatroomDetail, setChatroomDetail] = useState<ChatroomDetail | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isAlreadyParticipant, setIsAlreadyParticipant] = useState(false);

  const fetchChatroomDetails = useCallback(async () => {
    if (!chatroomId || !token || !user) return;

    try {
      const response = await authorizedFetch(
        `/chatroom/${encodeURIComponent(chatroomId)}/details`
      );

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();
      if (response.ok && data.data) {
        setChatroomDetail(data.data);
        setIsHost(data.data.hostAid === user.userId);
        setIsCreator(data.data.creatorAid === user.userId);
        setIsAlreadyParticipant(data.data.isAlreadyParticipant || false);
      }
    } catch {
      // Silently fail
    }
  }, [chatroomId, token, user, logout]);

  const verifyAccess = useCallback(async () => {
    if (!chatroomId || !token || !user) {
      setAccessState({ status: 'checking' });
      return;
    }

    setAccessState({ status: 'checking' });
    try {
      const joinAuthToken = cryptSessionStorage.getItem(`room_join_auth_${chatroomId}`, chatroomId) || undefined;
      const response = await checkAccess(chatroomId, joinAuthToken);

      if (response.success && response.data?.accessGranted) {
        setAccessState({ status: 'granted', joinRequired: !!response.data?.joinRequired });
        fetchChatroomDetails();
      } else {
        console.error('[useChatroomAccess] Access denied:', response);
        setAccessState({
          status: 'denied',
          message: response.message || 'Access denied. You need a valid invite link to access this private room.'
        });
      }
    } catch (err) {
      console.error('[useChatroomAccess] Error verifying access:', err);
      setAccessState({
        status: 'denied',
        message: 'Failed to verify access. Please try again later.'
      });
    }
  }, [chatroomId, token, user, fetchChatroomDetails]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  return {
    accessState,
    chatroomDetail,
    isHost,
    setIsHost,
    isCreator,
    setIsCreator,
    isAlreadyParticipant,
    setIsAlreadyParticipant,
    fetchChatroomDetails,
    setChatroomDetail
  };
};
