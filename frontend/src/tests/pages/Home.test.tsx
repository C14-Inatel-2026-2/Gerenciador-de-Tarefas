import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '../../pages/Home';
import type { ApiTask } from '../../services/tasks';

describe('Home', () => {
  let apiTasks: ApiTask[];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.setItem('task-manager.session', JSON.stringify({ email: 'ana@example.com' }));
    apiTasks = [{
      id: 1,
      title: 'Revisar proposta',
      description: 'Conferir os últimos detalhes',
      priority: 'alta',
      status: 'pendente',
      due_date: null,
    }];

    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';

      if (method === 'GET') {
        return new Response(JSON.stringify(apiTasks), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const taskId = Number(url.split('/').pop());
      const taskIndex = apiTasks.findIndex((task) => task.id === taskId);

      if (method === 'POST') {
        const body = JSON.parse(String(init?.body)) as {
          title: string;
          description: string | null;
          priority: ApiTask['priority'];
        };
        const task: ApiTask = {
          id: 2,
          title: body.title,
          description: body.description,
          priority: body.priority,
          status: 'pendente',
          due_date: null,
        };
        apiTasks.push(task);
        return new Response(JSON.stringify(task), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'PATCH') {
        const changes = JSON.parse(String(init?.body)) as Partial<ApiTask>;
        apiTasks[taskIndex] = { ...apiTasks[taskIndex], ...changes };
        return new Response(JSON.stringify(apiTasks[taskIndex]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'DELETE') {
        apiTasks.splice(taskIndex, 1);
        return new Response(null, { status: 204 });
      }

      return new Response(null, { status: 405 });
    });

    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('carrega da API e permite criar, editar e excluir tarefas', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Home /></MemoryRouter>);

    const existingTitle = await screen.findByRole('heading', { name: 'Revisar proposta' });
    expect(existingTitle).toBeInTheDocument();
    expect(screen.getByText('Conferir os últimos detalhes')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/tasks/',
      { signal: expect.any(AbortSignal) },
    );

    await user.click(screen.getByRole('button', { name: 'Nova tarefa' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Título'), 'Preparar apresentação');
    await user.selectOptions(within(dialog).getByLabelText('Prioridade'), 'media');
    await user.type(within(dialog).getByLabelText('Descrição'), 'Reunir os materiais');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar tarefa' }));

    const createdTitle = await screen.findByRole('heading', { name: 'Preparar apresentação' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/tasks/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Preparar apresentação',
          description: 'Reunir os materiais',
          priority: 'media',
        }),
      }),
    );

    const createdCard = createdTitle.closest('article');
    expect(createdCard).not.toBeNull();
    await user.click(within(createdCard!).getByRole('button', { name: 'Editar tarefa: Preparar apresentação' }));
    await user.clear(within(createdCard!).getByLabelText('Título'));
    await user.type(within(createdCard!).getByLabelText('Título'), 'Finalizar apresentação');
    await user.click(within(createdCard!).getByRole('button', { name: 'Salvar' }));

    const updatedTitle = await screen.findByRole('heading', { name: 'Finalizar apresentação' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/tasks/2',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          title: 'Finalizar apresentação',
          description: 'Reunir os materiais',
          priority: 'media',
        }),
      }),
    );

    const updatedCard = updatedTitle.closest('article');
    expect(updatedCard).not.toBeNull();
    await user.click(within(updatedCard!).getByRole('button', { name: 'Excluir tarefa: Finalizar apresentação' }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Finalizar apresentação' })).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/tasks/2', { method: 'DELETE' });
  });

  it('permite alterar o status pela lista', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    const status = await screen.findByRole('combobox', { name: 'Status da tarefa: Revisar proposta' });

    fireEvent.change(status, { target: { value: 'em_andamento' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8000/tasks/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'em_andamento' }),
        }),
      );
    });
  });
});
