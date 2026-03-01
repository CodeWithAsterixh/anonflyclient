import type { Participant, Message } from "../../../../lib/types/chat";

export type RemovalReason = boolean | 'removed' | 'banned';

export interface UseChatroomConnectionProps {
  token: string | null;
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  currentChatroomId: string | null;
  setCurrentChatroomId: (id: string | null) => void;
  isRemovedRef: React.RefObject<RemovalReason>;
  setIsRemoved: (val: RemovalReason) => void;
  chatroomDetailRef: React.RefObject<any>;
  participantsRef: React.RefObject<Map<string, Participant>>;
  messagesRef: React.RefObject<Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setParticipants: React.Dispatch<React.SetStateAction<Map<string, Participant>>>;
  setHasRoomKey: (has: boolean) => void;
  roomKeyRef: React.RefObject<CryptoKey | null>;
  decryptStoredMessages: (key: CryptoKey, messages: Message[]) => Promise<Message[]>;
  setError: (error: string | null) => void;
  setChatroomDetail: React.Dispatch<React.SetStateAction<any>>;
}

export interface ConnectionState {
  isConnected: boolean;
  isJoined: boolean;
  retryCount: number;
}

export interface MessageHandlerContext {
  user: any;
  token: string | null;
  logout: () => void;
  currentChatroomId: string | null;
  setCurrentChatroomId: (id: string | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setParticipants: React.Dispatch<React.SetStateAction<Map<string, Participant>>>;
  setHasRoomKey: (has: boolean) => void;
  roomKeyRef: React.RefObject<CryptoKey | null>;
  participantsRef: React.RefObject<Map<string, Participant>>;
  messagesRef: React.RefObject<Message[]>;
  decryptStoredMessages: (key: CryptoKey, messages: Message[]) => Promise<Message[]>;
  setError: (error: string | null) => void;
  joiningRef: React.RefObject<string | null>;
  ws: React.RefObject<WebSocket | null>;
  setIsJoined: (val: boolean) => void;
  setIsRemoved: (val: boolean | 'removed' | 'banned') => void;
  setChatroomDetail: React.Dispatch<React.SetStateAction<any>>;
}
