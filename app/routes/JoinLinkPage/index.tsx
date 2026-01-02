import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { validateShareLink } from '../../../lib/controllers/chatroomController';
import { useAuth } from '../../../hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Background } from '../../../components/background';
import { useTheme } from '../../../hooks/useTheme';

const JoinLinkPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, token: authToken, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasValidated = useRef(false);

  useEffect(() => {
    if (!token) {
      setError('No share link token provided');
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      if (hasValidated.current) return;
      hasValidated.current = true;
      
      if (!token) {
        setError('Invalid access link');
        setLoading(false);
        return;
      }

      try {
        const response = await validateShareLink(token);
        
        if (response.success && response.data.accessGranted) {
          const { chatroomId, password } = response.data;
          
          // Store the access token/password in sessionStorage so ChatroomPage can pick it up
          if (password) {
            sessionStorage.setItem(`room_access_${chatroomId}`, password);
          }
          
          // Also store the token itself for private room validation
          sessionStorage.setItem(`room_token_${chatroomId}`, token);
          
          // Navigate to the chatroom
          navigate(`/${chatroomId}`, { replace: true });
        } else {
          setError(response.message || 'Failed to validate access link');
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired access link');
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user && authToken) {
        validateToken();
      } else if (!user) {
        // If not logged in, redirect to login with this URL as redirect
        navigate(`/login?redirect_to=${encodeURIComponent(window.location.pathname)}`, { replace: true });
      } else if (user && !authToken) {
        // We have a user but no token (handshake failed or in progress)
        setError('Connection issue: Please wait while we reconnect or try refreshing the page.');
        setLoading(false);
      }
    }
  }, [token, user, authToken, authLoading, navigate]);

  return (
    <Background mode={theme} className="flex flex-col items-center justify-center min-h-screen p-4">
      <main className="w-full h-[100dvh] px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-6">
        {loading ? (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Validating Access Link...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we verify your invitation.
            </p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Denied
            </h2>
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Go to Homepage
            </button>
          </>
        ) : null}
      </div>
      </main>
    </Background>
  );
};

export default JoinLinkPage;
