/**
 * @file LoginPage.tsx
 * @description Login page component for user authentication.
 * This component provides a form for users to log in to the application.
 * It uses the `useAuth` hook for authentication logic and `validation` helpers for form input validation.
 */

import React, { useState } from "react";
import { useNavigate, useLocation, type MetaFunction } from "react-router";
import { useAuth } from "../../../hooks";
import { validateUsername } from "../../../lib/helpers/validation";
import { Loader2, Users } from "lucide-react";
import Logo from "../../../components/logo";
import AccountSelectionModal from "./components/AccountSelectionModal";
import Input from "../../../components/ui/input";
import Loader from "../../../components/ui/loader";

export const meta: MetaFunction = () => {
  return [
    { title: "Join Anonfly | Anonymous & Secure Chat" },
    { name: "description", content: "Join Anonfly instantly without registration. Choose a temporary username and start chatting securely and anonymously for free." },
    { property: "og:title", content: "Join Anonfly | Anonymous & Secure Chat" },
    { property: "og:description", content: "No sign-up, no tracking. Just pick a name and join the private conversation." },
    { rel: "canonical", href: "https://anonfly.vercel.app/login" },
  ];
};

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { joinAnonymously, switchAccount, isLoading, isInitialCheck, isAuthenticated, error, identities } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath =
    new URLSearchParams(location.search).get("redirect_to") || "/";

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isInitialCheck && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isInitialCheck, isAuthenticated, navigate, redirectPath]);

  /**
   * Handles the form submission for anonymous join.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameValidation = validateUsername(username);

    if (!usernameValidation) {
      setUsernameError(
        "Username must be between 3 and 30 characters and contain only letters, numbers, and underscores."
      );
      return;
    }

    try {
      await joinAnonymously(username, redirectPath);
    } catch {
      // Join failed error is handled by useAuth and displayed in the UI
    }
  };

  if (isInitialCheck || isAuthenticated) {
    return <Loader message="Loading..." />;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} className="mb-4" />
          <h1 className="text-3xl font-extrabold text-primary">
            Anonfly
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-wider">Free</span>
            <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full border border-green-100 dark:border-green-800 uppercase tracking-wider">Secure</span>
            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full border border-purple-100 dark:border-purple-800 uppercase tracking-wider">Anonymous</span>
          </div>
        </div>
        
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Join the Conversation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Choose a temporary username. No registration, no tracking, just 100% free and private messaging.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              id="username"
              label="Username"
              placeholder="e.g. ghost_rider"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              disabled={isLoading || isInitialCheck}
              error={usernameError || undefined}
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? "username-error" : undefined}
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              disabled={isLoading || isInitialCheck || !username}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Now"
              )}
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {identities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-colors"
            >
              <Users size={18} />
              Sign in to other accounts
            </button>
          </div>
        )}

        <AccountSelectionModal 
          isOpen={isAccountModalOpen} 
          onClose={() => setIsAccountModalOpen(false)} 
          identities={identities} 
          onSelect={(aid) => switchAccount(aid, redirectPath)} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};

export default LoginPage;
