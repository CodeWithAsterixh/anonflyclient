import { useState, useRef, useCallback, useEffect } from "react";
import type { Message } from "../../../lib/types/chat";
import type { Emoji } from "../../../lib/assets/emojis";
import { encryptMessage, signBlob } from "../../../lib/helpers/encryption";
import { getIdentity } from "../../../lib/helpers/identityManager";

export const useChatroomMessages = (currentChatroomId: string | null, user: any) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  const deleteMessageLocally = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, content: "[This message was deleted]", type: "system" as const, isDeleted: true };
        }
        if (msg.replyTo && msg.replyTo.messageId === messageId) {
          return { ...msg, replyTo: { ...msg.replyTo, content: "[This message was deleted]" } };
        }
        return msg;
      })
    );
  }, []);

  const handleMessageEdit = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, content: newContent, isEdited: true };
        }
        if (msg.replyTo && msg.replyTo.messageId === messageId) {
          return { ...msg, replyTo: { ...msg.replyTo, content: newContent } };
        }
        return msg;
      })
    );
  }, []);

  const handleReactionUpdate = useCallback((messageId: string, reactions: any[]) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, reactions } : msg
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (ws: WebSocket | null, content: string, roomKey: CryptoKey | null, replyTo?: any) => {
      if (ws?.readyState === WebSocket.OPEN && currentChatroomId && user) {
        try {
          const identity = await getIdentity();
          if (!identity) throw new Error("Identity not found");

          let finalContent = content;
          if (roomKey) {
            const encrypted = await encryptMessage(content, roomKey);
            finalContent = JSON.stringify(encrypted);
          }

          const signature = await signBlob(
            btoa(finalContent),
            identity.identityKeyPair.privateKey
          );

          ws.send(
            JSON.stringify({
              type: "message",
              chatroomId: currentChatroomId,
              content: finalContent,
              signature,
              userAid: identity.aid,
              replyTo: replyTo ? {
                messageId: replyTo.messageId,
                username: replyTo.senderUsername,
                content: replyTo.content,
                userAid: replyTo.senderAid
              } : undefined,
            })
          );
        } catch (err: any) {
          console.error("Failed to secure message:", err);
          throw err;
        }
      }
    },
    [currentChatroomId, user]
  );

  const editMessage = useCallback(
    async (ws: WebSocket | null, messageId: string, newContent: string, roomKey: CryptoKey | null) => {
      if (ws?.readyState === WebSocket.OPEN && currentChatroomId && user) {
        try {
          let finalContent = newContent;
          if (roomKey) {
            const encrypted = await encryptMessage(newContent, roomKey);
            finalContent = JSON.stringify(encrypted);
          }

          ws.send(
            JSON.stringify({
              type: "editMessage",
              chatroomId: currentChatroomId,
              messageId,
              newContent: finalContent,
            })
          );

          handleMessageEdit(messageId, newContent);
        } catch (err: any) {
          console.error("Failed to secure edited message:", err);
          throw err;
        }
      }
    },
    [currentChatroomId, user, handleMessageEdit]
  );

  const deleteMessage = useCallback(
    async (ws: WebSocket | null, messageId: string) => {
      if (ws?.readyState === WebSocket.OPEN && currentChatroomId) {
        deleteMessageLocally(messageId);
        ws.send(
          JSON.stringify({
            type: "deleteMessage",
            chatroomId: currentChatroomId,
            messageId,
          })
        );
      }
    },
    [currentChatroomId, deleteMessageLocally]
  );

  const sendReaction = useCallback(
    (ws: WebSocket | null, messageId: string, emoji: Emoji) => {
      if (ws?.readyState === WebSocket.OPEN && currentChatroomId && user) {
        ws.send(
          JSON.stringify({
            type: "reaction",
            chatroomId: currentChatroomId,
            messageId,
            emojiId: emoji.id,
            emojiValue: emoji.value,
            emojiType: emoji.type,
            userAid: user.userId,
            username: user.username,
          })
        );
      }
    },
    [currentChatroomId, user]
  );

  return {
    messages,
    setMessages,
    messagesRef,
    addMessage,
    updateMessage,
    deleteMessageLocally,
    handleMessageEdit,
    handleReactionUpdate,
    sendMessage,
    editMessage,
    deleteMessage,
    sendReaction,
  };
};
