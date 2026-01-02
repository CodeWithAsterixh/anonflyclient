import React from "react";
import { ShieldCheck } from "lucide-react";
import { type Message } from "../../../lib/types/chat";
import ReactionList from "./ReactionList";
import { formatMessage } from "../../../lib/helpers/markdown";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean | null;
  bubbleColors: { primary: string; text: string };
  isReplyToMe: boolean;
  scrollToRepliedMessage: (id: string) => void;
  isFocused?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  bubbleColors,
  isReplyToMe,
  scrollToRepliedMessage,
  isFocused,
}) => {
  return (
    <>
      {/* Reply Preview in Bubble */}
      {message.replyTo && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            scrollToRepliedMessage(message.replyTo!.messageId);
          }}
          className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border-l-4 border-black/20 dark:border-white/20 text-xs cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
        >
          <p className="font-bold opacity-70 truncate">
            {isReplyToMe ? "You" : message.replyTo.senderUsername || "Anonymous"}
          </p>
          <div className="opacity-60 line-clamp-2 italic">{formatMessage(message.replyTo.content)}</div>
        </div>
      )}

      {!isCurrentUser && (
        <div className="flex items-center justify-between mb-1 gap-2 px-2">
          <p className="font-bold text-[11px] uppercase tracking-wider opacity-90 truncate" style={{ color: bubbleColors.text }}>
            {message.senderUsername}
          </p>
          {message.isEncrypted && <ShieldCheck className="w-3 h-3 opacity-70" />}
        </div>
      )}

      <div className="break-words text-[15px] leading-relaxed whitespace-pre-wrap px-2">
        {formatMessage(message.content)}
      </div>

      <div className="flex items-center justify-end mt-1 gap-3 px-2">
        {message.isEdited && <span className="text-[9px] opacity-40 italic">edited</span>}
        <span className="text-[10px] opacity-50 font-medium">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Reactions List */}
      <ReactionList reactions={message.reactions || []} />
    </>
  );
};
