import { createContext } from 'react';
import type { User } from '../../types/User';
import type { Identity } from '../../lib/helpers/identityManager';
import type { Chatroom } from '../../hooks/useChatroomList/types';

export interface ChatLayoutContextType {
  user: User | null;
  token: string | null;
  identities: Identity[];
  authLoading: boolean;
  chatrooms: Chatroom[];
  loadingChatrooms: boolean;
  chatroomError: string | null;
  retryCountdown: number | null;
  switchAccount: (aid: string) => Promise<void>;
  deleteAccount: (aid: string) => Promise<void>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  isMobile: boolean;
  onBack: () => void;
}

export const ChatLayoutContext = createContext<ChatLayoutContextType | null>(null);
