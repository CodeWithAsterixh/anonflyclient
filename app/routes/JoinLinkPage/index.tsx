import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { validateShareLink } from '../../../lib/controllers/chatroomController';
import { ChatLayoutContext } from '../../contexts/ChatLayoutContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Background } from '../../../components/background';
import { useTheme } from '../../../hooks/useTheme';

const JoinLinkPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  const { theme } = useTheme();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
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
          // This allows us to bypass the password prompt
          if (password) {
            sessionStorage.setItem(`room_access_${chatroomId}`, password);
          }
          
          // Also store the token itself for private room validation
          sessionStorage.setItem(`room_token_${chatroomId}`, token);
          
          // Navigate to the chatroom
          navigate(`/${chatroomId}`);
        } else {
          setError(response.message || 'Failed to validate access link');
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired access link');
      } finally {
        setLoading(false);
      }
    };

    if (context?.user && context?.token) {
      validateToken();
    } else if (context && !context.user) {
        // If not logged in, redirect to login with this URL as redirect
        navigate(`/login?redirect_to=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [token, context, navigate]);

  return (
    <Background mode={theme} className="flex flex-col items-center justify-center min-h-screen p-4">
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
    </Background>
  );
};

export default JoinLinkPage;
