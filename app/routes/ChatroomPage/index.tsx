import NoChatSelectedFallback from "../../../components/noChatSelectedFallback";
import { getAPIBaseURL } from "../../../lib/constants/api";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { useAuth } from "../../../hooks/useAuth/index";
import { useChatroom } from "../../../hooks/useChatroom/index";
import { useTyping } from "../../../components/typingIndicator";
import type { ChatroomDetail } from "../../../lib/types/chat";
import type { OutletContext, ReplyingTo, EditingMessage } from "./types";
import {
  ChatScreen,
  ConnectingScreen,
  ErrorScreen,
  JoinRoomScreen,
  JoinScreen,
  LoadingScreen,
  SecuringRoomScreen,
} from "./screens";

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
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(null);

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

  useEffect(() => {
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
    ws
  } = useChatroom(chatroomId, !chatroomDetail || chatroomDetail.isLocked);

  const { typingUsers, sendTypingStatus } = useTyping(chatroomId, ws);

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
    fetchChatroomDetails();
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
      <SecuringRoomScreen
        isMobile={isMobile}
        onBack={onBack}
        onNavigateHome={() => navigate("/")}
        displayDetail={displayDetail}
      />
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !token) {
    return (
      <JoinScreen
        onNavigateToLogin={() =>
          navigate(
            `/login?redirect_to=${encodeURIComponent(window.location.pathname)}`
          )
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
      <ErrorScreen
        error={error}
        onReconnect={reconnect}
        onNavigateHome={() => navigate("/")}
        onLogout={logout}
      />
    );
  }

  if (!chatroomId) {
    return <NoChatSelectedFallback />;
  }

  if (!isConnected && (!displayDetail || !displayDetail.isLocked)) {
    return <ConnectingScreen />;
  }

  if (!isJoined) {
    return (
      <JoinRoomScreen
        isMobile={isMobile}
        displayDetail={displayDetail}
        isConnected={isConnected}
        isSubmitting={isSubmitting}
        isHost={isHost}
        joinPassword={joinPassword}
        showJoinPassword={showJoinPassword}
        passwordError={passwordError}
        onBack={onBack}
        onNavigateHome={() => navigate("/")}
        onLeaveRoom={handleLeaveRoom}
        onDeleteRoom={handleDeleteRoom}
        onEditRoom={() => setIsEditModalOpen(true)}
        onSetJoinPassword={setJoinPassword}
        onToggleShowJoinPassword={() => setShowJoinPassword(!showJoinPassword)}
        onJoinChatroom={handleJoinChatroom}
      />
    );
  }

  return (
    <ChatScreen
      isMobile={isMobile}
      displayDetail={displayDetail}
      isConnected={isConnected}
      isHost={isHost}
      messages={messages}
      replyingTo={replyingTo}
      editingMessage={editingMessage}
      showScrollButton={showScrollButton}
      isEditModalOpen={isEditModalOpen}
      messagesContainerRef={messagesContainerRef}
      messagesEndRef={messagesEndRef}
      onBack={onBack}
      onNavigateHome={() => navigate("/")}
      onLeaveRoom={handleLeaveRoom}
      onDeleteRoom={handleDeleteRoom}
      onOpenEditModal={() => setIsEditModalOpen(true)}
      onCloseEditModal={() => setIsEditModalOpen(false)}
      onScroll={handleScroll}
      onScrollToBottom={scrollToBottom}
      onSendMessage={handleSendMessage}
      onEditMessage={handleEditMessage}
      onSetReplyingTo={setReplyingTo}
      onSetEditingMessage={setEditingMessage}
      onDeleteMessage={deleteMessage}
      onSendReaction={sendReaction}
      onEditSuccess={handleEditSuccess}
      onTyping={sendTypingStatus}
      typingUsers={typingUsers}
    />
  );
};

export default ChatroomPage;
