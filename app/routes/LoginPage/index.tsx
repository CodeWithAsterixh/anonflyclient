/**
 * @file LoginPage.tsx
 * @description Login page component for user authentication.
 * This component provides a form for users to log in to the application.
 * It uses the `useAuth` hook for authentication logic and `validation` helpers for form input validation.
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../../hooks/useAuth/index";
import { validateUsername } from "../../../lib/helpers/validation";
import { Loader2 } from "lucide-react";
import Logo from "../../../components/logo";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { joinAnonymously, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath =
    new URLSearchParams(location.search).get("redirect_to") || "/";

  /**
   * Handles the form submission for anonymous join.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameValidation = validateUsername(username);

    if (!usernameValidation) {
      setUsernameError(
        "Username must be at least 3 characters long and contain only letters and numbers."
      );
      return;
    }

    try {
      await joinAnonymously(username);
      navigate(redirectPath);
    } catch (err) {
      // Join failed error is handled by useAuth and displayed in the UI
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} className="mb-4" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Anonfly
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800 uppercase tracking-wider">Free</span>
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
            <label
              htmlFor="username"
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="e.g. ghost_rider"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${
                usernameError ? "border-red-500 ring-red-200 dark:ring-red-900/30" : ""
              }`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              disabled={isLoading}
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? "username-error" : undefined}
            />
            {usernameError && (
              <p id="username-error" className="text-red-500 dark:text-red-400 text-xs italic mt-1">
                {usernameError}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
              disabled={isLoading || !username}
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
      </div>
    </div>
  );
};

export default LoginPage;
