import { clearSession, getSession } from '../auth/session';

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function authenticatedFetch(url: string, init: RequestInit = {}) {
  const session = getSession();
  if (!session) {
    clearSession();
    throw new Error('Entre novamente para acessar suas tarefas.');
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.token}`);
  const response = await fetch(url, { ...init, headers });
  if (response.status === 401) {
    clearSession();
    throw new Error('Sua sessão expirou. Entre novamente.');
  }
  return response;
}
