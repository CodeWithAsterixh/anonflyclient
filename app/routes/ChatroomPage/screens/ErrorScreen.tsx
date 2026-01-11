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
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onReconnect}
            className="w-full py-3 px-4 bg-primary hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline mt-2"
          >
            Sign in as different user
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
