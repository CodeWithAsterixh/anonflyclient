import NoChatSelectedFallback from "components/NoChatSelectedFallback";
import { getAPIBaseURL } from "lib/constants/api";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import ChatroomMenu from "../../components/ChatroomMenu";
import ChatroomSkeleton from "../../components/ChatroomSkeleton";
import EditChatroomModal from "../../components/EditChatroomModal";
import JoinRoomOverlay from "../../components/JoinRoomOverlay";
import Logo from "../../components/Logo";
import MessageDisplay from "../../components/MessageDisplay";
import MessageInput from "../../components/MessageInput";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";
import { useChatroom, type ChatroomDetail } from "../../hooks/useChatroom";

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
  const { user, isLoading: loading, token, logout } = useAuth();
  const { onBack, isMobile } = useOutletContext<OutletContext>();
  const [isHost, setIsHost] = useState(false);
  const [chatroomDetail, setChatroomDetails] = useState<ChatroomDetail | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string;
    senderUsername: string;
    content: string;
    senderAid: string;
  } | null>(null);

  const [editingMessage, setEditingMessage] = useState<{
    messageId: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    const fetchChatroomDetails = async () => {
      if (!chatroomId || !token || !user) return;

      try {
        const response = await fetch(
          `${getAPIBaseURL()}/chatroom/${chatroomId}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();
        if (response.ok && data.data) {
          setChatroomDetails(data.data);
          setIsHost(data.data.hostAid === user.userId);
        }
      } catch (error) {
        // Silently fail
      }
    };

    fetchChatroomDetails();
  }, [chatroomId, token, user]);

  const {
    messages,
    participants,
    chatroomDetail: sseChatroomDetail,
    sendMessage,
    editMessage,
    deleteMessage,
    sendReaction,
    joinChatroom,
    leaveChatroom,
    isConnected,
    isJoined,
    hasRoomKey,
    error,
    reconnect,
    clearError,
    currentChatroomId,
  } = useChatroom(chatroomId, !chatroomDetail || chatroomDetail.isLocked);

  // Sync isHost with SSE updates
  useEffect(() => {
    if (sseChatroomDetail?.hostAid && user) {
      setIsHost(sseChatroomDetail.hostAid === user.userId);
    }
  }, [sseChatroomDetail, user]);

  const displayDetail = sseChatroomDetail || chatroomDetail;

  // Auto-join if room is not locked and we are connected
  // Or if room IS locked, we are connected, and we have a password ready (from a previous attempt)
  useEffect(() => {
    if (isConnected && chatroomId && displayDetail && !isJoined) {
      if (!displayDetail.isLocked) {
        joinChatroom(chatroomId);
      } else if (isSubmitting && joinPassword) {
        // If it's locked and we just connected after clicking "Enter Room", try to join now
        joinChatroom(chatroomId, joinPassword);
      }
    }
  }, [
    isConnected,
    chatroomId,
    displayDetail,
    isJoined,
    joinChatroom,
    joinPassword,
    isSubmitting,
  ]);

  useEffect(() => {
    if (
      error &&
      (error.toLowerCase().includes("password") ||
        error.toLowerCase().includes("locked"))
    ) {
      setPasswordError(error);
      setIsSubmitting(false);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    return () => {
      if (currentChatroomId) {
        leaveChatroom();
      }
    };
  }, [currentChatroomId, leaveChatroom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track scroll position to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content, replyingTo || undefined);
    setReplyingTo(null);
  };

  const handleEditMessage = (newContent: string) => {
    if (editingMessage) {
      editMessage(editingMessage.messageId, newContent);
      setEditingMessage(null);
    }
  };

  const handleLeaveRoom = () => {
    leaveChatroom();
    navigate("/");
  };

  const handleDeleteRoom = async () => {
    if (!chatroomId || !token) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this chatroom? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${getAPIBaseURL()}/chatrooms/${chatroomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Chatroom deleted successfully!");
        navigate("/");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete chatroom: ${errorData.message}`);
      }
    } catch (error) {
      alert("An error occurred while deleting the chatroom.");
    }
  };

  const handleEditSuccess = () => {
    // Refetch chatroom details to get updated values
    if (chatroomId && token && user) {
      fetch(`${getAPIBaseURL()}/chatroom/${chatroomId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setChatroomDetails(data.data);
          }
        })
        .catch((err) => {
          // Silently fail
        });
    }
  };

  const handleJoinChatroom = async () => {
    if (!chatroomId) return;
    setPasswordError(null);
    setIsSubmitting(true);
    try {
      // For locked rooms, we might need to connect first if we deferred it
      if (displayDetail?.isLocked && !isConnected) {
        reconnect();
        // The useEffect will handle joinChatroom once isConnected becomes true
      } else {
        await joinChatroom(chatroomId, joinPassword);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to join chatroom");
      setIsSubmitting(false);
    }
  };

  if (isJoined && !hasRoomKey) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
          {/* Background Image with Opacity */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: "url(/chatroom-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
            {isMobile && <Logo showText size={32} className="py-2" />}
            <div className="w-full flex justify-between items-center bg-neutral-200/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onBack();
                    navigate("/");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                <div>
                  <h1 className="font-bold text-gray-900 leading-tight">
                    {displayDetail?.roomname || "Loading..."}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {displayDetail?.participantCount !== undefined
                      ? `${displayDetail.participantCount} participants • Securing room...`
                      : "Securing room..."}
                  </p>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Establishing Secure Connection
            </h2>
            <p className="text-gray-600 max-w-xs">
              Waiting for other participants to securely share the room key.
              This ensures your messages remain private.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return <JoinRoomOverlay message="Loading room." />;
  }

  if (!user || !token) {
    return (
      <JoinRoomOverlay
        message="Please join anonymously to view chatrooms."
        replaceLoading={
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() =>
                navigate(
                  `/login?redirect_to=${encodeURIComponent(
                    window.location.pathname
                  )}`
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Join Anonymously
            </button>
          </div>
        }
      />
    );
  }

  if (
    error &&
    !error.toLowerCase().includes("password") &&
    !error.toLowerCase().includes("locked")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reconnect()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-400 hover:text-gray-600 underline mt-2"
            >
              Sign in as different user
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatroomId) {
    return <NoChatSelectedFallback />;
  }

  if (!isConnected && (!displayDetail || !displayDetail.isLocked)) {
    return <JoinRoomOverlay message="Connecting to chat service..." />;
  }

  if (!isJoined) {
    const isLocked = displayDetail?.isLocked;
    const isConnecting = isLocked && !isConnected && isSubmitting;

    // show skeleton with overlay prompting the user to join
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
          {/* Background Image with Opacity */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: "url(/chatroom-bg.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Header */}

          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
            {isMobile && <Logo showText size={32} className="py-2" />}
            <div className="w-full flex justify-between items-center bg-neutral-200/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onBack();
                    navigate("/");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                <div>
                  <h1 className="font-bold text-gray-900 leading-tight">
                    {displayDetail?.roomname || "Loading..."}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {displayDetail?.participantCount !== undefined
                      ? `${displayDetail.participantCount} participants • ${
                          isConnected ? "connected" : "ready"
                        }`
                      : isConnected
                      ? "connected"
                      : "ready"}
                  </p>
                </div>
              </div>

              <ChatroomMenu
                onLeaveRoom={handleLeaveRoom}
                onRemoveParticipant={() => {}}
                onDeleteRoom={handleDeleteRoom}
                onEditRoom={() => setIsEditModalOpen(true)}
                isHost={isHost}
              />
            </div>
          </header>

          {/* Messages Area - No skeleton for locked rooms until connecting */}
          <div className="flex-1 overflow-y-hidden p-4 space-y-4 relative z-10 flex flex-col">
            {!isLocked || isConnecting ? (
              <ChatroomSkeleton />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {/* Empty space or decorative element for locked state */}
                <div className="opacity-10">
                  <Logo size={120} />
                </div>
              </div>
            )}

            {/* Join Overlay - Now contained within the messages area */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full mx-4 text-center">
                <h2 className="text-lg font-semibold mb-2">
                  {displayDetail?.roomname || "Chatroom"}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {displayDetail?.description ||
                    "Join the room to see messages and participate."}
                </p>

                {isLocked ||
                (passwordError &&
                  (passwordError.toLowerCase().includes("password") ||
                    passwordError.toLowerCase().includes("locked"))) ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                      <Lock size={16} />
                      <span className="text-sm font-medium">
                        This room is password protected
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showJoinPassword ? "text" : "password"}
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="Enter room password"
                        disabled={isConnecting}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleJoinChatroom()
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowJoinPassword(!showJoinPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 -mt-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showJoinPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showJoinPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-500 mb-2">
                        {passwordError}
                      </p>
                    )}
                    <div className="flex items-center justify-center space-x-3 mt-4">
                      <button
                        onClick={handleJoinChatroom}
                        disabled={isConnecting}
                        className={`px-4 py-2 rounded font-medium text-white transition-colors ${
                          !isConnecting
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-400 cursor-not-allowed"
                        }`}
                      >
                        {isConnecting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Connecting...
                          </div>
                        ) : (
                          "Enter Room"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          onBack();
                          navigate("/");
                        }}
                        className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm text-gray-500">
                      {isConnected
                        ? "Joining room..."
                        : "Connecting to service..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex isolate flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
        {/* Background Image with Opacity */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "url(/chatroom-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
          {isMobile && <Logo showText size={32} className="py-2" />}
          <div className="w-full flex justify-between items-center bg-neutral-200/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onBack();
                  navigate("/");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">
                  {displayDetail?.roomname || "Loading..."}
                </h1>
                <p className="text-xs text-gray-500">
                  {displayDetail?.participantCount !== undefined
                    ? `${displayDetail.participantCount} participants • connected`
                    : "connected"}
                </p>
              </div>
            </div>

            <ChatroomMenu
              onLeaveRoom={handleLeaveRoom}
              onRemoveParticipant={() => {}}
              onDeleteRoom={handleDeleteRoom}
              onEditRoom={() => setIsEditModalOpen(true)}
              isHost={isHost}
            />
          </div>
        </header>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative z-[1] overflow-x-hidden"
        >
          {messages.map((msg, index) => (
            <MessageDisplay
              key={msg.id || index}
              message={msg}
              onReply={(replyInfo) => setReplyingTo(replyInfo)}
              onReact={sendReaction}
              onEdit={(messageId, content) => setEditingMessage({ messageId, content })}
              onDelete={deleteMessage}
            />
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
          onEditMessage={handleEditMessage}
          isDisabled={!isConnected || !hasRoomKey}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
      <EditChatroomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        chatroomId={chatroomId || ""}
        initialRoomname={displayDetail?.roomname || ""}
        initialDescription={displayDetail?.description || ""}
      />
    </ProtectedRoute>
  );
};

export default ChatroomPage;
