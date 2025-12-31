import type { User } from '../../../types/User';
import type { Identity } from '../../../lib/helpers/identityManager';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialCheck: boolean;
  error: string | null;
  identities: Identity[];
  retryCountdown: number | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  identities: Identity[];
  joinAnonymously: (username: string, redirectTo?: string) => Promise<void>;
  switchAccount: (aid: string, redirectTo?: string) => Promise<void>;
  deleteAccount: (aid: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isInitialCheck: boolean;
  error: string | null;
  retryCountdown: number | null;
}
