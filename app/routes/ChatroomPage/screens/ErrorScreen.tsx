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
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connection Error
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onReconnect}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 underline mt-2"
          >
            Sign in as different user
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
