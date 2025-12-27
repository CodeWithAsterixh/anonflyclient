import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChatroomListPage from '~/routes/ChatroomListPage';
import NoChatSelectedFallback from '../../components/NoChatSelectedFallback';

const ChatLayout: React.FC = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(!chatroomId);
  const [isHydrated, setIsHydrated] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsHydrated(true);
    // Set initial mobile state after hydration
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setShowChatList(!chatroomId);

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
  }, [chatroomId]);

  // Auto-hide list on mobile when chatroom is selected
  useEffect(() => {
    if (isHydrated && isMobile && chatroomId) {
      setShowChatList(false);
    }
  }, [chatroomId, isMobile, isHydrated]);

  const handleSelectChatroom = (chatroomId: string) => {
    setShowChatList(false); // Hide list on mobile after selection
  };

  const handleBackFromChat = () => {
    setShowChatList(true); // Show list again on mobile
  };

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden">
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
        } w-full md:w-80 lg:w-1/4 border-r border-gray-300 overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
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
        } flex-1 flex-col bg-gray-50 overflow-hidden w-full md:w-auto`}
      >
        {chatroomId ? (
          <Outlet context={{ onBack: handleBackFromChat, isMobile }} />
        ) : (
          <NoChatSelectedFallback />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;