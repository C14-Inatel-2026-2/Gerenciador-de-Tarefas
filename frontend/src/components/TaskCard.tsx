import { useRef, useState } from 'react';
import type { Tarefa } from '../types';

interface TaskCardProps {
  tarefa: Tarefa;
  onDelete: (id: string) => Promise<void>;
}

export function TaskCard({ tarefa, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deleting = useRef(false);

  const handleDelete = async () => {
    if (deleting.current) return;
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
        <span className="text-slate-300">Status: <span className="font-medium text-blue-400">{tarefa.status}</span></span>
        {tarefa.dataVencimento && (
          <span className="text-slate-500">Vence em: {tarefa.dataVencimento}</span>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={`Excluir tarefa: ${tarefa.titulo}`}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
      {deleteError && <p role="alert" className="mt-2 text-sm text-red-400">{deleteError}</p>}
    </div>
  );
}
