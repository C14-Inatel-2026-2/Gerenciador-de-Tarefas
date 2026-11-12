import { API_URL } from './api';

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha: password }),
  });
  if (response.status === 401) throw new Error('E-mail ou senha incorretos.');
  if (!response.ok) throw new Error('Não foi possível entrar. Tente novamente.');
  const data = await response.json();
  if (typeof data.access_token !== 'string' || !data.access_token.trim()) {
    throw new Error('A API retornou uma sessão inválida.');
  }
  return data.access_token;
}
