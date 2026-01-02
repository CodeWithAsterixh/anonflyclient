import { useState, useRef, useMemo } from 'react';
import { deleteChatroom, leaveChatroom } from '../../../lib/controllers/chatroomController';
import { type DialogType } from './useSettingsDialog';

interface UseSettingsAccountsProps {
  user: any;
  identities: any[];
  chatrooms: any[];
  switchAccount: (aid: string) => Promise<void>;
  deleteAccount: (aid: string) => Promise<void>;
  logout: () => void;
  showDialog: (title: string, message: string, type?: DialogType, onConfirm?: () => void, children?: React.ReactNode) => void;
}

export const useSettingsAccounts = ({
  user,
  identities,
  chatrooms,
  switchAccount,
  deleteAccount,
  logout,
  showDialog
}: UseSettingsAccountsProps) => {
  const [roomAction, setRoomActionState] = useState<'transfer' | 'delete'>('transfer');
  const roomActionRef = useRef<'transfer' | 'delete'>('transfer');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingAid, setDeletingAid] = useState<string | null>(null);

  const setRoomAction = (action: 'transfer' | 'delete') => {
    setRoomActionState(action);
    roomActionRef.current = action;
  };

  // Find the full identity object for the current user
  const currentIdentity = useMemo(() => {
    return identities.find(id => id.aid === user?.userId);
  }, [identities, user]);

  // Filter rooms created by the user
  const myRooms = useMemo(() => {
    if (!user) return [];
    return chatrooms.filter(room => room.hostAid === user.userId);
  }, [chatrooms, user]);

  const handleSwitchAccount = async (aid: string) => {
    if (aid === user?.userId) return;
    try {
      await switchAccount(aid);
    } catch (error) {
      showDialog("Error", "Failed to switch account. Please try again.", "error");
    }
  };

  const handleLogout = () => {
    showDialog(
      "Logout",
      "Are you sure you want to logout? This will clear your current session, but your identity keys will remain safe on this device.",
      "confirm",
      () => logout()
    );
  };

  const handleDeleteAccount = (aid: string, username: string, children?: React.ReactNode) => {
    setIsDeletingAccount(true);
    setDeletingAid(aid);
    setRoomAction('transfer');
    showDialog(
      "Delete Account",
      `Are you sure you want to delete the identity "${username}"? This action cannot be undone and you will lose access to all rooms joined with this identity.`,
      "confirm",
      async () => {
        setIsProcessing(true);
        try {
          // If it's the active account, handle room cleanup
          if (aid === user?.userId) {
            const roomsToProcess = myRooms;
            const currentAction = roomActionRef.current;
            
            for (const room of roomsToProcess) {
              try {
                if (currentAction === 'delete') {
                  await deleteChatroom(room.id);
                } else {
                  await leaveChatroom(room.id);
                }
              } catch (err) {
                console.error(`Failed to ${currentAction} room ${room.id}:`, err);
              }
            }
          }
          
          await deleteAccount(aid);
        } catch (error) {
          showDialog("Error", "Failed to delete account. Please try again.", "error");
        } finally {
          setIsProcessing(false);
          setIsDeletingAccount(false);
          setDeletingAid(null);
        }
      },
      children
    );
  };

  return {
    currentIdentity,
    myRooms,
    roomAction,
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
  };
};
