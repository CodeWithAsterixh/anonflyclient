import React from 'react';
import Modal from '../modal';
import type { AlertDialogProps } from './types';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'alert',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="text-red-500" size={48} />;
      case 'success':
        return <CheckCircle2 className="text-green-500" size={48} />;
      case 'confirm':
        return <AlertTriangle className="text-amber-500" size={48} />;
      default:
        return <Info className="text-blue-500" size={48} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="mb-4">
          {getIcon()}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {message}
        </p>

        <div className="flex w-full gap-3">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-500/20 ${
              type === 'error' 
                ? 'bg-red-600 hover:bg-red-700' 
                : type === 'confirm' 
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {type === 'confirm' ? confirmText : 'OK'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;
