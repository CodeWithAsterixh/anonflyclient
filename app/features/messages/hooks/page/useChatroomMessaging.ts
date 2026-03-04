import { useState, useRef, useCallback, useEffect } from 'react';
import type { ReplyingTo } from '~/routes/ChatroomPage/types';

export const useChatroomMessaging = (
  messages: any[],
  sendMessage: (content: string, replyingTo?: ReplyingTo) => void,
  editMessage: (messageId: string, newContent: string) => void
) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    sendMessage(content, replyingTo || undefined);
    setReplyingTo(null);
  }, [sendMessage, replyingTo]);

  const handleEditMessage = useCallback((newContent: string) => {
    if (editingMessage) {
      editMessage(editingMessage.messageId, newContent);
      setEditingMessage(null);
    }
  }, [editMessage, editingMessage]);

  return {
    messagesEndRef,
    messagesContainerRef,
    showScrollButton,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    handleScroll,
    scrollToBottom,
    handleSendMessage,
    handleEditMessage
  };
};
