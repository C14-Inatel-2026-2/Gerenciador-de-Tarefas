import { useEffect, useState } from 'react';
import { AlertCircle, Check, CheckSquare, ListTodo, LogOut, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearSession, useSession } from '../auth/session';
import { TaskCard } from '../components/TaskCard';
import { createTask, deleteTask, getTasks, updateTask } from '../services/tasks';
import type { TaskUpdate } from '../services/tasks';
import type { PrioridadeTarefa, Tarefa } from '../types';

export function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState('');
  const [showMissingTitleToast, setShowMissingTitleToast] = useState(false);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  const session = useSession();
  const nomeUsuario = session?.email.split('@')[0] ?? '';

  useEffect(() => {
    if (!showMissingTitleToast) return;

    const timeout = window.setTimeout(() => setShowMissingTitleToast(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [showMissingTitleToast]);

  const handleUpdateTarefa = async (id: string, changes: TaskUpdate) => {
    const updated = await updateTask(id, changes);
    setTarefas((current) => current.map((tarefa) => (tarefa.id === id ? updated : tarefa)));
  };

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

  const handleDeleteTarefa = async (id: string) => {
    await deleteTask(id);
    setTarefas((current) => current.filter((tarefa) => tarefa.id !== id));
  };

  const handleAddTarefa = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = titulo.trim();
    if (!title) {
      setShowMissingTitleToast(true);
      return;
    }

    setShowMissingTitleToast(false);
    setIsCreatingTask(true);
    setCreateTaskError('');

    try {
      const newTask = await createTask({
        title,
        description: descricao.trim() || null,
        priority: prioridade,
        due_date: dataVencimento ? `${dataVencimento}T00:00:00` : null,
      });

      setTarefas((current) => [...current, newTask]);
      setTitulo('');
      setDescricao('');
      setPrioridade('media');
      setDataVencimento('');
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
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <span className="brand-mark" aria-hidden="true"><Check size={17} strokeWidth={2.5} /></span>
            <span>Gerenciador de Tarefas</span>
          </div>

          <nav className="sidebar-nav" aria-label="Navegação principal">
            <Link className="nav-link" to="/dashboard" aria-current="page">
              <ListTodo size={17} strokeWidth={1.9} aria-hidden="true" />
              <span>Minhas tarefas</span>
            </Link>
          </nav>

          <div className="sidebar-spacer" />

          <div className="sidebar-account">
            <div className="account-details">
              <div className="account-label">Conectado como</div>
              <div className="account-email" title={session?.email}>{nomeUsuario}</div>
            </div>
            <button type="button" onClick={clearSession} className="logout-button">
              <LogOut size={16} strokeWidth={1.9} aria-hidden="true" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-inner">
          <header className="page-header">
            <div>
              <h1 className="page-title">Minhas tarefas</h1>
              <p className="page-description">Organize e acompanhe suas atividades.</p>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setCreateTaskError('');
                setIsModalOpen(true);
              }}
              className="button-primary"
            >
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              <span>Nova tarefa</span>
            </button>
          </header>

          {isLoading ? (
            <div role="status" className="feedback-loading">Carregando tarefas...</div>
          ) : loadError ? (
            <div role="alert" className="feedback-error">
              <p>{loadError}</p>
              <button type="button" onClick={retryLoad} className="button-secondary">
                Tentar novamente
              </button>
            </div>
          ) : tarefas.length > 0 ? (
            <section className="task-list" aria-label="Lista de tarefas">
              {tarefas.map((tarefa) => (
                <TaskCard key={tarefa.id} tarefa={tarefa} onDelete={handleDeleteTarefa} onUpdate={handleUpdateTarefa} />
              ))}
            </section>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true"><CheckSquare size={18} strokeWidth={1.8} /></span>
              <p className="empty-state-title">Nenhuma tarefa por aqui</p>
              <p className="empty-state-description">Crie uma tarefa para começar a organizar suas atividades.</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-backdrop">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-task-title"
              className="modal-panel"
            >
              <header className="modal-header">
                <div>
                  <h2 id="create-task-title" className="modal-title">Nova tarefa</h2>
                  <p className="modal-description">Adicione uma atividade à sua lista.</p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar formulário"
                  disabled={isCreatingTask}
                  onClick={() => {
                    setIsModalOpen(false);
                    setCreateTaskError('');
                  }}
                  className="icon-button"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </header>

              <form onSubmit={handleAddTarefa} className="create-form">
                <div className="field-group">
                  <label htmlFor="task-title" className="field-label">Título</label>
                  <input
                    id="task-title"
                    type="text"
                    value={titulo}
                    onChange={(event) => {
                      setTitulo(event.target.value);
                      if (createTaskError) setCreateTaskError('');
                    }}
                    maxLength={120}
                    autoFocus
                    className="field-control"
                    placeholder="Ex.: Estudar React"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="task-priority" className="field-label">Prioridade</label>
                  <select
                    id="task-priority"
                    value={prioridade}
                    onChange={(event) => setPrioridade(event.target.value as PrioridadeTarefa)}
                    className="field-control"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="task-due-date" className="field-label">Data de vencimento</label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dataVencimento}
                    onChange={(event) => setDataVencimento(event.target.value)}
                    className="field-control"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="task-description" className="field-label">Descrição</label>
                  <textarea
                    id="task-description"
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    maxLength={500}
                    rows={3}
                    className="field-control"
                    placeholder="Detalhes adicionais da tarefa..."
                  />
                </div>

                {createTaskError && <p role="alert" className="form-error">{createTaskError}</p>}

                <div className="modal-actions">
                  <button
                    type="button"
                    disabled={isCreatingTask}
                    onClick={() => {
                      setIsModalOpen(false);
                      setCreateTaskError('');
                    }}
                    className="button-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={isCreatingTask} className="button-primary">
                    {isCreatingTask ? 'Salvando...' : 'Salvar tarefa'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
        {showMissingTitleToast && (
          <div role="alert" className="toast-error">
            <AlertCircle size={18} aria-hidden="true" />
            <span>Não é possível criar uma tarefa sem título</span>
          </div>
        )}
      </main>
    </div>
  );
}
