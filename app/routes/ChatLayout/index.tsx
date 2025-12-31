import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useLoaderData, useLocation } from 'react-router';
import ChatroomListPage from '../ChatroomListPage';
import NoChatSelectedFallback from '../../../components/noChatSelectedFallback';
import { requireAuth } from '../../middleware/auth';
import ProtectedRoute from '../../../components/protectedRoute';
import { useAuth } from '../../../hooks/useAuth/index';
import { useChatroomList } from '../../../hooks/useChatroomList/index';
import { ChatLayoutContext } from '../../contexts/ChatLayoutContext';

export async function loader({ request }: { request: Request }) {
  const { user, token } = await requireAuth(request);
  return { user, token };
}

const ChatLayout: React.FC = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';
  const { user: serverUser, token: serverToken } = useLoaderData<typeof loader>();
  const { 
    user: clientUser, 
    token: clientToken, 
    identities, 
    isLoading: authLoading,
    switchAccount, 
    deleteAccount,
    logout 
  } = useAuth();
  
  const { 
    chatrooms, 
    loading: loadingChatrooms, 
    error: chatroomError, 
    retryCountdown 
  } = useChatroomList();
  
  // Prefer client-side state for real-time updates, but fallback to server-side for initial render
  const user = clientUser || serverUser;
  const token = clientToken || serverToken;

  const { chatroomId } = useParams<{ chatroomId: string }>();
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatroomId && !isSettingsPage);
  const [isHydrated, setIsHydrated] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsHydrated(true);
    // Set initial mobile state after hydration
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setShowChatList(!chatroomId && !isSettingsPage);

    // Handle window resize to detect mobile/desktop
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show list
      if (!mobile) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chatroomId, isSettingsPage]);

  // Auto-hide list on mobile when chatroom or settings is selected
  useEffect(() => {
    if (isHydrated && isMobile && (chatroomId || isSettingsPage)) {
      setShowChatList(false);
    }
  }, [chatroomId, isSettingsPage, isMobile, isHydrated]);

  const handleSelectChatroom = (chatroomId: string) => {
    setShowChatList(false); // Hide list on mobile after selection
  };

  const handleBackFromChat = () => {
    setShowChatList(true); // Show list again on mobile
  };

  return (
    <ProtectedRoute>
      <ChatLayoutContext.Provider 
        value={{ 
          user, 
          token, 
          identities, 
          authLoading,
          chatrooms,
          loadingChatrooms,
          chatroomError,
          retryCountdown,
          switchAccount, 
          deleteAccount,
          logout, 
          isMobile, 
          onBack: handleBackFromChat 
        }}
      >
        <div className="flex h-[100dvh] overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
          {/* Left Column: Chatroom List 
              - Desktop: Always visible (md:block)
              - Mobile: Shows based on JavaScript state or Tailwind hidden state
          */}
          <div
            className={`${
              isHydrated
                ? showChatList || !isMobile
                  ? 'block'
                  : 'hidden'
                : 'block md:block'
            } w-full md:w-80 lg:w-1/4 border-r h-full border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
          >
            <ChatroomListPage onChatroomSelect={handleSelectChatroom} />
          </div>

          {/* Right Column: Chatroom View or Fallback 
              - Desktop: Always visible (md:flex)
              - Mobile: Shows based on JavaScript state or Tailwind hidden state
          */}
          <div
            className={`${
              isHydrated
                ? showChatList && isMobile
                  ? 'hidden'
                  : 'flex'
                : 'hidden md:flex'
            } flex-1 flex-col overflow-hidden relative isolate w-full md:w-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
          >
            {chatroomId || isSettingsPage ? (
              <Outlet context={{ onBack: handleBackFromChat, isMobile }} />
            ) : (
              <NoChatSelectedFallback />
            )}
          </div>
        </div>
      </ChatLayoutContext.Provider>
    </ProtectedRoute>
  );
};

export default ChatLayout;
