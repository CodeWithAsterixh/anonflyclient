import React, { useRef, useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { MessageDisplay } from "~/features/messages/components/messageDisplay";
import { type Reaction } from "~/features/messages/components/messageDisplay/components/ReactionList";
import {
  TypingIndicator,
  type TypingUser,
} from "~/features/messages/components/typingIndicator";
import type { Message } from "~/shared/types/chat";
import type { ReplyingTo, EditingMessage } from "../../types";
import { allEmojis, type Emoji } from "~/shared/assets/emojis";

interface ChatMessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
  onScroll: () => void;
  onSetReplyingTo: (reply: ReplyingTo | null) => void;
  onSetEditingMessage: (edit: EditingMessage | null) => void;
  onDeleteMessage: (id: string) => void;
  onSendReaction: (id: string, emoji: Emoji) => void;
  onShowReactionDetails?: (reactions: Reaction[], messageId: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messagePortalRootRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  typingUsers,
  onScroll,
  onSetReplyingTo,
  onSetEditingMessage,
  onDeleteMessage,
  onSendReaction,
  onShowReactionDetails,
  messagesContainerRef,
  messagesEndRef,
  messagePortalRootRef,
}) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      setVisibleCount((prev) => prev + (messages.length - prevMessagesLengthRef.current));
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);


  const visibleMessages = useMemo(() => {
    return messages.slice(-visibleCount);
  }, [messages, visibleCount]);

  const hasMore = messages.length > visibleCount;

  const loadMore = () => {
    if (messagesContainerRef.current) {
      prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
    }

    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, messages.length));
      setIsLoadingMore(false);
    }, 500);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll();

    const container = e.currentTarget;
    if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMore();
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current && prevScrollHeightRef.current > 0) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      messagesContainerRef.current.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [visibleMessages, messagesContainerRef]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Message list"
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          {isLoadingMore ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <button
              onClick={loadMore}
              className="text-xs text-muted hover:text-primary transition-colors"
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
          onShowReactionDetails={(reactions) => onShowReactionDetails?.(reactions, msg.id || "")}
          portalRoot={messagePortalRootRef.current}
        />
      ))}
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
};
