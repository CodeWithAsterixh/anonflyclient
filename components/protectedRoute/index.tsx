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
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Authentication Issue" : "Securing Connection"}
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "We're verifying your identity to keep your chats private and anonymous."}
          </p>
          
          {retryCountdown !== null ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(retryCountdown / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                Retrying in <span className="font-bold text-blue-600">{retryCountdown}s</span>...
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
