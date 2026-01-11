import React from 'react';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

interface AccessDeniedScreenProps {
  message?: string;
  onNavigateHome: () => void;
  onNavigateToLogin?: () => void;
}

const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ 
  message = "You don't have access to this chatroom.", 
  onNavigateHome,
  onNavigateToLogin,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 max-w-md mx-auto">
      <div className="p-6 bg-destructive/10 rounded-full">
        <ShieldAlert className="w-16 h-16 text-destructive" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Access Denied
        </h1>
        <p className="text-lg text-muted">
          {message}
        </p>
      </div>

      <div className="flex flex-col w-full gap-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-white/5 text-foreground rounded-2xl font-semibold hover:bg-white/10 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go back home
        </button>
        
        {onNavigateToLogin && (
          <button
            onClick={onNavigateToLogin}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-primary text-white rounded-2xl font-semibold hover:opacity-90 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Sign in with a different account
          </button>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedScreen;
