import { useRef, useState } from 'react';
import { CalendarDays, ChevronDown, Flag, Pencil, Trash2 } from 'lucide-react';
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

export function TaskCard({ tarefa, onDelete, onUpdate }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [title, setTitle] = useState(tarefa.titulo);
  const [description, setDescription] = useState(tarefa.descricao ?? '');
  const [priority, setPriority] = useState(tarefa.prioridade);
  const [dueDate, setDueDate] = useState(tarefa.dataVencimento ?? '');
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
    setDueDate(tarefa.dataVencimento ?? '');
    setUpdateError('');
    setDeleteError('');
    setIsEditing(true);
  };

  return (
    <article className="task-card">
      <div className="task-card-top">
        <span className={`priority-badge priority-${tarefa.prioridade}`}>
          <Flag size={13} aria-hidden="true" /> {priorityLabels[tarefa.prioridade]}
          <span className="sr-only"> prioridade</span>
        </span>
        {!isEditing && (
          <div className="task-actions">
            <button type="button" onClick={startEditing} disabled={isSaving || isDeleting}
              aria-label={`Editar tarefa: ${tarefa.titulo}`} title="Editar tarefa" className="icon-button">
              <Pencil size={15} aria-hidden="true" />
            </button>
            <button type="button" onClick={handleDelete} disabled={isDeleting || isSaving}
              aria-label={`Excluir tarefa: ${tarefa.titulo}`} title="Excluir tarefa" className="icon-button icon-button-danger">
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <h3 className="task-title">{tarefa.titulo}</h3>
      {tarefa.descricao && <p className="task-description">{tarefa.descricao}</p>}

      {isEditing && (
        <form
          className="task-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) {
              setUpdateError('Informe um título para a tarefa.');
              return;
            }
            void handleUpdate({
              title: title.trim(),
              description: description.trim() || null,
              priority,
              due_date: dueDate ? `${dueDate}T00:00:00` : null,
            });
          }}
        >
          <fieldset disabled={isSaving} className="task-edit-fields">
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
              <label htmlFor={`priority-${tarefa.id}`} className="field-label">Prioridade</label>
              <select
                id={`priority-${tarefa.id}`}
                value={priority}
                onChange={(event) => setPriority(event.target.value as PrioridadeTarefa)}
                className="field-control"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor={`due-date-${tarefa.id}`} className="field-label">Data de vencimento</label>
              <input
                id={`due-date-${tarefa.id}`}
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
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
        <div className="status-control" data-status={tarefa.status}>
          <select
            aria-label={`Status da tarefa: ${tarefa.titulo}`}
            value={tarefa.status}
            disabled={isSaving || isDeleting || isEditing}
            onChange={(event) => void handleUpdate({ status: event.target.value as StatusTarefa })}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown size={13} aria-hidden="true" />
        </div>
        {tarefa.dataVencimento && (
          <span className="task-due-date">
            <CalendarDays size={14} aria-hidden="true" />
            Vence em {new Date(`${tarefa.dataVencimento}T00:00:00`).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
      {isSaving && <p role="status" className="card-status">Salvando alterações...</p>}
      {updateError && !isEditing && <p role="alert" className="form-error">{updateError}</p>}
      {deleteError && <p role="alert" className="form-error">{deleteError}</p>}
      {isDeleting && <p role="status" className="card-status">Excluindo tarefa...</p>}
    </article>
  );
}
