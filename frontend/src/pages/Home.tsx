import { useEffect, useState } from 'react';
import { clearSession, useSession } from '../auth/session';
import { TaskCard } from '../components/TaskCard';
import { createTask, deleteTask, getTasks, updateTask } from '../services/tasks';
import type { TaskUpdate } from '../services/tasks';
import type { Tarefa } from '../types';

export function Home() {
  const handleUpdateTarefa = async (id: string, changes: TaskUpdate) => {
    const updated = await updateTask(id, changes);
    setTarefas((current) => current.map((tarefa) => (tarefa.id === id ? updated : tarefa)));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState('');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getTasks(controller.signal)
      .then((tasks) => {
        if (!controller.signal.aborted) setTarefas(tasks);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError('Não foi possível carregar as tarefas. Verifique a conexão com a API e tente novamente.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [loadAttempt]);

  const retryLoad = () => {
    setLoadError('');
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  };

  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [descricao, setDescricao] = useState('');

  const session = useSession();
  const nomeUsuario = session?.email.split('@')[0] ?? '';

  const handleDeleteTarefa = async (id: string) => {
    await deleteTask(id);
    setTarefas((current) => current.filter((tarefa) => tarefa.id !== id));
  };

  const handleAddTarefa = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = titulo.trim();
    if (!title) {
      setCreateTaskError('Informe um título para a tarefa.');
      return;
    }

    setIsCreatingTask(true);
    setCreateTaskError('');

    try {
      const newTask = await createTask({
        title,
        description: descricao.trim() || null,
        priority: prioridade as 'baixa' | 'media' | 'alta',
      });

      setTarefas((current) => [...current, newTask]);
      setTitulo('');
      setDescricao('');
      setPrioridade('media');
      setIsModalOpen(false);
      setCreateTaskError('');
    } catch (error) {
      console.error(error);
      setCreateTaskError('Erro ao criar tarefa. Verifique a conexão com a API.');
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          {/* Título atualizado com o nome do usuário */}
          <h1 className="text-3xl font-extrabold text-white">Olá, {nomeUsuario}!</h1>
          
          <button
            type="button"
            onClick={clearSession}
            className="rounded-lg px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Sair
          </button>
          <button 
            disabled={isLoading}
            onClick={() => {
              setCreateTaskError('');
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Nova Tarefa
          </button>
        </header>

        {isLoading ? (
          <p role="status" className="py-12 text-center text-slate-400">Carregando tarefas...</p>
        ) : loadError ? (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-slate-800 p-6 text-center">
            <p className="text-red-400">{loadError}</p>
            <button type="button" onClick={retryLoad} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
              Tentar novamente
            </button>
          </div>
        ) : tarefas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {tarefas.map((tarefa) => (
              <TaskCard key={tarefa.id} tarefa={tarefa} onDelete={handleDeleteTarefa} onUpdate={handleUpdateTarefa} />
            ))}
          </div>
        ) : (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30">
          <p className="text-slate-400">O quadro está limpo. Clique no botão acima para começar!</p>
        </div>
        )}
        
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Adicionar Nova Tarefa</h2>
              
              <form onSubmit={handleAddTarefa} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Título da Tarefa
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => {
                      setTitulo(e.target.value);
                      if (createTaskError) setCreateTaskError('');
                    }}
                    required
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Estudar React"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Prioridade
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detalhes adicionais da tarefa..."
                  />
                </div>

                {createTaskError && (
                  <p role="alert" className="text-sm text-red-400">{createTaskError}</p>
                )}

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCreateTaskError('');
                    }}
                    className="rounded-lg px-4 py-2 font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTask}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingTask ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
