import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, type MetaFunction } from 'react-router';
import { validateShareLink } from '../../../lib/controllers/chatroomController';
import { useAuth, useTheme } from '../../../hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { Background } from '../../../components/background';
import { cryptSessionStorage } from '../../../lib/helpers/cryptSessionStorage';

export const meta: MetaFunction = () => {
  return [
    { title: "Join Chatroom | Anonfly" },
    { name: "description", content: "Validating your invitation to join a private chatroom on Anonfly." },
    { property: "og:title", content: "Join Chatroom | Anonfly" },
    { property: "og:description", content: "You've been invited to join a secure and private chatroom on Anonfly." },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

const JoinLinkPage: React.FC = () => {
  const params = useParams();
  const token = params["*"];
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
          const { chatroomId, password, joinAuthToken } = response.data;
          
          // Store the access token/password in sessionStorage so ChatroomPage can pick it up
          if (password) {
            cryptSessionStorage.setItem(`room_access_${chatroomId}`, password, chatroomId);
          }
          
          // Store the join authorization token
          if (joinAuthToken) {
            cryptSessionStorage.setItem(`room_join_auth_${chatroomId}`, joinAuthToken, chatroomId);
          }
          
          // Also store the token itself for private room validation
          cryptSessionStorage.setItem(`room_token_${chatroomId}`, token, chatroomId);
          
          // Navigate to the chatroom
          navigate(`/${chatroomId}`);
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
        navigate(`/login?redirect_to=${encodeURIComponent(globalThis.window.location.pathname)}`);
      } else if (user && !authToken) {
        // We have a user but no token (handshake failed or in progress)
        setError('Connection issue: Please wait while we reconnect or try refreshing the page.');
        setLoading(false);
      }
    }
  }, [token, user, authToken, authLoading, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Validating Access Link...
          </h2>
          <p className="text-muted">
            Please wait while we verify your invitation.
          </p>
        </>
      );
    }

    if (error) {
      return (
        <>
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Access Denied
          </h2>
          <p className="text-destructive">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-white/5 text-foreground rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            Go to Homepage
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <Background mode={theme} className="flex flex-col items-center justify-center min-h-screen p-4">
      <main className="w-full h-dvh px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-background rounded-3xl shadow-xl p-8 border border-border text-center space-y-6">
          {renderContent()}
        </div>
      </main>
    </Background>
  );
};

export default JoinLinkPage;
