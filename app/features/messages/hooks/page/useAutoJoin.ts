import { useEffect } from 'react';
import { type ChatroomDetail } from '~/shared/types/chat';

export interface AutoJoinOptions {
  chatroomId: string | undefined;
  isConnected: boolean;
  isJoined: boolean;
  isRemoved: string | boolean;
  displayDetail: ChatroomDetail | null;
  hasStoredCredentials: boolean;
  isSubmitting: boolean;
  joinPassword: string;
  isCreator: boolean;
  isAlreadyParticipant: boolean;
  joinChatroom: (chatroomId: string, password?: string) => Promise<void>;
  isJoiningRef: React.RefObject<boolean>;
  lastJoinedRoomRef: React.RefObject<string | null>;
}

/**
 * Hook to handle automatic joining of chatrooms.
 */
export const useAutoJoin = ({
  chatroomId,
  isConnected,
  isJoined,
  isRemoved,
  displayDetail,
  hasStoredCredentials,
  isSubmitting,
  joinPassword,
  isCreator,
  isAlreadyParticipant,
  joinChatroom,
  isJoiningRef,
  lastJoinedRoomRef,
}: AutoJoinOptions) => {
  useEffect(() => {
    // Only auto-join if:
    // 1. We have a chatroomId
    // 2. We're not already joined
    // 3. We're not currently joining
    // 4. We haven't just joined this room
    // 5. We haven't been removed from this room
    // 6. We have the necessary conditions (public room or stored credentials)
    if (!isJoined && lastJoinedRoomRef.current === chatroomId) {
      lastJoinedRoomRef.current = null;
    }

    if (
      !chatroomId ||
      isJoined ||
      isJoiningRef.current ||
      lastJoinedRoomRef.current === chatroomId ||
      isRemoved
    ) {
      return;
    }

    const canAutoJoin =
      (displayDetail && !displayDetail.isLocked) ||
      isCreator ||
      isAlreadyParticipant ||
      hasStoredCredentials;

    if (canAutoJoin && isConnected && !isSubmitting) {
      const performAutoJoin = async () => {
        isJoiningRef.current = true;
        try {
          // If we have a password (either from state or it's not needed), try joining
          await joinChatroom(chatroomId, joinPassword || undefined);
          lastJoinedRoomRef.current = chatroomId;
        } catch (error) {
          console.error("Auto-join failed:", error);
        } finally {
          isJoiningRef.current = false;
        }
      };

      performAutoJoin();
    }
  }, [
    chatroomId,
    isConnected,
    isJoined,
    isRemoved,
    displayDetail,
    hasStoredCredentials,
    isSubmitting,
    joinPassword,
    isCreator,
    isAlreadyParticipant,
    joinChatroom,
    isJoiningRef,
    lastJoinedRoomRef,
  ]);
};
