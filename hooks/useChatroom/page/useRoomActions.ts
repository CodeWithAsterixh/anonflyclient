import { useCallback } from 'react';
import { generateShareLink } from "../../../lib/controllers/chatroomController";
import { getAPIBaseURL } from "../../../lib/constants/api";

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
