import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth/index";
import type { ProtectedRouteProps } from "./types";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: loading, error, retryCountdown } = useAuth();

  if (loading || (error && retryCountdown !== null)) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="flex flex-col items-center gap-6 max-w-md w-full">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">
              {error ? "Authentication Issue" : "Verifying your session..."}
            </p>
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {retryCountdown !== null && (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(retryCountdown / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Retrying in <span className="font-bold text-blue-600 dark:text-blue-400">{retryCountdown}s</span>...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
