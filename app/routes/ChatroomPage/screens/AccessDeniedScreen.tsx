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
      <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full">
        <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-500" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>

      <div className="flex flex-col w-full gap-4">
        <button
          onClick={onNavigateHome}
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go back home
        </button>
        
        {onNavigateToLogin && (
          <button
            onClick={onNavigateToLogin}
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
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
