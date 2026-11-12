import { login, register } from '../../services/auth';
vi.mock('../../services/auth', () => ({ login: vi.fn(), register: vi.fn() }));
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../../pages/login';
import * as sessionAuth from '../../auth/session';

vi.mock('../../auth/session', () => ({
  saveSession: vi.fn(),
  useSession: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Testes Com Mock (Login)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(login).mockResolvedValue('test-token');
  });


  it('Redirecionamento para o dashboard', () => {
    vi.mocked(sessionAuth.useSession).mockReturnValue({ email: 'teste@email.com', token: 'test-token' });
    renderLogin();

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('exibe erro de credenciais e mantém a sessão vazia', async () => {
    vi.mocked(sessionAuth.useSession).mockReturnValue(null);
    vi.mocked(login).mockRejectedValue(new Error('E-mail ou senha incorretos.'));
    renderLogin();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('E-mail'), 'teste@email.com');
    await user.type(screen.getByLabelText('Senha'), 'errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
    expect(sessionAuth.saveSession).not.toHaveBeenCalled();
  });

  it('cadastra e autentica uma nova conta', async () => {
    vi.mocked(sessionAuth.useSession).mockReturnValue(null);
    vi.mocked(register).mockResolvedValue(undefined);
    renderLogin();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Criar uma conta' }));
    await user.type(screen.getByLabelText('Nome'), 'Ana Silva');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'senha123');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    await waitFor(() => expect(sessionAuth.saveSession).toHaveBeenCalledWith({ email: 'ana@example.com', token: 'test-token' }));
    expect(register).toHaveBeenCalledWith('Ana Silva', 'ana@example.com', 'senha123');
    expect(login).toHaveBeenCalledWith('ana@example.com', 'senha123');
  });

  it('Login', async () => {
    vi.mocked(sessionAuth.useSession).mockReturnValue(null);
    renderLogin();

    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'teste@email.com');
    await user.type(senhaInput, 'teste123');
    await user.click(submitButton);

    await waitFor(() => expect(sessionAuth.saveSession).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledWith('teste@email.com', 'teste123');
    expect(sessionAuth.saveSession).toHaveBeenCalledWith({ email: 'teste@email.com', token: 'test-token' });
  });
});
