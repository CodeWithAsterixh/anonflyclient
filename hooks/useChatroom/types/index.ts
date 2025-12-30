import { type Emoji } from "../../../lib/assets/emojis";
import { type Message, type Participant, type ChatroomDetail } from "../../../lib/types/chat";

export interface UseChatroomReturn {
  messages: Message[];
  participants: Map<string, Participant>;
  chatroomDetail: ChatroomDetail | null;
  sendMessage: (content: string, replyTo?: { messageId: string; senderUsername: string; content: string; senderAid: string }) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  sendReaction: (messageId: string, emoji: Emoji) => void;
  joinChatroom: (chatroomId: string, password?: string) => void;
  leaveChatroom: () => void;
  reconnect: () => void;
  clearError: () => void;
  isConnected: boolean;
  isJoined: boolean;
  hasRoomKey: boolean;
  error: string | null;
  currentChatroomId: string | null;
  ws: WebSocket | null;
}
