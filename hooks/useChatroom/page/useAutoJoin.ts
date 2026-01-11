import { useEffect } from 'react';
import type { ChatroomDetail } from "../../../lib/types/chat";
import { cryptSessionStorage } from "../../../lib/helpers/cryptSessionStorage";

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
  joinChatroom: (chatroomId: string, password?: string, linkToken?: string) => Promise<void>;
  isJoiningRef: React.RefObject<boolean>;
  lastJoinedRoomRef: React.RefObject<string | null>;
}

export const useAutoJoin = (options: AutoJoinOptions) => {
  const {
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
    lastJoinedRoomRef
  } = options;

  useEffect(() => {
    if (!isConnected || !chatroomId || isJoined || isRemoved) {
      return;
    }

    const performJoin = async (password?: string, linkToken?: string) => {
      try {
        isJoiningRef.current = true;
        lastJoinedRoomRef.current = chatroomId;
        await joinChatroom(chatroomId, password, linkToken);
      } catch (err) {
        console.error("[ChatroomPage] Join failed:", err);
        isJoiningRef.current = false;
        lastJoinedRoomRef.current = null;
        if (chatroomId) {
          cryptSessionStorage.removeItem(`room_access_${chatroomId}`);
          cryptSessionStorage.removeItem(`room_token_${chatroomId}`);
        }
      }
    };

    if (isJoiningRef.current || lastJoinedRoomRef.current === chatroomId) {
      return;
    }

    if (!displayDetail) {
      if (hasStoredCredentials) {
        const storedPassword = cryptSessionStorage.getItem(`room_access_${chatroomId}`, chatroomId);
        const storedToken = cryptSessionStorage.getItem(`room_token_${chatroomId}`, chatroomId);
        performJoin(storedPassword || undefined, storedToken || undefined);
      }
      return;
    }

    if ((!displayDetail.isLocked && !displayDetail.isPrivate) || isCreator || isAlreadyParticipant) {
      performJoin();
    } else {
      const storedPassword = cryptSessionStorage.getItem(`room_access_${chatroomId}`, chatroomId);
      const storedToken = cryptSessionStorage.getItem(`room_token_${chatroomId}`, chatroomId);
      
      if (storedToken || (displayDetail.isLocked && storedPassword)) {
        performJoin(storedPassword || undefined, storedToken || undefined);
      } else if (isSubmitting && joinPassword) {
        performJoin(joinPassword);
      }
    }
  }, [
    isConnected,
    chatroomId,
    displayDetail,
    isJoined,
    isRemoved,
    joinChatroom,
    joinPassword,
    isSubmitting,
    isCreator,
    isAlreadyParticipant,
    hasStoredCredentials,
    isJoiningRef,
    lastJoinedRoomRef
  ]);
};
