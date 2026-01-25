import React, { useRef, useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import MessageDisplay from "../../../../../components/messageDisplay";
import {
  TypingIndicator,
  type TypingUser,
} from "../../../../../components/typingIndicator";
import type { Message } from "../../../../../lib/types/chat";
import type { ReplyingTo, EditingMessage } from "../../types";

interface ChatMessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
  onScroll: () => void;
  onSetReplyingTo: (reply: ReplyingTo | null) => void;
  onSetEditingMessage: (edit: EditingMessage | null) => void;
  onDeleteMessage: (id: string) => void;
  onSendReaction: (id: string, emoji: any) => void;
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
  messagesContainerRef,
  messagesEndRef,
  messagePortalRootRef,
}) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);

  // If a new message arrives that isn't from pagination (i.e. length increased by 1 at the end), 
  // we should probably ensure it's visible. 
  // However, the original code had:
  // onSendMessage={(content) => { ... setVisibleCount((prev) => prev + 1); }}
  // We can replicate this by watching messages length or just exposing a way to increment visible count?
  // Actually, if we just rely on `messages.slice(-visibleCount)`, adding a message to the end 
  // effectively pushes the oldest visible message out if we don't increment visibleCount.
  // The original code incremented visibleCount on send.
  // Let's use a ref to track previous length to detect new messages.
  
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // New message added (likely sent or received)
      // We should increment visibleCount so the new message is shown without hiding the top one
      // IF we are at the bottom. But simpler is just to increment it.
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

  // Maintain scroll position after loading more messages
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
          portalRoot={messagePortalRootRef.current}
        />
      ))}
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
};
