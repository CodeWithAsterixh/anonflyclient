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
  children,
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
        return <Info className="text-primary" size={48} />;
    }
  };

  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        onConfirm();
      } catch (error) {
        console.error("Error during confirm action:", error);
      } finally {
        setIsLoading(false);
      }
    }
    onClose();
  };

  const getButtonClasses = () => {
    const baseClasses = "flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2";
    const loadingClasses = isLoading ? 'opacity-70 cursor-not-allowed' : '';
    
    let typeClasses = 'bg-primary hover:opacity-90';
    if (type === 'error') {
      typeClasses = 'bg-red-600 hover:bg-red-700 shadow-red-500/20';
    } else if (type === 'confirm') {
      typeClasses = 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20';
    }

    return `${baseClasses} ${loadingClasses} ${typeClasses}`;
  };

  const getButtonText = () => {
    if (type !== 'confirm') return 'OK';
    return isLoading ? 'Processing...' : confirmText;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="p-6 flex flex-col items-center text-center isolate">
        <div className="mb-4">
          {getIcon()}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {message}
        </p>

        {children && (
          <div className="w-full mb-8 text-left">
            {children}
          </div>
        )}

        <div className="flex w-full gap-3">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={getButtonClasses()}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {getButtonText()}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;
