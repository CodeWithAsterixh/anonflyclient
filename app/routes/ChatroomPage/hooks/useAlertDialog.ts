import { useState, useCallback } from 'react';

type AlertTypes = "alert" | "confirm" | "error" | "success";

export interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertTypes;
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
    type: AlertTypes = "alert",
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
