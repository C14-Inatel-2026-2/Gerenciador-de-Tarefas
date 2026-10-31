import type { PrioridadeTarefa, StatusTarefa, Tarefa } from '../types';

export const TASKS_URL = 'http://localhost:8000/tasks/';

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${TASKS_URL}${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Não foi possível excluir a tarefa (HTTP ${response.status}).`);
  }
  // DELETE retorna 204, sem corpo JSON.
}

export interface ApiTask {
  id: number;
  title: string;
  description: string | null;
  priority: PrioridadeTarefa;
  status: StatusTarefa;
  due_date: string | null;
}

export type TaskUpdate = Partial<Pick<ApiTask, 'title' | 'description' | 'priority' | 'status'>>;

// Contrato proposto: PATCH parcial retorna a tarefa atualizada (TaskOut).
export async function updateTask(id: string, changes: TaskUpdate): Promise<Tarefa> {
  const response = await fetch(`${TASKS_URL}${encodeURIComponent(id)}`, {
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
      ? new Date(task.due_date).toLocaleDateString('pt-BR')
      : undefined,
  };
}

export async function getTasks(signal: AbortSignal): Promise<Tarefa[]> {
  const response = await fetch(TASKS_URL, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar as tarefas (HTTP ${response.status}).`);
  }
  const tasks: ApiTask[] = await response.json();
  return tasks.map(toTarefa);
}
