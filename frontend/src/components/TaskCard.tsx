import { useRef, useState } from 'react';
import type { PrioridadeTarefa, StatusTarefa, Tarefa } from '../types';
import type { TaskUpdate } from '../services/tasks';

interface TaskCardProps {
  tarefa: Tarefa;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, changes: TaskUpdate) => Promise<void>;
}

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

  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white';

  const corPrioridade = {
    baixa: 'bg-green-500/20 text-green-400',
    media: 'bg-yellow-500/20 text-yellow-400',
    alta: 'bg-red-500/20 text-red-400',
  }[tarefa.prioridade];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-600">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white">{tarefa.titulo}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${corPrioridade}`}>
          {tarefa.prioridade.toUpperCase()}
        </span>
      </div>
      
      {tarefa.descricao && (
        <p className="mt-2 text-sm text-slate-400">{tarefa.descricao}</p>
      )}
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3 text-sm">
        <label className="text-slate-300">
          Status
          <select
            aria-label={`Status da tarefa: ${tarefa.titulo}`}
            value={tarefa.status}
            disabled={isSaving || isDeleting || isEditing}
            onChange={(event) => void handleUpdate({ status: event.target.value as StatusTarefa })}
            className={fieldClass}
          >
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </label>
        {tarefa.dataVencimento && (
          <span className="text-slate-500">Vence em: {tarefa.dataVencimento}</span>
        )}
      </div>
      {isEditing && (
        <form className="mt-4 space-y-3" onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) {
            setUpdateError('Informe um título para a tarefa.');
            return;
          }
          void handleUpdate({ title: title.trim(), description: description.trim() || null, priority });
        }}>
          <fieldset disabled={isSaving} className="space-y-3">
            <legend className="font-semibold text-white">Editar tarefa</legend>
            <label className="block text-sm text-slate-300">Título
              <input autoFocus required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm text-slate-300">Descrição
              <textarea maxLength={500} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm text-slate-300">Prioridade
              <select value={priority} onChange={(event) => setPriority(event.target.value as PrioridadeTarefa)} className={fieldClass}>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setIsEditing(false); setUpdateError(''); }} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-700">Cancelar</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{isSaving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </fieldset>
        </form>
      )}
      {isSaving && <p role="status" className="mt-2 text-sm text-slate-300">Salvando alterações...</p>}
      {updateError && <p role="alert" className="mt-2 text-sm text-red-400">{updateError}</p>}
      {!isEditing && <div className="mt-4 flex justify-end">
        <button type="button" onClick={startEditing} disabled={isSaving || isDeleting} aria-label={`Editar tarefa: ${tarefa.titulo}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 disabled:opacity-50">Editar</button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          aria-label={`Excluir tarefa: ${tarefa.titulo}`}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>}
      {deleteError && <p role="alert" className="mt-2 text-sm text-red-400">{deleteError}</p>}
    </div>
  );
}
