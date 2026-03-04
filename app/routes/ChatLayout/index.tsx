import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useParams, useLoaderData, useLocation } from "react-router";
import ChatroomListPage from "../ChatroomListPage";
import { requireAuth } from "~/middleware/auth";
import { useAuth } from "~/features/auth/hooks";
import { useChatroomList } from "~/features/conversations/hooks";
import { ChatLayoutContext } from "~/shell/context/ChatLayoutContext";

export async function loader({ request }: { request: Request }) {
  const { user, token } = await requireAuth(request);
  return { user, token };
}

const ChatLayout: React.FC = () => {
  const { user: serverUser, token: serverToken } =
    useLoaderData<typeof loader>();
  const {
    user: clientUser,
    token: clientToken,
    identities,
    isLoading: authLoading,
    switchAccount,
    deleteAccount,
    logout,
    refreshUserInfo,
  } = useAuth();

  const {
    chatrooms,
    loading: loadingChatrooms,
    error: chatroomError,
    retryCountdown,
  } = useChatroomList();

  // Prefer client-side state for real-time updates, but fallback to server-side for initial render
  const user = clientUser || serverUser;
  const token = clientToken || serverToken;

  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";
  const isPrivacyPage = location.pathname === "/privacy";
  const isTermsPage = location.pathname === "/terms";
  const isFullPage = isSettingsPage || isPrivacyPage || isTermsPage;

  const { chatroomId } = useParams<{ chatroomId: string }>();
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(
    !chatroomId && !isFullPage
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsHydrated(true);
    // Set initial mobile state after hydration
    const mobile = globalThis.window.innerWidth < 768;
    setIsMobile(mobile);
    setShowChatList(!chatroomId && !isFullPage);

    // Handle globalThis.window resize to detect mobile/desktop
    const handleResize = () => {
      const mobile = globalThis.window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show list
      if (!mobile) {
        setShowChatList(true);
      }
    };

    globalThis.window.addEventListener("resize", handleResize);
    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, [chatroomId, isFullPage]);

  // Auto-hide list on mobile when chatroom or settings is selected
  useEffect(() => {
    if (isHydrated && isMobile && (chatroomId || isFullPage)) {
      setShowChatList(false);
    }
  }, [chatroomId, isFullPage, isMobile, isHydrated]);

  const handleSelectChatroom = (chatroomId: string) => {
    setShowChatList(false); // Hide list on mobile after selection
  };

  const handleBackFromChat = () => {
    setShowChatList(true); // Show list again on mobile
  };

  const contextValue = useMemo(
    () => ({
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
      refreshUserInfo,
      isMobile,
      onBack: handleBackFromChat,
    }),
    [
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
      refreshUserInfo,
      isMobile,
    ]
  );

  return (
    <ChatLayoutContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Hidden on mobile when chat is active */}
        <div
          className={`${showChatList ? 'flex' : 'hidden'
            } md:flex w-full md:w-80 lg:w-96 border-r border-border flex-col shrink-0`}
        >
          <ChatroomListPage onChatroomSelect={handleSelectChatroom} />
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0 ${showChatList ? 'hidden md:flex' : 'flex'}`}>
          <Outlet />
        </div>
      </div>
    </ChatLayoutContext.Provider>
  );
};

export default ChatLayout;
