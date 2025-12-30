import React from "react";
import { type Message } from "../../../lib/types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageRowProps {
  message: Message;
  isCurrentUser: boolean|null;
  avatarUrl: string;
  bubbleColors: { primary: string; text: string };
  isReplyToMe: boolean;
  scrollToRepliedMessage: (id: string) => void;
  isFocused?: boolean;
  showReactions?: boolean;
  swipeOffset?: number;
  onDoubleClick?: () => void;
  bubbleRef?: React.RefObject<HTMLDivElement | null>;
  isPreview?: boolean;
}

export const MessageRow: React.FC<MessageRowProps> = ({
  message,
  isCurrentUser,
  avatarUrl,
  bubbleColors,
  isReplyToMe,
  scrollToRepliedMessage,
  isFocused=false,
  showReactions=false,
  swipeOffset = 0,
  onDoubleClick,
  bubbleRef,
  isPreview = false,
}) => {
  return (
    <div
      className={`w-full flex items-end gap-2 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      } ${isPreview ? "" : "w-full"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 mb-1 transition-opacity duration-300 ${
          showReactions && !isPreview ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <img
          src={avatarUrl}
          alt={message.senderUsername}
          className="w-8 h-8 rounded-full shadow-sm border border-gray-100 dark:border-gray-800"
        />
      </div>

      <div
        ref={bubbleRef}
        onDoubleClick={onDoubleClick}
        style={{
          backgroundColor: bubbleColors.primary,
          color: bubbleColors.text,
          transform: isPreview ? "none" : showReactions ? "none" : `translateX(${swipeOffset}px)`,
        }}
        className={`min-w-[2rem] w-fit line-break max-w-[70%] md:max-w-[50%] px-2 py-2 rounded-2xl shadow-sm relative transition-all duration-300 ${
          isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
        } ${
          isPreview
            ? "shadow-2xl ring-4 ring-black/10 dark:ring-white/10 min-w-[5rem]"
            : showReactions
            ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-[90%] md:max-w-[60%] w-auto shadow-2xl ring-4 ring-black/10 dark:ring-white/10 scale-110"
            : isFocused
            ? "shadow-2xl ring-4 ring-black/10 dark:ring-white/10"
            : ""
        }`}
      >
        <MessageBubble
          message={message}
          isCurrentUser={isCurrentUser}
          bubbleColors={bubbleColors}
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          isFocused={isFocused}
        />
      </div>
    </div>
  );
};
