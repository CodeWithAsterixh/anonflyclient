import Cookies from 'js-cookie';
import type { User } from '../../types/User';

const SESSION_KEY = import.meta.env.VITE_SESSION_COOKIE_KEY;

export interface SessionPayload {
  user: User;
  token: string;
  ts: number;
}

export function setSessionUser(user: User, token: string) {
  try {
    const payload: SessionPayload = { user, token, ts: Date.now() };
    const isSecure = globalThis.window?.location.protocol === 'https:';
    
    // Set cookie with 1 week expiration (7 days)
    Cookies.set(SESSION_KEY, JSON.stringify(payload), { 
      expires: 7, 
      sameSite: 'lax', 
      secure: isSecure 
    });
  } catch {
    // Silently fail
  }
}

export function getSessionUser(): { user: User; token: string } | null {
  try {
    const raw = Cookies.get(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionPayload;
    return { user: parsed.user, token: parsed.token };
  } catch {
    return null;
  }
}

export function clearSessionUser() {
  try {
    Cookies.remove(SESSION_KEY);
  } catch {
    // Silently fail
  }
}

export function getTokenFromSession(): string | null {
  const s = getSessionUser();
  return s ? s.token : null;
}
