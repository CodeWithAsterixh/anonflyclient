import { getAPIBaseURL } from 'lib/constants/api';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import ChatroomMenu from '../../components/ChatroomMenu';
import JoinRoomOverlay from '../../components/JoinRoomOverlay';
import MessageDisplay from '../../components/MessageDisplay';
import MessageInput from '../../components/MessageInput';
import ProtectedRoute from "../../components/ProtectedRoute";
import ChatroomSkeleton from '../../components/ChatroomSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { useChatroom, type ChatroomDetail } from '../../hooks/useChatroom';
import { ChevronDown } from 'lucide-react';

interface OutletContext {
  onBack: () => void;
  isMobile: boolean;
}

/**
 * ChatroomPage component displays the messages within a specific chatroom,
 * allows users to send new messages, and handles joining/leaving the chatroom.
 * It integrates with the `useChatroom` hook for WebSocket communication.
 */
const ChatroomPage: React.FC = () => {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const navigate = useNavigate();
  const { user, loading, token } = useAuth();
  const { onBack, isMobile } = useOutletContext<OutletContext>();
  const [isHost, setIsHost] = useState(false);
  const [chatroomDetail, setChatroomDetails] = useState<ChatroomDetail | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const fetchChatroomDetails = async () => {
      if (!chatroomId || !token || !user) return;

      try {
        const response = await fetch(`${getAPIBaseURL()}/chatroom/${chatroomId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.data) {
          setChatroomDetails(data.data)
          setIsHost(data.data.hostUserId === user.userId);
        } else {
          console.error("Failed to fetch chatroom details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching chatroom details:", error);
      }
    };

    fetchChatroomDetails();
  }, [chatroomId, token, user]);

  const {
    messages,
    sendMessage,
    joinChatroom,
    leaveChatroom,
    isConnected,
    error,
    currentChatroomId,
  } = useChatroom();

  useEffect(() => {
    // Do not auto-join on page load. Joining will be triggered by user action.
  }, [/* intentionally empty to avoid auto-joining */]);



  useEffect(() => {
    return () => {
      if (currentChatroomId) {
        leaveChatroom();
      }
    };
  }, [currentChatroomId, leaveChatroom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll position to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  if (loading) {
    return <JoinRoomOverlay message="Loading room." />;
  }

  if (!user || !token) {
    return (
      <JoinRoomOverlay
        message="Please log in to view chatrooms."
        replaceLoading={
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => navigate(`/login?redirect_to=${encodeURIComponent(window.location.pathname)}`)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
          </div>
        }
      />
    );
  }

  if (error && !loading) {
    return <JoinRoomOverlay message={`Error: ${error}`} />;
  }

  if (!isConnected) {
    return <JoinRoomOverlay message="Connecting to chat service..." />;
  }

  const isJoined = currentChatroomId === chatroomId;

  const handleLeaveRoom = () => {
    leaveChatroom();
    if (isMobile) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const handleDeleteRoom = async () => {
    if (!chatroomId || !token) return;

    if (!window.confirm('Are you sure you want to delete this chatroom? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${getAPIBaseURL()}/chatrooms/${chatroomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Chatroom deleted successfully!');
        if (isMobile) {
          onBack();
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete chatroom: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting chatroom:", error);
      alert('An error occurred while deleting the chatroom.');
    }
  };
  if (!isJoined) {
    // show skeleton with overlay prompting the user to join
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-[100dvh] bg-gray-50 relative">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3 flex-1">
              {isMobile && (
                <button
                  onClick={() => { if (typeof onBack === 'function') onBack(); else navigate('/'); }}
                  className="text-blue-500 hover:text-blue-700 font-semibold text-lg"
                  aria-label="Back"
                >
                  ← Back
                </button>
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {chatroomDetail?.roomname || 'Chatroom'}
              </h1>
            </div>
            <ChatroomMenu
              onLeaveRoom={handleLeaveRoom}
              onRemoveParticipant={() => console.log('Remove participant clicked')}
              onDeleteRoom={handleDeleteRoom}
              isHost={isHost}
            />
          </header>

          {/* Skeleton content */}
          <div className="flex-1 relative">
            <ChatroomSkeleton />

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center shadow-lg">
                <h2 className="text-lg font-semibold mb-2">{chatroomDetail?.roomname || 'Chatroom'}</h2>
                <p className="text-sm text-gray-600 mb-4">{chatroomDetail?.description || 'Join the room to see messages and participate.'}</p>
                <div className="flex items-center justify-center space-x-3">
                  {chatroomDetail?.participants?.some(p => p.userId === user.userId) ? (
                    <div className="text-sm text-gray-700">You're listed as a participant</div>
                  ) : (
                    <button
                      onClick={() => joinChatroom(chatroomId as string)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Join Room
                    </button>
                  )}
                  <button
                    onClick={() => { if (isMobile) onBack(); else navigate('/'); }}
                    className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input placeholder (disabled) */}
          <div className="p-4 border-t border-gray-200">
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }



  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1">
            {/* Back button for mobile */}
            {isMobile && (
              <button
                onClick={() => { if (typeof onBack === 'function') onBack(); else navigate('/'); }}
                className="text-blue-500 hover:text-blue-700 font-semibold text-lg"
                aria-label="Back"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {chatroomDetail?.roomname || 'Chatroom'}
            </h1>
          </div>
          <ChatroomMenu
            onLeaveRoom={handleLeaveRoom}
            onRemoveParticipant={() => console.log('Remove participant clicked')}
            onDeleteRoom={handleDeleteRoom}
            isHost={isHost}
          />
        </header>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        >
          {messages.map((msg, index) => (
            <MessageDisplay key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-40"
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={24} />
            </button>
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isDisabled={!isConnected || !currentChatroomId}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ChatroomPage;
