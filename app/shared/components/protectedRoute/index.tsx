import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "~/features/auth/hooks";
import type { ProtectedRouteProps } from "./types";
import Loader from "../ui/loader";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: loading, error, retryCountdown } = useAuth();

  if (loading || (error && retryCountdown !== null)) {
    return (
      <Loader
        message={error ? "Authentication Issue" : "Verifying your session..."}
        error={error || undefined}
        progress={retryCountdown ?? undefined}
        maxProgress={5}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
