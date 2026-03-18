import { Loader2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageDisplay } from "~/features/messages/components/messageDisplay";
import { type Reaction } from "~/features/messages/components/messageDisplay/components/ReactionList";
import {
  TypingIndicator,
  type TypingUser,
} from "~/features/messages/components/typingIndicator";
import { type Emoji } from "~/shared/assets/emojis";
import type { Message } from "~/shared/types/chat";
import { formatMessageDate, isSameDay } from "~/shared/utils/dateUtils";
import type { EditingMessage, ReplyingTo } from "../../types";

function msgDayString(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
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

  const messagesWithDividers = useMemo(() => {
    const result: (Message | { type: 'dateDivider'; date: string; id: string })[] = [];
    let lastDate: Date | null = null;

    visibleMessages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp);
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        result.push({
          type: 'dateDivider',
          date: formatMessageDate(msgDate),
          id: `date-divider-${msgDayString(msgDate)}`
        });
        lastDate = msgDate;
      }
      result.push(msg);
    });

    return result;
  }, [visibleMessages]);



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

      {messagesWithDividers.map((item) => {
        if ('type' in item && item.type === 'dateDivider') {
          return (
            <div key={item.id} className="flex justify-center my-6">
              <span className="px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-medium text-muted uppercase tracking-widest shadow-lg">
                {item.date}
              </span>
            </div>
          );
        }

        const msg = item;
        return (
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
        );
      })}
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
};
