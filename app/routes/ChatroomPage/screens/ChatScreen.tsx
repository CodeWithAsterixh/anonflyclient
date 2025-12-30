import React, { useRef } from "react";
import { ChevronDown } from "lucide-react";
import ChatroomMenu from "../../../../components/chatroomMenu";
import EditChatroomModal from "../../../../components/editChatroomModal";
import Logo from "../../../../components/logo";
import MessageDisplay from "../../../../components/messageDisplay";
import MessageInput from "../../../../components/messageInput";
import { TypingIndicator, type TypingUser } from "../../../../components/typingIndicator";
import ProtectedRoute from "../../../../components/protectedRoute";
import type { ChatroomDetail, Message } from "../../../../lib/types/chat";
import type { ReplyingTo, EditingMessage } from "../types";

interface ChatScreenProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  isHost: boolean;
  messages: Message[];
  typingUsers: TypingUser[];
  replyingTo: ReplyingTo | null;
  editingMessage: EditingMessage | null;
  showScrollButton: boolean;
  isEditModalOpen: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onNavigateHome: () => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onOpenEditModal: () => void;
  onCloseEditModal: () => void;
  onScroll: () => void;
  onScrollToBottom: () => void;
  onSendMessage: (content: string) => void;
  onEditMessage: (content: string) => void;
  onSetReplyingTo: (reply: ReplyingTo | null) => void;
  onSetEditingMessage: (edit: EditingMessage | null) => void;
  onDeleteMessage: (id: string) => void;
  onSendReaction: (id: string, emoji: any) => void;
  onEditSuccess: () => void;
  onTyping: (isTyping: boolean) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  isHost,
  messages,
  typingUsers,
  replyingTo,
  editingMessage,
  showScrollButton,
  isEditModalOpen,
  messagesContainerRef,
  messagesEndRef,
  onBack,
  onNavigateHome,
  onLeaveRoom,
  onDeleteRoom,
  onOpenEditModal,
  onCloseEditModal,
  onScroll,
  onScrollToBottom,
  onSendMessage,
  onEditMessage,
  onSetReplyingTo,
  onSetEditingMessage,
  onDeleteMessage,
  onSendReaction,
  onEditSuccess,
  onTyping,
}) => {
  const messagePortalRootRef = useRef<HTMLDivElement>(null);

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
                  onNavigateHome();
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
                        isConnected ? "online" : "connecting..."
                      }`
                    : isConnected
                    ? "online"
                    : "connecting..."}
                </p>
              </div>
            </div>

            <ChatroomMenu
              onLeaveRoom={onLeaveRoom}
              onRemoveParticipant={() => {}}
              onDeleteRoom={onDeleteRoom}
              onEditRoom={onOpenEditModal}
              isHost={isHost}
            />
          </div>
        </header>

        {/* message full viewer area */}
        <div
          ref={messagePortalRootRef}
          id="message-portal-root"
          className="absolute inset-0 z-[100] size-full pointer-events-none"
        />

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10"
        >
          {messages.map((msg) => (
            <MessageDisplay
              key={msg.id}
              message={msg}
              onReply={onSetReplyingTo}
              onEdit={(id, content) =>
                onSetEditingMessage({ messageId: id, content })
              }
              onDelete={onDeleteMessage}
              onReact={onSendReaction}
              portalRoot={messagePortalRootRef.current}
            />
          ))}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={onScrollToBottom}
            className="absolute bottom-24 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-20 animate-in fade-in zoom-in duration-200"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        )}

        {/* Input Area */}
        <MessageInput
          onSendMessage={onSendMessage}
          onEditMessage={onEditMessage}
          isDisabled={!isConnected}
          replyingTo={replyingTo}
          onCancelReply={() => onSetReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => onSetEditingMessage(null)}
          onTyping={onTyping}
        />

        <EditChatroomModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          chatroomId={displayDetail?.roomId || ""}
          initialRoomname={displayDetail?.roomname || ""}
          initialDescription={displayDetail?.description || ""}
          onSuccess={onEditSuccess}
        />
      </div>
    </ProtectedRoute>
  );
};

export default ChatScreen;
