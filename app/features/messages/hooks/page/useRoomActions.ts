import { useCallback, useState } from 'react';
import { deleteChatroom, generateShareLink } from '~/shared/utils/controllers/chatroomController';
import type { AlertType } from '~/shared/components/alertDialog/types';

export const useRoomActions = (
  chatroomId: string | undefined,
  token: string | null,
  showDialog: (title: string, message: string, type?: AlertType, onConfirm?: () => void) => void,
  navigate: (path: string) => void
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleDeleteRoom = useCallback(async () => {
    if (!chatroomId) return;

    showDialog(
      "Delete Chatroom",
      "Are you sure you want to delete this chatroom? This action cannot be undone and all messages will be permanently lost.",
      "confirm",
      async () => {
        setIsDeleting(true);
        try {
          await deleteChatroom(chatroomId);
          navigate("/");
        } catch (err: any) {
          showDialog("Error", err.message || "Failed to delete chatroom", "error");
        } finally {
          setIsDeleting(false);
        }
      }
    );
  }, [chatroomId, showDialog, navigate]);

  const handleGenerateShareLink = useCallback(async () => {
    if (!chatroomId) return "";

    setIsGeneratingLink(true);
    try {
      const result = await generateShareLink(chatroomId);
      return result.token;
    } catch (err: any) {
      showDialog("Error", err.message || "Failed to generate share link", "error");
      return "";
    } finally {
      setIsGeneratingLink(false);
    }
  }, [chatroomId, showDialog]);

  return {
    isDeleting,
    isGeneratingLink,
    handleDeleteRoom,
    handleGenerateShareLink
  };
};
