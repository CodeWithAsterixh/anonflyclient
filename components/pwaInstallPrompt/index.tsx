import React from 'react';
import { Download, X, Clock, Trash2 } from 'lucide-react';
import Logo from '../logo';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onRemindLater: () => void;
  onCancel: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onRemindLater, onCancel }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-8 md:bottom-8 md:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <Logo size={32} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Install Anonfly</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Get a better experience on your device</p>
              </div>
            </div>
            <button 
              onClick={onRemindLater}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Install Anonfly as an app for faster access, offline support, and a cleaner interface without browser address bars.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onInstall}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Download size={18} />
              Install Now
            </button>
            <button
              onClick={onRemindLater}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl transition-all"
            >
              <Clock size={18} />
              Remind Later
            </button>
          </div>
          
          <button
            onClick={onCancel}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xs font-semibold transition-colors"
          >
            <Trash2 size={14} />
            Don't show this again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
