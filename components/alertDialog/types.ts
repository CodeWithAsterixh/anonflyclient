import React from 'react';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
}
