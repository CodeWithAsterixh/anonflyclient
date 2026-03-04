import NoChatSelectedFallback from "~/features/messages/components/noChatSelectedFallback";
import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useParams, type MetaFunction } from "react-router";
import {
  useChatroom,
  useAutoJoin,
  useParticipantActions,
  useRoomActions,
  useChatroomAccess,
  useChatroomLifecycle,
  useChatroomMessaging,
  useTyping,
} from "~/features/messages/hooks";
import { useTheme, useAlertDialog } from "~/shared/hooks";
import { Background } from "~/shared/components/background";
import { cryptSessionStorage } from "~/shared/utils/cryptSessionStorage";
import AlertDialog from "~/shared/components/alertDialog";
import { ChatLayoutContext } from "~/shell/context/ChatLayoutContext";
import {
  ChatScreen,
  ConnectingScreen,
  ErrorScreen,
  JoinRoomScreen,
  JoinScreen,
  LoadingScreen,
  SecuringRoomScreen,
  AccessDeniedScreen,
} from "./screens";

export const meta: MetaFunction = ({ params }) => {
  const chatroomId = params.chatroomId;
  return [
    { title: `Chatroom ${chatroomId || ""} | Anonfly` },
    {
      name: "description",
      content:
        "Join this private, encrypted chatroom on Anonfly. No registration, no logs, just secure conversation.",
    },
    { property: "og:title", content: `Secure Chatroom | Anonfly` },
    {
      property: "og:description",
      content:
        "Join this private, encrypted chatroom. Secure and anonymous conversation.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

const ChatroomPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const context = useContext(ChatLayoutContext);

  if (!context) {
    throw new Error("ChatroomPage must be used within ChatLayoutContext");
  }

  const { user, token, isMobile, onBack, logout } = context;

  const {
    accessState,
    chatroomDetail,
    isHost,
    setIsHost,
    isCreator,
    setIsCreator,
    isAlreadyParticipant,
    fetchChatroomDetails,
  } = useChatroomAccess(chatroomId, token, user, logout);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storedPassword = chatroomId
    ? cryptSessionStorage.getItem(`room_access_${chatroomId}`, chatroomId)
    : null;
  const storedToken = chatroomId
    ? cryptSessionStorage.getItem(`room_token_${chatroomId}`, chatroomId)
    : null;
  const hasStoredCredentials = !!(storedToken || storedPassword);

  const shouldDeferConnection =
    accessState.status !== "granted" ||
    (!hasStoredCredentials &&
      (!chatroomDetail ||
        (chatroomDetail.isLocked && !isCreator && !isAlreadyParticipant)));

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
    ws,
  } = useChatroom(chatroomId, shouldDeferConnection);

  const { alertDialog, showAlertDialog, closeAlertDialog } = useAlertDialog();

  useChatroomLifecycle({
    chatroomId,
    isRemoved,
    setIsRemoved,
    sseChatroomDetail,
    user,
    setIsHost,
    setIsCreator,
    leaveChatroom,
    showAlertDialog,
  });

  const {
    messagesContainerRef,
    messagesEndRef,
    showScrollButton,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    handleEditMessage,
  } = useChatroomMessaging(messages, sendMessage, editMessage);

  const { typingUsers, sendTypingStatus } = useTyping(chatroomId, ws);
  const { theme } = useTheme();

  const displayDetail = sseChatroomDetail || chatroomDetail;
  const lastJoinedRoomRef = useRef<string | null>(null);
  const isJoiningRef = useRef<boolean>(false);

  useEffect(() => {
    isJoiningRef.current = false;
    lastJoinedRoomRef.current = null;
  }, [chatroomId]);

  useEffect(() => {
    if (isJoined && chatroomId) {
      cryptSessionStorage.removeItem(`room_access_${chatroomId}`);
      cryptSessionStorage.removeItem(`room_token_${chatroomId}`);
      cryptSessionStorage.removeItem(`room_join_auth_${chatroomId}`);
    }
  }, [isJoined, chatroomId]);

  useAutoJoin({
    chatroomId,
    isConnected,
    isJoined,
    isRemoved,
    displayDetail,
    hasStoredCredentials,
    isSubmitting,
    joinPassword,
    isCreator,
    isAlreadyParticipant,
    joinChatroom,
    isJoiningRef,
    lastJoinedRoomRef,
  });

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

  const {
    handleRemoveParticipant,
    handleBanParticipant,
    handleUnbanParticipant,
  } = useParticipantActions(chatroomId, showAlertDialog);
  const { handleGenerateShareLink, handleDeleteRoom } = useRoomActions(
    chatroomId,
    token,
    showAlertDialog,
    navigate
  );

  const handleLeaveRoom = () => {
    leaveChatroom();
    navigate("/");
  };

  const handleJoinChatroom = async () => {
    if (!chatroomId) return;
    setPasswordError(null);
    setIsSubmitting(true);
    try {
      if (displayDetail?.isLocked && !isConnected) {
        reconnect();
      } else {
        await joinChatroom(chatroomId, joinPassword);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to join chatroom");
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (accessState.status === "checking") return <LoadingScreen />;

    if (accessState.status === "denied") {
      return (
        <AccessDeniedScreen
          message={accessState.message}
          onNavigateHome={() => navigate("/")}
          onNavigateToLogin={() =>
            navigate(
              `/login?redirect_to=${encodeURIComponent(
                globalThis.window.location.pathname
              )}`
            )
          }
        />
      );
    }

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

    if (!user || !token) {
      return (
        <JoinScreen
          onNavigateToLogin={() =>
            navigate(
              `/login?redirect_to=${encodeURIComponent(
                globalThis.window.location.pathname
              )}`
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

    if (!chatroomId) return <NoChatSelectedFallback />;

    if (!isConnected && !displayDetail?.isLocked) return <ConnectingScreen />;

    if (!isJoined) {
      return (
        <JoinRoomScreen
          isMobile={isMobile}
          displayDetail={displayDetail}
          isConnected={isConnected}
          isSubmitting={isSubmitting}
          isHost={isHost}
          isCreator={isCreator}
          isAlreadyParticipant={isAlreadyParticipant}
          hasStoredCredentials={hasStoredCredentials}
          joinPassword={joinPassword}
          passwordError={
            passwordError ||
            (error?.toLowerCase().includes("password") ||
              error?.toLowerCase().includes("locked")
              ? error
              : null)
          }
          onBack={onBack}
          onNavigateHome={() => navigate("/")}
          onLeaveRoom={handleLeaveRoom}
          onDeleteRoom={handleDeleteRoom}
          onEditRoom={() => setIsEditModalOpen(true)}
          onGenerateShareLink={handleGenerateShareLink}
          onSetJoinPassword={setJoinPassword}
          onJoinChatroom={handleJoinChatroom}
          onRemoveParticipant={handleRemoveParticipant}
          onBanParticipant={handleBanParticipant}
          onUnbanParticipant={handleUnbanParticipant}
        />
      );
    }

    return (
      <ChatScreen
        isMobile={isMobile}
        displayDetail={displayDetail}
        isConnected={isConnected}
        isHost={isHost}
        currentUserId={user?.userId}
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
        onGenerateShareLink={handleGenerateShareLink}
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
        onEditSuccess={fetchChatroomDetails}
        onTyping={sendTypingStatus}
        typingUsers={typingUsers}
        onRemoveParticipant={handleRemoveParticipant}
        onBanParticipant={handleBanParticipant}
        onUnbanParticipant={handleUnbanParticipant}
      />
    );
  };

  return (
    <Background mode={theme} className="h-full">
      {renderContent()}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={closeAlertDialog}
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
