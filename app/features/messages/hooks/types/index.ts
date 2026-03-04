import React from "react";
import type { Emoji } from "~/shared/assets/emojis";
import type { Message, Participant, ChatroomDetail } from "~/shared/types/chat";

export interface UseChatroomReturn {
  messages: Message[];
  participants: Map<string, Participant>;
  chatroomDetail: ChatroomDetail | null;
  sendMessage: (content: string, replyTo?: { messageId: string; senderUsername: string; content: string; senderAid: string }) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  sendReaction: (messageId: string, emoji: Emoji) => void;
  joinChatroom: (chatroomId: string, password?: string, linkToken?: string) => Promise<void>;
  leaveChatroom: () => Promise<void>;
  reconnect: () => void;
  clearError: () => void;
  isConnected: boolean;
  isJoined: boolean;
  isRemoved: boolean | 'removed' | 'banned';
  setIsRemoved: (val: boolean | 'removed' | 'banned') => void;
  hasRoomKey: boolean;
  rotateKey: () => Promise<void>;
  error: string | null;
  currentChatroomId: string | null;
  ws: React.RefObject<WebSocket | null>;
}
