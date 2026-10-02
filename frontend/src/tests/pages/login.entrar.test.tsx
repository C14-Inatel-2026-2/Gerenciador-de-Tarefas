import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  });


  it('Redirecionamento para o dashboard', () => {
    vi.mocked(sessionAuth.useSession).mockReturnValue({ email: 'teste@email.com' });
    renderLogin();

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
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

    expect(sessionAuth.saveSession).toHaveBeenCalledTimes(1);
    expect(sessionAuth.saveSession).toHaveBeenCalledWith({ email: 'teste@email.com' });
  });
});
