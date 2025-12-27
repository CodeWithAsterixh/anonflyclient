import type { User } from '../../types/User';

const SESSION_KEY = 'anonfly_session_user';

export function setSessionUser(user: User, token: string) {
  try {
    const payload = { user, token, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to set session user:', e);
  }
}

export function getSessionUser(): { user: User; token: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { user: parsed.user, token: parsed.token };
  } catch (e) {
    console.error('Failed to read session user:', e);
    return null;
  }
}

export function clearSessionUser() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear session user:', e);
  }
}

export function getTokenFromSession(): string | null {
  const s = getSessionUser();
  return s ? s.token : null;
}
