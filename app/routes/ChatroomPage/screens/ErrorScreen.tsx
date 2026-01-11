import React from "react";
import { Lock } from "lucide-react";

interface ErrorScreenProps {
  error: string;
  onReconnect: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  onReconnect,
  onNavigateHome,
  onLogout,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-transparent p-6 text-center">
      <div className="bg-background p-8 rounded-2xl shadow-xl max-w-md w-full border border-border">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Connection Error
        </h2>
        <p className="text-muted mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onReconnect}
            className="w-full py-3 px-4 bg-primary hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-foreground font-medium rounded-xl transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-muted hover:text-foreground underline mt-2"
          >
            Sign in as different user
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
