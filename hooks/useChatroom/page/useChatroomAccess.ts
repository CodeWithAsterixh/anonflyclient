import { useState, useEffect, useCallback } from 'react';
import { getAPIBaseURL } from "../../../lib/constants/api";
import { checkAccess } from "../../../lib/controllers/chatroomController";
import { cryptSessionStorage } from "../../../lib/helpers/cryptSessionStorage";
import type { ChatroomDetail } from "../../../lib/types/chat";
import type { User } from '../../../types/User';

export interface AccessState {
  status: 'checking' | 'granted' | 'denied';
  message?: string;
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
      const response = await fetch(
        `${getAPIBaseURL()}/chatroom/${encodeURIComponent(chatroomId)}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    if (!chatroomId || !token || !user) return;

    setAccessState({ status: 'checking' });
    try {
      const joinAuthToken = cryptSessionStorage.getItem(`room_join_auth_${chatroomId}`, chatroomId) || undefined;
      const response = await checkAccess(chatroomId, joinAuthToken);
      
      if (response.success && response.data?.accessGranted) {
        setAccessState({ status: 'granted' });
        fetchChatroomDetails();
      } else {
        setAccessState({ 
          status: 'denied', 
          message: response.message || 'Access denied. You need a valid invite link to access this private room.' 
        });
      }
    } catch {
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
