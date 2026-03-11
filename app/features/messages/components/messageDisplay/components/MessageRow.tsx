import React from "react";
import Avatar from "~/shared/components/ui/avatar";
import type { Message } from "~/shared/types/chat";
import { MessageBubble } from "./MessageBubble";
import { type Reaction } from "./ReactionList";

interface MessageRowProps {
  message: Message;
  isCurrentUser: boolean | null;
  avatarUrl: string;
  isReplyToMe: boolean;
  scrollToRepliedMessage: (id: string) => void;
  isFocused?: boolean;
  showReactions?: boolean;
  swipeOffset?: number;
  onDoubleClick?: () => void;
  bubbleRef?: React.RefObject<HTMLDivElement | null>;
  isPreview?: boolean;
  onShowReactionDetails?: (reactions: Reaction[], messageId: string) => void;
  onContextMenu?: (e: React.MouseEvent, message: Message) => void;
}

export const MessageRow: React.FC<MessageRowProps> = ({
  message,
  isCurrentUser,
  avatarUrl,
  isReplyToMe,
  scrollToRepliedMessage,
  isFocused = false,
  showReactions = false,
  swipeOffset = 0,
  onDoubleClick,
  bubbleRef,
  isPreview = false,
  onShowReactionDetails,
  onContextMenu,
}) => {
  const getBubbleTransform = () => {
    if (isPreview || showReactions) return "none";
    return `translateX(${swipeOffset}px)`;
  };

  const getBubbleClassName = () => {
    const baseClasses = `min-w-[2rem] w-fit line-break max-w-[70%] md:max-w-[50%] px-2 py-2 rounded-2xl shadow-sm relative transition-all duration-300`;
    const alignmentClass = isCurrentUser ? "rounded-br-none" : "rounded-bl-none";
    const colorClass = isCurrentUser
      ? "bg-primary text-white"
      : "bg-white/5 text-foreground";

    let stateClass = "";
    if (isPreview) {
      stateClass = "shadow-2xl ring-4 ring-black/10 dark:ring-white/10 min-w-[5rem]";
    } else if (showReactions) {
      stateClass = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-[90%] md:max-w-[60%] w-auto shadow-2xl ring-4 ring-black/10 dark:ring-white/10 scale-110";
    } else if (isFocused) {
      stateClass = "shadow-2xl ring-4 ring-black/10 dark:ring-white/10";
    }

    return `${baseClasses} ${alignmentClass} ${colorClass} ${stateClass}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDoubleClick?.();
    }
  };

  return (
    <div
      className={`w-full flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"
        } ${isPreview ? "" : "w-full"}`}
    >
      {/* Avatar */}
      {!isCurrentUser && <div
        className={`shrink-0 mb-1 transition-opacity duration-300 ${showReactions && !isPreview ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
        <Avatar
          name={message.senderUsername}
          userAid={message.senderAid}
          size="sm"
          className="shadow-sm border border-border"
        />
      </div>}

      <button
        type="button"
        ref={bubbleRef as any}
        onDoubleClick={onDoubleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Message from ${message.senderUsername}`}
        style={{
          transform: getBubbleTransform(),
        }}
        className={`${getBubbleClassName()} text-left border-none cursor-default`}
      >
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          isFocused={isFocused}
          onShowReactionDetails={onShowReactionDetails}
          onContextMenu={onContextMenu}
        />
      </button>
    </div>
  );
};
