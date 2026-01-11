import React from 'react';

export type AlertType = 'alert' | 'confirm' | 'error' | 'success';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
}

export interface AlertDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}
