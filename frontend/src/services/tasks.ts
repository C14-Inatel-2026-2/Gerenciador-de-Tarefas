import { API_URL, authenticatedFetch } from './api';
import type { PrioridadeTarefa, StatusTarefa, Tarefa } from '../types';

export const TASKS_URL = `${API_URL}/tasks/`;

export async function deleteTask(id: string): Promise<void> {
  const response = await authenticatedFetch(`${TASKS_URL}${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Não foi possível excluir a tarefa (HTTP ${response.status}).`);
  }
}

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  priority: PrioridadeTarefa;
  status: StatusTarefa;
  due_date: string | null;
  created_at?: string;
}

export type TaskCreate = {
  title: string;
  description?: string | null;
  priority?: PrioridadeTarefa;
  status?: StatusTarefa;
  due_date?: string | null;
};

export type TaskUpdate = Partial<Pick<ApiTask, 'title' | 'description' | 'priority' | 'status' | 'due_date'>>;

export async function createTask(task: TaskCreate): Promise<Tarefa> {
  const response = await authenticatedFetch(TASKS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Não foi possível criar a tarefa.');
  }

  return toTarefa(await response.json());
}

export async function updateTask(id: string, changes: TaskUpdate): Promise<Tarefa> {
  const response = await authenticatedFetch(`${TASKS_URL}${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!response.ok) throw new Error('Não foi possível atualizar a tarefa.');
  return toTarefa(await response.json());
}

export function toTarefa(task: ApiTask): Tarefa {
  return {
    id: String(task.id),
    titulo: task.title,
    descricao: task.description ?? undefined,
    prioridade: task.priority,
    status: task.status,
    dataVencimento: task.due_date
      ? task.due_date.slice(0, 10)
      : undefined,
  };
}

export async function getTasks(signal: AbortSignal): Promise<Tarefa[]> {
  const response = await authenticatedFetch(TASKS_URL, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar as tarefas (HTTP ${response.status}).`);
  }
  const tasks: ApiTask[] = await response.json();
  return tasks.map(toTarefa);
}
