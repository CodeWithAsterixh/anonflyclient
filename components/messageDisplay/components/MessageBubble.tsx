import React from "react";
import { ShieldCheck } from "lucide-react";
import { type Message } from "../../../lib/types/chat";

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
          className="mb-2 p-2 rounded-lg bg-black/5 border-l-4 border-black/20 text-xs cursor-pointer hover:bg-black/10 transition-colors"
        >
          <p className="font-bold opacity-70 truncate">
            {isReplyToMe ? "You" : message.replyTo.senderUsername || "Anonymous"}
          </p>
          <p className="opacity-60 line-clamp-2 italic">{message.replyTo.content}</p>
        </div>
      )}

      {!isCurrentUser && (
        <div className="flex items-center justify-between mb-1 gap-2 px-2">
          <p className="font-bold text-xs truncate" style={{ color: bubbleColors.text }}>
            {message.senderUsername}
          </p>
          {message.isEncrypted && <ShieldCheck className="w-3 h-3 opacity-70" />}
        </div>
      )}

      <p className="break-words text-sm md:text-base whitespace-pre-wrap px-2">
        {message.content}
      </p>

      <div className="flex items-center justify-end mt-1 gap-3 px-2">
        {message.isEdited && <span className="text-[10px] opacity-50 italic">edited</span>}
        <span className="text-[10px] opacity-60 font-medium">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Reactions List */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="absolute -bottom-3 flex flex-wrap gap-1 z-20 px-1">
          {message.reactions
            .reduce((acc: { emoji: string; count: number; users: string[] }[], curr) => {
              const existing = acc.find((a) => a.emoji === curr.emojiValue);
              if (existing) {
                existing.count++;
                existing.users.push(curr.username);
              } else {
                acc.push({
                  emoji: curr.emojiValue,
                  count: 1,
                  users: [curr.username],
                });
              }
              return acc;
            }, [])
            .map((reaction, i) => (
              <div
                key={i}
                title={reaction.users.join(", ")}
                className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm text-[10px] flex items-center gap-1 hover:scale-110 transition-transform cursor-default"
              >
                <span>{reaction.emoji}</span>
                <span className="font-bold text-gray-600">{reaction.count}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
};
