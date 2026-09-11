import { useSyncExternalStore } from 'react';

const SESSION_KEY = 'task-manager.session';
const SESSION_EVENT = 'task-manager.session-change';

type Session = {
  email: string;
  token?: string;
};

function getSnapshot(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const session: unknown = JSON.parse(stored);
    if (
      typeof session !== 'object' || session === null ||
      !('email' in session) || typeof session.email !== 'string' ||
      !session.email.trim() ||
      ('token' in session && (typeof session.token !== 'string' || !session.token.trim()))
    ) return null;
    return stored;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(SESSION_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

// Quando a API de login existir, passar também o token retornado por ela.
export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function useSession(): Session | null {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return stored ? JSON.parse(stored) as Session : null;
}
