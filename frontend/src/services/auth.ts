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

export async function register(name: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: name, email, senha: password }),
  });
  if (response.status === 400) throw new Error('Este e-mail já está cadastrado. Entre na sua conta.');
  if (!response.ok) throw new Error('Não foi possível criar a conta. Confira os dados e tente novamente.');
}
