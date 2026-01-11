import { useSettingsDialog } from "./parts/useSettingsDialog";
import { useSettingsAccounts } from "./parts/useSettingsAccounts";

interface UseSettingsProps {
  user: any;
  identities: any[];
  chatrooms: any[];
  switchAccount: (aid: string) => Promise<void>;
  deleteAccount: (aid: string) => Promise<void>;
  logout: () => void;
  authLoading: boolean;
}

export const useSettings = ({
  user,
  identities,
  chatrooms,
  switchAccount,
  deleteAccount,
  logout,
  authLoading
}: UseSettingsProps) => {
  const { 
    alertDialog, 
    setAlertDialog, 
    showDialog, 
    closeDialog 
  } = useSettingsDialog();

  const {
    currentIdentity,
    myRooms,
    roomActionState,
    setRoomAction,
    isDeletingAccount,
    setIsDeletingAccount,
    isProcessing,
    setIsProcessing,
    deletingAid,
    setDeletingAid,
    handleSwitchAccount,
    handleLogout,
    handleDeleteAccount,
    roomActionRef
  } = useSettingsAccounts({
    user,
    identities,
    chatrooms,
    switchAccount,
    deleteAccount,
    logout,
    showDialog
  });

  return {
    alertDialog,
    setAlertDialog,
    showDialog,
    closeDialog,
    currentIdentity,
    myRooms,
    roomActionState,
    setRoomAction,
    isDeletingAccount,
    setIsDeletingAccount,
    isProcessing,
    setIsProcessing,
    deletingAid,
    setDeletingAid,
    handleSwitchAccount,
    handleLogout,
    handleDeleteAccount,
    roomActionRef,
    authLoading
  };
};
