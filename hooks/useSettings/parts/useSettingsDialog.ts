import { useState, useCallback } from 'react';

export type DialogType = "alert" | "confirm" | "error" | "success";

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: DialogType;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export const useSettingsDialog = () => {
  const [alertDialog, setAlertDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const showDialog = useCallback((
    title: string,
    message: string,
    type: DialogType = "alert",
    onConfirm?: () => void,
    children?: React.ReactNode
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      children,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setAlertDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertDialog,
    setAlertDialog,
    showDialog,
    closeDialog
  };
};
