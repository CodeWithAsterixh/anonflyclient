import { Reply } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth, useIsMobile, useSwipe } from "../../hooks";
import { type Emoji } from "../../lib/assets/emojis";
import {
  getUserAvatar
} from "../../lib/controllers/colorsProcessors/userAvatar";
import AlertDialog from "../alertDialog";
import { MessageFullViewer } from "./components/MessageFullViewer";
import { MessageRow } from "./components/MessageRow";
import SystemMessage from "./components/SystemMessage";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setShowReactions(false);
    setShowAllEmojis(false);
  };

  // Check if message is editable (within 10 minutes)
  const isEditable = useMemo(() => {
    if (!isCurrentUser || message.type === "system") return false;
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = Date.now();
    return currentTime - messageTime < 10 * 60 * 1000;
  }, [message.timestamp, isCurrentUser, message.type]);

  // Prevent scrolling when preview is active
  useEffect(() => {
    if (showReactions) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${
        globalThis.window.innerWidth - document.documentElement.clientWidth
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

    globalThis.window.addEventListener("highlight-message" as any, handleHighlight);
    return () =>
      globalThis.window.removeEventListener("highlight-message" as any, handleHighlight);
  }, [message.id]);

  const scrollToRepliedMessage = (messageId: string) => {
    closeMenus();
    // Use a small delay to ensure any layout shifts have completed
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "auto", block: "center" });
        
        // Dispatch highlight event
        globalThis.window.dispatchEvent(
          new CustomEvent("highlight-message", { detail: { messageId } })
        );
      } else {
        // Fallback: search by data attribute if ID lookup fails
        const fallbackElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (fallbackElement) {
          fallbackElement.scrollIntoView({ behavior: "auto", block: "center" });
          globalThis.window.dispatchEvent(
            new CustomEvent("highlight-message", { detail: { messageId } })
          );
        }
      }
    }, 100);
  };

  const handleEmojiClick = (emoji: Emoji) => {
    if (onReact && message.id) {
      onReact(message.id, emoji);
    }
    closeMenus();
  };

  const handleLongPress = () => {
    setShowReactions(true);
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

  const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd } =
    useSwipe({
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
      setShowDeleteConfirm(true);
      closeMenus();
    }
  };

  const confirmDelete = () => {
    if (onDelete && message.id) {
      onDelete(message.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleDoubleClick = () => {
    if (!isMobile) {
      setShowReactions(true);
    }
  };


  const avatarUrl = useMemo(
    () => getUserAvatar(message.senderUsername, message.senderAid, 32),
    [message.senderUsername, message.senderAid]
  );

  if (isSystemMessage) {
    return (
      <SystemMessage 
        id={message.id||""} 
        content={message.content} 
        highlight={highlight} 
      />
    );
  }

  return (
    <>
      <div
        id={`message-${message.id}`}
        data-message-id={message.id}
        className={`flex items-end gap-2 mb-4 relative transition-all duration-500 ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } ${highlight ? "bg-primary/20 rounded-lg p-1" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
          isReplyToMe={isReplyToMe}
          scrollToRepliedMessage={scrollToRepliedMessage}
          swipeOffset={swipeOffset}
          onDoubleClick={handleDoubleClick}
          bubbleRef={bubbleRef}
        />
      </div>
      {showReactions &&
        portalRoot &&
        createPortal(
          <MessageFullViewer
            message={message}
            isCurrentUser={isCurrentUser}
            avatarUrl={avatarUrl}
            isReplyToMe={isReplyToMe}
            scrollToRepliedMessage={scrollToRepliedMessage}
            showReactions={showReactions}
            closeMenus={closeMenus}
            reactionsRef={reactionsRef}
            onReact={handleEmojiClick}
            onShowAllEmojis={() => setShowAllEmojis(!showAllEmojis)}
            showAllEmojis={showAllEmojis}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditable={isEditable}
          />,
          portalRoot
        )}

      <AlertDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        type="confirm"
      />
    </>
  );
};

export default MessageDisplay;
