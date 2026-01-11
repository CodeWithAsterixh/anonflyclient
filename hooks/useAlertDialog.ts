import { useState, useCallback } from 'react';
import type { AlertDialogState, AlertType } from '../components/alertDialog/types';

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
    type: AlertType = "alert",
    onConfirm?: () => void,
    children?: React.ReactNode
  ) => {
    setAlertDialog(prev => ({
      ...prev,
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      children,
    }));
  }, []);

  const closeAlertDialog = useCallback(() => {
    setAlertDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { alertDialog, setAlertDialog, showAlertDialog, closeAlertDialog };
};
