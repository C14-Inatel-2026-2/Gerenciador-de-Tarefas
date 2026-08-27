import type { Tarefa } from '../types';

interface TaskCardProps {
  tarefa: Tarefa;
}

export function TaskCard({ tarefa }: TaskCardProps) {
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
    </div>
  );
}