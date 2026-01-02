import NoChatSelectedFallback from "../../../components/noChatSelectedFallback";
import { getAPIBaseURL } from "../../../lib/constants/api";
import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { useChatroom } from "../../../hooks/useChatroom/index";
import { useTheme } from "../../../hooks/useTheme/index";
import { useTyping } from "../../../components/typingIndicator";
import { Background } from "../../../components/background";
import AlertDialog from "../../../components/alertDialog";
import type { ChatroomDetail } from "../../../lib/types/chat";
import type { ReplyingTo, EditingMessage } from "./types";
import { ChatLayoutContext } from "../../contexts/ChatLayoutContext";
import {
  ChatScreen,
  ConnectingScreen,
  ErrorScreen,
  JoinRoomScreen,
  JoinScreen,
  LoadingScreen,
  SecuringRoomScreen,
} from "./screens";

import {
  removeParticipant,
} from "../../../lib/controllers/chatroomController";

/**
 * ChatroomPage component displays the messages within a specific chatroom,
 * allows users to send new messages, and handles joining/leaving the chatroom.
 * It integrates with the `useChatroom` hook for WebSocket communication.
 */
const ChatroomPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const context = useContext(ChatLayoutContext);

  if (!context) {
    throw new Error("ChatroomPage must be used within ChatLayoutContext");
  }

  const { user, token, isMobile, onBack, logout } = context;

  const [isHost, setIsHost] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [chatroomDetail, setChatroomDetails] = useState<ChatroomDetail | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

  const [editingMessage, setEditingMessage] = useState<EditingMessage | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "error" | "success";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const showAlertDialog = (
    title: string,
    message: string,
    type: "alert" | "confirm" | "error" | "success" = "alert",
    onConfirm?: () => void
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const fetchChatroomDetails = async () => {
    if (!chatroomId || !token || !user) return;

    try {
      const response = await fetch(
        `${getAPIBaseURL()}/chatroom/${encodeURIComponent(chatroomId)}/details`,
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
    isRemoved,
    setIsRemoved,
    hasRoomKey,
    error,
    reconnect,
    clearError,
    currentChatroomId,
    ws
  } = useChatroom(chatroomId, !chatroomDetail || chatroomDetail.isLocked);

  useEffect(() => {
    if (isRemoved) {
      setAlertDialog({
        isOpen: true,
        title: "Removed from Room",
        message: "You have been removed from the room by the host.",
        type: "alert",
        confirmText: "Go Home",
        onConfirm: () => {
          setIsRemoved(false);
          navigate("/");
        }
      });
    }
  }, [isRemoved, setIsRemoved, navigate]);

  const { typingUsers, sendTypingStatus } = useTyping(chatroomId, ws);
  const { theme } = useTheme();

  // Sync isHost and isCreator with SSE updates
  useEffect(() => {
    if (sseChatroomDetail?.hostAid && user) {
      setIsHost(sseChatroomDetail.hostAid === user.userId);
    }
    if (sseChatroomDetail?.creatorAid && user) {
      setIsCreator(sseChatroomDetail.creatorAid === user.userId);
    }
  }, [sseChatroomDetail, user]);

  const displayDetail = sseChatroomDetail || chatroomDetail;

  const lastJoinedRoomRef = useRef<string | null>(null);
  const isJoiningRef = useRef<boolean>(false);

  // Reset joining state when room ID changes
  useEffect(() => {
    isJoiningRef.current = false;
    lastJoinedRoomRef.current = null;
  }, [chatroomId]);

  // Auto-join if room is not locked and we are connected
  useEffect(() => {
    if (!isConnected || !chatroomId || !displayDetail || isJoined || isRemoved) {
      return;
    }

    // If we are already in the process of joining this specific room, stop
    if (isJoiningRef.current || lastJoinedRoomRef.current === chatroomId) {
      return;
    }

    const performJoin = async (password?: string) => {
      try {
        isJoiningRef.current = true;
        lastJoinedRoomRef.current = chatroomId;
        await joinChatroom(chatroomId, password);
      } catch (err) {
        console.error("[ChatroomPage] Join failed:", err);
        isJoiningRef.current = false;
        lastJoinedRoomRef.current = null;
      }
    };

    if (!displayDetail.isLocked) {
      console.log(`[ChatroomPage] Auto-joining room: ${chatroomId}`);
      performJoin();
    } else if (isSubmitting && joinPassword) {
      console.log(`[ChatroomPage] Joining locked room with password: ${chatroomId}`);
      performJoin(joinPassword);
    }
  }, [
    isConnected,
    chatroomId,
    displayDetail?.isLocked,
    isJoined,
    isRemoved,
    joinChatroom,
    joinPassword,
    isSubmitting,
  ]);

  // Reset joining lock on errors so user can try again
  useEffect(() => {
    if (error) {
      isJoiningRef.current = false;
      lastJoinedRoomRef.current = null;
    }
  }, [error]);

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

  // Graceful exit: Only leave if we are actually unmounting or changing to a different room
  const leaveRoomRef = useRef(leaveChatroom);
  useEffect(() => {
    leaveRoomRef.current = leaveChatroom;
  }, [leaveChatroom]);

  useEffect(() => {
    const currentRoomOnMount = chatroomId;
    return () => {
      // Only call leave if we are unmounting or if the URL chatroomId has changed
      if (currentRoomOnMount) {
        leaveRoomRef.current();
      }
    };
  }, [chatroomId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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

    showAlertDialog(
      "Delete Chatroom",
      "Are you sure you want to delete this chatroom? This action cannot be undone.",
      "confirm",
      async () => {
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
            showAlertDialog(
              "Success",
              "Chatroom deleted successfully!",
              "success",
              () => navigate("/")
            );
          } else {
            const errorData = await response.json();
            showAlertDialog(
              "Error",
              `Failed to delete chatroom: ${errorData.message}`,
              "error"
            );
          }
        } catch (error) {
          showAlertDialog(
            "Error",
            "An error occurred while deleting the chatroom.",
            "error"
          );
        }
      }
    );
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

  const handleRemoveParticipant = async (userAid: string) => {
    if (!chatroomId) return;
    try {
      await removeParticipant(chatroomId, userAid);
      showAlertDialog(
        "Success",
        "Participant removed successfully",
        "success"
      );
    } catch (error: any) {
      showAlertDialog(
        "Error",
        error.message || "Failed to remove participant",
        "error"
      );
    }
  };

  if (isJoined && !hasRoomKey) {
    return (
      <Background mode={theme}>
        <SecuringRoomScreen
          isMobile={isMobile}
          onBack={onBack}
          onNavigateHome={() => navigate("/")}
          displayDetail={displayDetail}
        />
      </Background>
    );
  }

  if (!user || !token) {
    return (
      <Background mode={theme}>
        <JoinScreen
          onNavigateToLogin={() =>
            navigate(
              `/login?redirect_to=${encodeURIComponent(window.location.pathname)}`
            )
          }
        />
      </Background>
    );
  }

  if (
    error &&
    !error.toLowerCase().includes("password") &&
    !error.toLowerCase().includes("locked")
  ) {
    return (
      <Background mode={theme}>
        <ErrorScreen
          error={error}
          onReconnect={reconnect}
          onNavigateHome={() => navigate("/")}
          onLogout={logout}
        />
      </Background>
    );
  }

  if (!chatroomId) {
    return (
      <Background mode={theme}>
        <NoChatSelectedFallback />
      </Background>
    );
  }

  if (!isConnected && (!displayDetail || !displayDetail.isLocked)) {
    return (
      <Background mode={theme}>
        <ConnectingScreen />
      </Background>
    );
  }

  if (!isJoined) {
    return (
      <Background mode={theme}>
        <JoinRoomScreen
          isMobile={isMobile}
          displayDetail={displayDetail}
          isConnected={isConnected}
          isSubmitting={isSubmitting}
          isHost={isHost}
          isCreator={isCreator}
          joinPassword={joinPassword}
          passwordError={passwordError || (error?.toLowerCase().includes("password") || error?.toLowerCase().includes("locked") ? error : null)}
          onBack={onBack}
          onNavigateHome={() => navigate("/")}
          onLeaveRoom={handleLeaveRoom}
          onDeleteRoom={handleDeleteRoom}
          onEditRoom={() => setIsEditModalOpen(true)}
          onSetJoinPassword={setJoinPassword}
          onJoinChatroom={handleJoinChatroom}
        />
      </Background>
    );
  }

  return (
    <Background mode={theme} className="h-full">
      <ChatScreen
        isMobile={isMobile}
        displayDetail={displayDetail}
        isConnected={isConnected}
        isHost={isHost}
        isCreator={isCreator}
        messages={messages}
        participants={Array.from(participants.values())}
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
        onRemoveParticipant={handleRemoveParticipant}
      />
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => {
          if (alertDialog.onCancel) {
            alertDialog.onCancel();
          }
          setAlertDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onConfirm={alertDialog.onConfirm}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        confirmText={alertDialog.confirmText}
        cancelText={alertDialog.cancelText}
      />
    </Background>
  );
};

export default ChatroomPage;
