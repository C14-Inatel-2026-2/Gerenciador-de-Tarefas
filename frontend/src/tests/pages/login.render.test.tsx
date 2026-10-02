import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Login } from '../../pages/login';

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

describe('Testes Sem Mock', () => {
  beforeEach(() => {
    localStorage.clear();
  });


  it('Tela de Login', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /gerenciador de tarefas/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('Interação com campos e botão de login', async () => {
    renderLogin();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const senhaInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'teste@email.com');
    await user.type(senhaInput, '123456');
    await user.click(submitButton);

    expect(emailInput).toHaveValue('teste@email.com');
    expect(senhaInput).toHaveValue('123456');
  });
});
