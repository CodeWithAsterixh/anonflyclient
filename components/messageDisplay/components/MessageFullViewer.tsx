import React, { useEffect } from "react";
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
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenus();
      }
    };

    globalThis.window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      globalThis.window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [closeMenus]);

  return (
    <dialog
      open
      className={`pointer-events-auto absolute top-0 inset-0 z-100 bg-black/10 dark:bg-black/40 backdrop-blur-2xl transition-all duration-300 flex items-center p-4 border-none m-0 max-w-none max-h-none w-full h-full outline-none ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Backdrop Button for closing */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-transparent border-none cursor-default"
        onClick={closeMenus}
        aria-label="Close viewer"
      />

      <div
        className={`relative z-10 flex flex-col items-center gap-2 animate-in zoom-in-90 fade-in-80 duration-300 ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <MessageRow
          message={message}
          isCurrentUser={isCurrentUser}
          avatarUrl={avatarUrl}
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          isFocused={true}
          showReactions={showReactions}
          isPreview={true}
        />

        <div
          ref={reactionsRef}
          className="flex flex-col items-center gap-4 w-max animate-in zoom-in duration-200"
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
    </dialog>
  );
};

export default MessageFullViewer;
