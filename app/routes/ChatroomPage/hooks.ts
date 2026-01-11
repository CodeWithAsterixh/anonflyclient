import { useState, useCallback, useEffect } from 'react';
import { 
  removeParticipant, 
  banParticipant, 
  unbanParticipant, 
  generateShareLink 
} from "../../../lib/controllers/chatroomController";
import { getAPIBaseURL } from "../../../lib/constants/api";
import type { ChatroomDetail } from "../../../lib/types/chat";

export interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "alert" | "confirm" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useAlertDialog = () => {
  const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const showAlertDialog = useCallback((
    title: string,
    message: string,
    type: "alert" | "confirm" | "error" | "success" = "alert",
    onConfirm?: () => void
  ) => {
    setAlertDialog(prev => ({
      ...prev,
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    }));
  }, []);

  const closeAlertDialog = useCallback(() => {
    setAlertDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { alertDialog, setAlertDialog, showAlertDialog, closeAlertDialog };
};

export const useParticipantActions = (
  chatroomId: string | undefined,
  showAlertDialog: (title: string, message: string, type?: "alert" | "confirm" | "error" | "success", onConfirm?: () => void) => void
) => {
  const handleRemoveParticipant = useCallback(async (userAid: string) => {
    if (!chatroomId) return;
    try {
      await removeParticipant(chatroomId, userAid);
      showAlertDialog("Success", "Participant removed successfully", "success");
    } catch (error: any) {
      showAlertDialog("Error", error.message || "Failed to remove participant", "error");
    }
  }, [chatroomId, showAlertDialog]);

  const handleBanParticipant = useCallback(async (userAid: string, reason?: string) => {
    if (!chatroomId) return;
    try {
      await banParticipant(chatroomId, userAid, reason);
      showAlertDialog("Success", "Participant banned successfully", "success");
    } catch (error: any) {
      showAlertDialog("Error", error.message || "Failed to ban participant", "error");
    }
  }, [chatroomId, showAlertDialog]);

  const handleUnbanParticipant = useCallback(async (userAid: string) => {
    if (!chatroomId) return;
    try {
      await unbanParticipant(chatroomId, userAid);
      showAlertDialog("Success", "Participant unbanned successfully", "success");
    } catch (error: any) {
      showAlertDialog("Error", error.message || "Failed to unban participant", "error");
    }
  }, [chatroomId, showAlertDialog]);

  return {
    handleRemoveParticipant,
    handleBanParticipant,
    handleUnbanParticipant,
  };
};

export const useRoomActions = (
  chatroomId: string | undefined,
  token: string | null,
  showAlertDialog: (title: string, message: string, type?: "alert" | "confirm" | "error" | "success", onConfirm?: () => void) => void,
  navigate: (path: string) => void
) => {
  const handleGenerateShareLink = useCallback(async () => {
    if (!chatroomId) return null;
    try {
      const response = await generateShareLink(chatroomId);
      if (response.success && response.data.token) {
        const shareUrl = `${globalThis.window.location.origin}/join/${response.data.token}`;
        await navigator.clipboard.writeText(shareUrl);
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to generate share link:", err);
      showAlertDialog("Error", "Failed to generate share link. Please try again.", "error");
      return null;
    }
  }, [chatroomId, showAlertDialog]);

  const handleDeleteRoom = useCallback(async () => {
    if (!chatroomId || !token) return;

    showAlertDialog(
      "Delete Chatroom",
      "Are you sure you want to delete this chatroom? This action cannot be undone.",
      "confirm",
      async () => {
        try {
          const response = await fetch(
            `${getAPIBaseURL()}/chatrooms/${chatroomId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            showAlertDialog(
              "Success",
              "Chatroom deleted successfully!",
              "success",
              () => navigate("/")
            );
          } else {
            const errorData = await response.json();
            showAlertDialog(
              "Error",
              `Failed to delete chatroom: ${errorData.message}`,
              "error"
            );
          }
        } catch {
          showAlertDialog(
            "Error",
            "An error occurred while deleting the chatroom.",
            "error"
          );
        }
      }
    );
  }, [chatroomId, token, showAlertDialog, navigate]);

  return {
    handleGenerateShareLink,
    handleDeleteRoom,
  };
};

export const useAutoJoin = (
  chatroomId: string | undefined,
  isConnected: boolean,
  isJoined: boolean,
  isRemoved: string | boolean,
  displayDetail: ChatroomDetail | null,
  hasStoredCredentials: boolean,
  isSubmitting: boolean,
  joinPassword: string,
  isCreator: boolean,
  isAlreadyParticipant: boolean,
  joinChatroom: (chatroomId: string, password?: string, linkToken?: string) => void,
  isJoiningRef: React.MutableRefObject<boolean>,
  lastJoinedRoomRef: React.MutableRefObject<string | null>
) => {
  useEffect(() => {
    if (!isConnected || !chatroomId || isJoined || isRemoved) {
      return;
    }

    const performJoin = async (password?: string, linkToken?: string) => {
      try {
        isJoiningRef.current = true;
        lastJoinedRoomRef.current = chatroomId;
        joinChatroom(chatroomId, password, linkToken);
      } catch (err) {
        console.error("[ChatroomPage] Join failed:", err);
        isJoiningRef.current = false;
        lastJoinedRoomRef.current = null;
        if (chatroomId) {
          sessionStorage.removeItem(`room_access_${chatroomId}`);
          sessionStorage.removeItem(`room_token_${chatroomId}`);
        }
      }
    };

    if (isJoiningRef.current || lastJoinedRoomRef.current === chatroomId) {
      return;
    }

    if (!displayDetail) {
      if (hasStoredCredentials) {
        const storedPassword = sessionStorage.getItem(`room_access_${chatroomId}`);
        const storedToken = sessionStorage.getItem(`room_token_${chatroomId}`);
        performJoin(storedPassword || undefined, storedToken || undefined);
      }
      return;
    }

    if ((!displayDetail.isLocked && !displayDetail.isPrivate) || isCreator || isAlreadyParticipant) {
      performJoin();
    } else {
      const storedPassword = sessionStorage.getItem(`room_access_${chatroomId}`);
      const storedToken = sessionStorage.getItem(`room_token_${chatroomId}`);
      
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
