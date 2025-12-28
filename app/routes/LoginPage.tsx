/**
 * @file LoginPage.tsx
 * @description Login page component for user authentication.
 * This component provides a form for users to log in to the application.
 * It uses the `useAuth` hook for authentication logic and `validation` helpers for form input validation.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { validateUsername } from '../../lib/helpers/validation';
import { Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { joinAnonymously, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get('redirect_to') || '/';

  /**
   * Handles the form submission for anonymous join.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameValidation = validateUsername(username);

    if (!usernameValidation) {
      setUsernameError('Username must be at least 3 characters long and contain only letters and numbers.');
      return;
    }

    try {
      await joinAnonymously(username);
      navigate(redirectPath);
    } catch (err) {
      console.error('Join failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Enter Anonymously</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Choose a temporary username. No password required. Your identity is stored locally and lost if you clear your browser data.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              id="username"
              placeholder="e.g. ghost_rider"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${usernameError ? 'border-red-500' : ''}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              disabled={isLoading}
            />
            {usernameError && <p className="text-red-500 text-xs italic mt-1">{usernameError}</p>}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline disabled:opacity-50 flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Start Chatting'
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
