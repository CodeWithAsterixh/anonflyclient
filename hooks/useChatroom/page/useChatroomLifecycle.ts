import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { ChatroomDetail } from "../../../lib/types/chat";
import type { User } from '../../../types/User';

export interface ChatroomLifecycleOptions {
  chatroomId: string | undefined;
  isRemoved: string | boolean;
  setIsRemoved: (val: boolean) => void;
  sseChatroomDetail: ChatroomDetail | null;
  user: User | null;
  setIsHost: (val: boolean) => void;
  setIsCreator: (val: boolean) => void;
  leaveChatroom: () => void;
  showAlertDialog: (title: string, message: string, type?: "alert" | "confirm" | "error" | "success", onConfirm?: () => void) => void
}
export const useChatroomLifecycle = (options: ChatroomLifecycleOptions) => {
  const {
    chatroomId,
    isRemoved,
    setIsRemoved,
    sseChatroomDetail,
    user,
    setIsHost,
    setIsCreator,
    leaveChatroom,
    showAlertDialog
  } = options;

  const navigate = useNavigate();

  useEffect(() => {
    if (isRemoved) {
      const isBanned = isRemoved === 'banned';
      showAlertDialog(
        isBanned ? "Banned from Room" : "Removed from Room",
        isBanned 
          ? "You have been permanently banned from this room by the creator."
          : "You have been removed from the room by the host.",
        "alert",
        () => {
          setIsRemoved(false);
          navigate("/");
        }
      );
    }
  }, [isRemoved, setIsRemoved, navigate, showAlertDialog]);

  // Sync isHost and isCreator with SSE updates
  useEffect(() => {
    if (sseChatroomDetail?.hostAid && user) {
      setIsHost(sseChatroomDetail.hostAid === user.userId);
    }
    if (sseChatroomDetail?.creatorAid && user) {
      setIsCreator(sseChatroomDetail.creatorAid === user.userId);
    }
  }, [sseChatroomDetail, user, setIsHost, setIsCreator]);

  // Graceful exit: Only leave if we are actually unmounting or changing to a different room
  const leaveRoomRef = useRef(leaveChatroom);
  useEffect(() => {
    leaveRoomRef.current = leaveChatroom;
  }, [leaveChatroom]);

  useEffect(() => {
    const currentRoomOnMount = chatroomId;
    return () => {
      if (currentRoomOnMount) {
        leaveRoomRef.current();
      }
    };
  }, [chatroomId]);
};
