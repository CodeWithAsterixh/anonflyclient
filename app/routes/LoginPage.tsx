/**
 * @file LoginPage.tsx
 * @description Login page component for user authentication.
 * This component provides a form for users to log in to the application.
 * It uses the `useAuth` hook for authentication logic and `validation` helpers for form input validation.
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { validateUsername } from "../../lib/helpers/validation";
import { Loader2 } from "lucide-react";
import Logo from "../../components/Logo";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Logo size={64} className="mb-4" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Anonfly
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wider">Free</span>
            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wider">Secure</span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full border border-purple-100 uppercase tracking-wider">Anonymous</span>
          </div>
        </div>
        
        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Join the Conversation
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Choose a temporary username. No registration, no tracking, just 100% free and private messaging.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="e.g. ghost_rider"
              className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                usernameError ? "border-red-500 ring-red-200" : ""
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
              <p id="username-error" className="text-red-500 text-xs italic mt-1">
                {usernameError}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> <strong>Loading...</strong>
                </>
              ) : (
                <strong>Start Chatting</strong>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-center text-sm mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
