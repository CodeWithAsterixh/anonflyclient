import React, { useRef, useState, useMemo, useEffect } from "react";
import { ChevronDown, Loader2, LogOutIcon, Settings } from "lucide-react";
import EditChatroomModal from "../../../../components/editChatroomModal";
import ChatroomSidebar from "../../../../components/chatroomSidebar";
import Drawer from "../../../../components/ui/drawer/Drawer";
import Logo from "../../../../components/logo";
import MessageDisplay from "../../../../components/messageDisplay";
import MessageInput from "../../../../components/messageInput";
import {
  TypingIndicator,
  type TypingUser,
} from "../../../../components/typingIndicator";
import type {
  ChatroomDetail,
  Message,
  Participant,
} from "../../../../lib/types/chat";
import type { ReplyingTo, EditingMessage } from "../types";

interface ChatScreenProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  isHost: boolean;
  isCreator: boolean;
  currentUserId?: string | null;
  messages: Message[];
  participants: Participant[];
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
  onRemoveParticipant: (userAid: string) => Promise<void>;
  onGenerateShareLink: () => Promise<void>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  isHost,
  isCreator,
  currentUserId,
  messages,
  participants,
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
  onRemoveParticipant,
  onGenerateShareLink,
}) => {
  const messagePortalRootRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);

  const visibleMessages = useMemo(() => {
    // Show the LAST N messages
    return messages.slice(-visibleCount);
  }, [messages, visibleCount]);

  const hasMore = messages.length > visibleCount;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll();

    const container = e.currentTarget;
    if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  const loadMore = () => {
    if (messagesContainerRef.current) {
      prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
    }

    setIsLoadingMore(true);
    // Simulate a small delay for smoother feel or just update immediately
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, messages.length));
      setIsLoadingMore(false);
    }, 500);
  };

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      messagesContainerRef.current.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [visibleMessages]);

  return (
    <div className="flex h-[100dvh] bg-transparent relative overflow-hidden transition-colors duration-300 w-full">
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
          {isMobile && <Logo showText size={32} className="py-2" />}
          <div className="w-full flex justify-between items-center bg-neutral-200/30 dark:bg-gray-800/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onBack();
                  onNavigateHome();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              >
                <ChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {displayDetail?.roomname || "Loading..."}
                </h1>
                <button
                  onClick={() => setIsOptionsOpen(true)}
                  className={`text-xs text-gray-500 dark:text-gray-400 transition-colors text-left hover:text-blue-500`}
                >
                  {participants.length} participant
                  {participants.length !== 1 ? "s" : ""} •{" "}
                  {isConnected ? (
                    <span className="text-green-500 dark:text-green-400 font-medium">
                      connected
                    </span>
                  ) : (
                    "connecting..."
                  )}
                  {displayDetail?.creatorAid && (
                    <>
                      {" • "}
                      <span className={`font-medium ${displayDetail.isCreatorOnline ? 'text-blue-500' : 'text-gray-400'}`}>
                        creator {displayDetail.isCreatorOnline ? 'online' : 'offline'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="w-fit flex gap-2 items-center justify-end">
              <button
                onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                className={`p-2 rounded-full transition-all ${
                  isOptionsOpen
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title="Room Options"
              >
                <Settings size={20} />
              </button>

              {isMobile ? (
                <button
                  onClick={onLeaveRoom}
                  className={`p-2 rounded-full transition-all text-red-500 hover:bg-red-100 dark:hover:bg-red-800`}
                  title="Leave Room"
                >
                  <LogOutIcon size={20} />
                </button>
              ) : (
                !isOptionsOpen && (
                  <button
                    onClick={onLeaveRoom}
                    className={`p-2 rounded-full transition-all text-red-500 hover:bg-red-100 dark:hover:bg-red-800`}
                    title="Leave Room"
                  >
                    <LogOutIcon size={20} />
                  </button>
                )
              )}
            </div>
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
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scroll-smooth"
        >
          {hasMore && (
            <div className="flex justify-center py-2">
              {isLoadingMore ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              ) : (
                <button
                  onClick={loadMore}
                  className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Load older messages
                </button>
              )}
            </div>
          )}

          {visibleMessages.map((msg) => (
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
          onSendMessage={(content) => {
            onSendMessage(content);
            setVisibleCount((prev) => prev + 1); // Ensure new message is visible
          }}
          onEditMessage={onEditMessage}
          isDisabled={!isConnected}
          replyingTo={replyingTo}
          onCancelReply={() => onSetReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => onSetEditingMessage(null)}
          onTyping={onTyping}
        />
      </div>

      {!isMobile && (
        <>
          {/* Backdrop for screens between 768px and 1024px */}
          <div 
            className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[40] lg:hidden transition-opacity duration-300 ${
              isOptionsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsOptionsOpen(false)}
          />
          <div 
            className={`z-[50] lg:z-auto transition-all duration-300 ease-in-out absolute right-0 top-0 h-full lg:relative lg:h-auto overflow-hidden ${
              isOptionsOpen 
                ? "translate-x-0 w-80 opacity-100 shadow-2xl lg:shadow-none" 
                : "translate-x-full lg:translate-x-0 w-0 lg:w-0 opacity-0"
            }`}
          >
            <div className="w-80 h-full">
              <ChatroomSidebar
                participants={participants}
                isHost={isHost}
                creatorAid={displayDetail?.creatorAid || ""}
                hostAid={displayDetail?.hostAid || ""}
                currentUserId={currentUserId}
                roomName={displayDetail?.roomname || ""}
                roomDescription={displayDetail?.description}
                allowedFeatures={displayDetail?.allowedFeatures}
                onRemoveParticipant={onRemoveParticipant}
                onLeaveRoom={onLeaveRoom}
                onEditRoom={onOpenEditModal}
                onDeleteRoom={onDeleteRoom}
                onGenerateShareLink={onGenerateShareLink}
                isConnected={isConnected}
              />
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <Drawer
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          side="bottom"
          height="95dvh"
        >
          <Drawer.Header
            title="Room Options"
            onClose={() => setIsOptionsOpen(false)}
          />
          <Drawer.Content className="p-0">
            <ChatroomSidebar
              participants={participants}
              isHost={isHost}
              hostAid={displayDetail?.hostAid || ""}
              creatorAid={displayDetail?.creatorAid || ""}
              currentUserId={currentUserId}
              roomName={displayDetail?.roomname || ""}
              roomDescription={displayDetail?.description}
              allowedFeatures={displayDetail?.allowedFeatures}
              onRemoveParticipant={onRemoveParticipant}
              onLeaveRoom={onLeaveRoom}
              onEditRoom={onOpenEditModal}
              onDeleteRoom={onDeleteRoom}
              onGenerateShareLink={onGenerateShareLink}
              isConnected={isConnected}
              hideHeader={true}
            />
          </Drawer.Content>
        </Drawer>
      )}

      <EditChatroomModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        chatroomId={displayDetail?.roomId || ""}
        initialRoomname={displayDetail?.roomname || ""}
        initialDescription={displayDetail?.description || ""}
        onSuccess={onEditSuccess}
      />
    </div>
  );
};

export default ChatScreen;
