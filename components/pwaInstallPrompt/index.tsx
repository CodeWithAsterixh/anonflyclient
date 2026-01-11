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
    <div className="fixed bottom-4 left-4 right-4 z-9999 md:left-auto md:right-8 md:bottom-8 md:max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-background rounded-3xl shadow-2xl border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Logo size={32} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Install Anonfly</h3>
                <p className="text-xs text-muted font-medium">Get a better experience on your device</p>
              </div>
            </div>
            <button 
              onClick={onRemindLater}
              className="p-1 text-muted hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Install Anonfly as an app for faster access, offline support, and a cleaner interface without browser address bars.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onInstall}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              <Download size={18} />
              Install Now
            </button>
            <button
              onClick={onRemindLater}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-foreground text-sm font-bold rounded-xl transition-all"
            >
              <Clock size={18} />
              Remind Later
            </button>
          </div>
          
          <button
            onClick={onCancel}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-muted hover:text-destructive text-xs font-semibold transition-colors"
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
