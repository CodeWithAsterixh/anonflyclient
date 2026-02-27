import React, { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import EditChatroomModal from "../../../../components/editChatroomModal";
import MessageInput from "../../../../components/messageInput";
import type {
  ChatroomDetail,
  Message,
  Participant,
} from "../../../../lib/types/chat";
import type { TypingUser } from "../../../../components/typingIndicator";
import type { ReplyingTo, EditingMessage } from "../types";
import { ChatHeader } from "./parts/ChatHeader";
import { ChatMessageList } from "./parts/ChatMessageList";
import { ChatSidebarArea } from "./parts/ChatSidebarArea";
import { ReactionDetailsDrawer } from "../../../../components/messageDisplay/components/ReactionDetailsDrawer";
import { type Reaction } from "../../../../components/messageDisplay/components/ReactionList";

interface ChatScreenProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  isHost: boolean;
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
  onBanParticipant: (userAid: string, reason?: string) => Promise<void>;
  onUnbanParticipant: (userAid: string) => Promise<void>;
  onGenerateShareLink: () => Promise<any>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  isHost,
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
  onBanParticipant,
  onUnbanParticipant,
  onGenerateShareLink,
}) => {
  const messagePortalRootRef = useRef<HTMLDivElement>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isReactionDrawerOpen, setIsReactionDrawerOpen] = useState(false);
  const [reactionDrawerMessageId, setReactionDrawerMessageId] = useState<string | null>(null);

  const handleShowReactionDetails = (reactions: Reaction[], messageId?: string) => {
    setReactionDrawerMessageId(messageId || null);
    setIsReactionDrawerOpen(true);
  };

  const currentReactions = useMemo(() => {
    if (!reactionDrawerMessageId) return [];
    const msg = messages.find(m => m.id === reactionDrawerMessageId);
    return msg?.reactions || [];
  }, [messages, reactionDrawerMessageId]);

  return (
    <div className="isolate flex h-dvh bg-transparent relative overflow-hidden transition-colors duration-300 w-full">
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <ChatHeader
          isMobile={isMobile}
          displayDetail={displayDetail}
          isConnected={isConnected}
          participants={participants}
          isOptionsOpen={isOptionsOpen}
          setIsOptionsOpen={setIsOptionsOpen}
          onBack={onBack}
          onNavigateHome={onNavigateHome}
          onLeaveRoom={onLeaveRoom}
        />

        {/* message full viewer area */}
        <div
          ref={messagePortalRootRef}
          id="message-portal-root"
          className="absolute inset-0 z-100 size-full pointer-events-none"
        />

        <ChatMessageList
          messages={messages}
          typingUsers={typingUsers}
          onScroll={onScroll}
          onSetReplyingTo={onSetReplyingTo}
          onSetEditingMessage={onSetEditingMessage}
          onDeleteMessage={onDeleteMessage}
          onSendReaction={onSendReaction}
          onShowReactionDetails={handleShowReactionDetails}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          messagePortalRootRef={messagePortalRootRef}
        />

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={onScrollToBottom}
            className="absolute bottom-24 right-6 p-3 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-all z-20 animate-in fade-in zoom-in duration-200 shadow-primary/20"
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
      </div>

      <ChatSidebarArea
        isMobile={isMobile}
        isOptionsOpen={isOptionsOpen}
        setIsOptionsOpen={setIsOptionsOpen}
        participants={participants}
        isHost={isHost}
        displayDetail={displayDetail}
        currentUserId={currentUserId}
        isConnected={isConnected}
        onRemoveParticipant={onRemoveParticipant}
        onBanParticipant={onBanParticipant}
        onUnbanParticipant={onUnbanParticipant}
        onLeaveRoom={onLeaveRoom}
        onOpenEditModal={onOpenEditModal}
        onDeleteRoom={onDeleteRoom}
        onGenerateShareLink={onGenerateShareLink}
      />

      <EditChatroomModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        chatroomId={displayDetail?.roomId || ""}
        initialRoomname={displayDetail?.roomname || ""}
        initialDescription={displayDetail?.description || ""}
        onSuccess={onEditSuccess}
      />

      <ReactionDetailsDrawer 
        isOpen={isReactionDrawerOpen}
        onClose={() => {
          setIsReactionDrawerOpen(false);
          setReactionDrawerMessageId(null);
        }}
        reactions={currentReactions}
        currentUserId={currentUserId}
        onUnreact={(emojiId) => {
          if (reactionDrawerMessageId) {
            onSendReaction(reactionDrawerMessageId, { id: emojiId });
          }
        }}
      />
    </div>
  );
};

export default ChatScreen;
