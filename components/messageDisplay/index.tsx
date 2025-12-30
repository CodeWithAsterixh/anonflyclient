import React, { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Reply } from "lucide-react";
import { useAuth } from "../../hooks/useAuth/index";
import {
  getUserAvatar,
  getUserBubbleColors,
} from "../../lib/controllers/colorsProcessors/userAvatar";
import { useIsMobile } from "../../hooks/useIsMobile/index";
import { type Emoji } from "../../lib/assets/emojis";
import { MessageRow } from "./components/MessageRow";
import { ReactionPicker } from "./components/ReactionPicker";
import { EmojiGrid } from "./components/EmojiGrid";
import { ActionMenu } from "./components/ActionMenu";
import { useSwipe } from "./hooks/useSwipe";
import type { MessageDisplayProps } from "./types";

/**
 * MessageDisplay component is a presentational component for displaying a single chat message.
 * It styles messages differently based on whether the current user is the sender.
 * System messages (like user join notifications) are displayed as centered notifications.
 *
 * @param {MessageDisplayProps} props The props for the component.
 */
export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  onReply,
  onReact,
  onEdit,
  onDelete,
  portalRoot,
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isCurrentUser = user && user.userId === message.senderAid;
  const isSystemMessage = message.type === "system";

  const [highlight, setHighlight] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showAllEmojis, setShowAllEmojis] = useState(false);
  const [isBubbleFocused, setIsBubbleFocused] = useState(false);
  
  const bubbleRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setShowReactions(false);
    setShowAllEmojis(false);
    setIsBubbleFocused(false);
  };

  // Check if message is editable (within 10 minutes)
  const isEditable = useMemo(() => {
    if (!isCurrentUser || message.type === "system") return false;
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = new Date().getTime();
    return currentTime - messageTime < 10 * 60 * 1000;
  }, [message.timestamp, isCurrentUser, message.type]);

  // Prevent scrolling when preview is active
  useEffect(() => {
    if (showReactions) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${
        window.innerWidth - document.documentElement.clientWidth
      }px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showReactions]);

  // Close reactions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showReactions &&
        !bubbleRef.current?.contains(event.target as Node) &&
        !reactionsRef.current?.contains(event.target as Node)
      ) {
        closeMenus();
      }
    };

    if (showReactions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactions]);

  useEffect(() => {
    const handleHighlight = (e: any) => {
      if (e.detail.messageId === message.id) {
        setHighlight(true);
        setTimeout(() => setHighlight(false), 2000);
      }
    };

    window.addEventListener("highlight-message" as any, handleHighlight);
    return () =>
      window.removeEventListener("highlight-message" as any, handleHighlight);
  }, [message.id]);

  const scrollToRepliedMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      window.dispatchEvent(
        new CustomEvent("highlight-message", { detail: { messageId } })
      );
    }
  };

  const handleEmojiClick = (emoji: Emoji) => {
    if (onReact && message.id) {
      onReact(message.id, emoji);
    }
    closeMenus();
  };

  const handleLongPress = () => {
    setShowReactions(true);
    setIsBubbleFocused(true);
  };

  const isReplyToMe =
    message.replyTo?.userAid === user?.userId ||
    (message.replyTo?.senderUsername === user?.username &&
      !message.replyTo?.userAid);

  const handleReply = () => {
    if (onReply && message.id) {
      onReply({
        messageId: message.id,
        senderUsername: message.senderUsername,
        content: message.content,
        senderAid: message.senderAid,
      });
      closeMenus();
    }
  };

  const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipe({
    isCurrentUser,
    minSwipeDistance: 50,
    onReply: handleReply,
    isMobile,
    onLongPress: handleLongPress,
  });

  const handleEdit = () => {
    if (onEdit && message.id) {
      onEdit(message.id, message.content);
      closeMenus();
    }
  };

  const handleDelete = () => {
    if (onDelete && message.id) {
      if (window.confirm("Are you sure you want to delete this message?")) {
        onDelete(message.id);
      }
      closeMenus();
    }
  };

  const handleDoubleClick = () => {
    if (!isMobile) {
      setShowReactions(true);
      setIsBubbleFocused(true);
    }
  };

  const handleClick = () => {
    if (!isMobile) {
      setIsBubbleFocused((prev) => !prev);
    }
  };

  const avatarUrl = useMemo(
    () => getUserAvatar(message.senderUsername, message.senderAid, 32),
    [message.senderUsername, message.senderAid]
  );

  const bubbleColors = useMemo(
    () => getUserBubbleColors(message.senderAid),
    [message.senderAid]
  );

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm italic">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <>
      {showReactions && (
        <div 
          className="fixed inset-0 z-[100] backdrop-blur-sm bg-black/40 transition-all duration-300 animate-in fade-in" 
          onClick={closeMenus} 
        />
      )}
      <div
        id={`message-${message.id}`}
        className={`flex items-end gap-2 mb-4 relative transition-all duration-500 ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } ${highlight ? "bg-blue-300/50 rounded-lg p-1" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 transition-opacity duration-200 ${
            Math.abs(swipeOffset) > 20 ? "opacity-100" : "opacity-0"
          } ${isCurrentUser ? "left-4" : "right-4"}`}
        >
          <Reply className="w-5 h-5 text-gray-400" />
        </div>

        <MessageRow
          message={message}
          isCurrentUser={isCurrentUser}
          avatarUrl={avatarUrl}
          bubbleColors={bubbleColors}
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          isFocused={isBubbleFocused || showReactions}
          showReactions={showReactions}
          swipeOffset={swipeOffset}
          onDoubleClick={handleDoubleClick}
          bubbleRef={bubbleRef}
        />
      </div>
      {showReactions &&
        portalRoot &&
        createPortal(
          <div
            className={`pointer-events-auto absolute top-0 h-full inset-0 z-[100] bg-black/10 backdrop-blur-2xl transition-all duration-300 flex items-center p-4 ${
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
                  onReact={handleEmojiClick}
                  onShowAll={() => setShowAllEmojis(!showAllEmojis)}
                  showAllEmojis={showAllEmojis}
                />

                {showAllEmojis && <EmojiGrid onReact={handleEmojiClick} />}

                <ActionMenu
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isEditable={isEditable}
                />
              </div>
            </div>
          </div>,
          portalRoot
        )}
    </>
  );
};

export default MessageDisplay;
