import { afterEach, expect, it, vi } from 'vitest';
import { login, register } from '../../services/auth';

afterEach(() => vi.unstubAllGlobals());

it('envia as credenciais no formato da API e retorna o token', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: 'jwt-token', token_type: 'bearer' })));
  vi.stubGlobal('fetch', fetchMock);
  await expect(login('ana@example.com', 'senha123')).resolves.toBe('jwt-token');
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ana@example.com', senha: 'senha123' }),
  });
});

it('envia os dados de cadastro e apresenta e-mail duplicado', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 201 }))
    .mockResolvedValueOnce(new Response(null, { status: 400 }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(register('Ana', 'ana@example.com', 'senha123')).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Ana', email: 'ana@example.com', senha: 'senha123' }),
  });
  await expect(register('Ana', 'ana@example.com', 'senha123')).rejects.toThrow('Este e-mail');
});
