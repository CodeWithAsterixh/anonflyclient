import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuthInternal } from '../../hooks/useAuth/useAuthInternal';
import type { Identity } from '../../lib/helpers/identityManager';
import type { User } from 'types/User';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  identities: Identity[];
  isLoading: boolean;
  isInitialCheck: boolean;
  isAuthenticated: boolean;
  error: string | null;
  retryCountdown: number | null;
  joinAnonymously: (username: string, redirectTo?: string) => Promise<void>;
  switchAccount: (aid: string, redirectTo?: string) => Promise<void>;
  deleteAccount: (aid: string) => Promise<void>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthInternal();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
