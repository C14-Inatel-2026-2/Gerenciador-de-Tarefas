import { useRef, useState } from 'react';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import type { PrioridadeTarefa, StatusTarefa, Tarefa } from '../types';
import type { TaskUpdate } from '../services/tasks';

interface TaskCardProps {
  tarefa: Tarefa;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, changes: TaskUpdate) => Promise<void>;
}

const priorityLabels: Record<PrioridadeTarefa, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

const statusLabels: Record<StatusTarefa, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
};

const priorityClasses: Record<PrioridadeTarefa, string> = {
  baixa: 'badge-priority-low',
  media: 'badge-priority-medium',
  alta: 'badge-priority-high',
};

const statusClasses: Record<StatusTarefa, string> = {
  pendente: 'badge-status-pending',
  em_andamento: 'badge-status-progress',
  concluida: 'badge-status-done',
};

export function TaskCard({ tarefa, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [title, setTitle] = useState(tarefa.titulo);
  const [description, setDescription] = useState(tarefa.descricao ?? '');
  const [priority, setPriority] = useState(tarefa.prioridade);
  const saving = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleting = useRef(false);

  const handleDelete = async () => {
    if (deleting.current || saving.current) return;
    deleting.current = true;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await onDelete(tarefa.id);
    } catch {
      setDeleteError('Não foi possível excluir a tarefa. Tente novamente.');
    } finally {
      deleting.current = false;
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (changes: TaskUpdate) => {
    if (saving.current || deleting.current) return;
    saving.current = true;
    setIsSaving(true);
    setUpdateError('');
    try {
      await onUpdate(tarefa.id, changes);
      setIsEditing(false);
    } catch {
      setUpdateError('Não foi possível atualizar a tarefa. Tente novamente.');
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    setTitle(tarefa.titulo);
    setDescription(tarefa.descricao ?? '');
    setPriority(tarefa.prioridade);
    setUpdateError('');
    setDeleteError('');
    setIsEditing(true);
  };

  return (
    <article className="task-card">
      <div className="task-card-heading">
        <div>
          <h2 className="task-title">{tarefa.titulo}</h2>
          {tarefa.descricao && <p className="task-description">{tarefa.descricao}</p>}
        </div>
        <div className="task-badges">
          <span className={`badge ${priorityClasses[tarefa.prioridade]}`}>
            Prioridade: {priorityLabels[tarefa.prioridade]}
          </span>
          <select
            aria-label={`Status da tarefa: ${tarefa.titulo}`}
            value={tarefa.status}
            disabled={isSaving || isDeleting || isEditing}
            onChange={(event) => void handleUpdate({ status: event.target.value as StatusTarefa })}
            className={`badge status-select ${statusClasses[tarefa.status]}`}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isEditing && (
        <form
          className="task-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) {
              setUpdateError('Informe um título para a tarefa.');
              return;
            }
            void handleUpdate({ title: title.trim(), description: description.trim() || null, priority });
          }}
        >
          <fieldset disabled={isSaving} className="grid gap-3 border-0 p-0">
            <legend className="field-label">Editar tarefa</legend>
            <div className="field-group">
              <label htmlFor={`title-${tarefa.id}`} className="field-label">Título</label>
              <input
                id={`title-${tarefa.id}`}
                autoFocus
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="field-control"
              />
            </div>
            <div className="field-group">
              <label htmlFor={`description-${tarefa.id}`} className="field-label">Descrição</label>
              <textarea
                id={`description-${tarefa.id}`}
                maxLength={500}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="field-control"
              />
            </div>
            <div className="field-group">
              <label htmlFor={`priority-${tarefa.id}`} className="field-label">Prioridade</label>
              <select
                id={`priority-${tarefa.id}`}
                value={priority}
                onChange={(event) => setPriority(event.target.value as PrioridadeTarefa)}
                className="field-control"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            {updateError && <p role="alert" className="form-error">{updateError}</p>}
            <div className="task-edit-actions">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setUpdateError('');
                }}
                className="button-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="button-primary">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </fieldset>
        </form>
      )}

      <div className="task-card-footer">
        <div className="task-meta">
          {tarefa.dataVencimento && (
            <span className="task-due-date">
              <CalendarDays size={14} strokeWidth={1.8} aria-hidden="true" />
              Vence em {tarefa.dataVencimento}
            </span>
          )}
          {isSaving && <span role="status">Salvando alterações...</span>}
        </div>
        {!isEditing && (
          <div className="task-actions">
            <button
              type="button"
              onClick={startEditing}
              disabled={isSaving || isDeleting}
              aria-label={`Editar tarefa: ${tarefa.titulo}`}
              className="icon-button"
            >
              <Pencil size={15} strokeWidth={1.9} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              aria-label={`Excluir tarefa: ${tarefa.titulo}`}
              className="icon-button icon-button-danger"
            >
              <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {updateError && !isEditing && <p role="alert" className="inline-error">{updateError}</p>}
      {deleteError && <p role="alert" className="inline-error">{deleteError}</p>}
      {isDeleting && <p role="status" className="inline-error">Excluindo tarefa...</p>}
    </article>
  );
}
