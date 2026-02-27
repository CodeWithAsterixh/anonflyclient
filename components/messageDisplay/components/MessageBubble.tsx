import React from "react";
import { ShieldCheck } from "lucide-react";
import { type Message } from "../../../lib/types/chat";
import ReactionList, { type Reaction } from "./ReactionList";
import { formatMessage } from "../../../lib/helpers/markdown";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean | null;
  isReplyToMe: boolean;
  scrollToRepliedMessage: (id: string) => void;
  isFocused?: boolean;
  onShowReactionDetails?: (reactions: Reaction[], messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  isReplyToMe,
  scrollToRepliedMessage,
  isFocused,
  onShowReactionDetails,
}) => {
  return (
    <>
      {/* Reply Preview in Bubble */}
      {message.replyTo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scrollToRepliedMessage(message.replyTo!.messageId);
          }}
          className={`w-full text-left mb-2 p-2 rounded-lg border-l-4 text-xs cursor-pointer transition-colors border-y-0 border-r-0 ${
            isCurrentUser 
              ? "bg-white/20 border-white/40 hover:bg-white/30" 
              : "bg-white/5 border-border hover:bg-white/10"
          }`}
        >
          <p className="font-bold opacity-70 truncate">
            {isReplyToMe ? "You" : message.replyTo.senderUsername || "Anonymous"}
          </p>
          <div className="opacity-60 line-clamp-2 italic text-left">{formatMessage(message.replyTo.content)}</div>
        </button>
      )}

      {!isCurrentUser && (
        <div className="flex items-center justify-between mb-1 gap-2 px-2">
          <p className="font-bold text-[11px] uppercase tracking-wider text-primary truncate">
            {message.senderUsername}
          </p>
          {message.isEncrypted && <ShieldCheck className="w-3 h-3 opacity-70" />}
        </div>
      )}

      <div className="wrap-break-word text-[15px] leading-relaxed whitespace-pre-wrap px-2">
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
      <ReactionList 
        reactions={message.reactions || []} 
        onShowDetails={onShowReactionDetails}
        messageId={message.id || ""}
      />
    </>
  );
};
