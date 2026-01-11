import { useCallback } from 'react';
import { 
  removeParticipant, 
  banParticipant, 
  unbanParticipant 
} from "../../../lib/controllers/chatroomController";

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
