import React from "react";
import { MessageRow } from "./MessageRow";
import { ReactionPicker } from "./ReactionPicker";
import { EmojiGrid } from "./EmojiGrid";
import { ActionMenu } from "./ActionMenu";
import type { Message } from "../../../lib/types/chat";
import type { Emoji } from "../../../lib/assets/emojis";

interface MessageFullViewerProps {
  message: Message;
  isCurrentUser: boolean | null;
  avatarUrl: string;
  bubbleColors: { primary: string; text: string };
  isReplyToMe: boolean;
  scrollToRepliedMessage: (messageId: string) => void;
  showReactions: boolean;
  closeMenus: () => void;
  reactionsRef: React.RefObject<HTMLDivElement | null>;
  onReact: (emoji: Emoji) => void;
  onShowAllEmojis: () => void;
  showAllEmojis: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditable: boolean;
}

export const MessageFullViewer: React.FC<MessageFullViewerProps> = ({
  message,
  isCurrentUser,
  avatarUrl,
  bubbleColors,
  isReplyToMe,
  scrollToRepliedMessage,
  showReactions,
  closeMenus,
  reactionsRef,
  onReact,
  onShowAllEmojis,
  showAllEmojis,
  onReply,
  onEdit,
  onDelete,
  isEditable,
}) => {
  return (
    <div
      className={`pointer-events-auto absolute top-0 h-full inset-0 z-100 bg-black/10 dark:bg-black/40 backdrop-blur-2xl transition-all duration-300 flex items-center p-4 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
      onClick={closeMenus}
    >
      <div
        className={`relative flex flex-col items-center gap-2 animate-in zoom-in-90 fade-in-80 duration-300 ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <MessageRow
          message={message}
          isCurrentUser={isCurrentUser}
          avatarUrl={avatarUrl}
          bubbleColors={bubbleColors}
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          isFocused={true}
          showReactions={showReactions}
          isPreview={true}
        />

        <div
          ref={reactionsRef}
          className="flex flex-col items-center gap-4 w-max animate-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <ReactionPicker
            onReact={onReact}
            onShowAll={onShowAllEmojis}
            showAllEmojis={showAllEmojis}
          />

          {showAllEmojis && <EmojiGrid onReact={onReact} />}

          <ActionMenu
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditable={isEditable}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageFullViewer;
